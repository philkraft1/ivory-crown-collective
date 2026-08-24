# Taxonomy: four buyer catalogs

Prefer **smart collections** (tag rules).

## Department tags

| Tag | Use |
|-----|-----|
| `dept:women` | Women apparel, accessories, beauty |
| `dept:men` | Men apparel / accessories |
| `dept:kids` | Costumes & dress-up |
| `dept:seasonal` | Holiday & seasonal (Halloween, fall gifts, etc.) |
| `dept:beauty` | Helper on beauty SKUs (with `type:beauty`) |

## Type tags + Product type

| Tag | Product type |
|-----|--------------|
| `type:apparel` | Apparel |
| `type:accessory` | Accessory |
| `type:beauty` | Beauty |
| `type:costume` | Costume |
| `type:footwear` | Footwear |

Do **not** leave beauty / everyday apparel on `type:costume`.

## Merch tags

| Tag | Collection |
|-----|------------|
| `merch:seasonal` | Dual-signal with `dept:seasonal` |
| `merch:best-seller` | Best Sellers |
| `merch:new` | New Arrivals |
| `merch:under-40` | Under $40 |

## Kids costume tags

- Age: `age:toddler` | `age:little-kids` | `age:big-kids`
- Occasion: `occasion:book-character` | `occasion:halloween` | `occasion:stage` | `occasion:everyday`

## Top-level collections

| Title | Handle | Rule |
|-------|--------|------|
| Women | `women` | `dept:women` |
| Men | `men` | `dept:men` |
| Costumes | `costumes` | `dept:kids` + `type:costume` |
| Holiday & Seasonal | `holiday-seasonal` | `dept:seasonal` |

Nested: women-apparel, women-accessories, beauty, men-apparel, men-accessories, age/occasion kids collections.

## Scripts

```bash
source store-ops/.secrets/admin.env
bash store-ops/scripts/refresh-token.sh
node store-ops/scripts/audit-four-catalogs.mjs
node store-ops/scripts/expand-women-men-catalog.mjs
node store-ops/scripts/apply-four-catalogs.mjs
```

## Navigation

See `NAV.md`.
