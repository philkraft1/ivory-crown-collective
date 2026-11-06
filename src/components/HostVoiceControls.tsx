"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_HOST_VOICE_SETTINGS,
  hostVoiceLines,
  isSpeechSupported,
  listHostVoices,
  loadHostVoiceSettings,
  playerLabel,
  saveHostVoiceSettings,
  speakHostLine,
  stopHostVoice,
  whenHostVoicesReady,
  type HostVoiceSettings,
} from "@/lib/host-voice";
import {
  DEFAULT_SOUND_SETTINGS,
  SOUND_EFFECTS,
  effectMeta,
  loadSoundSettings,
  playGameSound,
  saveSoundSettings,
  stopGameSounds,
  type SoundEffectId,
  type SoundEffectSettings,
} from "@/lib/game-sounds";

export type HostVoiceAnnouncer = ReturnType<typeof useHostVoice>;

/**
 * Shared voice + sound state. Effects play first (short and quiet), then
 * the voice line starts after the effect's `voiceDelayMs`, so a voice
 * never talks over a sting and effects never blare over speech.
 */
export function useHostVoice(playerNames: readonly string[]) {
  const [settings, setSettings] = useState<HostVoiceSettings>(DEFAULT_HOST_VOICE_SETTINGS);
  const [soundSettings, setSoundSettings] = useState<SoundEffectSettings>(DEFAULT_SOUND_SETTINGS);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [lastLine, setLastLine] = useState("");
  const [lastSound, setLastSound] = useState("");
  const [status, setStatus] = useState("");
  const namesRef = useRef(playerNames);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    namesRef.current = playerNames;
  }, [playerNames]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSettings(loadHostVoiceSettings());
      setSoundSettings(loadSoundSettings());
      setSupported(isSpeechSupported());
      setVoices(listHostVoices());
    });
    const cancelVoices = whenHostVoicesReady(() => setVoices(listHostVoices()));
    const timers = timersRef.current;
    return () => {
      window.cancelAnimationFrame(frame);
      cancelVoices();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const update = useCallback((patch: Partial<HostVoiceSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveHostVoiceSettings(next);
      if (!next.enabled) stopHostVoice();
      return next;
    });
  }, []);

  const updateSounds = useCallback((patch: Partial<SoundEffectSettings>) => {
    setSoundSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSoundSettings(next);
      if (!next.enabled) stopGameSounds();
      return next;
    });
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const stop = useCallback(() => {
    clearTimers();
    stopHostVoice();
    stopGameSounds();
    setStatus("Voice and sounds stopped.");
  }, [clearTimers]);

  const speak = useCallback(
    (text: string) => {
      setLastLine(text);
      const result = speakHostLine(text, settings);
      setStatus(
        result.spoken
          ? "Speaking…"
          : result.reason === "disabled"
            ? "Voice is off — line shown below."
            : result.reason === "duplicate"
              ? "Already announced — skipped a repeat."
              : "Speech is not available in this browser — line shown below.",
      );
      return result;
    },
    [settings],
  );

  const playEffect = useCallback(
    (id: SoundEffectId) => {
      const played = playGameSound(id, soundSettings);
      setLastSound(played ? effectMeta(id).label : `${effectMeta(id).label} (muted/unavailable)`);
      return played;
    },
    [soundSettings],
  );

  /** Effect first at a gentle level, voice after it — never overlapping. */
  const speakWithEffect = useCallback(
    (id: SoundEffectId | null, text: string) => {
      clearTimers();
      stopHostVoice();
      if (!id || !playEffect(id)) {
        speak(text);
        return;
      }
      setLastLine(text);
      setStatus(`Playing ${effectMeta(id).label}, then speaking…`);
      const timer = window.setTimeout(() => speak(text), effectMeta(id).voiceDelayMs);
      timersRef.current.push(timer);
    },
    [clearTimers, playEffect, speak],
  );

  const label = useCallback(
    (playerIndex: number) => playerLabel(playerIndex, namesRef.current),
    [],
  );

  const announce = {
    welcome: useCallback(() => speak(hostVoiceLines.welcome()), [speak]),
    roundStart: useCallback(() => speakWithEffect("puzzle-reveal", hostVoiceLines.roundStart()), [speakWithEffect]),
    goodbye: useCallback(() => speakWithEffect("applause", hostVoiceLines.goodbye()), [speakWithEffect]),
    turn: useCallback((i: number) => speak(hostVoiceLines.turn(label(i))), [speak, label]),
    spin: useCallback(() => speakWithEffect("wheel-spin", hostVoiceLines.spin()), [speakWithEffect]),
    consonant: useCallback(() => speakWithEffect("choose-letters", hostVoiceLines.consonant()), [speakWithEffect]),
    vowel: useCallback(() => speak(hostVoiceLines.vowel()), [speak]),
    puzzleReveal: useCallback(() => speakWithEffect("puzzle-reveal", hostVoiceLines.puzzleReveal()), [speakWithEffect]),
    category: useCallback(
      (category: string) =>
        speakWithEffect("puzzle-reveal", category.trim() ? hostVoiceLines.category(category.trim()) : hostVoiceLines.puzzleReveal()),
      [speakWithEffect],
    ),
    correctLetter: useCallback((letter?: string) => speakWithEffect("ding", hostVoiceLines.correctLetter(letter)), [speakWithEffect]),
    wrongLetter: useCallback((letter?: string) => speakWithEffect("buzzer", hostVoiceLines.wrongLetter(letter)), [speakWithEffect]),
    vowelBought: useCallback((letter?: string) => speakWithEffect("ding", hostVoiceLines.vowelBought(letter)), [speakWithEffect]),
    noVowels: useCallback(() => speakWithEffect("lose-turn", hostVoiceLines.noVowels()), [speakWithEffect]),
    bankrupt: useCallback((i: number) => speakWithEffect("bankrupt", hostVoiceLines.bankrupt(label(i))), [speakWithEffect, label]),
    loseTurn: useCallback((i: number) => speakWithEffect("lose-turn", hostVoiceLines.loseTurn(label(i))), [speakWithEffect, label]),
    bigMoney: useCallback(() => speakWithEffect("big-money", hostVoiceLines.bigMoney()), [speakWithEffect]),
    prizeWedge: useCallback((i: number) => speakWithEffect("prize", hostVoiceLines.prizeWedge(label(i))), [speakWithEffect, label]),
    solve: useCallback((i: number) => speak(hostVoiceLines.solve(label(i))), [speak, label]),
    solveCorrect: useCallback((i: number) => speakWithEffect("puzzle-solve", hostVoiceLines.solveCorrect(label(i))), [speakWithEffect, label]),
    solveWrong: useCallback((i: number) => speakWithEffect("buzzer", hostVoiceLines.solveWrong(label(i))), [speakWithEffect, label]),
    winner: useCallback((i: number) => speakWithEffect("applause", hostVoiceLines.winner(label(i))), [speakWithEffect, label]),
  };

  /** Official start: short original intro snippet (fades out ~6s), then welcome as it fades. */
  const startGame = useCallback(() => {
    speakWithEffect("intro", hostVoiceLines.welcome());
    setStatus("Playing short intro snippet, then the welcome line…");
  }, [speakWithEffect]);

  /** Cut the intro snippet short and go straight to the welcome line. */
  const skipIntro = useCallback(() => {
    clearTimers();
    stopGameSounds();
    speak(hostVoiceLines.welcome());
  }, [clearTimers, speak]);

  return {
    settings,
    update,
    soundSettings,
    updateSounds,
    supported,
    voices,
    lastLine,
    lastSound,
    status,
    speak,
    playEffect,
    speakWithEffect,
    announce,
    startGame,
    skipIntro,
    stop,
    // Backwards-friendly aliases used by the first version of the console.
    announceTurn: announce.turn,
    announceSpin: announce.spin,
    announceConsonant: announce.consonant,
    announceVowel: announce.vowel,
    announceSolve: announce.solve,
  };
}

