/**
 * Host voice announcements for the Wheel of Fortune TikTok Live game.
 *
 * Uses the browser Web Speech API (`speechSynthesis`) on the host's machine,
 * so no audio files, API keys, or network calls are required. If the API is
 * unavailable the caller still gets the exact line text back, which the host
 * UI shows as a caption / fallback.
 *
 * The game built for TLG-1 can reuse this module directly: call the
 * `speak*` helpers from turn-change / spin / consonant / vowel / solve
 * handlers, or render `HostVoiceControls` for the manual buttons.
 */

export const HOST_VOICE_STORAGE_KEY = "icc-wheel-host-voice";
export const HOST_VOICE_EVENT = "icc:host-voice";

export type HostVoiceSettings = {
  enabled: boolean;
  rate: number;
  pitch: number;
  volume: number;
  voiceURI: string;
};

/** Calm, spectator-friendly defaults: relaxed rate, neutral pitch, 70% volume. */
export const DEFAULT_HOST_VOICE_SETTINGS: HostVoiceSettings = {
  enabled: true,
  rate: 0.95,
  pitch: 1.0,
  volume: 0.7,
  voiceURI: "",
};

export const DEFAULT_PLAYER_NAMES = [
  "Player 1",
  "Player 2",
  "Player 3",
  "Player 4",
  "Player 5",
] as const;

export function playerLabel(playerIndex: number, playerNames?: readonly string[]): string {
  const name = playerNames?.[playerIndex]?.trim();
  return name ? name : `Player ${playerIndex + 1}`;
}

/** Exact host lines. Keep in sync with the buttons in HostVoiceControls. */
export const hostVoiceLines = {
  welcome: () => "Welcome to Wheel of Fortune!",
  roundStart: () => "Let's start a new round!",
  goodbye: () => "Thanks for playing, everyone! And thanks for watching — we'll see you next time!",
  turn: (player: string) => `${player}, it's your turn!`,
  spin: () => "Spin the Wheel!",
  consonant: () => "Choose a Consonant",
  vowel: () => "Would you like to buy a vowel?",
  puzzleReveal: () => "Let's look at the puzzle.",
  category: (category: string) => `The category is ${category}.`,
  correctLetter: (letter?: string) =>
    letter ? `Yes! We have a ${letter}!` : "Yes! That's in the puzzle!",
  wrongLetter: (letter?: string) =>
    letter ? `Sorry, there's no ${letter} in the puzzle.` : "Sorry, that letter isn't in the puzzle.",
  vowelBought: (letter?: string) =>
    letter ? `You've bought the ${letter}. Let's see it on the board.` : "That vowel is yours. Let's see it on the board.",
  noVowels: () => "There are no vowels left in the puzzle.",
  bankrupt: (player: string) => `Oh no — Bankrupt for ${player}. That's a tough break.`,
  loseTurn: (player: string) => `${player}, that's Lose a Turn. We'll come back to you.`,
  bigMoney: () => "Big money! What a spin!",
  prizeWedge: (player: string) => `${player} landed on a prize wedge! Nicely done.`,
  solve: (player: string) =>
    `It looks like ${player} is ready to solve the puzzle...`,
  solveCorrect: (player: string) => `That's right! ${player} solved the puzzle! Congratulations!`,
  solveWrong: (player: string) => `Not quite, ${player}. Let's keep going.`,
  winner: (player: string) => `${player} is our winner today! Congratulations!`,
} as const;

export function isSpeechSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance !== "undefined"
  );
}

