/**
 * Original, synthesized sound effects for the Wheel of Fortune TikTok Live game.
 *
 * Copyright note: the reference board at soundboard.com/sb/WheeloffortuneFX
 * states "I DO NOT own ANY of these sounds", so nothing from that board is
 * downloaded, scraped, or bundled here. Every effect below is generated
 * live with the Web Audio API (oscillators / filtered noise) and is only
 * *inspired by the category* of the board track listed in
 * `boardCorrespondsTo`. The intro is likewise a short (~6s, fading)
 * original game-show-style snippet, not the copyrighted Wheel of Fortune
 * theme. Hosts who own licensed
 * audio can replace `playGameSound` internals without touching callers.
 */

export type SoundEffectId =
  | "intro"
  | "wheel-spin"
  | "choose-letters"
  | "ding"
  | "buzzer"
  | "bankrupt"
  | "lose-turn"
  | "puzzle-reveal"
  | "puzzle-solve"
  | "applause"
  | "big-money"
  | "prize";

export type SoundEffectSettings = { enabled: boolean; volume: number };

export const SOUND_STORAGE_KEY = "icc-wheel-sound-effects";
export const DEFAULT_SOUND_SETTINGS: SoundEffectSettings = { enabled: true, volume: 0.35 };

export const SOUND_EFFECTS: { id: SoundEffectId; label: string; boardCorrespondsTo: string; durationMs: number; voiceDelayMs: number }[] = [
  { id: "intro", label: "Intro snippet (original, ~6s, fades out)", boardCorrespondsTo: "Intro-Opening Theme / Theme (short snippet only)", durationMs: 6200, voiceDelayMs: 5600 },
  { id: "wheel-spin", label: "Wheel spin ticks", boardCorrespondsTo: "Bonus Wheel Music (spin bed)", durationMs: 1400, voiceDelayMs: 900 },
  { id: "choose-letters", label: "Choose-letters prompt", boardCorrespondsTo: "Choose letters", durationMs: 350, voiceDelayMs: 400 },
  { id: "ding", label: "Correct letter ding", boardCorrespondsTo: "Ding!", durationMs: 500, voiceDelayMs: 550 },
  { id: "buzzer", label: "Wrong letter buzzer (soft)", boardCorrespondsTo: "Buzzer", durationMs: 450, voiceDelayMs: 500 },
  { id: "bankrupt", label: "Bankrupt slide", boardCorrespondsTo: "Bankrupt (\"played when a player goes bankrupt\")", durationMs: 800, voiceDelayMs: 850 },
  { id: "lose-turn", label: "Lose a Turn tones", boardCorrespondsTo: "Buzzer (lose-a-turn use)", durationMs: 550, voiceDelayMs: 600 },
  { id: "puzzle-reveal", label: "Puzzle reveal chimes", boardCorrespondsTo: "Puzzle Reveal", durationMs: 700, voiceDelayMs: 750 },
  { id: "puzzle-solve", label: "Puzzle solve sting", boardCorrespondsTo: "Puzzle solve / Toss Up Solve", durationMs: 1200, voiceDelayMs: 1250 },
  { id: "applause", label: "Applause (soft)", boardCorrespondsTo: "Puzzle solve celebration", durationMs: 1600, voiceDelayMs: 900 },
  { id: "big-money", label: "Big money sparkle", boardCorrespondsTo: "Bonus Wheel Music (big wedge)", durationMs: 800, voiceDelayMs: 850 },
  { id: "prize", label: "Prize wedge sparkle", boardCorrespondsTo: "Puzzle Reveal (prize use)", durationMs: 700, voiceDelayMs: 750 },
];

export function effectMeta(id: SoundEffectId) {
  return SOUND_EFFECTS.find((effect) => effect.id === id) ?? SOUND_EFFECTS[0];
}

export function loadSoundSettings(): SoundEffectSettings {
  if (typeof window === "undefined") return DEFAULT_SOUND_SETTINGS;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SOUND_STORAGE_KEY) ?? "{}") as Partial<SoundEffectSettings>;
    return {
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : true,
      volume:
        typeof parsed.volume === "number" && Number.isFinite(parsed.volume)
          ? Math.min(1, Math.max(0, parsed.volume))
          : DEFAULT_SOUND_SETTINGS.volume,
    };
  } catch {
    return DEFAULT_SOUND_SETTINGS;
  }
}

export function saveSoundSettings(settings: SoundEffectSettings): void {
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Session-only settings.
  }
}

let context: AudioContext | null = null;
let master: GainNode | null = null;
const activeSources = new Set<AudioScheduledSourceNode>();

function ensureContext(volume: number): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!context) {
    context = new Ctor();
    master = context.createGain();
    master.connect(context.destination);
  }
  if (master) master.gain.value = volume;
  if (context.state === "suspended") void context.resume();
  return context;
}

