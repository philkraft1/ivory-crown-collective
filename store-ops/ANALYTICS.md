# Store Analytics (GA4)

Shopify storefront measurement ID: **`G-M5TL69BJF8`**

## Source of truth

Tracking is provided by the **Shopify Google / YouTube channel web pixel** (see storefront `webPixelsConfigList` → `google_tag_ids`). That pixel also references Google tag **`GT-PLHFH4GS`**.

Do **not** also render a theme `snippets/google-tag.liquid` for the same `G-` ID — that double-counts page views.

The theme snippet file may exist as a deprecated stub only; layouts must **not** `{% render 'google-tag' %}`.

## Agency site

`ivorycrowncollective.com` uses a separate GA4 property: **`G-M0286DKYRS`** (Next.js `SITE.gaMeasurementId`). Keep store and agency IDs distinct.

Retired / do not use on agency: `G-0B672ZN217`.
