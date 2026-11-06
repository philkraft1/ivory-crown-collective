const stage = document.getElementById('stage');
const category = document.getElementById('category');
const status = document.getElementById('status');
const board = document.getElementById('board');
const vowels = document.getElementById('vowels');
const called = document.getElementById('called');
const players = document.getElementById('players');
const popup = document.getElementById('turn-popup');
const popupPhoto = document.getElementById('popup-photo');
const popupName = document.getElementById('popup-name');
const indicator = document.getElementById('turn-indicator');
const indicatorPhoto = document.getElementById('indicator-photo');
const indicatorName = document.getElementById('indicator-name');
const indicatorTime = document.getElementById('indicator-time');
const log = document.getElementById('log');
const winner = document.getElementById('winner');
const canvas = document.getElementById('wheel');
const hubKicker = document.getElementById('hub-kicker');
const hubScore = document.getElementById('hub-score');
const flash = document.getElementById('flash');
const clockWrap = document.getElementById('clock-wrap');
const clock = document.getElementById('clock');
const clockBar = document.getElementById('clock-bar');
const confetti = document.getElementById('confetti');
const commands = [...document.querySelectorAll('.cmd')];

let state = null;
let signature = '';
let previousRevealed = [];
let previousMessage = '';
let previousStatus = '';
let lastSpinId = 0;
let rotation = 0;
let drawn = false;
let audio;
let tickTimers = [];
let announcedId = '';
let popupTimer;
let flashTimer;

const source = new EventSource('/events');
source.addEventListener('state', (event) => {
  render(JSON.parse(event.data));
});

async function pull() {
  try {
    const response = await fetch('/api/state?role=overlay', { cache: 'no-store' });
    if (!response.ok) return;
    render(await response.json());
  } catch {
    /* The next poll tries again if the link source drops the live stream. */
  }
}

pull();
setInterval(pull, 700);

function render(next) {
  const solveCmd = document.querySelector('[data-cmd="solve"]');
  if (solveCmd) solveCmd.textContent = '/solve [your answer] to solve the puzzle';
  const sig = JSON.stringify(next);
  if (sig === signature) return;
  const prior = state;
  state = next;
  signature = sig;
  document.body.classList.toggle('clear', Boolean(next.transparent));
  stage.classList.toggle('spinning', next.phase === 'spinning');
  if (!drawn && next.wedges?.length) {
    drawWheel(canvas, next.wedges);
    drawn = true;
  }
  category.textContent = next.category || 'Waiting for a puzzle';
  status.textContent = next.message || '';
  renderBoard(next.rows || []);
  renderCalled(next.called || []);
  renderSeats(next);
  renderTurn(next);
  renderIndicator(next);
  renderLog(next.log || []);
  renderWinner(next);
  renderHub(next);
  highlightCommand(next);
  placeWheel(next, prior);
  react(next);
  previousRevealed = [...(next.revealed || [])];
  previousMessage = next.message || '';
  previousStatus = next.status;
}

function renderBoard(rows) {
  board.replaceChildren();
  let index = 0;
  for (const word of rows) {
    const group = document.createElement('div');
    group.className = 'word';
    for (const cell of word) {
      if (cell.kind === 'symbol') {
        const symbol = document.createElement('span');
        symbol.className = 'symbol';
        symbol.textContent = cell.value;
        group.appendChild(symbol);
        continue;
      }
      const tile = document.createElement('span');
      tile.className = cell.value ? 'tile on' : 'tile';
      tile.textContent = cell.value || '';
      if (cell.value && !previousRevealed.includes(cell.value)) {
        tile.classList.add('fresh');
        tile.style.animationDelay = `${index * 35}ms`;
        index += 1;
      }
      group.appendChild(tile);
    }
    board.appendChild(group);
  }
}