function tone(freq: number, start: number, duration: number, gain = 0.25, type: OscillatorType = "sine", endFreq?: number, dest?: AudioNode) {
  if (!context || !master) return;
  const osc = context.createOscillator();
  const amp = context.createGain();
  const t0 = context.currentTime + start;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), t0 + duration);
  amp.gain.setValueAtTime(0, t0);
  amp.gain.linearRampToValueAtTime(gain, t0 + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(amp).connect(dest ?? master);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
  activeSources.add(osc);
  osc.onended = () => activeSources.delete(osc);
}

function noise(start: number, duration: number, gain = 0.12, freq = 1800) {
  if (!context || !master) return;
  const t0 = context.currentTime + start;
  const buffer = context.createBuffer(1, Math.max(1, Math.floor(context.sampleRate * duration)), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = context.createBufferSource();
  src.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = 0.7;
  const amp = context.createGain();
  amp.gain.setValueAtTime(gain, t0);
  amp.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  src.connect(filter).connect(amp).connect(master);
  src.start(t0);
  activeSources.add(src);
  src.onended = () => activeSources.delete(src);
}

/** Play one original synthesized effect. Returns false when muted/unsupported. */
export function playGameSound(id: SoundEffectId, settings: SoundEffectSettings): boolean {
  if (!settings.enabled || settings.volume <= 0) return false;
  if (!ensureContext(settings.volume)) return false;
  // Exposed for headless verification; harmless in production.
  (window as unknown as { __lastGameSound?: string }).__lastGameSound = id;
  window.dispatchEvent(new CustomEvent("icc:game-sound", { detail: { id } }));

  switch (id) {
    case "intro": {
      // Short original snippet (~6s, not the copyrighted theme): a bright
      // opening phrase, one answering phrase, then a smooth bus fade-out
      // from ~4s to 6.2s so the welcome line lands as the music disappears.
      if (!context || !master) break;
      const bus = context.createGain();
      const t0 = context.currentTime;
      bus.gain.setValueAtTime(1, t0);
      bus.gain.setValueAtTime(1, t0 + 4);
      bus.gain.linearRampToValueAtTime(0, t0 + 6.2);
      bus.connect(master);
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.16, 0.5, 0.2, "triangle", undefined, bus));
      [523.25, 659.25, 783.99, 1046.5].forEach((f) => tone(f, 0.72, 1.2, 0.1, "triangle", undefined, bus));
      [587.33, 739.99, 880, 1174.66].forEach((f, i) => tone(f, 2.1 + i * 0.14, 0.45, 0.18, "triangle", undefined, bus));
      [587.33, 739.99, 880, 1174.66].forEach((f) => tone(f, 2.7, 1.1, 0.09, "sine", undefined, bus));
      [523.25, 659.25, 783.99, 1046.5].forEach((f) => tone(f, 4, 2.1, 0.11, "triangle", undefined, bus));
      break;
    }
    case "wheel-spin":
      for (let i = 0; i < 16; i++) tone(1150, i * (0.045 + i * 0.008), 0.035, 0.16, "square");
      break;
    case "choose-letters":
      tone(783.99, 0, 0.18, 0.18, "sine");
      tone(1046.5, 0.12, 0.22, 0.16, "sine");
      break;
    case "ding":
      tone(1318.5, 0, 0.45, 0.22, "sine");
      tone(1760, 0.02, 0.35, 0.1, "sine");
      break;
    case "buzzer":
      tone(185, 0, 0.42, 0.14, "sawtooth", 160);
      break;
    case "bankrupt":
      tone(392, 0, 0.25, 0.2, "triangle");
      tone(311, 0.22, 0.25, 0.2, "triangle");
      tone(233, 0.44, 0.4, 0.2, "triangle", 180);
      break;
    case "lose-turn":
      tone(440, 0, 0.22, 0.18, "sine");
      tone(349, 0.24, 0.32, 0.18, "sine");
      break;
    case "puzzle-reveal":
      [659.25, 783.99, 987.77, 1318.5].forEach((f, i) => tone(f, i * 0.11, 0.3, 0.16, "sine"));
      break;
    case "puzzle-solve":
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, i * 0.1, 0.5, 0.18, "triangle"));
      noise(0.45, 0.9, 0.05, 2200);
      break;
    case "applause":
      for (let i = 0; i < 7; i++) noise(i * 0.19, 0.28, 0.09, 1600 + (i % 3) * 350);
      break;
    case "big-money":
      [987.77, 1174.66, 1567.98, 1975.53].forEach((f, i) => tone(f, i * 0.09, 0.35, 0.15, "sine"));
      break;
    case "prize":
      [1046.5, 1318.5, 1567.98].forEach((f, i) => tone(f, i * 0.1, 0.35, 0.16, "triangle"));
      noise(0.2, 0.35, 0.05, 2600);
      break;
  }
  return true;
}

export function stopGameSounds(): void {
  for (const src of activeSources) {
    try {
      src.stop();
    } catch {
      // Already ended.
    }
  }
  activeSources.clear();
}
