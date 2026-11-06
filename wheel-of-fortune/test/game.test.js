import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import { parseCommand } from '../lib/commands.js';
import { WEDGES, createGame, hostView, publicView } from '../lib/game.js';
import { createApp } from '../server.js';

function at(index) {
  return () => (index + 0.01) / WEDGES.length;
}

function indexes(sequence) {
  let cursor = 0;
  return () => (sequence[Math.min(cursor++, sequence.length - 1)] + 0.01) / WEDGES.length;
}

function land(game, result) {
  return game.dispatch(result.effects[0].action);
}

function spinAndLand(game, id, name) {
  const spinning = game.dispatch({ type: 'SPIN', id, name });
  return land(game, spinning);
}

test('chat commands', () => {
  assert.deepEqual(parseCommand('  /join  '), { type: 'join' });
  assert.deepEqual(parseCommand('!join please'), { type: 'join' });
  assert.equal(parseCommand('hello /join'), null);
  assert.equal(parseCommand('/g S').letter, 'S');
  assert.equal(parseCommand('/gS').letter, 'S');
  assert.equal(parseCommand('/guess S').letter, 'S');
  assert.equal(parseCommand('/guessS').letter, 'S');
  assert.equal(parseCommand('!g the letter m').letter, 'M');
  assert.equal(parseCommand('/g hello').letter, '');
  assert.equal(parseCommand('T').letter, 'T');
  assert.equal(parseCommand('t').letter, 'T');
  assert.equal(parseCommand('hi'), null);
  assert.equal(parseCommand('/solve fresh lemonade!').phrase, 'fresh lemonade!');
  assert.equal(parseCommand('/solve').phrase, '');
  assert.equal(parseCommand('!solve never gonna give you up').phrase, 'never gonna give you up');
  assert.deepEqual(parseCommand('/s'), { type: 'spin' });
  assert.deepEqual(parseCommand('!s'), { type: 'spin' });
  assert.deepEqual(parseCommand('/spin'), { type: 'spin' });
  assert.equal(parseCommand('/solve the ranch').type, 'solve');
});

test('a full turn pays, then a solve banks the score', () => {
  const game = createGame(at(0));
  game.dispatch({ type: 'SET_PUZZLE', category: 'Secret', puzzle: 'zxq plane' });
  game.dispatch({ type: 'JOIN', id: 'Alex', name: 'Alex' });
  const spun = game.dispatch({ type: 'START' });
  assert.equal(spun.state.phase, 'spinning');
  assert.equal(spun.state.wedge.value, 500);
  assert.equal(JSON.stringify(publicView(spun.state)).includes('ZXQ'), false);
  assert.equal(JSON.stringify(publicView(spun.state)).includes('PLANE'), false);
  assert.equal(hostView(spun.state).phrase, 'ZXQ PLANE');

  const token = spun.state.token;
  game.dispatch({ type: 'JOIN', id: 'sam', name: 'Sam' });
  assert.equal(game.getState().token, token);
  const ready = land(game, spun);
  assert.equal(ready.state.phase, 'guess');
  assert.equal(ready.state.clockMs, 20000);

  game.dispatch({ type: 'GUESS', id: 'sam', name: 'Sam', letter: 'Z' });
  assert.match(game.getState().message, /wait for a turn/i);

  const hit = game.dispatch({ type: 'GUESS', id: 'alex', name: 'Alex', letter: 'Z' });
  assert.equal(hit.state.players[0].round, 500);
  assert.equal(hit.state.phase, 'turn');
  assert.equal(hit.state.clockMs, 20000);
  assert.equal(hit.effects[0].action.type, 'TIMEOUT');
  assert.equal(JSON.stringify(publicView(hit.state)).includes('PLANE'), false);

  const solved = game.dispatch({ type: 'SOLVE', id: 'alex', name: 'Alex', phrase: 'zxq-plane!!' });
  assert.equal(solved.state.status, 'solved');
  assert.equal(solved.state.players[0].total, 500);
  assert.equal(solved.state.players[0].solved, 1);
  assert.equal(solved.state.players[0].round, 0);
  assert.equal(publicView(solved.state).phrase, 'ZXQ PLANE');
  assert.equal(solved.effects[0].type, 'clear');
});

