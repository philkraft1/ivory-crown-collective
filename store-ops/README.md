# Store ops (separate from agency site)

Store: `1wtpc0-c2.myshopify.com` · live: https://www.ivorycrowncollective.store

This folder is **Shopify Admin / catalog ops only**. It must never be wired into the Next.js agency site at `ivorycrowncollective.com`.

## Contents

| Path | Purpose |
|------|---------|
| `UNLOCK.md` | Fix primary-domain redirect (password already off) |
| `TAXONOMY.md` | Four-catalog tags + smart collections |
| `NAV.md` | Main/footer menu (Women · Men · Costumes · Holiday & Seasonal) |
| `UX.md` | Horizon homepage / purchase-path checklist |
| `IMPORT.md` | Legal CSV import path |
| `theme/` | Horizon homepage/header JSON snapshots |
| `reports/` | Audits, gaps, assortment notes |
| `templates/shopify-products-import.csv` | Legal CSV import template |
| `scripts/audit-four-catalogs.mjs` | Archive noise + retag four catalogs |
| `scripts/expand-women-men-catalog.mjs` | Restore women apparel + seed Men from owned assets |
| `scripts/apply-four-catalogs.mjs` | Collections, pages, merch tags |
| `scripts/apply-departments.mjs` | Legacy department collections |
| `scripts/tag-departments.mjs` | Legacy women/men/kids/beauty classifier |
| `scripts/refresh-token.sh` | Refresh CLI Admin token |
| `scripts/verify-storefront.sh` | Confirms storefront host |

## Live status

- **Four catalogs:** Women · Men · Costumes · Holiday & Seasonal
- Horizon homepage: catalog carousel + featured rails for each
- Men filled from owned product images (duplicate + retitle); grocery/supplement noise archived
- Navigation: set Main menu in Admin per `NAV.md` if token lacks `write_online_store_navigation`
- Password protection: off
- Agency apex remains Next.js

## Auth

```bash
./scripts/refresh-token.sh
set -a; source .secrets/admin.env; set +a
./scripts/verify-storefront.sh
node scripts/apply-taxonomy.mjs
node scripts/tag-products.mjs
```

For menus automation, re-auth locally with navigation scopes (Cloudflare blocks cloud VMs):

```bash
shopify store auth -s 1wtpc0-c2.myshopify.com \
  --scopes write_products,write_content,write_themes,write_online_store_navigation
```

## Execution order

1. Complete domain demote in `UNLOCK.md` (one Admin click)
2. Set menus per `NAV.md`
3. Use `reports/category-gaps.md` when sourcing inventory
4. Fill `templates/shopify-products-import.csv` with supplier SKUs/images/prices → Products → Import
