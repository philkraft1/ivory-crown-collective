"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createGame, applyAction, hostView, publicView, indexAtPointer, WEDGES } = require("../lib/game");

function rngFor(index) {
  let call = 0;
  return () => {
    call += 1;
    if (call % 2 === 1) return (index + 0.01) / WEDGES.length;
    return 0.5;
  };
}

function load(state, puzzle = "HELLO WORLD", category = "Phrase") {
  applyAction(state, { type: "loadPuzzle", puzzle, category });
  return state;
}

test("a loaded puzzle hides letters from the audience and shows them to the host", () => {
  const state = load(createGame(), "QUIZ BOWL");
  const audience = publicView(state);
  const host = hostView(state);
  assert.equal(audience.rows.flat().map((tile) => tile.ch).join(""), "");
  assert.equal(JSON.stringify(audience).includes("QUIZ"), false);
  assert.equal(host.rows.flat().filter((tile) => tile.kind === "secret").map((tile) => tile.ch).join(""), "QUIZBOWL");
  assert.equal(host.puzzle, "QUIZ BOWL");
  assert.equal(state.phase, "spin");
});

test("punctuation starts revealed", () => {
  const state = load(createGame(), "DON'T STOP");
  const audience = publicView(state).rows.flat().map((tile) => tile.ch).join("");
  assert.equal(audience, "'");
});

test("the wheel stops on the wedge the server chose", () => {
  for (let index = 0; index < WEDGES.length; index += 1) {
    const state = load(createGame());
    state.wheelRotation = 1234.5;
    applyAction(state, { type: "spin" }, rngFor(index));
    assert.equal(indexAtPointer(state.wheelRotation), index);
    applyAction(state, { type: "resolveSpin" });
    if (WEDGES[index].kind === "money" || WEDGES[index].kind === "prize") {
      assert.equal(state.phase, "guess");
      assert.equal(state.stake, WEDGES[index].value);
    } else if (WEDGES[index].kind === "bankrupt") {
      assert.equal(state.phase, "spin");
      assert.equal(state.current, 1);
      assert.equal(state.players[0].round, 0);
    } else {
      assert.equal(state.phase, "spin");
      assert.equal(state.current, 1);
    }
  }
});

test("a correct consonant pays the stake times the hits and a vowel costs 250", () => {
  const state = load(createGame());
  applyAction(state, { type: "spin" }, rngFor(0));
  applyAction(state, { type: "resolveSpin" });
  applyAction(state, { type: "guess", letter: "l" });
  assert.equal(state.players[0].round, 1500);
  assert.equal(state.phase, "decide");
  applyAction(state, { type: "buyVowel", letter: "O" });
  assert.equal(state.players[0].round, 1250);
  assert.equal(publicView(state).rows.flat().map((tile) => tile.ch).join(""), "LLOOL");
  assert.equal(JSON.stringify(publicView(state)).includes("HELLO"), false);
});

test("a miss, a wrong vowel, and a wrong solve pass the turn without banking", () => {
  const state = load(createGame());
  state.players[0].name = "Ava";
  state.players[1].name = "Bea";
  const rng = (() => {
    const indexes = [1, 0, 0, 0];
    let call = 0;
    return () => {
      const index = indexes[Math.floor(call / 2)];
      const jitter = call % 2 === 1;
      call += 1;
      return jitter ? 0.5 : (index + 0.01) / WEDGES.length;
    };
  })();
  applyAction(state, { type: "spin" }, rng);
  applyAction(state, { type: "resolveSpin" });
  applyAction(state, { type: "guess", letter: "L" });
  applyAction(state, { type: "spin" }, rng);
  applyAction(state, { type: "resolveSpin" });
  applyAction(state, { type: "guess", letter: "T" });
  assert.equal(state.current, 1);
  assert.equal(state.players[0].round, 1800);
  applyAction(state, { type: "spin" }, rng);
  applyAction(state, { type: "resolveSpin" });
  applyAction(state, { type: "guess", letter: "H" });
  applyAction(state, { type: "buyVowel", letter: "A" });
  assert.equal(state.current, 2);
  assert.equal(state.players[1].round, 250);
  applyAction(state, { type: "spin" }, rng);
  applyAction(state, { type: "resolveSpin" });
  applyAction(state, { type: "solve", text: "goodbye" });
  assert.equal(state.current, 0);
  assert.equal(state.players[2].score, 0);
  assert.equal(state.players[0].round, 1800);
});

test("solving banks only the solver and reveals the board", () => {
  const state = load(createGame(), "CAT");
  applyAction(state, { type: "spin" }, rngFor(0));
  applyAction(state, { type: "resolveSpin" });
  applyAction(state, { type: "solve", text: "cat" });
  assert.equal(state.phase, "solved");
  assert.equal(state.players[0].score, 0);
  assert.equal(publicView(state).rows.flat().map((tile) => tile.ch).join(""), "CAT");
});

test("filling the board banks the round score", () => {
  const state = load(createGame(), "LL");
  applyAction(state, { type: "spin" }, rngFor(0));
  applyAction(state, { type: "resolveSpin" });
  applyAction(state, { type: "guess", letter: "L" });
  assert.equal(state.phase, "solved");
  assert.equal(state.players[0].score, 1000);
  assert.equal(publicView(state).rows.flat().map((tile) => tile.ch).join(""), "LL");
});

test("bankrupt after a hit clears that player's round bank", () => {
  const state = load(createGame());
  applyAction(state, { type: "spin" }, rngFor(0));
  applyAction(state, { type: "resolveSpin" });
  applyAction(state, { type: "guess", letter: "L" });
  assert.equal(state.players[0].round, 1500);
  applyAction(state, { type: "spin" }, rngFor(3));
  applyAction(state, { type: "resolveSpin" });
  assert.equal(state.players[0].round, 0);
  assert.equal(state.current, 1);
});

test("rejects a puzzle with no letters and a vowel bought with an empty bank", () => {
  const state = createGame();
  assert.throws(() => applyAction(state, { type: "loadPuzzle", puzzle: "???" }), /letter/);
  load(state, "HELLO");
  applyAction(state, { type: "spin" }, rngFor(0));
  applyAction(state, { type: "resolveSpin" });
  applyAction(state, { type: "guess", letter: "H" });
  state.players[0].round = 100;
  assert.throws(() => applyAction(state, { type: "buyVowel", letter: "E" }), /\$250/);
});
