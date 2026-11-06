"use strict";

const VOWELS = new Set(["A", "E", "I", "O", "U"]);
const VOWEL_COST = 250;
const SPIN_MS = 5200;

const WEDGES = [
  { label: "$500", value: 500, kind: "money", color: "#e23b78" },
  { label: "$600", value: 600, kind: "money", color: "#f0a202" },
  { label: "$700", value: 700, kind: "money", color: "#1f8fff" },
  { label: "BANKRUPT", value: 0, kind: "bankrupt", color: "#1a1024" },
  { label: "$800", value: 800, kind: "money", color: "#7c4dff" },
  { label: "$550", value: 550, kind: "money", color: "#12b886" },
  { label: "$900", value: 900, kind: "money", color: "#ff6b35" },
  { label: "LOSE TURN", value: 0, kind: "lose", color: "#5b2a86" },
  { label: "$650", value: 650, kind: "money", color: "#ef476f" },
  { label: "$1,000", value: 1000, kind: "money", color: "#118ab2" },
  { label: "$750", value: 750, kind: "money", color: "#06d6a0" },
  { label: "PRIZE", value: 500, kind: "prize", color: "#ffd60a" },
  { label: "$600", value: 600, kind: "money", color: "#f77f00" },
  { label: "$2,500", value: 2500, kind: "money", color: "#9b5de5" },
  { label: "$500", value: 500, kind: "money", color: "#00bbf9" },
  { label: "BANKRUPT", value: 0, kind: "bankrupt", color: "#14080f" },
];

const SAMPLES = [
  { category: "Phrase", puzzle: "LIVE FROM THIS MACHINE" },
  { category: "Food & Drink", puzzle: "STRAWBERRY SHORTCAKE" },
  { category: "Song Title", puzzle: "DON'T STOP BELIEVIN'" },
  { category: "Before & After", puzzle: "COFFEE BREAK A LEG" },
];

function createGame() {
  return {
    category: "",
    puzzle: "",
    revealed: [],
    players: [1, 2, 3].map((n) => ({ name: `Player ${n}`, score: 0, round: 0 })),
    current: 0,
    phase: "setup",
    wedgeIndex: null,
    stake: 0,
    spin: null,
    spinSeq: 0,
    wheelRotation: 0,
    used: [],
    message: "Load a puzzle, then spin to start the round.",
    winner: null,
    vowelCost: VOWEL_COST,
  };
}

function isLetter(ch) {
  return ch >= "A" && ch <= "Z";
}

