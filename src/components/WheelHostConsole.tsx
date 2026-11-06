"use client";

import { useEffect, useRef, useState } from "react";
import { HostVoiceControls, useHostVoice } from "@/components/HostVoiceControls";
import { DEFAULT_PLAYER_NAMES, playerLabel } from "@/lib/host-voice";

const PLAYERS_STORAGE_KEY = "icc-wheel-player-names";
const PLAYER_COUNT = DEFAULT_PLAYER_NAMES.length;

const actionClass =
  "rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm font-semibold text-pearl transition hover:border-gold hover:bg-gold/20 focus-visible:outline-2 focus-visible:outline-gold";
const groupTitle = "mt-4 text-xs font-semibold tracking-[0.18em] text-pearl/50 uppercase";

/**
 * Host console for the Wheel of Fortune TikTok Live game.
 *
 * Start Game plays a short original synthesized intro snippet (~6s,
 * fading out), then the welcome line as it fades. Turn changes, spins,
 * letter results, wheel results, and solve
 * attempts each play their (quiet, synthesized) effect first and then the
 * matching voice line, so nothing overlaps. Every line/effect is also
 * replayable from the Host voice & sounds panel. This console has no
 * overlay sizing of its own — the 9:16 overlay work (TLG-1) can mount
 * `HostVoiceControls` / `useHostVoice` without taking this page layout.
 */
