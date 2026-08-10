import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { REPO_ROOT } from "./env.mjs";

const args = process.argv.slice(2);

/**
 * Writes are opt-in. Every script is read-only until you pass --apply, so a
 * mistake in a transform rule can't quietly rewrite 118 products.
 */
export const FLAGS = {
  apply: args.includes("--apply"),
  dryRun: !args.includes("--apply"),
  verbose: args.includes("--verbose") || args.includes("-v"),
  limit: (() => {
    const flag = args.find((a) => a.startsWith("--limit="));
    return flag ? Number(flag.split("=")[1]) : Infinity;
  })(),
  only: (() => {
    const flag = args.find((a) => a.startsWith("--only="));
    return flag ? flag.split("=")[1] : null;
  })(),
};

const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

export const log = {
  banner(title, subtitle) {
    console.log("");
    console.log(`${BOLD}${title}${RESET}`);
    if (subtitle) console.log(`${DIM}${subtitle}${RESET}`);
    console.log(
      FLAGS.dryRun
        ? `${YELLOW}DRY RUN${RESET} ${DIM}- nothing will be written. Re-run with --apply to commit.${RESET}`
        : `${RED}APPLY MODE${RESET} ${DIM}- changes will be written to the live store.${RESET}`,
    );
    console.log("");
  },
  step: (msg) => console.log(`${CYAN}>${RESET} ${msg}`),
  ok: (msg) => console.log(`  ${GREEN}ok${RESET}  ${msg}`),
  warn: (msg) => console.log(`  ${YELLOW}warn${RESET}  ${msg}`),
  err: (msg) => console.log(`  ${RED}fail${RESET}  ${msg}`),
  detail: (msg) => console.log(`      ${DIM}${msg}${RESET}`),
  info: (msg) => console.log(`  ${msg}`),
  blank: () => console.log(""),
  summary(rows) {
    console.log("");
    console.log(`${BOLD}Summary${RESET}`);
    const width = Math.max(...rows.map(([k]) => k.length));
    for (const [key, value] of rows) {
      console.log(`  ${key.padEnd(width)}  ${BOLD}${value}${RESET}`);
    }
    console.log("");
  },
};

/** Truncates for side-by-side before/after output without wrecking alignment. */
export function clip(text, max = 78) {
  const oneLine = String(text ?? "").replace(/\s+/g, " ").trim();
  return oneLine.length <= max ? oneLine : `${oneLine.slice(0, max - 1)}…`;
}

export function diffLine(label, before, after) {
  console.log(`      ${DIM}${label} before:${RESET} ${clip(before)}`);
  console.log(`      ${DIM}${label} after: ${RESET} ${clip(after)}`);
}

export function writeReport(relativePath, contents) {
  const path = resolve(REPO_ROOT, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    typeof contents === "string" ? contents : JSON.stringify(contents, null, 2),
    "utf8",
  );
  log.ok(`report written to ${relativePath}`);
  return path;
}

export function guardApply() {
  if (FLAGS.apply) {
    log.warn("running in APPLY mode against the live store");
  }
}