function formatMoney(amount) {
  const digits = Math.abs(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${amount < 0 ? "-" : ""}$${digits}`;
}

function playerName(state, index) {
  const name = state.players[index] && state.players[index].name.trim();
  return name || `Player ${index + 1}`;
}

function normalizePuzzle(raw) {
  const text = String(raw || "").toUpperCase().replace(/\s+/g, " ").trim();
  if (!text) throw new Error("Enter a puzzle first.");
  if (text.length > 48) throw new Error("Keep the puzzle to 48 characters.");
  if (![...text].some(isLetter)) throw new Error("The puzzle needs at least one letter.");
  for (const ch of text) {
    if (!isLetter(ch) && !" '-&!?.,".includes(ch)) {
      throw new Error("Use letters, spaces, and simple punctuation only.");
    }
  }
  return text;
}

function revealedFor(puzzle) {
  return [...puzzle].map((ch) => !isLetter(ch));
}

function fold(text) {
  return String(text || "").toUpperCase().replace(/[^A-Z]/g, "");
}

function cleanLetter(value) {
  const letter = String(value || "").trim().toUpperCase();
  if (!/^[A-Z]$/.test(letter)) throw new Error("Call one letter.");
  return letter;
}

function rollWedge(rng) {
  const count = WEDGES.length;
  let roll = Number(rng());
  if (!Number.isFinite(roll) || roll < 0) roll = 0;
  if (roll >= 1) roll = 0.999999;
  return Math.floor(roll * count);
}

function landingRotation(current, index, jitter) {
  const slice = 360 / WEDGES.length;
  const target = (((360 - index * slice) % 360) + jitter + 360) % 360;
  let next = current + 360 * 5;
  const mod = ((next % 360) + 360) % 360;
  next += (target - mod + 360) % 360;
  return next;
}

function indexAtPointer(rotation) {
  const slice = 360 / WEDGES.length;
  const mod = ((rotation % 360) + 360) % 360;
  const atPointer = (360 - mod) % 360;
  const shifted = (atPointer + slice / 2) % 360;
  return Math.floor(shifted / slice) % WEDGES.length;
}

function endTurn(state, lead) {
  state.current = (state.current + 1) % state.players.length;
  state.phase = "spin";
  state.stake = 0;
  state.wedgeIndex = null;
  state.message = `${lead} ${playerName(state, state.current)}, it's your turn.`;
}

function revealLetter(state, letter) {
  let hits = 0;
  [...state.puzzle].forEach((ch, index) => {
    if (ch === letter && !state.revealed[index]) {
      state.revealed[index] = true;
      hits += 1;
    }
  });
  return hits;
}

function boardClear(state) {
  return state.revealed.every(Boolean);
}

function awardSolve(state) {
  const banked = state.players[state.current].round;
  const who = playerName(state, state.current);
  state.players.forEach((player, index) => {
    if (index === state.current) player.score += player.round;
    player.round = 0;
  });
  state.revealed = state.revealed.map(() => true);
  state.phase = "solved";
  state.winner = state.current;
  state.stake = 0;
  state.message = `${who} solved it and banks ${formatMoney(banked)}.`;
}

function applyWedge(state, index) {
  const wedge = WEDGES[index];
  const who = playerName(state, state.current);
  state.wedgeIndex = index;
  if (wedge.kind === "bankrupt") {
    state.players[state.current].round = 0;
    endTurn(state, `Bankrupt. ${who} loses this round's bank.`);
    return;
  }
  if (wedge.kind === "lose") {
    endTurn(state, `Lose a turn for ${who}.`);
    return;
  }
  state.stake = wedge.value;
  state.phase = "guess";
  state.message = wedge.kind === "prize"
    ? `${who} landed on a prize and plays for ${formatMoney(wedge.value)} a letter. Call a consonant.`
    : `${who} spun ${wedge.label}. Call a consonant.`;
}

function assertNotSpinning(state) {
  if (state.phase === "spinning") throw new Error("Wait for the wheel to stop.");
}

function applyAction(state, action, rng = Math.random) {
  const type = action && action.type;
  switch (type) {
    case "loadPuzzle": {
      assertNotSpinning(state);
      const puzzle = normalizePuzzle(action.puzzle);
      const category = String(action.category || "Phrase").trim().slice(0, 40) || "Phrase";
      state.puzzle = puzzle;
      state.category = category;
      state.revealed = revealedFor(puzzle);
      state.used = [];
      state.players.forEach((player) => {
        player.round = 0;
      });
      state.current = 0;
      state.phase = "spin";
      state.wedgeIndex = null;
      state.stake = 0;
      state.winner = null;
      state.message = `${category}. ${playerName(state, 0)}, spin the wheel.`;
      return {};
    }
    case "rename": {
      const index = action.index;
      if (!Number.isInteger(index) || index < 0 || index >= state.players.length) {
        throw new Error("That player isn't at the table.");
      }
      const name = String(action.name || "").replace(/\s+/g, " ").trim().slice(0, 24);
      state.players[index].name = name || `Player ${index + 1}`;
      return {};
    }
    case "welcome": {
      state.message = "Welcome to Wheel of Fortune!";
      return {};
    }
    case "newRound": {
      assertNotSpinning(state);
      state.category = "";
      state.puzzle = "";
      state.revealed = [];
      state.used = [];
      state.players.forEach((player) => {
        player.round = 0;
      });
      state.current = 0;
      state.phase = "setup";
      state.wedgeIndex = null;
      state.stake = 0;
      state.winner = null;
      state.message = "Round cleared. Load the next puzzle. Totals stay.";
      return { cancelSpin: true };
    }
    case "reset": {
      assertNotSpinning(state);
      const names = state.players.map((player) => player.name);
      const fresh = createGame();
      fresh.players.forEach((player, index) => {
        player.name = names[index] || player.name;
      });
      fresh.wheelRotation = state.wheelRotation;
      for (const key of Object.keys(state)) delete state[key];
      Object.assign(state, fresh);
      state.message = "Scores cleared. Load a puzzle to start a new show.";
      return { cancelSpin: true };
    }
    case "spin": {
      if (state.phase !== "spin" && state.phase !== "decide") {
        throw new Error("You can't spin right now.");
      }
      const index = rollWedge(rng);
      const jitter = (Number(rng()) - 0.5) * 16;
      state.wheelRotation = landingRotation(state.wheelRotation, index, Number.isFinite(jitter) ? jitter : 0);
      state.spinSeq += 1;
      state.phase = "spinning";
      state.spin = { id: state.spinSeq, index };
      state.message = "Spinning…";
      return { spin: true };
    }
    case "resolveSpin": {
      if (state.phase !== "spinning" || !state.spin) return {};
      applyWedge(state, state.spin.index);
      return {};
    }
    case "guess": {
      if (state.phase !== "guess") throw new Error("Spin the wheel before calling a consonant.");
      const letter = cleanLetter(action.letter);
      if (VOWELS.has(letter)) throw new Error("Buy vowels instead of calling them.");
      if (state.used.includes(letter)) throw new Error(`${letter} was already called.`);
      state.used.push(letter);
      const hits = revealLetter(state, letter);
      if (hits === 0) {
        endTurn(state, `No ${letter}.`);
        return {};
      }
      const gain = hits * state.stake;
      state.players[state.current].round += gain;
      if (boardClear(state)) {
        awardSolve(state);
        return {};
      }
      state.phase = "decide";
      const plural = hits === 1 ? "" : "s";
      state.message = `${hits} ${letter}${plural} for ${formatMoney(gain)}. Spin, buy a vowel, or solve.`;
      return {};
    }
    case "buyVowel": {
      if (state.phase !== "decide") throw new Error("Buy a vowel after a correct consonant.");
      const letter = cleanLetter(action.letter);
      if (!VOWELS.has(letter)) throw new Error("That isn't a vowel.");
      if (state.used.includes(letter)) throw new Error(`${letter} was already called.`);
      const player = state.players[state.current];
      if (player.round < VOWEL_COST) {
        throw new Error(`You need ${formatMoney(VOWEL_COST)} in this round to buy a vowel.`);
      }
      state.used.push(letter);
      player.round -= VOWEL_COST;
      const hits = revealLetter(state, letter);
      if (hits === 0) {
        endTurn(state, `No ${letter}.`);
        return {};
      }
      if (boardClear(state)) {
        awardSolve(state);
        return {};
      }
      state.message = `${letter} is on the board. Spin, buy a vowel, or solve.`;
      return {};
    }
    case "solve": {
      if (state.phase !== "guess" && state.phase !== "decide") {
        throw new Error("Spin the wheel before solving.");
      }
      if (fold(action.text) !== fold(state.puzzle)) {
        endTurn(state, "That's not it.");
        return {};
      }
      awardSolve(state);
      return {};
    }
    default:
      throw new Error("Unknown action.");
  }
}

function tileRows(state, showSecret) {
  if (!state.puzzle) return [];
  const rows = [];
  let word = [];
  const push = () => {
    if (word.length) rows.push(word);
    word = [];
  };
  [...state.puzzle].forEach((ch, index) => {
    if (ch === " ") {
      push();
      return;
    }
    const open = state.revealed[index];
    let kind = "punct";
    if (isLetter(ch)) {
      if (open) kind = "open";
      else kind = showSecret ? "secret" : "blank";
    }
    word.push({
      ch: open || showSecret || kind === "punct" ? ch : "",
      kind,
    });
  });
  push();
  return rows;
}

function snapshot(state, showSecret) {
  const round = state.players[state.current] ? state.players[state.current].round : 0;
  const vowelLeft = ["A", "E", "I", "O", "U"].some((letter) => !state.used.includes(letter));
  return {
    category: state.category,
    rows: tileRows(state, showSecret),
    players: state.players.map((player, index) => ({
      name: playerName(state, index),
      score: player.score,
      round: player.round,
      current: index === state.current,
    })),
    current: state.current,
    phase: state.phase,
    message: state.message,
    used: state.used.slice(),
    vowelCost: state.vowelCost,
    winner: state.winner,
    wheelRotation: state.wheelRotation,
    spinId: state.spin ? state.spin.id : 0,
    spinning: state.phase === "spinning",
    wedgeLabel: state.phase === "spinning" || state.wedgeIndex == null ? "" : WEDGES[state.wedgeIndex].label,
    wedges: WEDGES.map(({ label, color, kind }) => ({ label, color, kind })),
    canSpin: state.phase === "spin" || state.phase === "decide",
    canGuess: state.phase === "guess",
    canVowel: state.phase === "decide" && round >= state.vowelCost && vowelLeft,
    canSolve: state.phase === "guess" || state.phase === "decide",
    puzzle: showSecret ? state.puzzle : "",
    samples: showSecret ? SAMPLES : [],
  };
}

module.exports = {
  WEDGES,
  SAMPLES,
  SPIN_MS,
  VOWEL_COST,
  createGame,
  applyAction,
  hostView: (state) => snapshot(state, true),
  publicView: (state) => snapshot(state, false),
  indexAtPointer,
  formatMoney,
};
