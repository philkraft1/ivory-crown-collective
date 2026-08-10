#!/usr/bin/env node
/**
 * Snapshots the live catalog before anything is modified, and re-runs the audit
 * that produced the overhaul plan so you can see the current numbers at any time.
 *
 *   node scripts/shopify/01-audit-export.mjs
 *
 * Writes docs/shopify/snapshot.json. Every later script can be reversed from it
 * via restore.mjs, so run this first and keep the file.
 */
import { fetchAllProducts, fetchShopInfo } from "./lib/client.mjs";
import { log, writeReport } from "./lib/cli.mjs";
import { BRAND } from "./lib/env.mjs";
import { classify, DECISION, hasSupplierCdn, stripHtml } from "./lib/classify.mjs";

log.banner("01 - Audit and snapshot", "Read-only. Captures the pre-overhaul state.");

const shop = await fetchShopInfo();
log.step("Shop");
log.info(`name            ${shop.name}`);
log.info(`domain          ${shop.myshopifyDomain}`);
log.info(`primary domain  ${shop.primaryDomain?.host ?? "(none)"}`);
log.info(`currency        ${shop.currencyCode}`);

if (shop.name === "My Store") {
  log.err('Store name is still the Shopify default "My Store".');
  log.detail("This poisons the title tag, all og: tags, and the Organization schema.");
  log.detail("Fix in Settings > Store details. See docs/shopify/00-emergency-fixes.md");
}
if (!shop.primaryDomain?.host || shop.primaryDomain.host.endsWith("myshopify.com")) {
  log.warn("No custom domain connected. See docs/shopify/03-domain.md");
}

log.blank();
log.step("Fetching products");
const products = await fetchAllProducts();
log.ok(`${products.length} products`);

const variants = products.flatMap((p) => p.variants);
const images = products.flatMap((p) => p.images);

// ---------------------------------------------------------------------------
// Catalog health
// ---------------------------------------------------------------------------

const issues = {
  supplierVendor: products.filter(
    (p) => p.vendor?.toLowerCase() === BRAND.supplierVendor.toLowerCase(),
  ),
  noProductType: products.filter((p) => !p.productType?.trim()),
  noTags: products.filter((p) => !p.tags?.length),
  longTitles: products.filter((p) => p.title.length > 70),
  noImages: products.filter((p) => p.images.length === 0),
  thinGallery: products.filter((p) => p.images.length > 0 && p.images.length <= 2),
  emptyAlt: images.filter((i) => !i.alt?.trim()),
  supplierCdn: products.filter((p) => hasSupplierCdn(p.descriptionHtml)),
  cmOnly: products.filter(
    (p) => /\bcm\b/i.test(stripHtml(p.descriptionHtml)) && !/\bin\b|inch/i.test(stripHtml(p.descriptionHtml)),
  ),
  noCompareAt: variants.filter((v) => !v.compareAtPrice),
  duplicateTitles: Object.entries(
    products.reduce((acc, p) => {
      acc[p.title] = (acc[p.title] ?? 0) + 1;
      return acc;
    }, {}),
  ).filter(([, count]) => count > 1),
};

log.blank();
log.step("Catalog health");
const report = [
  ["products", products.length],
  ["variants", variants.length],
  ["images", images.length],
  [`vendor = "${BRAND.supplierVendor}"`, issues.supplierVendor.length],
  ["missing product type", issues.noProductType.length],
  ["zero tags", issues.noTags.length],
  ["titles over 70 chars", issues.longTitles.length],
  ["zero images", issues.noImages.length],
  ["1-2 images only", issues.thinGallery.length],
  ["images with empty alt", issues.emptyAlt.length],
  ["supplier CDN in description", issues.supplierCdn.length],
  ["cm sizing, no inches", issues.cmOnly.length],
  ["variants without compare-at", issues.noCompareAt.length],
  ["duplicate titles", issues.duplicateTitles.length],
];
log.summary(report);

// ---------------------------------------------------------------------------
// Niche classification preview
// ---------------------------------------------------------------------------

log.step("Niche classification");
const classified = products.map((product) => ({ product, classification: classify(product) }));

const byDecision = {
  keep: classified.filter((c) => c.classification.decision === DECISION.KEEP),
  review: classified.filter((c) => c.classification.decision === DECISION.REVIEW),
  cut: classified.filter((c) => c.classification.decision === DECISION.CUT),
};

log.summary([
  ["keep", byDecision.keep.length],
  ["needs review", byDecision.review.length],
  ["cut", byDecision.cut.length],
]);

if (byDecision.cut.length) {
  log.step("Cut list");
  for (const { product, classification } of byDecision.cut) {
    log.warn(product.title);
    for (const reason of classification.reasons) log.detail(reason);
  }
}

const liability = byDecision.cut.filter((c) => c.classification.cutRule?.severity === "liability");
if (liability.length) {
  log.blank();
  log.err(`${liability.length} product(s) flagged as a liability, not merely off-niche:`);
  for (const { product, classification } of liability) {
    log.detail(`${product.title} - ${classification.cutRule.id}`);
  }
}

// ---------------------------------------------------------------------------
// Snapshot
// ---------------------------------------------------------------------------

writeReport("docs/shopify/snapshot.json", {
  capturedAt: new Date().toISOString(),
  shop,
  counts: Object.fromEntries(report),
  products,
});

writeReport(
  "docs/shopify/audit-report.json",
  {
    capturedAt: new Date().toISOString(),
    counts: Object.fromEntries(report),
    decisions: {
      keep: byDecision.keep.map((c) => c.product.title),
      review: byDecision.review.map((c) => ({
        title: c.product.title,
        reasons: c.classification.reasons,
      })),
      cut: byDecision.cut.map((c) => ({
        title: c.product.title,
        severity: c.classification.cutRule?.severity ?? "unknown",
        reasons: c.classification.reasons,
      })),
    },
  },
);

log.blank();
log.info("Next: node scripts/shopify/02-vendor-brand.mjs");
