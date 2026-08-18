# Costume store ops (separate from agency site)

Store: `1wtpc0-c2.myshopify.com` (intended custom domain: `shop.ivorycrowncollective.com`)

This folder is **Shopify Admin / catalog ops only**. It must never be wired into the Next.js agency site at `ivorycrowncollective.com`.

## Contents

| Path | Purpose |
|------|---------|
| `UNLOCK.md` | Fix primary-domain redirect + password (Admin UI; domain primary cannot be changed via API) |
| `TAXONOMY.md` | Collections, tags, navigation model |
| `UX.md` | Horizon homepage / purchase-path checklist |
| `reports/category-gaps.md` | Competitive category-gap recommendations (product *types* only) |
| `reports/research-checklist.md` | Reusable checklist for later gap research runs |
| `templates/shopify-products-import.csv` | Legal CSV import template + replaceable stubs |
| `scripts/apply-taxonomy.mjs` | Admin API: collections + menus (needs token) |
| `scripts/verify-storefront.sh` | Confirms myshopify no longer redirects to agency |
| `scripts/graphql.sh` | Helper curl wrapper for Admin GraphQL |

## Auth

```bash
export SHOPIFY_SHOP=1wtpc0-c2.myshopify.com
export SHOPIFY_ADMIN_TOKEN=shpat_...   # Custom app Admin API token
```

Or locally (Cloud VMs often fail Cloudflare on `admin.shopify.com`):

```bash
shopify store auth -s 1wtpc0-c2.myshopify.com \
  --scopes read_products,write_products,write_content,write_online_store_navigation,read_themes,write_themes
```

Then:

```bash
./scripts/verify-storefront.sh
node scripts/apply-taxonomy.mjs
```

## Execution order

1. Complete `UNLOCK.md` in Admin (human; Cloudflare blocks cloud automation)
2. Run `apply-taxonomy.mjs` (or follow `TAXONOMY.md` in Admin UI)
3. Apply `UX.md` in theme editor
4. Use `reports/category-gaps.md` when sourcing inventory
5. Fill `templates/shopify-products-import.csv` with **your** supplier SKUs/images/prices → Products → Import
