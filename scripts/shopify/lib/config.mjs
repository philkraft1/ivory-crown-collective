import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export const PROJECT_ROOT = resolve(here, "../../..");
export const DATA_DIR = resolve(
  PROJECT_ROOT,
  process.env.SHOPIFY_DATA_DIR || "shopify-data",
);
export const APPLY_CONFIRMATION = "SHOPIFY-STORE-OVERHAUL";

function unquote(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function loadLocalEnv() {
  const envPath = resolve(PROJECT_ROOT, ".env.local");

  try {
    const contents = readFileSync(envPath, "utf8");
    for (const line of contents.split(/\r?\n/u)) {
      const match = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/u);
      if (!match || match[1] in process.env) continue;
      process.env[match[1]] = unquote(match[2]);
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

export function getConfig({ requireToken = true } = {}) {
  loadLocalEnv();

  const storeDomain =
    process.env.SHOPIFY_STORE_DOMAIN || "1wtpc0-c2.myshopify.com";
  const apiVersion = process.env.SHOPIFY_API_VERSION || "2026-07";
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  const normalizedDomain = storeDomain
    .replace(/^https?:\/\//u, "")
    .replace(/\/.*$/u, "");

  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/u.test(normalizedDomain)) {
    throw new Error(
      "SHOPIFY_STORE_DOMAIN must be a *.myshopify.com hostname, without a path.",
    );
  }

  if (requireToken && !token) {
    throw new Error(
      "Missing SHOPIFY_ADMIN_TOKEN. Add it to .env.local; never commit the token.",
    );
  }

  return {
    apiVersion,
    endpoint: `https://${normalizedDomain}/admin/api/${apiVersion}/graphql.json`,
    storeDomain: normalizedDomain,
    token,
  };
}

export function executionMode(argv = process.argv.slice(2)) {
  const apply = argv.includes("--apply");
  const confirmation = argv.find((arg) => arg.startsWith("--confirm="));
  const confirmationValue = confirmation?.slice("--confirm=".length);

  if (apply && confirmationValue !== APPLY_CONFIRMATION) {
    throw new Error(
      `Applying changes requires --confirm=${APPLY_CONFIRMATION}. Run without --apply to preview first.`,
    );
  }

  return {
    apply,
    label: apply ? "APPLY" : "DRY RUN",
  };
}
