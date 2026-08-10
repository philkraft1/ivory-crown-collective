# Admin API migration runbook

The scripts use Shopify Admin GraphQL API `2026-07`. They are dry-run by
default and refuse to mutate the store without a second confirmation flag.

## 1. Create the custom app

In Shopify Admin:

1. Go to **Settings > Apps and sales channels > Develop apps**.
2. Enable custom app development if prompted.
3. Create an app named `ICC Catalog Overhaul`.
4. Under **Configuration > Admin API integration**, grant:
   - `read_products`
   - `write_products`
   - `read_files`
   - `write_files`
   - `read_online_store_pages`
   - `write_online_store_pages`
5. Install the app.
6. Reveal the Admin API access token once.

These scripts do not require `write_themes`, order, customer, payment, or
analytics scopes. Keep the app least-privileged.

## 2. Store the token locally

Copy `.env.example` to `.env.local` and fill in:

```dotenv
SHOPIFY_STORE_DOMAIN=1wtpc0-c2.myshopify.com
SHOPIFY_API_VERSION=2026-07
SHOPIFY_ADMIN_TOKEN=shpat_your_token_here
```

Never paste the token into chat, commit it, place it in a report, or expose it
through a `NEXT_PUBLIC_` variable. `.env.local` and `shopify-data/` are
gitignored.

## 3. Export the baseline

```bash
npm run shopify:audit
```

This verifies the store identity and writes the complete catalog state to:

```text
shopify-data/01-audit-export-<timestamp>.json
```

Copy that file to encrypted business storage before applying changes.

## 4. Preview every change

Run in order:

```bash
npm run shopify:vendor
npm run shopify:prune
npm run shopify:taxonomy
npm run shopify:titles
npm run shopify:descriptions
npm run shopify:sizing
npm run shopify:pricing
npm run shopify:alt-text
npm run shopify:image-audit
npm run shopify:collections
npm run shopify:pages
```

Each command writes a timestamped JSON report and makes no changes. Review:

- Every product selected for archive in `03-prune`.
- Every `safeChanges` title and all `manualReview` titles in `05-titles`.
- Every generated description and converted size table in `06-descriptions`.
- `unmappedValues` in `07-sizing`; those stay unchanged.
- Price changes in `08-pricing`.

Do not apply a step until its report is acceptable.

## 5. Apply one step at a time

Use the exact confirmation on each mutating command:

```bash
npm run shopify:vendor -- --apply --confirm=SHOPIFY-STORE-OVERHAUL
npm run shopify:prune -- --apply --confirm=SHOPIFY-STORE-OVERHAUL
npm run shopify:taxonomy -- --apply --confirm=SHOPIFY-STORE-OVERHAUL
npm run shopify:titles -- --apply --confirm=SHOPIFY-STORE-OVERHAUL
npm run shopify:descriptions -- --apply --confirm=SHOPIFY-STORE-OVERHAUL
npm run shopify:sizing -- --apply --confirm=SHOPIFY-STORE-OVERHAUL
npm run shopify:pricing -- --apply --confirm=SHOPIFY-STORE-OVERHAUL
npm run shopify:alt-text -- --apply --confirm=SHOPIFY-STORE-OVERHAUL
npm run shopify:collections -- --apply --confirm=SHOPIFY-STORE-OVERHAUL
npm run shopify:pages -- --apply --confirm=SHOPIFY-STORE-OVERHAUL
```

Step 10 is report-only. Steps 11 and 12 create unpublished resources so a
merchant can review collection membership, images, page content, links, and
theme rendering before publication.

After each command:

1. Open Shopify Admin and inspect at least five affected products.
2. Open one desktop and one mobile product page.
3. Check variant selectors, price, description, size table, and images.
4. Run that step again in dry-run mode. The remaining changes should be zero
   or only items intentionally left for manual review.

## What each script does

| Step | Change |
| --- | --- |
| 01 | Exports full catalog baseline and warnings. |
| 02 | Changes public vendor/structured-data brand from eProlo to Ivory Crown Collective. |
| 03 | Archives zero-image, duplicate, off-niche fashion, and adult-only costume products. |
| 04 | Adds `Kids' Costumes`/`Family Costumes` types and structured occasion/character/theme/age/gender tags. |
| 05 | Rewrites only high-confidence kids' character titles under 70 characters; ambiguous titles are report-only. |
| 06 | Removes supplier-CDN description images, writes customer-oriented copy, and converts eligible size tables to dual units. |
| 07 | Renames `Suitable for height` to `Size`; adds age ranges only when explicitly found in that product's source description. |
| 08 | Rounds prices upward to `.95`/`.99`; preserves existing compare-at prices and never fabricates discounts. |
| 09 | Adds alt text to blank product-image fields. |
| 10 | Reports retained products with fewer than five images. |
| 11 | Creates missing automated collections from structured tags; existing handles are never overwritten and new collections remain unpublished. |
| 12 | Creates missing About, FAQ, Size Guide, and Costume by Date pages as drafts; existing pages are never overwritten. |

## Product category

Step 04 sets the merchant-defined product type, but does not guess a Shopify
Standard Product Taxonomy GID. In the bulk editor, set the verified category:

```text
Apparel & Accessories > Costumes & Accessories > Costumes
```

Confirm the exact current label in Shopify Admin before bulk applying it.

## Rollback

The audit export contains the original title, description HTML, vendor, type,
tags, status, variants, options, and media metadata. Roll back in the reverse
order of application. Product archival is non-destructive: restore an archived
product by changing status after its data and images are verified.

If a script stops on a Shopify user error, do not immediately rerun with
`--apply`. Fix the reported product or scope, then generate a new dry-run report.