function renderCalled(letters) {
  vowels.replaceChildren();
  for (const vowel of ['A', 'E', 'I', 'O', 'U']) {
    const lamp = document.createElement('span');
    lamp.className = letters.includes(vowel) ? 'lamp on' : 'lamp';
    lamp.textContent = vowel;
    vowels.appendChild(lamp);
  }
  const consonants = letters.filter((letter) => !'AEIOU'.includes(letter));
  called.textContent = consonants.length ? `Called ${consonants.join(' ')}` : 'No consonants called yet';
}

function renderSeats(next) {
  const playing = next.status === 'playing';
  const host = next.host || { name: 'Host', avatar: '' };
  const hostId = String(host.name || '').toLowerCase();
  const joined = (next.players || []).filter((player) => player.id !== hostId);
  let visible = joined.slice(0, 4);
  const currentPlayer = joined.find((player) => player.id === next.currentPlayerId);
  if (currentPlayer && !visible.some((player) => player.id === currentPlayer.id)) {
    visible = visible.slice(0, 3).concat(currentPlayer);
  }
  const slots = [visible[0], visible[1], host, visible[2], visible[3]];
  players.replaceChildren();
  slots.forEach((player, index) => {
    const seat = document.createElement('article');
    seat.className = 'seat';
    const photo = document.createElement('div');
    photo.className = 'photo';
    if (index === 2) {
      seat.classList.add('host');
      paintPhoto(photo, { name: host.name || 'Host', avatar: host.avatar || '' });
      const name = document.createElement('b');
      name.textContent = host.name || 'Host';
      seat.append(photo, name);
      players.appendChild(seat);
      return;
    }
    if (!player) {
      seat.classList.add('open');
      seat.append(photo);
      players.appendChild(seat);
      return;
    }
    if (player.id === next.currentPlayerId && playing) seat.classList.add('up');
    paintPhoto(photo, player);
    const name = document.createElement('b');
    name.textContent = player.name;
    seat.append(photo, name);
    players.appendChild(seat);
  });
}

function paintPhoto(node, player) {
  node.replaceChildren();
  node.style.background = portraitColor(player.name);
  const letter = document.createElement('span');
  letter.textContent = initial(player.name);
  node.appendChild(letter);
  if (!player.avatar) return;
  const image = document.createElement('img');
  image.alt = '';
  image.referrerPolicy = 'no-referrer';
  image.src = player.avatar;
  image.addEventListener('error', () => image.remove());
  node.appendChild(image);
}

function renderIndicator(next) {
  const player = next.status === 'playing' ? next.players[next.turn] : null;
  const active = Boolean(player) && ['spinning', 'guess', 'turn', 'result'].includes(next.phase);
  indicator.hidden = !active;
  if (!active) return;
  if (indicator.dataset.player !== player.id) {
    indicator.dataset.player = player.id;
    indicatorName.textContent = player.name;
    paintPhoto(indicatorPhoto, player);
  }
  const timing = Boolean(next.deadline && next.clockMs);
  indicatorTime.hidden = !timing;
}

function renderTurn(next) {
  const player = next.status === 'playing' ? next.players[next.turn] : null;
  if (!player) {
    announcedId = '';
    return;
  }
  if (player.id === announcedId) return;
  announcedId = player.id;
  popupName.textContent = player.name;
  paintPhoto(popupPhoto, player);
  popup.hidden = false;
  popup.classList.remove('show');
  void popup.offsetWidth;
  popup.classList.add('show');
  clearTimeout(popupTimer);
  popupTimer = setTimeout(() => {
    popup.classList.remove('show');
    popup.hidden = true;
  }, 2600);
}

function initial(name) {
  const letter = String(name || '?').trim().charAt(0).toUpperCase();
  return /[A-Z0-9]/.test(letter) ? letter : '?';
}

function portraitColor(name) {
  const tones = ['#0f766e', '#c2410c', '#1d4ed8', '#a16207', '#be185d'];
  const code = Array.from(String(name || '')).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return tones[code % tones.length];
}

function renderLog(entries) {
  log.replaceChildren();
  for (const entry of entries.slice(-4)) {
    const item = document.createElement('li');
    item.textContent = entry.text;
    log.appendChild(item);
  }
}

