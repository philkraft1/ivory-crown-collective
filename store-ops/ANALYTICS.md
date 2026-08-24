# Store Analytics (GA4)

Shopify storefront measurement ID: **`G-M5TL69BJF8`**

Installed manually in Horizon via:

- `snippets/google-tag.liquid`
- `{% render 'google-tag' %}` immediately after `<head>` in `layout/theme.liquid` and `layout/password.liquid`

Snapshots live under `store-ops/theme/`. Deployed with Admin API `themeFilesUpsert`.

Do **not** also connect the Google & YouTube channel for this same property without removing the theme snippet (duplicate hits).

Agency site (`ivorycrowncollective.com`) uses a separate property (`G-M0286DKYRS`) in the Next.js app — keep them distinct.
