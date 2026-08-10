#!/usr/bin/env node
/**
 * Replaces the supplier name in the `vendor` field with the store's own brand.
 *
 *   node scripts/shopify/02-vendor-brand.mjs            # preview
 *   node scripts/shopify/02-vendor-brand.mjs --apply    # write
 *
 * Why this matters more than it looks: `vendor` is what Shopify renders into the
 * Product JSON-LD as the brand. Every product page currently ships
 *
 *   "brand": { "@type": "Brand", "name": "eprolo" }
 *
 * so Google, Google Shopping, and any shopper who views source is told the brand
 * is the dropship supplier. `vendor` is also exposed publicly on /products.json.
 */
import { fetchAllProducts, mutate } from "./lib/client.mjs";
import { FLAGS, log, clip } from "./lib/cli.mjs";
import { BRAND } from "./lib/env.mjs";
import { PRODUCT_UPDATE } from "./lib/mutations.mjs";

log.banner("02 - Vendor and brand", `vendor -> "${BRAND.name}"`);

const products = await fetchAllProducts();
const needsChange = products.filter((p) => p.vendor !== BRAND.name);

log.step(`${needsChange.length} of ${products.length} products need a vendor change`);

const bySupplier = needsChange.filter(
  (p) => p.vendor?.toLowerCase() === BRAND.supplierVendor.toLowerCase(),
);
if (bySupplier.length) {
  log.warn(`${bySupplier.length} currently expose the supplier name "${BRAND.supplierVendor}" publicly`);
}

let updated = 0;
let failed = 0;

for (const product of needsChange.slice(0, FLAGS.limit)) {
  if (FLAGS.dryRun) {
    log.info(`${clip(product.title, 62).padEnd(64)} ${product.vendor || "(empty)"} -> ${BRAND.name}`);
    updated++;
    continue;
  }

  try {
    await mutate(
      PRODUCT_UPDATE,
      { product: { id: product.id, vendor: BRAND.name } },
      "productUpdate",
    );
    log.ok(clip(product.title, 70));
    updated++;
  } catch (error) {
    log.err(`${clip(product.title, 50)} - ${error.message}`);
    failed++;
  }
}

log.summary([
  [FLAGS.dryRun ? "would update" : "updated", updated],
  ["failed", failed],
  ["already correct", products.length - needsChange.length],
]);

if (FLAGS.dryRun) log.info("Re-run with --apply to write these changes.");
else log.info("Verify: a product page's JSON-LD should now report the correct brand.");
