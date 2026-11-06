import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGame, hostView, publicView } from './lib/game.js';
import { parseCommand } from './lib/commands.js';
import { PUZZLES } from './lib/puzzles.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, 'public');
const pages = {
  '/': 'index.html',
  '/host': 'host.html',
  '/overlay': 'overlay.html',
};
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

export function createApp() {
  const game = createGame();
  const clients = new Set();
  let timers = [];
  let connection = null;
  let puzzleCursor = 0;
  let heardSeq = 0;
  const heard = [];
  let tiktok = { state: 'idle', username: '', detail: 'Practice mode is ready' };
  let hostAvatar = '';
  let tunnelProc = null;
  let tunnel = { state: 'off', url: '', detail: 'Click New stream link when you go live.' };
  let recent = { key: '', at: 0 };

  function clearTimers() {
    for (const timer of timers) clearTimeout(timer);
    timers = [];
  }

  function viewFor(role) {
    const view = role === 'host' ? hostView(game.getState()) : publicView(game.getState());
    view.host = hostCard();
    if (role === 'host') {
      view.tiktok = tiktok;
      view.heard = heard;
      view.tunnel = tunnel;
    }
    return view;
  }

  function send(res, event, data) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  function broadcast() {
    for (const client of clients) {
      try {
        send(client.res, 'state', viewFor(client.role));
      } catch {
        clients.delete(client);
      }
    }
  }

  function dispatch(action) {
    const result = game.dispatch(action);
    if (result.effects.length) {
      clearTimers();
      for (const effect of result.effects) {
        if (effect.type === 'after') {
          timers.push(setTimeout(() => dispatch(effect.action), effect.ms));
        }
      }
    }
    broadcast();
    return result;
  }

  function hear(name, comment, handled) {
    heard.push({
      id: ++heardSeq,
      text: `${name}: ${String(comment).slice(0, 180)}`,
      handled,
    });
    if (heard.length > 40) heard.shift();
  }

  function profilePicture(user) {
    if (!user || typeof user !== 'object') return '';
    if (typeof user.profilePictureUrl === 'string') return user.profilePictureUrl;
    const models = [user.profilePicture, user.avatarLarge, user.avatarMedium, user.avatarThumb];
    for (const model of models) {
      const list = model?.url || model?.urls || model?.urlList;
      if (!Array.isArray(list)) continue;
      const url = list.find((item) => typeof item === 'string' && item.startsWith('https://'));
      if (url) return url;
    }
    return '';
  }

  function hostCard() {
    const name = tiktok.username || 'Host';
    const match = game.getState().players.find((player) => player.id === name.toLowerCase());
    return { name, avatar: hostAvatar || match?.avatar || '' };
  }

  function handleComment({ id, name, comment, avatar }) {
    const safeName = String(name || id || 'Viewer').slice(0, 40);
    const safeId = String(id || safeName);
    const text = String(comment || '');
    const picture = typeof avatar === 'string' ? avatar : '';
    if (tiktok.username && safeId.toLowerCase() === tiktok.username.toLowerCase() && picture) {
      hostAvatar = picture;
    }
    const key = `${safeId}|${text}`;
    const now = Date.now();
    if (key === recent.key && now - recent.at < 1200) return;
    recent = { key, at: now };
    const command = parseCommand(text);
    hear(safeName, text, Boolean(command));
    if (!command) {
      broadcast();
      return;
    }
    if (command.type === 'join') {
      dispatch({ type: 'JOIN', id: safeId, name: safeName, avatar: picture });
      return;
    }
    if (command.type === 'spin') {
      dispatch({ type: 'SPIN', id: safeId, name: safeName, avatar: picture });
      return;
    }
    if (command.type === 'guess') {
      dispatch({ type: 'GUESS', id: safeId, name: safeName, letter: command.letter, avatar: picture });
      return;
    }
    dispatch({ type: 'SOLVE', id: safeId, name: safeName, phrase: command.phrase, avatar: picture });
  }

  async function disconnectTikTok() {
    const current = connection;
    connection = null;
    if (!current) return;
    try {
      await current.disconnect();
    } catch {
      /* The LIVE socket can already be closed. */
    }
  }

  async function connectTikTok(username) {
    const uniqueId = String(username || '').trim().replace(/^@+/, '');
    if (!uniqueId) {
      tiktok = { state: 'error', username: '', detail: 'Enter your TikTok username' };
      broadcast();
      return;
    }
    await disconnectTikTok();
    tiktok = { state: 'connecting', username: uniqueId, detail: 'Connecting to your LIVE' };
    broadcast();
    try {
      const { TikTokLiveConnection, WebcastEvent, ControlEvent } = await import('tiktok-live-connector');
      const next = new TikTokLiveConnection(uniqueId, {});
      next.on(WebcastEvent.CHAT, (data) => {
        handleComment({
          id: data?.user?.uniqueId || data?.user?.displayId || data?.user?.id || 'viewer',
          name: data?.user?.nickname || data?.user?.displayId || data?.user?.uniqueId || 'Viewer',
          comment: data?.content || data?.comment || '',
          avatar: profilePicture(data?.user),
        });
      });
      next.on(WebcastEvent.STREAM_END, () => {
        tiktok = { state: 'error', username: uniqueId, detail: 'The LIVE ended' };
        broadcast();
      });
      next.on(ControlEvent.DISCONNECTED, () => {
        if (connection !== next) return;
        tiktok = { state: 'error', username: uniqueId, detail: 'Chat disconnected. Connect again if you are still live.' };
        broadcast();
      });
      connection = next;
      await next.connect();
      if (connection !== next) return;
      tiktok = { state: 'live', username: uniqueId, detail: 'Reading LIVE chat' };
    } catch (error) {
      if (connection) await disconnectTikTok();
      tiktok = {
        state: 'error',
        username: uniqueId,
        detail: error?.message || 'Could not connect. Go live on TikTok, then try again.',
      };
    }
    broadcast();
  }

  async function hostAction(body) {
    const action = body?.action;
    if (action === 'puzzle') {
      dispatch({ type: 'SET_PUZZLE', category: body.category, puzzle: body.puzzle });
      return;
    }
    if (action === 'random') {
      const [category, puzzle] = PUZZLES[puzzleCursor % PUZZLES.length];
      puzzleCursor += 1;
      dispatch({ type: 'SET_PUZZLE', category, puzzle });
      return;
    }
    if (action === 'start') {
      dispatch({ type: 'START' });
      return;
    }
    if (action === 'skip') {
      dispatch({ type: 'SKIP' });
      return;
    }
    if (action === 'force') {
      dispatch({ type: 'FORCE_SOLVE' });
      return;
    }
    if (action === 'reset') {
      dispatch({ type: 'RESET' });
      return;
    }
    if (action === 'prize') {
      dispatch({ type: 'SET_PRIZE', prize: body.prize });
      return;
    }
    if (action === 'sound') {
      dispatch({ type: 'SET_SOUND', on: Boolean(body.on) });
      return;
    }
    if (action === 'transparent') {
      dispatch({ type: 'SET_TRANSPARENT', on: Boolean(body.on) });
      return;
    }
    if (action === 'chat') {
      handleComment({
        id: body.name || 'host',
        name: body.name || 'Host',
        comment: body.comment || '',
        avatar: body.avatar || '',
      });
      return;
    }
    if (action === 'connect') {
      await connectTikTok(body.username);
      return;
    }
    if (action === 'disconnect') {
      await disconnectTikTok();
      tiktok = { state: 'idle', username: tiktok.username, detail: 'Disconnected. Practice mode still works.' };
      broadcast();
      return;
    }
    if (action === 'tunnel') {
      startTunnel();
    }
  }

  function stopTunnel() {
    const proc = tunnelProc;
    tunnelProc = null;
    if (!proc || proc.killed) return;
    try { proc.kill(); } catch { /* The tunnel process can already be gone. */ }
  }

  function startTunnel() {
    stopTunnel();
    const exe = path.join(root, 'cloudflared.exe');
    tunnel = { state: 'starting', url: '', detail: 'Creating a new stream link. This can take a minute.' };
    broadcast();
    const proc = spawn(exe, ['tunnel', '--url', 'http://127.0.0.1:8787', '--no-autoupdate'], {
      cwd: root,
      windowsHide: true,
    });
    tunnelProc = proc;
    let buffer = '';
    const watch = (chunk) => {
      buffer += chunk.toString();
      const match = buffer.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (!match || tunnelProc !== proc) return;
      tunnel = {
        state: 'ready',
        url: `${match[0]}/overlay?v=17`,
        detail: 'Paste this into the TikTok Link source. A new link replaces this one.',
      };
      broadcast();
    };
    proc.stdout?.on('data', watch);
    proc.stderr?.on('data', watch);
    proc.on('error', () => {
      if (tunnelProc !== proc) return;
      tunnelProc = null;
      tunnel = { state: 'off', url: '', detail: 'cloudflared.exe was not found in the game folder.' };
      broadcast();
    });
    proc.on('exit', () => {
      if (tunnelProc !== proc) return;
      tunnelProc = null;
      tunnel = {
        state: 'off',
        url: '',
        detail: tunnel.url
          ? 'That stream link stopped. Click New stream link again.'
          : 'The stream link did not start. Click New stream link again.',
      };
      broadcast();
    });
  }

  async function serveStatic(res, pathname) {
    const name = pages[pathname] || pathname.replace(/^\/+/, '');
    const file = path.resolve(publicDir, name);
    const relative = path.relative(publicDir, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      json(res, 403, { ok: false, error: 'Forbidden' });
      return;
    }
    try {
      const body = await readFile(file);
      const type = types[path.extname(file)] || 'application/octet-stream';
      res.writeHead(200, {
        'content-type': type,
        'cache-control': 'no-store',
      });
      res.end(body);
    } catch {
      json(res, 404, { ok: false, error: 'Not found' });
    }
  }

  function isLocal(req) {
    const host = String(req.headers.host || '').split(':')[0].replace(/^\[|\]$/g, '').toLowerCase();
    return host === '127.0.0.1' || host === 'localhost' || host === '::1';
  }

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', 'http://127.0.0.1');
      const local = isLocal(req);
      const hostOnly = url.pathname === '/host'
        || url.pathname === '/api/host'
        || (url.pathname === '/api/state' && url.searchParams.get('role') === 'host')
        || (url.pathname === '/events' && url.searchParams.get('role') === 'host');
      if (hostOnly && !local) {
        json(res, 404, { ok: false, error: 'Not found' });
        return;
      }
      if (req.method === 'GET' && url.pathname === '/api/health') {
        json(res, 200, { ok: true, name: 'Wheel of Paradise' });
        return;
      }
      if (req.method === 'GET' && url.pathname === '/api/state') {
        json(res, 200, viewFor(url.searchParams.get('role') === 'host' ? 'host' : 'overlay'));
        return;
      }
      if (req.method === 'GET' && url.pathname === '/events') {
        res.writeHead(200, {
          'content-type': 'text/event-stream',
          'cache-control': 'no-store',
          connection: 'keep-alive',
        });
        const client = { res, role: url.searchParams.get('role') === 'host' ? 'host' : 'overlay' };
        clients.add(client);
        send(res, 'state', viewFor(client.role));
        req.on('close', () => clients.delete(client));
        return;
      }
      if (req.method === 'POST' && url.pathname === '/api/host') {
        const body = await readJson(req);
        await hostAction(body);
        json(res, 200, { ok: true });
        return;
      }
      if (req.method === 'GET') {
        await serveStatic(res, url.pathname);
        return;
      }
      json(res, 405, { ok: false, error: 'Method not allowed' });
    } catch (error) {
      json(res, 400, { ok: false, error: error?.message || 'Bad request' });
    }
  });

  const pulse = setInterval(() => {
    for (const client of clients) client.res.write(': ping\n\n');
  }, 15000);
  pulse.unref?.();

  function close() {
    clearTimers();
    stopTunnel();
    clearInterval(pulse);
    for (const client of clients) client.res.end();
    clients.clear();
    return new Promise((resolve) => {
      if (!server.listening) {
        resolve();
        return;
      }
      server.close(() => resolve());
    });
  }

  return { server, close, dispatch, handleComment };
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 20000) throw new Error('Body too large');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  const port = Number(process.env.PORT) || 8787;
  const { server } = createApp();
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Close the other Wheel of Paradise window and try again.`);
      process.exit(1);
    }
    throw error;
  });
  server.listen(port, '127.0.0.1', () => {
    console.log('Wheel of Paradise is running');
    console.log(`Host desk  http://127.0.0.1:${port}/host`);
    console.log(`Overlay    http://127.0.0.1:${port}/overlay`);
  });
}
