import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

/**
 * Minimal .env reader. Avoids adding a dependency for three variables, and
 * deliberately does not overwrite anything already in process.env so CI can
 * inject secrets without a file on disk.
 */
function loadEnvFile(name) {
  const path = resolve(REPO_ROOT, name);
  if (!existsSync(path)) return;

  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

export const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "1wtpc0-c2.myshopify.com";
export const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN || "";
export const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-10";

export const BRAND = {
  name: "Ivory Crown Collective",
  legalName: "Ivory Crown Collective LLC",
  email: "phil@ivorycrowncollective.com",
  phone: "(732) 233-8516",
  shopUrl: "https://shop.ivorycrowncollective.com",
  agencyUrl: "https://ivorycrowncollective.com",
  /** The supplier name currently leaking into every product's JSON-LD brand field. */
  supplierVendor: "eprolo",
};

export function requireToken() {
  if (!ADMIN_TOKEN) {
    console.error(
      [
        "",
        "  Missing SHOPIFY_ADMIN_TOKEN.",
        "",
        "  Create a custom app in Shopify admin:",
        "    Settings > Apps and sales channels > Develop apps > Create an app",
        "",
        "  Grant these Admin API scopes:",
        "    read_products, write_products",
        "    read_files, write_files",
        "    read_content, write_content",
        "    read_publications, write_publications",
        "    read_themes, write_themes",
        "",
        "  Then install the app, reveal the Admin API access token, and add it to",
        "  .env.local (already gitignored):",
        "",
        "    SHOPIFY_ADMIN_TOKEN=shpat_xxxxxxxxxxxx",
        `    SHOPIFY_STORE_DOMAIN=${STORE_DOMAIN}`,
        "",
      ].join("\n"),
    );
    process.exit(1);
  }
}