function renderWinner(next) {
  const show = next.status === 'solved';
  winner.hidden = !show;
  winner.replaceChildren();
  if (!show) return;
  const person = next.players.find((player) => player.id === next.winnerId);
  const kicker = document.createElement('p');
  kicker.textContent = 'Solved';
  const title = document.createElement('h2');
  title.textContent = person?.name || 'Winner';
  const line = document.createElement('p');
  line.textContent = `${next.phrase || ''} · ${money(next.won)}`.replace(/^\s*·\s*/, '').replace(/\s+·\s*$/, '');
  winner.append(kicker, title, line);
  if (previousStatus !== 'solved') burst();
}

function renderHub(next) {
  const player = next.players[next.turn];
  if (next.status === 'solved') {
    const winner = next.players.find((entry) => entry.id === next.winnerId);
    hubKicker.textContent = winner?.name || 'Winner';
    hubScore.textContent = money(next.won);
    return;
  }
  if (next.status !== 'playing' || !player) {
    hubKicker.textContent = 'Join';
    hubScore.textContent = '/join';
    return;
  }
  hubKicker.textContent = player.name;
  hubScore.textContent = money(player.round);
}

function highlightCommand(next) {
  const hot = next.phase === 'guess' ? 'guess' : next.phase === 'turn' ? 'spin' : next.phase === 'solved' ? 'solve' : 'join';
  for (const command of commands) command.classList.toggle('hot', command.dataset.cmd === hot);
}

function placeWheel(next) {
  const idle = !next.spin && (next.status === 'lobby' || next.phase === 'waiting');
  canvas.classList.toggle('idle', idle);
  if (!next.spin || !next.wedges?.length) return;
  if (next.spin.id === lastSpinId) return;
  const animate = next.phase === 'spinning';
  lastSpinId = next.spin.id;
  const count = next.wedges.length;
  const seg = 360 / count;
  const desired = -next.spin.index * seg;
  const desiredMod = ((desired % 360) + 360) % 360;
  let target = rotation - ((rotation % 360) + 360) % 360 + desiredMod;
  if (target <= rotation) target += 360;
  if (animate) target += 360 * 6;
  rotation = target;
  canvas.style.animation = 'none';
  canvas.style.transition = animate
    ? `transform ${next.spinMs || 4800}ms cubic-bezier(.12,.72,.08,1)`
    : 'none';
  canvas.style.transform = `rotate(${rotation}deg)`;
  if (animate && next.sound) playSpin(next.spinMs || 4800);
}

function react(next) {
  if (next.message === previousMessage) return;
  if (/BANKRUPT/i.test(next.message)) {
    stage.classList.remove('shake');
    void stage.offsetWidth;
    stage.classList.add('shake');
    showFlash('BANKRUPT', 'bankrupt');
    if (next.sound) tone(90, 0.45, 'sawtooth', 0.05);
    return;
  }
  const added = (next.revealed || []).filter((letter) => !previousRevealed.includes(letter));
  if (added.length) {
    showFlash(added[0], 'good');
    if (next.sound) {
      tone(880, 0.12, 'sine', 0.05);
      setTimeout(() => tone(1320, 0.16, 'sine', 0.05), 90);
    }
  }
  if (next.status === 'solved' && previousStatus !== 'solved' && next.sound) {
    [523, 659, 784, 1046].forEach((freq, index) => {
      setTimeout(() => tone(freq, 0.18, 'triangle', 0.05), index * 120);
    });
  }
  if (/No [A-Z] /.test(next.message) || /missed the solve|lost the turn|ran out of time|repeated/.test(next.message)) {
    if (next.sound) tone(140, 0.22, 'square', 0.04);
  }
}

function showFlash(text, kind) {
  clearTimeout(flashTimer);
  flash.textContent = text;
  flash.className = `flash show ${kind || ''}`;
  flashTimer = setTimeout(() => { flash.className = 'flash'; }, 900);
}

