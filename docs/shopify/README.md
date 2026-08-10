# Shopify retail-arm overhaul

This runbook relaunches `1wtpc0-c2.myshopify.com` as the retail arm of
Ivory Crown Collective, focused on children's storybook, school-play, recital,
and pageant costumes.

## Why this niche

The public-catalog audit on August 9, 2026 found:

- 118 products and 891 variants, all imported from eProlo.
- 59 kids/family products; 51 of those are storybook or character themed.
- 38 products already use height-based sizing.
- 20 off-niche adult fashion products and 39 adult-only costumes.
- 118 products with no product type or tags.
- 370 images with empty alt text and four products with no images.
- 118 descriptions hotlinking supplier images; 103 products with metric-only
  sizing despite US-only shipping.

The store should compete on urgent, specific intent such as “Tin Man costume
for a school play” and “book character day outfit,” not generic Halloween
traffic dominated by Amazon and national party chains.

## Order of work

1. Complete [00-emergency-fixes.md](00-emergency-fixes.md).
2. Configure Admin API access and run every script in dry-run mode by following
   [02-api-runbook.md](02-api-runbook.md).
3. Review the generated JSON reports in the ignored `shopify-data/` directory.
4. Apply scripts 02–14 one at a time, checking the generated resources after
   each step.
5. Review and publish the new collection/page/article drafts, assign the
   review navigation menu, then rebuild the homepage using
   [01-store-rebuild.md](01-store-rebuild.md).
6. Connect the domain and analytics using
   [03-domain-and-growth.md](03-domain-and-growth.md).

## Safety model

- Migration scripts are read-only unless both `--apply` and
  `--confirm=SHOPIFY-STORE-OVERHAUL` are present.
- Step 01 exports the full pre-change Admin API state before any mutation.
- Snapshots and reports go to `shopify-data/`, which is gitignored.
- Scripts stop on GraphQL or Shopify user errors.
- No script invents product facts, taxonomy IDs, or discount anchors.
- Existing compare-at prices are preserved. Fake “was” prices are never added.
