#!/usr/bin/env node
/**
 * Locates the exact products behind each Phase 0 emergency item, so you are not
 * hunting through 118 products in the admin. Read-only.
 *
 *   node scripts/shopify/find-issues.mjs
 */
import { fetchAllProducts, fetchShopInfo } from "./lib/client.mjs";
import { log, writeReport } from "./lib/cli.mjs";
import { BRAND, STORE_DOMAIN } from "./lib/env.mjs";
import { classifyOptionValue, findCutRule, hasSupplierCdn } from "./lib/classify.mjs";

log.banner("Find emergency issues", "Read-only. Pairs with docs/shopify/00-emergency-fixes.md");

const shop = await fetchShopInfo();
const products = await fetchAllProducts();

const adminUrl = (id) => `https://admin.shopify.com/store/${STORE_DOMAIN.split(".")[0]}/products/${id.split("/").pop()}`;

const findings = { storeName: [], badOptionValues: [], zeroImages: [], liability: [], supplierVendor: [], supplierCdn: [] };

// --- 1. store name ---------------------------------------------------------
log.step("Store name");
if (shop.name === "My Store") {
  log.err(`Store name is "${shop.name}" - the Shopify default.`);
  log.detail("Fix: Settings > Store details. This propagates to title, og: tags, and Organization schema.");
  findings.storeName.push(shop.name);
} else {
  log.ok(`Store name is "${shop.name}"`);
}

// --- 2. non-colour values in Color -----------------------------------------
log.blank();
log.step("Non-colour values in the Color option");
for (const product of products) {
  const colorOption = product.options.find((o) => /colou?r/i.test(o.name));
  if (!colorOption) continue;

  const problems = colorOption.optionValues
    .map((v) => ({ value: v.name, ...classifyOptionValue(v.name) }))
    .filter((v) => v.drop || v.moved);

  if (!problems.length) continue;

  const hasDrop = problems.some((p) => p.drop);
  (hasDrop ? log.err : log.warn)(product.title);
  log.detail(adminUrl(product.id));
  for (const p of problems) {
    log.detail(`  "${p.value}" -> ${p.drop ? "REMOVE" : `belongs in a "${p.kind}" option`}`);
  }

  findings.badOptionValues.push({
    id: product.id,
    title: product.title,
    admin: adminUrl(product.id),
    values: problems.map((p) => ({ value: p.value, action: p.drop ? "remove" : `move to ${p.kind}` })),
  });
}
if (!findings.badOptionValues.length) log.ok("none");

// --- 3. zero images --------------------------------------------------------
log.blank();
log.step("Products with zero images");
for (const product of products.filter((p) => p.images.length === 0)) {
  log.err(`${product.title}  [${product.status}]`);
  log.detail(adminUrl(product.id));
  findings.zeroImages.push({ id: product.id, title: product.title, status: product.status, admin: adminUrl(product.id) });
}
if (!findings.zeroImages.length) log.ok("none");

// --- 4. liability products -------------------------------------------------
log.blank();
log.step("Liability products");
for (const product of products) {
  const rule = findCutRule(product.title);
  if (rule?.severity !== "liability") continue;
  log.err(product.title);
  log.detail(`${rule.id}: ${rule.reason}`);
  log.detail(adminUrl(product.id));
  findings.liability.push({ id: product.id, title: product.title, rule: rule.id, admin: adminUrl(product.id) });
}
if (!findings.liability.length) log.ok("none");

// --- 5. supplier leakage ---------------------------------------------------
log.blank();
log.step("Supplier name and CDN leakage");
findings.supplierVendor = products
  .filter((p) => p.vendor?.toLowerCase() === BRAND.supplierVendor.toLowerCase())
  .map((p) => p.title);
findings.supplierCdn = products.filter((p) => hasSupplierCdn(p.descriptionHtml)).map((p) => p.title);

if (findings.supplierVendor.length) {
  log.err(`${findings.supplierVendor.length} products have vendor "${BRAND.supplierVendor}" (public on /products.json and in JSON-LD)`);
  log.detail("Fix with: node scripts/shopify/02-vendor-brand.mjs --apply");
}
if (findings.supplierCdn.length) {
  log.err(`${findings.supplierCdn.length} descriptions hotlink the supplier CDN`);
  log.detail("Fix with: node scripts/shopify/06-descriptions.mjs --apply");
}

// --- 6. policies -----------------------------------------------------------
log.blank();
log.step("Policy pages");
for (const path of ["terms-of-service", "contact-information", "shipping-policy", "refund-policy", "privacy-policy"]) {
  const response = await fetch(`https://${STORE_DOMAIN}/policies/${path}`).catch(() => null);
  if (!response || response.status >= 400) log.err(`/policies/${path} - missing (HTTP ${response?.status ?? "error"})`);
  else log.ok(`/policies/${path}`);
}

const shipping = await fetch(`https://${STORE_DOMAIN}/policies/shipping-policy`)
  .then((r) => (r.ok ? r.text() : ""))
  .catch(() => "");
if (/\[your support email\]|\[your |\bTODO\b/i.test(shipping)) {
  log.err("Shipping policy contains an unfilled placeholder - live on a public page.");
}

writeReport("docs/shopify/emergency-findings.json", {
  generatedAt: new Date().toISOString(),
  ...findings,
});

log.summary([
  ["store name wrong", findings.storeName.length],
  ["products with bad Color values", findings.badOptionValues.length],
  ["products with zero images", findings.zeroImages.length],
  ["liability products", findings.liability.length],
  ["products exposing supplier vendor", findings.supplierVendor.length],
  ["descriptions hotlinking supplier CDN", findings.supplierCdn.length],
]);