function burst() {
  confetti.replaceChildren();
  const colors = ['#f6d36b', '#ffffff', '#60a5fa', '#fb7185', '#34d399'];
  for (let i = 0; i < 70; i += 1) {
    const bit = document.createElement('i');
    bit.style.left = `${Math.random() * 100}%`;
    bit.style.background = colors[i % colors.length];
    bit.style.animationDuration = `${1.1 + Math.random()}s`;
    bit.style.animationDelay = `${Math.random() * 0.2}s`;
    confetti.appendChild(bit);
  }
}

function money(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function drawWheel(target, wedges) {
  const size = 1000;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  target.width = size * dpr;
  target.height = size * dpr;
  const ctx = target.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const center = size / 2;
  const radius = size / 2 - 28;
  const arc = (Math.PI * 2) / wedges.length;
  wedges.forEach((wedge, index) => {
    const start = -Math.PI / 2 - arc / 2 + index * arc;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, start, start + arc);
    ctx.closePath();
    ctx.fillStyle = wedge.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(246, 211, 107, 0.9)';
    ctx.stroke();
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = wedge.text || '#ffffff';
    const lines = String(wedge.label).split('\n');
    ctx.font = `800 ${lines.length > 1 ? 22 : 30}px Arial Black, Segoe UI, sans-serif`;
    lines.forEach((line, lineIndex) => {
      ctx.fillText(line, radius - 42, (lineIndex - (lines.length - 1) / 2) * 26 + 8);
    });
    ctx.restore();
  });
  wedges.forEach((_, index) => {
    const angle = -Math.PI / 2 - arc / 2 + index * arc;
    ctx.beginPath();
    ctx.arc(center + Math.cos(angle) * (radius + 2), center + Math.sin(angle) * (radius + 2), 8, 0, Math.PI * 2);
    ctx.fillStyle = '#f8e7a2';
    ctx.fill();
  });
  ctx.beginPath();
  ctx.arc(center, center, radius + 10, 0, Math.PI * 2);
  ctx.lineWidth = 16;
  ctx.strokeStyle = '#e8c56b';
  ctx.stroke();
}

function playSpin(ms) {
  tickTimers.forEach(clearTimeout);
  tickTimers = [];
  let at = 40;
  let step = 46;
  while (at < ms - 200) {
    const when = at;
    tickTimers.push(setTimeout(() => tone(160 + Math.random() * 30, 0.03, 'square', 0.025), when));
    at += step;
    step *= 1.045;
  }
}

function tone(freq, duration, type, gain) {
  if (!Number.isFinite(freq) || !Number.isFinite(duration)) return;
  const context = audioContext();
  if (!context) return;
  const osc = context.createOscillator();
  const amp = context.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, context.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
  osc.connect(amp).connect(context.destination);
  osc.start();
  osc.stop(context.currentTime + duration);
}

function audioContext() {
  if (!state?.sound) return null;
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return null;
  if (!audio) audio = new Context();
  if (audio.state === 'suspended') audio.resume();
  return audio;
}

function fitStage() {
  const scale = Math.min(window.innerWidth / 480, window.innerHeight / 900);
  const safe = Number.isFinite(scale) && scale > 0 ? scale : 1;
  const x = Math.max(0, (window.innerWidth - 480 * safe) / 2);
  const y = Math.max(0, (window.innerHeight - 900 * safe) / 2);
  stage.style.transform = `translate(${x}px, ${y}px) scale(${safe})`;
}

fitStage();
window.addEventListener('resize', fitStage);

setInterval(() => {
  if (!state?.deadline || !state.clockMs) {
    clockWrap.hidden = true;
    indicatorTime.hidden = true;
    return;
  }
  const left = Math.max(0, state.deadline - Date.now());
  const seconds = String(Math.ceil(left / 1000));
  clockWrap.hidden = false;
  clock.textContent = seconds;
  clockBar.style.transform = `scaleX(${Math.max(0, left / state.clockMs)})`;
  indicatorTime.hidden = indicator.hidden;
  indicatorTime.textContent = seconds;
}, 200);
