# Storefront visibility

Live shop: https://www.ivorycrowncollective.store

Apply with an Admin token (`write_products`, `write_content`, `write_online_store_navigation`, `write_themes`):

```bash
set -a; source store-ops/.secrets/admin.env; set +a
node store-ops/scripts/optimize-visibility.mjs
```

## What it changes

- Homepage title and meta description (shop `global.title_tag` / `global.description_tag`)
- SEO title, meta description, and intro copy on Women, Men, Costumes, Holiday, Halloween, and Book Character Day
- Customer pages: Shipping, Returns, Size guide, About, FAQ — copy matches the live shipping and refund policies
- Product SEO title and description **only when those fields are blank**. Product bodies and URLs are left alone
- Search-hides empty or retired collections (`footwear`, `food-supplements`, `frontpage`, `mens-clothing-retired`)
- Main menu: Women · Men · Costumes · Holiday & Seasonal · FAQ
- Homepage hero points at costumes (Halloween) and the announcement bar matches that

AEO/GEO (answer-engine and generative-engine markup) is a follow-up. This pass is the on-page and merchandising layer those systems need first.

Do not add a second GA4 tag. `G-M5TL69BJF8` already loads from the Shopify Google channel. See `ANALYTICS.md`.
