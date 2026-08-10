#!/usr/bin/env node
/**
 * Launch unlock for the costume store (requires SHOPIFY_ADMIN_TOKEN).
 *
 * 1) Disables Online Store password protection
 * 2) Prints current domains / primary domain so you can confirm the agency
 *    apex is NOT the store primary (that breaks product links)
 *
 * Usage:
 *   SHOPIFY_ADMIN_TOKEN=shpat_... node scripts/shopify/launch-unlock.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2];
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const domain = (process.env.SHOPIFY_STORE_DOMAIN || "1wtpc0-c2.myshopify.com")
  .replace(/^https?:\/\//, "")
  .replace(/\/.*$/, "");
const token = process.env.SHOPIFY_ADMIN_TOKEN?.trim();
const apiVersion = process.env.SHOPIFY_API_VERSION || "2026-07";

if (!token) {
  console.error("Missing SHOPIFY_ADMIN_TOKEN");
  process.exit(1);
}

async function gql(query, variables) {
  const res = await fetch(
    `https://${domain}/admin/api/${apiVersion}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(JSON.stringify(json.errors || json, null, 2));
  }
  return json.data;
}

const before = await gql(`{
  onlineStore { passwordProtection { enabled } }
  shop { primaryDomain { host url } }
  domains(first: 20) { nodes { host url sslEnabled localization { country } } }
}`);

console.log("Before:", JSON.stringify(before, null, 2));

if (before.onlineStore?.passwordProtection?.enabled) {
  const updated = await gql(`mutation {
    onlineStorePasswordProtectionUpdate(input: { passwordEnabled: false }) {
      onlineStorePasswordProtection { enabled }
      userErrors { field message }
    }
  }`);
  console.log("Password update:", JSON.stringify(updated, null, 2));
} else {
  console.log("Password already disabled.");
}

const after = await gql(`{
  onlineStore { passwordProtection { enabled } }
  shop { primaryDomain { host url } }
}`);
console.log("After:", JSON.stringify(after, null, 2));

const primary = after.shop?.primaryDomain?.host || "";
if (primary === "ivorycrowncollective.com" || primary === "www.ivorycrowncollective.com") {
  console.error(`
BLOCKER: Store primary domain is still ${primary}.
That redirects the Shopify store onto the agency site and breaks product links.
In Shopify Admin → Settings → Domains, set primary to ${domain}
(or shop.ivorycrowncollective.com once DNS is live), and remove the apex from the store.
`);
  process.exit(2);
}

console.log("Launch unlock complete.");
