# Shopify overhaul scripts

Bulk catalog work for the Ivory Crown Collective store. Everything here is
**read-only until you pass `--apply`**, so a bad transform rule can't quietly
rewrite 118 products.

## Try it with no credentials

The transforms run against real product records captured from the storefront
before it was password-protected:

```bash
node scripts/shopify/00-preview-offline.mjs
```

That prints every title rewrite, the cut list with reasons, option cleanups, size
remaps, pricing, and a full sample description rebuild. Review it before granting
API access.

## Getting a token

Step-by-step walkthrough with screenshots' worth of detail:
[docs/shopify/01-admin-token.md](../../docs/shopify/01-admin-token.md). The short version:

1. Shopify admin → **Settings → Apps and sales channels → Develop apps → Create an app**
2. **Configure Admin API scopes** and enable:
   - `read_products`, `write_products`
   - `read_files`, `write_files`
   - `read_content`, `write_content`
   - `read_publications`, `write_publications`
   - `read_themes`, `write_themes`
3. **Install app**, then reveal the **Admin API access token** (starts `shpat_`)
4. Add it to `.env.local` (already gitignored — never commit it):

```
SHOPIFY_ADMIN_TOKEN=shpat_xxxxxxxxxxxxxxxx
SHOPIFY_STORE_DOMAIN=1wtpc0-c2.myshopify.com
```

`SHOPIFY_API_VERSION` defaults to `2025-10`; override it if Shopify retires that
version.

## Order of operations

Run in this order. Each is dry-run first, then `--apply`.

| Step | Script | What it does |
| --- | --- | --- |
| 1 | `01-audit-export.mjs` | Snapshots the catalog to `docs/shopify/snapshot.json`. **Run this first** — `restore.mjs` depends on it. |
| 2 | `02-vendor-brand.mjs` | `vendor: eprolo` → `Ivory Crown Collective`, which is what fixes the supplier name in every product's JSON-LD brand field. |
| 3 | `03-prune.mjs` | Archives off-niche, off-brand, liability, and duplicate products. Nothing is deleted. |
| 4 | `04-taxonomy.mjs` | Assigns product type and the structured tags the collections depend on. |
| 5 | `05-titles.mjs` | Rewrites titles to under 70 characters, character-led. |
| 6 | `06-descriptions.mjs` | Rebuilds copy, strips the supplier CDN, converts cm to inches. |
| 7 | `07-sizing.mjs` | `Suitable for height` → `Size` with US kids labels. Reports Color-option junk for manual cleanup. |
| 8 | `08-pricing.mjs` | Charm-rounds prices. `--promo` also writes compare-at prices. |
| 9 | `09-alt-text.mjs` | Alt text for every image. |
| 10 | `10-image-audit.mjs` | Read-only worklist of products needing more photography. |
| 11 | `11-collections.mjs` | Creates the automated collections. Needs step 4 first. |
| 12 | `12-pages.mjs` | Creates Size Guide, Costume by Date, FAQ, and About. |
| 13 | `13-blog.mjs` | Publishes the three SEO articles to the (currently empty) blog. |

Then:

```bash
node scripts/shopify/verify.mjs
```

### Helpers

- `find-issues.mjs` — locates the exact products behind each Phase 0 emergency
  item, with admin deep links. Pairs with [docs/shopify/00-emergency-fixes.md](../../docs/shopify/00-emergency-fixes.md).
- `verify.mjs` — runs every acceptance check and exits non-zero on failure.
- `restore.mjs` — rolls back to the snapshot. `--fields=title,tags` to be selective.

## Flags

| Flag | Effect |
| --- | --- |
| *(none)* | Dry run. Prints what would change and writes nothing. |
| `--apply` | Commits changes to the live store. |
| `--limit=N` | Process only the first N products. Good for a cautious first run. |
| `--only=handle` | Single product, supported by `06-descriptions.mjs`. |
| `--verbose` | Extra output; also writes a JSON report from the offline preview. |
| `--promo` | `08-pricing.mjs` only. Writes compare-at prices. |
| `--include-review` | `03-prune.mjs` only. Also archives adult-only costumes. |
| `--allow-empty` | `11-collections.mjs` only. Creates collections with under 3 products. |

Recommended first live run:

```bash
node scripts/shopify/01-audit-export.mjs
node scripts/shopify/05-titles.mjs --apply --limit=3   # confirm 3 look right
node scripts/shopify/05-titles.mjs --apply             # then the rest
```

## What these scripts can't do

Shopify has no Admin API for these, so they're documented as manual steps:

- **Store name**, sender email, and business address → `Settings → Store details`
- **Policies** (Terms of Service, Contact Information) → `Settings → Policies`, content in [docs/shopify/policies/](../../docs/shopify/policies/)
- **Navigation menus** → `Online Store → Navigation`, structure in [docs/shopify/02-store-architecture.md](../../docs/shopify/02-store-architecture.md)
- **Theme sections and homepage layout** → theme editor, spec in the same doc
- **Custom domain** → [docs/shopify/03-domain.md](../../docs/shopify/03-domain.md)
- **Pixels, apps, email flows** → [docs/shopify/04-growth.md](../../docs/shopify/04-growth.md)
- **Color option restructuring** — moving `Complete Set` out of `Color` changes the
  variant matrix, so `07-sizing.mjs` reports it to `docs/shopify/option-cleanup.json`
  rather than guessing.

## Two decisions encoded here worth knowing about

**Compare-at prices are opt-in.** Nothing on the store currently shows a discount,
and the tempting fix is to invent a "was" price. A compare-at price is a claim about
a former price, and the FTC treats a reference price you never charged as deceptive
advertising — it's also grounds for a Google Merchant Center suspension. So
`08-pricing.mjs` only tidies prices by default, and writes compare-at values solely
under `--promo` for a real, time-bound sale.

**Some products are cut, not renamed.** `03-prune.mjs` archives Native American
"chief" costumes and a blood-stained student uniform outright. Schools are this
store's customer base and both are banned in most US districts, so no amount of
retitling makes them sellable here. The reasoning is in each rule in
[lib/classify.mjs](lib/classify.mjs).

## Layout

```
scripts/shopify/
  lib/
    env.mjs         .env.local loading, brand constants
    client.mjs      Admin GraphQL client, throttling, pagination
    cli.mjs         flags, logging, report writing
    classify.mjs    the domain rules: characters, occasions, cut list, rewrites
    mutations.mjs   GraphQL mutation strings
    fixtures.mjs    real product records for offline preview
  content/
    pages.mjs       page copy, version-controlled
    articles.mjs    blog articles
  00-preview-offline.mjs .. 13-blog.mjs
  find-issues.mjs  verify.mjs  restore.mjs
```

`lib/classify.mjs` is where the judgment lives — character catalog, occasion
mapping, cut rules, title and description generation. Tune it there and every
script picks it up.
