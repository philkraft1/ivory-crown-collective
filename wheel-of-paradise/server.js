"use strict";

const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { createGame, applyAction, hostView, publicView, SPIN_MS } = require("./lib/game");

const PUBLIC_DIR = path.join(__dirname, "public");
const STATIC = {
  "/host.js": ["host.js", "text/javascript; charset=utf-8"],
  "/overlay.js": ["overlay.js", "text/javascript; charset=utf-8"],
  "/ui.js": ["ui.js", "text/javascript; charset=utf-8"],
  "/ui.css": ["ui.css", "text/css; charset=utf-8"],
  "/overlay": ["overlay.html", "text/html; charset=utf-8"],
};

function readCookie(req, name) {
  const header = req.headers.cookie || "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return "";
}

function authorized(req, token) {
  const got = Buffer.from(readCookie(req, "wop_host"));
  const expected = Buffer.from(token);
  if (got.length !== expected.length || got.length === 0) return false;
  return crypto.timingSafeEqual(got, expected);
}

function send(res, status, body, type, extraHeaders) {
  const payload = Buffer.from(body);
  res.writeHead(status, {
    "content-type": type,
    "content-length": payload.length,
    "cache-control": "no-store",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
    ...extraHeaders,
  });
  res.end(payload);
}

function sendJson(res, status, data) {
  send(res, status, JSON.stringify(data), "application/json; charset=utf-8", {
    "content-security-policy": "frame-ancestors 'self'",
    "x-frame-options": "SAMEORIGIN",
  });
}

function createApp(options = {}) {
  const token = options.token || crypto.randomBytes(16).toString("hex");
  const rng = options.rng || Math.random;
  const spinMs = Number.isFinite(options.spinMs) ? options.spinMs : SPIN_MS;
  const game = createGame();
  const publicClients = new Set();
  const hostClients = new Set();
  let spinTimer = null;

  function broadcast() {
    const viewers = `data: ${JSON.stringify(publicView(game))}\n\n`;
    const hosts = `data: ${JSON.stringify(hostView(game))}\n\n`;
    for (const client of publicClients) client.write(viewers);
    for (const client of hostClients) client.write(hosts);
  }

  function clearSpin() {
    if (spinTimer) clearTimeout(spinTimer);
    spinTimer = null;
  }

  function scheduleSpin() {
    clearSpin();
    spinTimer = setTimeout(() => {
      spinTimer = null;
      try {
        applyAction(game, { type: "resolveSpin" }, rng);
        broadcast();
      } catch (error) {
        console.error(error);
      }
    }, spinMs);
  }

  function openSse(req, res, clients, view) {
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-store",
      connection: "keep-alive",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
      "content-security-policy": "frame-ancestors 'self'",
    });
    res.write(`data: ${JSON.stringify(view(game))}\n\n`);
    clients.add(res);
    const beat = setInterval(() => res.write(": ping\n\n"), 20000);
    req.on("close", () => {
      clearInterval(beat);
      clients.delete(res);
    });
  }

  async function readBody(req) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 8000) throw Object.assign(new Error("Request is too large."), { status: 413 });
      chunks.push(chunk);
    }
    if (size === 0) return {};
    try {
      return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      throw Object.assign(new Error("That wasn't valid JSON."), { status: 400 });
    }
  }

  const server = http.createServer((req, res) => {
    handle(req, res).catch((error) => {
      if (!res.headersSent) {
        const status = error.status || 500;
        sendJson(res, status, { error: status === 500 ? "Something went wrong." : error.message });
      }
      if (!error.status || error.status === 500) console.error(error);
    });
  });

  async function handle(req, res) {
    const url = new URL(req.url || "/", "http://127.0.0.1");
    const pathname = url.pathname === "/" ? "/host" : url.pathname;

    if (req.method === "GET" && pathname === "/host") {
      const html = fs.readFileSync(path.join(PUBLIC_DIR, "host.html"), "utf8");
      send(res, 200, html, "text/html; charset=utf-8", {
        "set-cookie": `wop_host=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/`,
        "content-security-policy": "frame-ancestors 'self'",
        "x-frame-options": "SAMEORIGIN",
      });
      return;
    }

    if (req.method === "GET" && STATIC[pathname]) {
      const [file, type] = STATIC[pathname];
      const body = fs.readFileSync(path.join(PUBLIC_DIR, file));
      const overlay = pathname === "/overlay";
      send(res, 200, body, type, overlay
        ? { "content-security-policy": "frame-ancestors *" }
        : { "content-security-policy": "frame-ancestors 'self'", "x-frame-options": "SAMEORIGIN" });
      return;
    }

    if (req.method === "GET" && pathname === "/api/state") {
      sendJson(res, 200, publicView(game));
      return;
    }

    if (req.method === "GET" && pathname === "/events") {
      openSse(req, res, publicClients, publicView);
      return;
    }

    if ((req.method === "GET" && (pathname === "/api/host" || pathname === "/host-events")) ||
        (req.method === "POST" && pathname === "/api/action")) {
      if (!authorized(req, token)) {
        sendJson(res, 401, { error: "Open the host page on this machine to run the game." });
        return;
      }
    }

    if (req.method === "GET" && pathname === "/api/host") {
      sendJson(res, 200, hostView(game));
      return;
    }

    if (req.method === "GET" && pathname === "/host-events") {
      openSse(req, res, hostClients, hostView);
      return;
    }

    if (req.method === "POST" && pathname === "/api/action") {
      const body = await readBody(req);
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        sendJson(res, 400, { error: "Missing action." });
        return;
      }
      if (body.type === "resolveSpin") {
        sendJson(res, 400, { error: "That action isn't available." });
        return;
      }
      try {
        const result = applyAction(game, body, rng);
        if (result.cancelSpin) clearSpin();
        if (result.spin) scheduleSpin();
        broadcast();
        sendJson(res, 200, { state: hostView(game) });
      } catch (error) {
        sendJson(res, 400, { error: error.message || "That move didn't work." });
      }
      return;
    }

    send(res, 404, "Not found\n", "text/plain; charset=utf-8");
  }

  function close() {
    clearSpin();
    for (const client of [...publicClients, ...hostClients]) client.end();
    if (typeof server.closeAllConnections === "function") server.closeAllConnections();
    return new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }

  return { server, token, close };
}

if (require.main === module) {
  const { server } = createApp();
  const port = Number(process.env.PORT) || 8787;
  const host = process.env.HOST || "127.0.0.1";
  server.listen(port, host, () => {
    const address = server.address();
    const shownPort = address && typeof address === "object" ? address.port : port;
    console.log(`Wheel of Fortune host   http://${host}:${shownPort}/host`);
    console.log(`Overlay for OBS/TikTok  http://${host}:${shownPort}/overlay`);
  });
}

module.exports = { createApp };
