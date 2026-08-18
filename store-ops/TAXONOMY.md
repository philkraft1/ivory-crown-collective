# Taxonomy: age / occasion / type

Goal: kids & costume shopping without hunting. Prefer **automated collections** (tag rules) so new imports land correctly.

## Tag vocabulary (apply on every product)

### Age (`age:*`)

| Tag | Meaning |
|-----|---------|
| `age:toddler` | ~2–4 / 2T–5T |
| `age:little-kids` | ~4–8 / XS–M kids |
| `age:big-kids` | ~8–14 / L–XL kids / juniors |

### Occasion (`occasion:*`)

| Tag | Meaning |
|-----|---------|
| `occasion:book-character` | Book Character Day / literacy week |
| `occasion:halloween` | Halloween / fall events |
| `occasion:stage` | Recital, theater, performance |
| `occasion:everyday` | Dress-up play, not event-specific |

### Type (`type:*`) — also set Shopify **Product type** field

| Tag / Product type | Meaning |
|--------------------|---------|
| `type:costume` / `Costume` | Full costume sets |
| `type:accessory` / `Accessory` | Hats, wands, masks, packs |
| `type:footwear` / `Footwear` | Boots, slippers, character shoes |

### Merchandising (optional)

- `merch:best-seller`
- `merch:new`
- `merch:under-25` / `merch:under-40` (maintain manually or via price rules)

## Collections to create

### By Age (smart)

| Title | Handle | Rule |
|-------|--------|------|
| Toddler | `toddler` | Tag `age:toddler` |
| Little Kids | `little-kids` | Tag `age:little-kids` |
| Big Kids | `big-kids` | Tag `age:big-kids` |

### By Occasion (smart)

| Title | Handle | Rule |
|-------|--------|------|
| Book Character Day | `book-character-day` | Tag `occasion:book-character` |
| Halloween | `halloween` | Tag `occasion:halloween` |
| Stage & Recital | `stage-recital` | Tag `occasion:stage` |
| Everyday Dress-up | `everyday-dress-up` | Tag `occasion:everyday` |

### By Type (smart)

| Title | Handle | Rule |
|-------|--------|------|
| Costumes | `costumes` | Product type `Costume` **or** tag `type:costume` |
| Accessories | `accessories` | Product type `Accessory` **or** tag `type:accessory` |
| Footwear | `footwear` | Product type `Footwear` **or** tag `type:footwear` |

### Merchandising (manual or smart)

| Title | Handle | Notes |
|-------|--------|-------|
| Best Sellers | `best-sellers` | Tag `merch:best-seller` or manual |
| New Arrivals | `new-arrivals` | Tag `merch:new` or created_at sort |
| Under $40 | `under-40` | Price `< 40` if plan allows; else tag |

## Navigation

### Main menu (`main-menu`)

- Shop by Age → Toddler | Little Kids | Big Kids
- Shop by Occasion → Book Character Day | Halloween | Stage & Recital | Everyday Dress-up
- Costumes
- Accessories
- Best Sellers (optional)

### Footer (`footer`)

- Shipping
- Returns
- Size Guide
- Contact

Create matching pages (Online Store → Pages) for Shipping / Returns / Size Guide if missing; link those URLs in the footer menu.

## Admin UI path (if no API token)

1. Products → open each product → set **Product type** + tags from vocabulary
2. Products → Collections → Create (smart) per tables above
3. Online Store → Navigation → edit Main menu + Footer as above

## API path

```bash
export SHOPIFY_SHOP=1wtpc0-c2.myshopify.com
export SHOPIFY_ADMIN_TOKEN=shpat_...
node scripts/apply-taxonomy.mjs
```

Script creates smart collections + rebuilds main/footer menus. It does **not** invent product tags — after import, tag products (or include tags in the CSV).
