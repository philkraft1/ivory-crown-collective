import { renderBoard, renderScores, drawWheel, setRotation } from "/ui.js";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const VOWELS = new Set(["A", "E", "I", "O", "U"]);

const board = document.querySelector("#board");
const message = document.querySelector("#message");
const players = document.querySelector("#players");
const letters = document.querySelector("#letters");
const category = document.querySelector("#category");
const puzzle = document.querySelector("#puzzle");
const solve = document.querySelector("#solve");
const spinButton = document.querySelector("#spin");
const samples = document.querySelector("#samples");
const link = document.querySelector("#overlay-link");
const connection = document.querySelector("#conn");
const speakToggle = document.querySelector("#speak");
const wheel = document.querySelector("#wheel");
const wedgeReadout = document.querySelector("#wedge");
const solveButton = document.querySelector("#solve-btn");

link.href = `${location.origin}/overlay`;
link.textContent = link.href;

let state = null;
let lastSpoken = "";
let wheelReady = false;
let lastSpinId = -1;
let namesReady = false;

speakToggle.checked = localStorage.getItem("wop-speak") !== "0";
speakToggle.addEventListener("change", () => {
  localStorage.setItem("wop-speak", speakToggle.checked ? "1" : "0");
});

function speak(text) {
  if (!speakToggle.checked || !text || text === lastSpoken || !window.speechSynthesis) return;
  lastSpoken = text;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.volume = 0.7;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

async function action(body) {
  const response = await fetch("/api/action", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    message.textContent = data.error || "That move didn't work.";
    return null;
  }
  render(data.state);
  return data.state;
}

function renderPlayers() {
  if (!namesReady) {
    renderScores(players, state.players);
    [...players.children].forEach((item, index) => {
      const name = item.querySelector("strong");
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 24;
      input.value = state.players[index].name;
      input.setAttribute("aria-label", `Player ${index + 1} name`);
      input.addEventListener("change", () => {
        action({ type: "rename", index, name: input.value });
      });
      name.replaceWith(input);
    });
    namesReady = true;
    return;
  }
  [...players.children].forEach((item, index) => {
    const player = state.players[index];
    const input = item.querySelector("input");
    if (document.activeElement !== input && input.value !== player.name) input.value = player.name;
    item.classList.toggle("current", player.current);
    item.querySelector("span").textContent = `$${player.score.toLocaleString("en-US")} · round $${player.round.toLocaleString("en-US")}`;
  });
}

function renderLetters() {
  letters.replaceChildren();
  for (const letter of ALPHABET) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = letter;
    const used = state.used.includes(letter);
    const vowel = VOWELS.has(letter);
    button.className = vowel ? "vowel" : "consonant";
    if (used) button.classList.add("used");
    button.disabled = used || (vowel ? !state.canVowel : !state.canGuess);
    button.addEventListener("click", () => callLetter(letter));
    letters.append(button);
  }
}

function render(next) {
  const previousMessage = state ? state.message : "";
  state = next;
  renderBoard(board, state.rows);
  if (!wheelReady && state.wedges) {
    drawWheel(wheel, state.wedges);
    wheelReady = true;
  }
  if (state.spinId !== lastSpinId) {
    setRotation(wheel, state.wheelRotation, state.spinning);
    lastSpinId = state.spinId;
  }
  message.textContent = state.message;
  wedgeReadout.textContent = state.spinning ? "Spinning…" : state.wedgeLabel || "—";
  spinButton.disabled = !state.canSpin;
  solveButton.disabled = !state.canSolve;
  renderPlayers();
  renderLetters();
  if (samples.childElementCount === 0) {
    for (const sample of state.samples) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = sample.category;
      button.addEventListener("click", () => {
        category.value = sample.category;
        puzzle.value = sample.puzzle;
        loadPuzzle(sample.puzzle, sample.category);
      });
      samples.append(button);
    }
  }
  if (previousMessage && state.message !== previousMessage && state.message !== "Spinning…") {
    speak(state.message);
  }
}

function loadPuzzle(text, categoryText) {
  if (state && ["spin", "guess", "decide"].includes(state.phase)) {
    const ok = window.confirm("Replace the current puzzle? This round's unbanked scores will clear.");
    if (!ok) return;
  }
  action({ type: "loadPuzzle", puzzle: text, category: categoryText });
}

function callLetter(letter) {
  if (!state || state.used.includes(letter)) return;
  if (VOWELS.has(letter)) {
    if (state.canVowel) action({ type: "buyVowel", letter });
    return;
  }
  if (state.canGuess) action({ type: "guess", letter });
}

spinButton.addEventListener("click", () => {
  if (state && state.canSpin) action({ type: "spin" });
});
document.querySelector("#load").addEventListener("click", () => {
  loadPuzzle(puzzle.value, category.value);
});
document.querySelector("#welcome").addEventListener("click", () => action({ type: "welcome" }));
document.querySelector("#new-round").addEventListener("click", () => action({ type: "newRound" }));
document.querySelector("#reset").addEventListener("click", () => {
  if (window.confirm("Clear the board and the scores?")) action({ type: "reset" });
});
document.querySelector("#solve-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (state && state.canSolve) action({ type: "solve", text: solve.value });
});
document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, textarea")) return;
  if (event.code === "Space") {
    event.preventDefault();
    if (state && state.canSpin) action({ type: "spin" });
  } else if (/^[a-zA-Z]$/.test(event.key)) {
    callLetter(event.key.toUpperCase());
  }
});

const events = new EventSource("/host-events");
events.onmessage = (event) => render(JSON.parse(event.data));
events.onopen = () => {
  connection.textContent = "Live on this machine";
};
events.onerror = () => {
  connection.textContent = "Reconnecting…";
};
