export function renderBoard(root, rows) {
  root.replaceChildren();
  if (!rows || rows.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Puzzle will appear here";
    root.append(empty);
    return;
  }
  for (const word of rows) {
    const group = document.createElement("div");
    group.className = "word";
    for (const tile of word) {
      const cell = document.createElement("span");
      cell.className = `tile ${tile.kind}`;
      cell.textContent = tile.ch || "";
      group.append(cell);
    }
    root.append(group);
  }
}

export function renderScores(root, players) {
  root.replaceChildren();
  players.forEach((player) => {
    const item = document.createElement("li");
    if (player.current) item.className = "current";
    const name = document.createElement("strong");
    name.textContent = player.name;
    const score = document.createElement("span");
    score.textContent = `$${player.score.toLocaleString("en-US")} · round $${player.round.toLocaleString("en-US")}`;
    item.append(name, score);
    root.append(item);
  });
}

export function drawWheel(wheel, wedges) {
  const slice = 360 / wedges.length;
  const stops = wedges
    .map((wedge, index) => `${wedge.color} ${index * slice}deg ${(index + 1) * slice}deg`)
    .join(", ");
  wheel.style.background = `conic-gradient(from ${-slice / 2}deg, ${stops})`;
  wheel.replaceChildren();
  wedges.forEach((wedge, index) => {
    const label = document.createElement("span");
    const text = document.createElement("em");
    text.textContent = wedge.label;
    label.append(text);
    label.style.transform = `rotate(${index * slice - 90}deg)`;
    if (wedge.kind === "prize") label.dataset.kind = "prize";
    wheel.append(label);
  });
}

export function setRotation(wheel, degrees, animate) {
  if (!animate) {
    wheel.style.transition = "none";
    wheel.style.transform = `rotate(${degrees}deg)`;
    wheel.getBoundingClientRect();
    return;
  }
  wheel.style.transition = "transform 5.2s cubic-bezier(.12,.8,.08,1)";
  wheel.style.transform = `rotate(${degrees}deg)`;
}
