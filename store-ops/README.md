# Costume store ops (separate from agency site)

Store: `1wtpc0-c2.myshopify.com` (intended custom domain: `shop.ivorycrowncollective.com`)

This folder is **Shopify Admin / catalog ops only**. It must never be wired into the Next.js agency site at `ivorycrowncollective.com`.

## Contents

| Path | Purpose |
|------|---------|
| `UNLOCK.md` | Fix primary-domain redirect (password already off) |
| `TAXONOMY.md` | Collections, tags, navigation model |
| `NAV.md` | Main/footer menu setup (needs navigation scope or Admin UI) |
| `UX.md` | Horizon homepage / purchase-path checklist |
| `IMPORT.md` | Legal CSV import path |
| `reports/category-gaps.md` | Competitive category-gap recommendations (types only) |
| `reports/research-checklist.md` | Reusable checklist for later gap research |
| `templates/shopify-products-import.csv` | Legal CSV import template + replaceable stubs |
| `scripts/apply-taxonomy.mjs` | Create smart collections (+ menus if scoped) |
| `scripts/tag-products.mjs` | Map catalog → taxonomy tags |
| `scripts/refresh-token.sh` | Refresh expiring CLI Admin token |
| `scripts/verify-storefront.sh` | Confirms myshopify no longer redirects to agency |

## Live status

- **Storefront live:** https://www.ivorycrowncollective.store (primary domain)
- Smart collections published to Online Store; products tagged for age / occasion / type
- Horizon homepage: hero CTA → Book Character Day + age/occasion sections
- Product trust links; Shipping / Returns / Size Guide pages
- Password protection: off
- Agency apex `ivorycrowncollective.com` remains the Next.js site (separate)
- Menus: set in Admin per `NAV.md` if Main menu still needs age/occasion links

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
