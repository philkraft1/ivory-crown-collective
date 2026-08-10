# Domain, brand, and growth setup

## Connect `shop.ivorycrowncollective.com`

The root domain remains on the Next.js agency site. Only the `shop` subdomain
should point to Shopify.

At the DNS provider for `ivorycrowncollective.com`, add:

| Type | Host/name | Target/value |
| --- | --- | --- |
| CNAME | `shop` | `shops.myshopify.com.` |

Do not change the root-domain A/AAAA records or the `www` record; those serve
the agency site. If the DNS provider uses a proxy/CDN toggle, set the record to
DNS-only while Shopify issues TLS.

Then:

1. Go to **Shopify Admin > Settings > Domains**.
2. Choose **Connect existing domain** and enter
   `shop.ivorycrowncollective.com`.
3. Complete any TXT ownership verification Shopify requests.
4. Wait for both **Connected** and a valid TLS certificate.
5. Set the subdomain as the online-store primary domain.
6. Verify that the old `1wtpc0-c2.myshopify.com` URL redirects to the custom
   domain.

DNS commonly updates within two hours but can take up to 48 hours. Do not switch
the agency site's `NEXT_PUBLIC_SHOP_URL` to the subdomain before the HTTPS URL
loads successfully.

Official Shopify reference:
[Connect a third-party domain](https://help.shopify.com/en/manual/domains/add-a-domain/connecting-domains/connect-domain-manual).

## Theme brand settings

The uploaded ICC logo can remain the parent mark, but add a text qualifier near
it:

```text
KIDS · COSTUMES FOR THE STORY
```

Use the agency site's existing tokens:

| Role | Value |
| --- | --- |
| Ink/background | `#030303` |
| Soft black | `#0A0A0A` |
| Gold | `#C9A227` |
| Bright gold | `#E8C547` |
| Pearl | `#F4EFDF` |

Use dark/gold for the header, footer, and editorial sections, but keep product
cards and size tables on a light, high-contrast surface for readability. Do not
place long product copy in gold text on black.

Typography:

- Cinzel (or the closest Shopify theme serif) for short display headings only.
- A plain sans serif for prices, controls, size tables, policy copy, and body
  text.

## Analytics foundation

Configure consent and privacy before advertising:

1. In **Settings > Customer privacy**, configure the correct markets, cookie
   banner, and data-sale/opt-out behavior with legal review.
2. Install **Google & YouTube** to connect Merchant Center and Google Analytics
   rather than pasting duplicate `gtag` snippets into the theme.
3. Install **Facebook & Instagram** only when the Meta account is ready; connect
   Pixel and Conversions API through the channel.
4. Install the official **TikTok** channel only when TikTok advertising is part
   of the acquisition plan.
5. Use Shopify's pixel/app status pages and browser diagnostics to verify one
   event stream per platform. Duplicate pixels inflate conversions and corrupt
   optimization.

Verify these events with test traffic:

```text
page_view
view_item
add_to_cart
begin_checkout
purchase
```

Record one test order and make sure purchase value, currency, order ID, and
item IDs are correct. Exclude staff/test traffic where the platform supports
it.

## Reviews

Install Judge.me's free tier or another Shopify review app with verified-order
controls.

- Send the first request after the expected delivery date, not immediately
  after fulfillment.
- Ask about fit, role/occasion, and whether the item matched the listing.
- Never import fabricated reviews or write reviews on a customer's behalf.
- Hide empty rating widgets until genuine reviews exist.

## Email automation

Use Shopify Email for:

1. **Welcome**
   - Immediate: brand promise and shop-by-occasion links.
   - Day 2: how to measure a child.
   - Day 5: book day, school play, and pageant checklist.
2. **Abandoned checkout**
   - First reminder after the standard Shopify delay.
   - Second message focused on sizing/support, not false urgency.
3. **Post-purchase**
   - Measurement and try-on reminder before shipment arrives.
   - Review request after expected delivery.

Do not offer a discount until margin, supplier cost, shipping, returns, and
payment fees are modeled.

## Merchant Center readiness

Do not activate paid listings until:

- Custom domain is connected.
- Store name and policies are complete.
- Product vendor no longer exposes eProlo.
- Standard product category, age group, gender, color, and size are accurate.
- Image and landing-page URLs work without supplier-CDN dependencies.
- Shipping cost and delivery estimates in Merchant Center match checkout.
- Return-policy settings match the live policy.

Resolve diagnostics before campaign launch; disapproved products should not be
worked around with inaccurate feed data.

## Initial SEO content

Step 14 creates the first three guides below as unpublished drafts. Add original
images, verify every claim and internal link, then publish useful articles
rather than thin keyword posts:

1. `25 Book Character Day Costume Ideas for Kids`
2. `Wizard of Oz School Play Costume Guide`
3. `Christmas Pageant Costume Checklist for Families and Directors`
4. `How to Measure a Child for a Stage Costume`
5. `When to Order a Costume for a School Performance`

Each article should link to relevant live collections only, include original
helpful guidance, and avoid claiming stock, delivery, or safety facts that have
not been verified.