test('bankrupt clears the round score and a wrong guess passes the turn', () => {
  const bankruptAt = WEDGES.findIndex((wedge) => wedge.type === 'bankrupt');
  const game = createGame(indexes([0, bankruptAt]));
  game.dispatch({ type: 'SET_PUZZLE', category: 'Sound', puzzle: 'TOOT' });
  game.dispatch({ type: 'JOIN', id: 'alex', name: 'Alex' });
  game.dispatch({ type: 'JOIN', id: 'sam', name: 'Sam' });
  land(game, game.dispatch({ type: 'START' }));
  const hit = game.dispatch({ type: 'GUESS', id: 'alex', name: 'Alex', letter: 'T' });
  assert.equal(hit.state.players[0].round, 1000);
  assert.equal(hit.state.phase, 'turn');
  const spinning = game.dispatch({ type: 'SPIN', id: 'alex', name: 'Alex' });
  assert.equal(spinning.state.wedge.type, 'bankrupt');
  const after = game.dispatch(spinning.effects[0].action);
  assert.equal(after.state.players[0].round, 0);
  assert.match(after.state.message, /BANKRUPT/);
});

test('free play keeps the turn after a miss, and vowels cost 250', () => {
  const freeAt = WEDGES.findIndex((wedge) => wedge.type === 'free');
  const game = createGame(at(freeAt));
  game.dispatch({ type: 'SET_PUZZLE', category: 'Sound', puzzle: 'TOOT' });
  game.dispatch({ type: 'JOIN', id: 'alex', name: 'Alex' });
  land(game, game.dispatch({ type: 'START' }));
  const missed = game.dispatch({ type: 'GUESS', id: 'alex', name: 'Alex', letter: 'S' });
  assert.equal(missed.state.phase, 'result');
  assert.equal(missed.state.turn, 0);
  assert.equal(missed.effects[0].action.type, 'OFFER_TURN');
  const kept = game.dispatch(missed.effects[0].action);
  assert.equal(kept.state.phase, 'turn');
  assert.equal(kept.state.clockMs, 20000);
  assert.equal(kept.state.turn, 0);
  const still = game.dispatch({ type: 'TIMEOUT', token: kept.state.token });
  assert.equal(still.state.turn, 0);
  assert.equal(still.state.phase, 'turn');
  assert.equal(still.effects[0].action.type, 'TIMEOUT');
  assert.doesNotMatch(still.state.message, /lost the turn|ran out of time/);

  const paid = createGame(at(0));
  paid.dispatch({ type: 'SET_PUZZLE', category: 'Sound', puzzle: 'TOOT' });
  paid.dispatch({ type: 'JOIN', id: 'alex', name: 'Alex' });
  land(paid, paid.dispatch({ type: 'START' }));
  paid.dispatch({ type: 'GUESS', id: 'alex', name: 'Alex', letter: 'O' });
  assert.match(paid.getState().message, /needs \$250/);
  paid.dispatch({ type: 'GUESS', id: 'alex', name: 'Alex', letter: 'T' });
  const bought = paid.dispatch({ type: 'GUESS', id: 'alex', name: 'Alex', letter: 'O' });
  assert.equal(bought.state.status, 'solved');
  assert.equal(bought.state.won, 750);
});

test('landing on free play does not pass the turn when the clock runs out', () => {
  const freeAt = WEDGES.findIndex((wedge) => wedge.type === 'free');
  const free = createGame(at(freeAt));
  free.dispatch({ type: 'SET_PUZZLE', category: 'Sound', puzzle: 'TOOT' });
  free.dispatch({ type: 'JOIN', id: 'alex', name: 'Alex' });
  free.dispatch({ type: 'JOIN', id: 'sam', name: 'Sam' });
  const landed = land(free, free.dispatch({ type: 'START' }));
  assert.equal(landed.state.wedge.type, 'free');
  assert.equal(landed.state.phase, 'guess');
  assert.equal(landed.state.turn, 0);
  assert.match(landed.state.message, /FREE PLAY/);
  assert.doesNotMatch(landed.state.message, /lost the turn/);
  const stayed = free.dispatch({ type: 'TIMEOUT', token: landed.state.token });
  assert.equal(stayed.state.turn, 0);
  assert.equal(stayed.state.phase, 'guess');
  assert.equal(stayed.state.players[stayed.state.turn].id, 'alex');
  assert.equal(stayed.effects[0].action.type, 'TIMEOUT');
  assert.doesNotMatch(stayed.state.message, /lost the turn|ran out of time/);

  const cash = createGame(at(0));
  cash.dispatch({ type: 'SET_PUZZLE', category: 'Sound', puzzle: 'TOOT' });
  cash.dispatch({ type: 'JOIN', id: 'alex', name: 'Alex' });
  cash.dispatch({ type: 'JOIN', id: 'sam', name: 'Sam' });
  const ready = land(cash, cash.dispatch({ type: 'START' }));
  const lost = cash.dispatch({ type: 'TIMEOUT', token: ready.state.token });
  assert.equal(lost.state.phase, 'result');
  assert.match(lost.state.message, /ran out of time/);
  const next = cash.dispatch(lost.effects[0].action);
  assert.equal(next.state.turn, 1);
  assert.equal(next.state.phase, 'spinning');
});