export function loadHostVoiceSettings(): HostVoiceSettings {
  if (typeof window === "undefined") return DEFAULT_HOST_VOICE_SETTINGS;
  try {
    const raw = window.localStorage.getItem(HOST_VOICE_STORAGE_KEY);
    if (!raw) return DEFAULT_HOST_VOICE_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<HostVoiceSettings>;
    return {
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : true,
      rate: clamp(parsed.rate, 0.5, 2, DEFAULT_HOST_VOICE_SETTINGS.rate),
      pitch: clamp(parsed.pitch, 0, 2, DEFAULT_HOST_VOICE_SETTINGS.pitch),
      volume: clamp(parsed.volume, 0, 1, DEFAULT_HOST_VOICE_SETTINGS.volume),
      voiceURI: typeof parsed.voiceURI === "string" ? parsed.voiceURI : "",
    };
  } catch {
    return DEFAULT_HOST_VOICE_SETTINGS;
  }
}

export function saveHostVoiceSettings(settings: HostVoiceSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HOST_VOICE_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Private mode / storage disabled: voice still works for the session.
  }
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}

function voiceScore(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase().replace("_", "-");
  let score = 0;
  if (lang.startsWith("en")) score += 20;
  if (lang === "en-us") score += 10;
  // Smooth modern voices first: Microsoft Natural/Neural (Edge) and Google.
  if (name.includes("natural") || name.includes("neural") || name.includes("online")) score += 50;
  if (name.includes("google us english")) score += 45;
  if (name.includes("google")) score += 25;
  if (/aria|jenny|michelle|sara|amber|ashley/.test(name)) score += 20;
  if (/samantha|zira|karen|serena/.test(name)) score += 15;
  if (voice.default) score += 5;
  if (/compact|eloquence|fred|albert|bad news|cellos|whisper/.test(name)) score -= 30;
  return score;
}

/** Prefer a calm, warm, natural English voice when the browser offers one. */
export function pickHostVoice(
  voices: SpeechSynthesisVoice[],
  preferredURI: string,
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  if (preferredURI) {
    const preferred = voices.find((voice) => voice.voiceURI === preferredURI);
    if (preferred) return preferred;
  }
  return [...voices].sort((a, b) => voiceScore(b) - voiceScore(a))[0];
}

export function listHostVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];
  return window.speechSynthesis.getVoices();
}

/** Resolves once voices are available (they often load asynchronously). */
export function whenHostVoicesReady(onReady: () => void): () => void {
  if (!isSpeechSupported()) return () => {};
  if (window.speechSynthesis.getVoices().length > 0) {
    onReady();
    return () => {};
  }
  const handler = () => onReady();
  window.speechSynthesis.addEventListener("voiceschanged", handler);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", handler);
}

let lastSpokenText = "";
let lastSpokenAt = 0;
/** Ignore an identical line repeated inside this window (rapid host clicks). */
export const HOST_VOICE_DEDUPE_MS = 1500;

export type SpeakResult = { spoken: boolean; reason?: "disabled" | "unsupported" | "duplicate" };

/**
 * Speak one line. Any line already playing is cancelled first, so
 * announcements never overlap. Returns the support/enabled state so the
 * UI can show the line as a caption when audio is unavailable.
 */
export function speakHostLine(
  text: string,
  settings: HostVoiceSettings,
  now = Date.now(),
): SpeakResult {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(HOST_VOICE_EVENT, { detail: { text } }));
    (window as unknown as { __lastHostVoiceLine?: string }).__lastHostVoiceLine = text;
  }
  if (!settings.enabled) return { spoken: false, reason: "disabled" };
  if (!isSpeechSupported()) return { spoken: false, reason: "unsupported" };
  if (text === lastSpokenText && now - lastSpokenAt < HOST_VOICE_DEDUPE_MS) {
    return { spoken: false, reason: "duplicate" };
  }
  lastSpokenText = text;
  lastSpokenAt = now;

  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;
  utterance.volume = settings.volume;
  const voice = pickHostVoice(synth.getVoices(), settings.voiceURI);
  if (voice) {
    try {
      utterance.voice = voice;
    } catch {
      // A stale/unusual voice entry must never block the announcement.
    }
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "en-US";
  }
  synth.speak(utterance);
  return { spoken: true };
}

export function stopHostVoice(): void {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
  lastSpokenText = "";
  lastSpokenAt = 0;
}
