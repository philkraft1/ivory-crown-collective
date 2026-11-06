import { renderBoard, renderScores, drawWheel, setRotation } from "/ui.js";

const params = new URLSearchParams(location.search);
if (params.get("transparent") === "1") document.body.classList.add("transparent");

const board = document.querySelector("#board");
const message = document.querySelector("#message");
const category = document.querySelector("#category");
const scores = document.querySelector("#scores");
const wheel = document.querySelector("#wheel");

let wheelReady = false;
let lastSpinId = -1;

function render(state) {
  category.textContent = state.category || "";
  message.textContent = state.message || "";
  renderBoard(board, state.rows);
  renderScores(scores, state.players);
  if (!wheelReady && state.wedges) {
    drawWheel(wheel, state.wedges);
    wheelReady = true;
  }
  if (state.spinId !== lastSpinId) {
    setRotation(wheel, state.wheelRotation, state.spinning);
    lastSpinId = state.spinId;
  }
}

const events = new EventSource("/events");
events.onmessage = (event) => render(JSON.parse(event.data));
events.onerror = () => {
  if (!category.textContent && message.textContent === "Waiting for the host…") {
    message.textContent = "Reconnecting to the host…";
  }
};
