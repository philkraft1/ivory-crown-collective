#!/usr/bin/env node
/**
 * Runs every rewrite rule against real product records captured from the live
 * storefront, with no Admin API access needed.
 *
 *   node scripts/shopify/00-preview-offline.mjs
 *   node scripts/shopify/00-preview-offline.mjs --verbose
 *
 * Use this to sign off on the transforms before handing over a token.
 */
import { FIXTURE_PRODUCTS } from "./lib/fixtures.mjs";
import { FLAGS, log, clip, writeReport } from "./lib/cli.mjs";
import {
  classify,
  classifyOptionValue,
  DECISION,
  hasSupplierCdn,
  repriceVariant,
  buildAltText,
  stripHtml,
  TITLE_MAX,
} from "./lib/classify.mjs";

log.banner(
  "00 - Offline transform preview",
  `${FIXTURE_PRODUCTS.length} real product records captured before the store was password-protected.`,
);

const results = FIXTURE_PRODUCTS.map((product) => ({
  product,
  classification: classify(product),
}));

const groups = {
  keep: results.filter((r) => r.classification.decision === DECISION.KEEP),
  review: results.filter((r) => r.classification.decision === DECISION.REVIEW),
  cut: results.filter((r) => r.classification.decision === DECISION.CUT),
};

// ---------------------------------------------------------------------------
// Cut list first: this is where the judgment calls live
// ---------------------------------------------------------------------------

log.step("Cut list");
for (const { product, classification } of groups.cut) {
  const severity = classification.cutRule?.severity ?? "unknown";
  const line = `[${severity}] ${clip(product.title, 68)}`;
  if (severity === "liability") log.err(line);
  else log.warn(line);
  for (const reason of classification.reasons) log.detail(reason);
}

log.blank();
log.step("Needs your decision");
for (const { product, classification } of groups.review) {
  log.warn(clip(product.title, 68));
  for (const reason of classification.reasons) log.detail(reason);
}

// ---------------------------------------------------------------------------
// Title rewrites
// ---------------------------------------------------------------------------

log.blank();
log.step("Title rewrites (kept products)");
for (const { product, classification } of groups.keep) {
  const before = product.title;
  const after = classification.newTitle;
  console.log(`  ${before.length > TITLE_MAX ? "\x1b[31m" : ""}${before.length}\x1b[0m chars  ${clip(before, 92)}`);
  console.log(`  \x1b[32m${after.length}\x1b[0m chars  \x1b[1m${after}\x1b[0m`);
  console.log(`           \x1b[2mtype:\x1b[0m ${classification.newProductType}`);
  console.log(`           \x1b[2mtags:\x1b[0m ${classification.newTags.join(", ")}`);
  console.log("");
}

// ---------------------------------------------------------------------------
// Option value cleanup
// ---------------------------------------------------------------------------

log.step("Option value cleanup");
let optionIssues = 0;
for (const { product } of results) {
  const colorOption = product.options.find((o) => o.name === "Color");
  if (!colorOption) continue;

  const verdicts = colorOption.optionValues.map((v) => ({
    original: v.name,
    ...classifyOptionValue(v.name),
  }));
  const problems = verdicts.filter((v) => v.moved || v.drop);
  if (!problems.length) continue;

  optionIssues += problems.length;
  log.warn(clip(product.title, 68));
  for (const p of problems) {
    const action = p.drop ? `DROP` : `move to "${p.kind}" as "${p.cleaned}"`;
    log.detail(`Color value "${p.original}" -> ${action}${p.note ? ` (${p.note})` : ""}`);
  }
}
if (!optionIssues) log.ok("no non-colour values found in Color options");

// ---------------------------------------------------------------------------
// Sizing
// ---------------------------------------------------------------------------

log.blank();
log.step("Size option remap");
for (const { product, classification } of groups.keep) {
  const sizeOption = product.options.find((o) => /size|height|age/i.test(o.name));
  if (!sizeOption) continue;
  const from = sizeOption.optionValues.map((v) => v.name).join(", ");
  const to = classification.sizeLabels.join(", ") || "(unmapped)";
  log.info(`${clip(product.title, 50).padEnd(52)} ${sizeOption.name}: ${from}  ->  Size: ${to}`);
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

log.blank();
log.step("Pricing");
for (const { product } of groups.keep) {
  const current = product.variants[0].price;
  const next = repriceVariant(current);
  log.info(
    `${clip(product.title, 50).padEnd(52)} $${current}  ->  $${next.price}  (compare-at $${next.compareAtPrice})`,
  );
}

// ---------------------------------------------------------------------------
// Descriptions
// ---------------------------------------------------------------------------

log.blank();
log.step("Description rebuild");
const withCdn = results.filter((r) => hasSupplierCdn(r.product.descriptionHtml));
log.warn(`${withCdn.length} of ${results.length} descriptions hotlink the supplier's Alibaba CDN`);
const stillCdn = groups.keep.filter((r) => hasSupplierCdn(r.classification.newDescriptionHtml));
if (stillCdn.length === 0) log.ok("0 rebuilt descriptions reference the supplier CDN");
else log.err(`${stillCdn.length} rebuilt descriptions still reference the supplier CDN`);

const sample = groups.keep[0];
log.blank();
log.info(`Sample rebuild - ${sample.classification.newTitle}`);
log.detail("BEFORE (supplier dump, first 200 chars of text):");
console.log(`      ${stripHtml(sample.product.descriptionHtml).slice(0, 200)}...`);
log.detail("AFTER:");
console.log(
  sample.classification.newDescriptionHtml
    .split("\n")
    .map((l) => `      ${l}`)
    .join("\n"),
);

// ---------------------------------------------------------------------------
// Alt text
// ---------------------------------------------------------------------------

log.blank();
log.step("Image alt text");
for (const { product, classification } of groups.keep.slice(0, 3)) {
  log.info(clip(product.title, 60));
  product.images.forEach((_, i) => {
    log.detail(`image ${i + 1}: "${buildAltText(product, classification, i)}"`);
  });
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const keptTitlesOverLimit = groups.keep.filter((r) => r.classification.newTitle.length > TITLE_MAX);

log.summary([
  ["sample size", results.length],
  ["keep", groups.keep.length],
  ["needs review", groups.review.length],
  ["cut (off-niche)", groups.cut.filter((r) => r.classification.cutRule?.severity === "off-niche").length],
  ["cut (off-brand)", groups.cut.filter((r) => r.classification.cutRule?.severity === "off-brand").length],
  ["cut (liability)", groups.cut.filter((r) => r.classification.cutRule?.severity === "liability").length],
  ["new titles over 70 chars", keptTitlesOverLimit.length],
  ["rebuilt descs with supplier CDN", stillCdn.length],
]);

if (keptTitlesOverLimit.length) {
  log.err("Some generated titles exceed the 70-character limit:");
  for (const r of keptTitlesOverLimit) log.detail(`${r.classification.newTitle.length}: ${r.classification.newTitle}`);
  process.exitCode = 1;
}

if (FLAGS.verbose) {
  writeReport(
    "docs/shopify/offline-preview.json",
    results.map(({ product, classification }) => ({
      before: { title: product.title, vendor: product.vendor, tags: product.tags },
      decision: classification.decision,
      reasons: classification.reasons,
      after: {
        title: classification.newTitle,
        productType: classification.newProductType,
        tags: classification.newTags,
        descriptionHtml: classification.newDescriptionHtml,
      },
    })),
  );
}

log.info("This preview writes nothing. Grant an Admin token to run 01-audit-export.mjs against the live store.");
