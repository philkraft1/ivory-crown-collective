#!/usr/bin/env node
/**
 * Rolls the catalog back to the snapshot taken by 01-audit-export.mjs.
 *
 *   node scripts/shopify/restore.mjs                    # preview
 *   node scripts/shopify/restore.mjs --apply            # restore everything
 *   node scripts/shopify/restore.mjs --apply --fields=title,tags
 *
 * Restores title, descriptionHtml, vendor, productType, tags, status, and variant
 * prices. Deliberately does not restore option names or values: those mutations
 * rewrite the variant matrix, and replaying them backwards can orphan variants.
 * If you need to undo 07-sizing.mjs, do it in the admin.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { mutate } from "./lib/client.mjs";
import { FLAGS, log, clip } from "./lib/cli.mjs";
import { REPO_ROOT } from "./lib/env.mjs";
import { PRODUCT_UPDATE, PRODUCT_VARIANTS_BULK_UPDATE } from "./lib/mutations.mjs";

const RESTORABLE = ["title", "descriptionHtml", "vendor", "productType", "tags", "status"];

const fieldsFlag = process.argv.find((a) => a.startsWith("--fields="));
const fields = fieldsFlag ? fieldsFlag.split("=")[1].split(",").map((f) => f.trim()) : RESTORABLE;
const restorePrices = !fieldsFlag || fields.includes("prices");

const invalid = fields.filter((f) => !RESTORABLE.includes(f) && f !== "prices");
if (invalid.length) {
  log.err(`Unknown field(s): ${invalid.join(", ")}`);
  log.detail(`Valid: ${[...RESTORABLE, "prices"].join(", ")}`);
  process.exit(1);
}

const snapshotPath = resolve(REPO_ROOT, "docs/shopify/snapshot.json");
if (!existsSync(snapshotPath)) {
  log.err("No snapshot found at docs/shopify/snapshot.json");
  log.detail("Run: node scripts/shopify/01-audit-export.mjs");
  process.exit(1);
}

const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));

log.banner(
  "Restore from snapshot",
  `Snapshot taken ${snapshot.capturedAt}, ${snapshot.products.length} products.`,
);
log.step(`Restoring: ${fields.join(", ")}${restorePrices ? " + variant prices" : ""}`);
log.blank();

let restored = 0;
let failed = 0;

for (const product of snapshot.products.slice(0, FLAGS.limit)) {
  if (FLAGS.dryRun) {
    log.info(clip(product.title, 74));
    restored++;
    continue;
  }

  try {
    const input = { id: product.id };
    for (const field of fields) {
      if (field !== "prices") input[field] = product[field];
    }
    await mutate(PRODUCT_UPDATE, { product: input }, "productUpdate");

    if (restorePrices && product.variants?.length) {
      await mutate(
        PRODUCT_VARIANTS_BULK_UPDATE,
        {
          productId: product.id,
          variants: product.variants.map((v) => ({
            id: v.id,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
          })),
        },
        "productVariantsBulkUpdate",
      );
    }

    log.ok(clip(product.title, 70));
    restored++;
  } catch (error) {
    log.err(`${clip(product.title, 46)} - ${error.message}`);
    failed++;
  }
}

log.summary([
  [FLAGS.dryRun ? "would restore" : "restored", restored],
  ["failed", failed],
]);

log.warn("Option names and values are not restored; undo 07-sizing.mjs in the admin if needed.");
