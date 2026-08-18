# Product import (legal path only)

## Rules

- Do **not** copy competitor titles, photos, or descriptions.
- Import only supplier-owned or licensed assets.
- Stub rows in `templates/shopify-products-import.csv` use `REPLACE:` titles and `Published=FALSE` / `Status=draft` — replace before go-live.

## Template

File: `templates/shopify-products-import.csv`

Includes stub variants for Priority 1–2 types from `reports/category-gaps.md`, pre-tagged for smart collections in `TAXONOMY.md`.

## When you have a supplier file

1. Map supplier columns → Shopify columns (Handle, Title, Body, Vendor, Type, Tags, Variant SKU/Price/Qty, Image Src).
2. Ensure tags include `age:*`, `occasion:*`, `type:*` as needed.
3. Shopify Admin → **Products → Import** → upload CSV.
4. Or Admin API bulk product create (future enhancement).

## If no supplier file yet

Ship the empty/stub template only (this repo state). Do not invent competitor clones.

## After import

```bash
export SHOPIFY_ADMIN_TOKEN=shpat_...
node scripts/apply-taxonomy.mjs   # if collections not created yet
./scripts/verify-storefront.sh
```

Publish drafts only after images + real copy are in place.
