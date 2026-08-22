# Taxonomy: clothing shop departments

Three equal departments. Prefer **smart collections** (tag rules).

## Department tags

| Tag | Use |
|-----|-----|
| `dept:women` | Women apparel, accessories, beauty |
| `dept:men` | Men apparel / accessories |
| `dept:kids` | Kids costumes & dress-up |
| `dept:beauty` | Helper on beauty SKUs (with `type:beauty`) |

## Type tags + Product type

| Tag | Product type |
|-----|--------------|
| `type:apparel` | Apparel |
| `type:accessory` | Accessory |
| `type:beauty` | Beauty |
| `type:costume` | Costume |

Do **not** leave beauty / everyday apparel on `type:costume`.

## Kids costume tags (unchanged)

- Age: `age:toddler` | `age:little-kids` | `age:big-kids`
- Occasion: `occasion:book-character` | `occasion:halloween` | `occasion:stage` | `occasion:everyday`

## Collections

### Departments

| Title | Handle | Rule |
|-------|--------|------|
| Women | `women` | `dept:women` |
| Women Apparel | `women-apparel` | `dept:women` + `type:apparel` |
| Women Accessories | `women-accessories` | `dept:women` + `type:accessory` |
| Beauty | `beauty` | `type:beauty` |
| Men | `men` | `dept:men` |
| Men Apparel | `men-apparel` | `dept:men` + `type:apparel` |
| Men Accessories | `men-accessories` | `dept:men` + `type:accessory` |
| Kids & Costumes | `kids-costumes` | `dept:kids` |
| Costumes | `costumes` | `dept:kids` + `type:costume` |

### Kids age / occasion

Toddler, Little Kids, Big Kids, Book Character Day, Halloween, Stage & Recital, Everyday Dress-up — same as before.

## Scripts

```bash
source store-ops/.secrets/admin.env   # or refresh-token.sh
node store-ops/scripts/tag-departments.mjs
node store-ops/scripts/apply-departments.mjs
```

## Navigation

See `NAV.md`.