export function WheelHostConsole() {
  const [playerNames, setPlayerNames] = useState<string[]>([...DEFAULT_PLAYER_NAMES]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [category, setCategory] = useState("");
  const [letter, setLetter] = useState("");
  const [started, setStarted] = useState(false);
  const announcer = useHostVoice(playerNames);
  const a = announcer.announce;
  const announceTurnRef = useRef(a.turn);
  const isFirstPlayerRef = useRef(true);

  useEffect(() => {
    announceTurnRef.current = a.turn;
  }, [a.turn]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = window.localStorage.getItem(PLAYERS_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setPlayerNames(
            DEFAULT_PLAYER_NAMES.map((fallback, index) =>
              typeof parsed[index] === "string" && parsed[index].trim() ? parsed[index] : fallback,
            ),
          );
        }
      } catch {
        // Keep default Player 1–5 names.
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Turn-change trigger (skips first render; browsers need a user gesture).
  useEffect(() => {
    if (isFirstPlayerRef.current) {
      isFirstPlayerRef.current = false;
      return;
    }
    announceTurnRef.current(currentPlayer);
  }, [currentPlayer]);

  const renamePlayer = (index: number, name: string) => {
    setPlayerNames((prev) => {
      const next = prev.map((value, i) => (i === index ? name : value));
      try {
        window.localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Session-only names.
      }
      return next;
    });
  };

  const nextPlayer = () => setCurrentPlayer((prev) => (prev + 1) % PLAYER_COUNT);
  const cleanLetter = letter.trim().toUpperCase() || undefined;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <p className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">TikTok Live · Host console</p>
      <h1 className="mt-2 font-display text-3xl text-pearl sm:text-4xl">Wheel of Fortune</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-pearl/70">
        Start the game for a short intro snippet and welcome, then run the round from here.
        Voices are calm by default (70% volume, relaxed speed); effects are
        quieter still and always finish before the voice starts.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setStarted(true);
            announcer.startGame();
          }}
          className="rounded-xl bg-gold px-5 py-3 text-sm font-bold text-black transition hover:bg-gold-bright"
        >
          ▶ Start Game / Play short intro
        </button>
        <button type="button" onClick={announcer.skipIntro} className={actionClass}>
          Skip intro → welcome
        </button>
        <button type="button" onClick={announcer.stop} className={actionClass}>
          Stop voice &amp; sounds
        </button>
        {started && <span className="self-center text-sm text-gold-hot">Game started</span>}
      </div>

      <section aria-label="Players" className="mt-6 rounded-2xl border border-white/10 bg-void-soft p-4 sm:p-5">
        <h2 className="font-display text-lg tracking-wide text-gold-bright">Players</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {playerNames.map((name, index) => (
            <label
              key={index}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                index === currentPlayer ? "border-gold bg-gold/10 text-pearl" : "border-white/10 text-pearl/70"
              }`}
            >
              <span aria-hidden>{index === currentPlayer ? "▶" : "·"}</span>
              <span className="sr-only">Player {index + 1} name</span>
              <input
                value={name}
                onChange={(event) => renamePlayer(index, event.target.value)}
                maxLength={24}
                aria-label={`Player ${index + 1} name`}
                className="w-full bg-transparent outline-none placeholder:text-pearl/40"
                placeholder={`Player ${index + 1}`}
              />
            </label>
          ))}
        </div>
        <p aria-live="polite" className="mt-3 text-sm text-pearl/80">
          Up now: <strong className="text-gold-hot">{playerLabel(currentPlayer, playerNames)}</strong>
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="text-xs font-semibold tracking-[0.18em] text-pearl/60 uppercase">
            Puzzle category
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="e.g. Phrase, Food & Drink"
              className="mt-1.5 w-full rounded-lg border border-white/15 bg-void px-3 py-2 text-sm normal-case tracking-normal text-pearl"
            />
          </label>
          <label className="text-xs font-semibold tracking-[0.18em] text-pearl/60 uppercase">
            Letter just called
            <input
              value={letter}
              onChange={(event) => setLetter(event.target.value.slice(-1))}
              placeholder="T"
              maxLength={1}
              className="mt-1.5 w-full rounded-lg border border-white/15 bg-void px-3 py-2 text-sm normal-case tracking-normal text-pearl uppercase"
            />
          </label>
        </div>
      </section>

      <section aria-label="Game actions" className="mt-4 rounded-2xl border border-white/10 bg-void-soft p-4 sm:p-5">
        <h2 className="font-display text-lg tracking-wide text-gold-bright">Game actions</h2>
        <p className="mt-1 text-xs text-pearl/60">Each button plays its effect first, then speaks its host line.</p>

        <p className={groupTitle}>Round</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button type="button" className={actionClass} onClick={a.roundStart}>New round</button>
          <button type="button" className={actionClass} onClick={() => a.category(category)}>Reveal puzzle / category</button>
          <button type="button" className={actionClass} onClick={nextPlayer}>End turn → next player</button>
        </div>

        <p className={groupTitle}>Wheel &amp; letters</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button type="button" className={actionClass} onClick={a.spin}>🎡 Spin</button>
          <button type="button" className={actionClass} onClick={a.consonant}>Choose a consonant</button>
          <button type="button" className={actionClass} onClick={a.vowel}>Buy a vowel?</button>
          <button type="button" className={actionClass} onClick={() => a.vowelBought(cleanLetter)}>Vowel bought</button>
          <button type="button" className={actionClass} onClick={() => a.correctLetter(cleanLetter)}>Correct letter</button>
          <button type="button" className={actionClass} onClick={() => a.wrongLetter(cleanLetter)}>Wrong letter</button>
          <button type="button" className={actionClass} onClick={a.noVowels}>No vowels left</button>
          <button type="button" className={actionClass} onClick={() => a.bankrupt(currentPlayer)}>Bankrupt</button>
          <button type="button" className={actionClass} onClick={() => a.loseTurn(currentPlayer)}>Lose a Turn</button>
          <button type="button" className={actionClass} onClick={a.bigMoney}>Big money wedge</button>
          <button type="button" className={actionClass} onClick={() => a.prizeWedge(currentPlayer)}>Prize wedge</button>
        </div>

        <p className={groupTitle}>Solve &amp; finish</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button type="button" className={actionClass} onClick={() => a.solve(currentPlayer)}>Ready to solve</button>
          <button type="button" className={actionClass} onClick={() => a.solveCorrect(currentPlayer)}>Solved it!</button>
          <button type="button" className={actionClass} onClick={() => a.solveWrong(currentPlayer)}>Wrong solve</button>
          <button type="button" className={actionClass} onClick={() => a.winner(currentPlayer)}>Announce winner</button>
          <button type="button" className={actionClass} onClick={a.goodbye}>Goodbye</button>
          <button type="button" className={actionClass} onClick={() => a.turn(currentPlayer)}>Announce turn</button>
        </div>
      </section>

      <div className="mt-4">
        <HostVoiceControls
          announcer={announcer}
          currentPlayer={currentPlayer}
          onSelectPlayer={setCurrentPlayer}
          playerNames={playerNames}
          category={category}
          letter={letter}
        />
      </div>
    </main>
  );
}
