# Navigation (Admin UI — required scope)

Collections and tags were applied via Admin API. **Menus need** `write_online_store_navigation`, which the current CLI token does not include.

## Main menu

Online Store → Navigation → **Main menu**:

1. Shop by Age → Toddler, Little Kids, Big Kids (`/collections/toddler` etc.)
2. Shop by Occasion → Book Character Day, Halloween, Stage & Recital, Everyday Dress-up
3. Costumes → `/collections/costumes`
4. Accessories → `/collections/accessories`

## Footer

Link to pages already created:

- `/pages/shipping`
- `/pages/returns`
- `/pages/size-guide`

(Footer theme also includes a Shipping · Returns · Size Guide liquid row.)

## Re-auth for automation

```bash
shopify store auth -s 1wtpc0-c2.myshopify.com \
  --scopes write_products,write_content,write_themes,write_online_store_navigation
node store-ops/scripts/apply-taxonomy.mjs
```
