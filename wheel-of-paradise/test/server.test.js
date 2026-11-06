"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");
const { once } = require("events");
const { createApp } = require("../server");
const { WEDGES } = require("../lib/game");

function rngFor(index) {
  let call = 0;
  return () => {
    call += 1;
    if (call % 2 === 1) return (index + 0.01) / WEDGES.length;
    return 0.5;
  };
}

function request(port, method, path, { cookie, body } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: "127.0.0.1",
      port,
      method,
      path,
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(payload ? { "content-type": "application/json", "content-length": Buffer.byteLength(payload) } : {}),
      },
    }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString("utf8"),
        });
      });
    });
    req.on("error", reject);
    req.end(payload);
  });
}

async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return server.address().port;
}

test("the overlay cannot see the puzzle or run the show", async () => {
  const app = createApp({ token: "host-token-host-token-host", rng: rngFor(0), spinMs: 30 });
  const port = await listen(app.server);
  try {
    const page = await request(port, "GET", "/host");
    assert.equal(page.status, 200);
    assert.match([].concat(page.headers["set-cookie"]).join(";"), /wop_host=host-token-host-token-host/);
    const cookie = "wop_host=host-token-host-token-host";

    const denied = await request(port, "POST", "/api/action", {
      body: { type: "loadPuzzle", puzzle: "HELLO WORLD", category: "Phrase" },
    });
    assert.equal(denied.status, 401);

    const loaded = await request(port, "POST", "/api/action", {
      cookie,
      body: { type: "loadPuzzle", puzzle: "HELLO WORLD", category: "Phrase" },
    });
    assert.equal(loaded.status, 200);

    const audience = await request(port, "GET", "/api/state");
    assert.equal(audience.status, 200);
    assert.equal(audience.body.includes("HELLO"), false);
    const host = await request(port, "GET", "/api/host", { cookie });
    assert.equal(JSON.parse(host.body).puzzle, "HELLO WORLD");

    const overlay = await request(port, "GET", "/overlay");
    assert.equal(overlay.status, 200);
    assert.equal(overlay.headers["set-cookie"], undefined);
    assert.match(overlay.headers["content-security-policy"], /frame-ancestors \*/);

    const spun = await request(port, "POST", "/api/action", { cookie, body: { type: "spin" } });
    assert.equal(spun.status, 200);
    assert.equal(JSON.parse(spun.body).state.spinning, true);
    await new Promise((resolve) => setTimeout(resolve, 80));
    const after = JSON.parse((await request(port, "GET", "/api/state")).body);
    assert.equal(after.spinning, false);
    assert.equal(after.phase, "guess");
    assert.equal(after.wedgeLabel, "$500");

    const early = await request(port, "POST", "/api/action", { cookie, body: { type: "resolveSpin" } });
    assert.equal(early.status, 400);
  } finally {
    await app.close();
  }
});