test('the leaderboard ranks by total points, then puzzles solved', () => {
  const game = createGame(at(0));
  game.dispatch({ type: 'SET_PUZZLE', category: 'Sound', puzzle: 'TOOT' });
  game.dispatch({ type: 'JOIN', id: 'sam', name: 'Sam' });
  game.dispatch({ type: 'JOIN', id: 'alex', name: 'Alex' });
  land(game, game.dispatch({ type: 'START' }));
  game.dispatch({ type: 'GUESS', id: 'sam', name: 'Sam', letter: 'T' });
  const first = game.dispatch({ type: 'SOLVE', id: 'sam', name: 'Sam', phrase: 'toot' });
  assert.equal(first.state.players.find((player) => player.id === 'sam').solved, 1);
  assert.equal(first.state.players.find((player) => player.id === 'alex').solved, 0);

  game.dispatch({ type: 'SET_PUZZLE', category: 'Sound', puzzle: 'BEEP' });
  const next = game.dispatch({ type: 'START' });
  assert.equal(next.state.players.find((player) => player.id === 'sam').total, 1000);
  assert.equal(next.state.players.find((player) => player.id === 'sam').solved, 1);
  const skipped = game.dispatch({ type: 'SKIP' });
  assert.equal(skipped.state.players[skipped.state.turn].id, 'alex');
  const second = game.dispatch({ type: 'FORCE_SOLVE' });
  const board = hostView(second.state).leaderboard;
  assert.equal(board[0].name, 'Sam');
  assert.equal(board[0].rank, 1);
  assert.equal(board[0].total, 1000);
  assert.equal(board[0].solved, 1);
  assert.equal(board[1].name, 'Alex');
  assert.equal(board[1].solved, 1);
  assert.equal(board[1].gap, 1000);
});

test('a join stores an https profile picture and drops anything else', () => {
  const game = createGame();
  const joined = game.dispatch({
    type: 'JOIN',
    id: 'alex',
    name: 'Alex',
    avatar: 'https://example.com/alex.jpg',
  });
  assert.equal(joined.state.players[0].avatar, 'https://example.com/alex.jpg');
  assert.equal(hostView(joined.state).players[0].avatar, 'https://example.com/alex.jpg');
  const blocked = game.dispatch({
    type: 'JOIN',
    id: 'sam',
    name: 'Sam',
    avatar: 'javascript:alert(1)',
  });
  assert.equal(blocked.state.players[1].avatar, '');
});

test('the overlay state never includes the unsolved puzzle', async () => {
  const { server, close } = createApp();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = server.address().port;
  try {
    const post = (body) => fetch(`http://127.0.0.1:${port}/api/host`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    await post({ action: 'puzzle', category: 'Secret', puzzle: 'zxq plane' });
    await post({ action: 'chat', name: 'Alex', comment: '/join' });
    await post({ action: 'start' });
    const overlay = await (await fetch(`http://127.0.0.1:${port}/api/state?role=overlay`)).json();
    const host = await (await fetch(`http://127.0.0.1:${port}/api/state?role=host`)).json();
    assert.equal(JSON.stringify(overlay).includes('ZXQ'), false);
    assert.equal(JSON.stringify(overlay).includes('PLANE'), false);
    assert.equal(host.phrase, 'ZXQ PLANE');
    assert.equal(overlay.players[0].name, 'Alex');
    assert.equal(overlay.phase, 'spinning');
    assert.equal(overlay.clockMs, null);
  } finally {
    await close();
  }
});
