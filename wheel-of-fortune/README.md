# Wheel of Paradise

A chat game for TikTok LIVE Studio. Viewers join from chat, take turns on a spinning wheel, and solve the puzzle on stream.

## Play

Double-click `Start Wheel of Fortune.bat`, or from this folder run:

```bash
npm start
```

- Host desk: http://127.0.0.1:8787/host
- Stream overlay: http://127.0.0.1:8787/overlay

The host desk can show the answer. Put only the overlay link in TikTok LIVE Studio.

## TikTok LIVE Studio

1. On the host desk, click Open overlay window.
2. In LIVE Studio, add a source and choose Window. Pick the window titled Wheel of Paradise.
3. Fit that window in the upper half of the phone preview. Leave the bottom clear for chat.
4. Turn on the source's audio if you want the wheel ticks.
5. On the host desk, enter your TikTok username and connect while you are LIVE.

LIVE Studio's Link source rejects `http://127.0.0.1`. Use the overlay window instead.

You can practice before going live. The host desk sends `/join`, `/g`, and solves without a live chat.

## Commands

- `/join` enters the line. Viewers can join in the middle of a round.
- `/s` spins again after a correct letter. The first spin of a turn happens on its own.
- `/g S` plays one letter after the wheel stops. Vowels cost $250 in game points.
- `/solve the whole puzzle` solves it.

When a player loses a turn, the wheel spins for the next player. That player has 20 seconds to guess. The timer is on the board. After a correct letter, the wheel waits until they type `/s`.

`!join`, `!s`, `!g S`, and `!solve` do the same thing if a slash is filtered.

Points stay in the game.

## Checks

```bash
npm test
```