const buttonClass =
  "rounded-lg border border-gold/40 bg-white/[0.04] px-3 py-2 text-left text-sm text-pearl transition hover:border-gold hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-gold";
const groupTitle = "mt-4 text-xs font-semibold tracking-[0.18em] text-pearl/50 uppercase";

export function HostVoiceControls({
  announcer,
  currentPlayer,
  onSelectPlayer,
  playerNames,
  category = "",
  letter = "",
}: {
  announcer: HostVoiceAnnouncer;
  currentPlayer: number;
  onSelectPlayer: (playerIndex: number) => void;
  playerNames: readonly string[];
  category?: string;
  letter?: string;
}) {
  const { settings, update, soundSettings, updateSounds, supported, voices, lastLine, lastSound, status } = announcer;
  const a = announcer.announce;
  const player = playerLabel(currentPlayer, playerNames);
  const cleanLetter = letter.trim().toUpperCase() || undefined;

  return (
    <section aria-label="Host voice and sound announcements" className="rounded-2xl border border-gold/25 bg-void-soft p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg tracking-wide text-gold-bright">Host voice &amp; sounds</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={announcer.startGame} className="rounded-full bg-gold px-3 py-1.5 text-sm font-bold text-black hover:bg-gold-bright">
            ▶ Start Game / Play short intro
          </button>
          <button type="button" onClick={announcer.skipIntro} className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-pearl/80 hover:bg-white/5">
            Skip intro
          </button>
          <button
            type="button"
            aria-pressed={settings.enabled}
            onClick={() => update({ enabled: !settings.enabled })}
            className="rounded-full border border-gold/50 px-3 py-1.5 text-sm font-semibold text-pearl hover:bg-gold/10"
          >
            {settings.enabled ? "🔊 Voice on" : "🔇 Voice off"}
          </button>
          <button
            type="button"
            aria-pressed={soundSettings.enabled}
            onClick={() => updateSounds({ enabled: !soundSettings.enabled })}
            className="rounded-full border border-gold/50 px-3 py-1.5 text-sm font-semibold text-pearl hover:bg-gold/10"
          >
            {soundSettings.enabled ? "🎵 Sounds on" : "🔇 Sounds off"}
          </button>
          <button type="button" onClick={announcer.stop} className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-pearl/80 hover:bg-white/5">
            Stop all
          </button>
        </div>
      </div>

      {!supported && (
        <p role="status" className="mt-3 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm text-pearl">
          Speech synthesis is not available in this browser. Buttons still show each line
          below so the host can read it aloud — try Chrome or Edge for spoken voices.
        </p>
      )}

      <label className="mt-4 block text-xs font-semibold tracking-[0.18em] text-pearl/60 uppercase">
        Player for turn / solve lines
        <select
          value={currentPlayer}
          onChange={(event) => onSelectPlayer(Number(event.target.value))}
          className="mt-1.5 w-full rounded-lg border border-white/15 bg-void px-3 py-2 text-sm normal-case tracking-normal text-pearl"
        >
          {playerNames.map((name, index) => (
            <option key={index} value={index}>
              {playerLabel(index, playerNames)}
            </option>
          ))}
        </select>
      </label>

      <p className={groupTitle}>Show open &amp; close</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button type="button" className={buttonClass} onClick={a.welcome}>👋 {hostVoiceLines.welcome()}</button>
        <button type="button" className={buttonClass} onClick={a.roundStart}>🆕 {hostVoiceLines.roundStart()}</button>
        <button type="button" className={buttonClass} onClick={() => a.winner(currentPlayer)}>🏆 {hostVoiceLines.winner(player)}</button>
        <button type="button" className={buttonClass} onClick={a.goodbye}>🙏 Thanks for playing / goodbye</button>
      </div>

      <p className={groupTitle}>Turns &amp; wheel</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button type="button" className={buttonClass} onClick={() => a.turn(currentPlayer)}>📣 {hostVoiceLines.turn(player)}</button>
        <button type="button" className={buttonClass} onClick={a.spin}>🎡 {hostVoiceLines.spin()}</button>
        <button type="button" className={buttonClass} onClick={() => a.bankrupt(currentPlayer)}>💸 Bankrupt — {player}</button>
        <button type="button" className={buttonClass} onClick={() => a.loseTurn(currentPlayer)}>⏭️ Lose a Turn — {player}</button>
        <button type="button" className={buttonClass} onClick={a.bigMoney}>💰 {hostVoiceLines.bigMoney()}</button>
        <button type="button" className={buttonClass} onClick={() => a.prizeWedge(currentPlayer)}>🎁 Prize wedge — {player}</button>
      </div>

      <p className={groupTitle}>Puzzle &amp; letters</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button type="button" className={buttonClass} onClick={() => a.category(category)}>🧩 {category.trim() ? hostVoiceLines.category(category.trim()) : hostVoiceLines.puzzleReveal()}</button>
        <button type="button" className={buttonClass} onClick={a.consonant}>🔤 {hostVoiceLines.consonant()}</button>
        <button type="button" className={buttonClass} onClick={a.vowel}>🅰️ {hostVoiceLines.vowel()}</button>
        <button type="button" className={buttonClass} onClick={() => a.correctLetter(cleanLetter)}>✅ {hostVoiceLines.correctLetter(cleanLetter)}</button>
        <button type="button" className={buttonClass} onClick={() => a.wrongLetter(cleanLetter)}>❌ {hostVoiceLines.wrongLetter(cleanLetter)}</button>
        <button type="button" className={buttonClass} onClick={() => a.vowelBought(cleanLetter)}>🔡 {hostVoiceLines.vowelBought(cleanLetter)}</button>
        <button type="button" className={buttonClass} onClick={a.noVowels}>🚫 {hostVoiceLines.noVowels()}</button>
      </div>

      <p className={groupTitle}>Solve</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button type="button" className={buttonClass} onClick={() => a.solve(currentPlayer)}>🧩 {hostVoiceLines.solve(player)}</button>
        <button type="button" className={buttonClass} onClick={() => a.solveCorrect(currentPlayer)}>🎉 {hostVoiceLines.solveCorrect(player)}</button>
        <button type="button" className={buttonClass} onClick={() => a.solveWrong(currentPlayer)}>💪 {hostVoiceLines.solveWrong(player)}</button>
      </div>

      <p className={groupTitle}>Sound effects only (original synthesized — no soundboard audio)</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {SOUND_EFFECTS.map((effect) => (
          <button
            key={effect.id}
            type="button"
            onClick={() => announcer.playEffect(effect.id)}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-pearl/85 hover:border-gold hover:bg-gold/10"
            title={`Board category: ${effect.boardCorrespondsTo}`}
          >
            {effect.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-pearl/50">
        Effects are generated in the browser and correspond to the soundboard categories
        (Ding!, Buzzer, Bankrupt, Puzzle Reveal, Puzzle solve, themes, etc.). No audio is
        downloaded or bundled from soundboard.com — its uploader states they do not own
        those sounds.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="block text-xs font-semibold tracking-[0.18em] text-pearl/60 uppercase">
          Voice
          <select
            value={settings.voiceURI}
            onChange={(event) => update({ voiceURI: event.target.value })}
            disabled={!supported || voices.length === 0}
            className="mt-1.5 w-full rounded-lg border border-white/15 bg-void px-2 py-2 text-sm normal-case tracking-normal text-pearl disabled:opacity-50"
          >
            <option value="">Auto (calm, natural English)</option>
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold tracking-[0.18em] text-pearl/60 uppercase">
          Voice volume {Math.round(settings.volume * 100)}%
          <input type="range" min={0} max={1} step={0.05} value={settings.volume} onChange={(event) => update({ volume: Number(event.target.value) })} className="mt-2.5 w-full accent-[#c9a227]" />
        </label>
        <label className="block text-xs font-semibold tracking-[0.18em] text-pearl/60 uppercase">
          Effects volume {Math.round(soundSettings.volume * 100)}%
          <input type="range" min={0} max={1} step={0.05} value={soundSettings.volume} onChange={(event) => updateSounds({ volume: Number(event.target.value) })} className="mt-2.5 w-full accent-[#c9a227]" />
        </label>
        <label className="block text-xs font-semibold tracking-[0.18em] text-pearl/60 uppercase">
          Speed {settings.rate.toFixed(2)}×
          <input type="range" min={0.5} max={2} step={0.05} value={settings.rate} onChange={(event) => update({ rate: Number(event.target.value) })} className="mt-2.5 w-full accent-[#c9a227]" />
        </label>
        <label className="block text-xs font-semibold tracking-[0.18em] text-pearl/60 uppercase">
          Pitch {settings.pitch.toFixed(2)}
          <input type="range" min={0} max={2} step={0.05} value={settings.pitch} onChange={(event) => update({ pitch: Number(event.target.value) })} className="mt-2.5 w-full accent-[#c9a227]" />
        </label>
      </div>

      <div aria-live="polite" className="mt-4 rounded-lg bg-black/40 px-3 py-2">
        <p className="text-xs tracking-[0.18em] text-pearl/50 uppercase">Last line / sound</p>
        <p className="mt-0.5 text-base text-gold-hot">{lastLine || "—"}</p>
        {lastSound && <p className="text-sm text-pearl/70">Sound: {lastSound}</p>}
        {status && <p className="mt-0.5 text-xs text-pearl/60">{status}</p>}
      </div>
    </section>
  );
}
