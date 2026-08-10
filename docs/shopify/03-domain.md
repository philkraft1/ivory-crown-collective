# Phase 3 — Domain and brand integration

The store runs on `1wtpc0-c2.myshopify.com` with no custom domain.
`ivorycrowncollective.com` serves the Next.js agency site, and
`shop.ivorycrowncollective.com` does not resolve at all.

A `myshopify.com` URL costs you real money: shoppers read it as a temporary or
untrustworthy store, and it can't accumulate SEO authority under your brand.

---

## 1. DNS

You chose a subdomain, which is the right call here — the agency site keeps the root
domain and the store gets its own space without either fighting for it.

Add this record at whatever hosts DNS for `ivorycrowncollective.com` (likely Vercel,
given the Next.js site is deployed there, or your registrar):

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| `CNAME` | `shop` | `shops.myshopify.com` | 3600 |

`shops.myshopify.com` is correct and intentional — note the **s** on `shops`. It is not
your store's own `myshopify` hostname.

Do not add an A record for the subdomain. Shopify handles the apex-versus-subdomain
distinction differently, and a stray A record will fight the CNAME.

## 2. Connect it in Shopify

**Settings → Domains → Connect existing domain** → enter
`shop.ivorycrowncollective.com`.

Shopify verifies the CNAME, then provisions a TLS certificate. Verification usually
takes minutes; the certificate can take up to 48 hours. Until it's issued you'll see a
"pending SSL" warning, which is normal.

Once green, set it as the **primary domain**. Shopify then 301-redirects the
`myshopify.com` URL to it automatically, so nothing is orphaned.

## 3. Verify

```bash
nslookup shop.ivorycrowncollective.com
curl -sI https://shop.ivorycrowncollective.com | Select-String -Pattern 'HTTP/|location'
```

You want a `200` on the store, a valid certificate, and `1wtpc0-c2.myshopify.com`
redirecting to the new host. Confirm the sitemap follows:

```bash
curl -s https://shop.ivorycrowncollective.com/sitemap.xml
```

Every `<loc>` should be on the new domain. If any still point at `myshopify.com`, the
primary domain isn't set.

## 4. Google Search Console

Add `shop.ivorycrowncollective.com` as a property and submit the sitemap. Do this
**after** the Phase 1 catalog work and **before** removing the storefront password —
otherwise the first thing Google indexes is 118 products titled after their supplier.

---

## 5. Theme branding

Theme: **Horizon 4.1.3**. The logo is already uploaded as
`Ivory_Crown_Collective_Logo_v2.png`, so the mark is done. What's missing is
everything around it.

### Colors

Pull these from the agency site's tokens in
[src/app/globals.css](../../src/app/globals.css) so the two properties read as one
brand:

| Token | Hex | Use in the theme |
| --- | --- | --- |
| `--ink` | `#0a0a0a` | Header and footer background, body text on light |
| `--pearl` | `#f4efdf` | Page background, text on dark |
| `--gold` | `#c9a227` | Primary buttons, links, accents |
| `--gold-bright` | `#e8c547` | Button hover |
| `--gold-hot` | `#f5d76a` | Focus rings, highlights |
| `--gold-deep` | `#8a6d1a` | Borders, dividers, pressed states |

One deliberate divergence: **do not carry the agency site's full dark theme onto the
store.** The agency site is near-black with gold, which suits a design and DJ studio.
A children's costume store selling to parents and teachers needs to feel bright and
trustworthy. Use `--pearl` as the page background with `--ink` for the header and
footer and `--gold` for accents. Same palette, inverted weight.

### Type

The agency site uses **Cinzel** (an engraved serif) for headings. Cinzel works for the
logotype and section headings, but it's poor for body text at small sizes and terrible
in a size chart table.

- **Headings:** Cinzel, matching the agency site
- **Body, product copy, tables:** a plain system or grotesque sans

Both are available in Shopify's font picker. Keep body text at 16px minimum — parents
read size charts on phones.

### Favicon

**Online Store → Themes → Customize → Theme settings → Favicon.** Use the same mark as
`src/app/icon.png`.

---

## 6. Cross-linking the two properties

The agency site and the store should each know the other exists. The agency-side change
is in code:

- `shopUrl` added to `SITE` in [src/lib/site.ts](../../src/lib/site.ts)
- Surfaced through [src/components/Hero.tsx](../../src/components/Hero.tsx) and
  [src/components/SiteFooter.tsx](../../src/components/SiteFooter.tsx)

On the store side, add to the footer under **Company**:

```
Design, DJ & IT services → https://ivorycrowncollective.com
```

Both directions are also stated in the store's
[About page](../../scripts/shopify/content/pages.mjs) and the
[Contact Information policy](policies/contact-information.md).

---

## 7. Email

Store email currently sends from a Shopify default. Set the sender to
`phil@ivorycrowncollective.com` in **Settings → Notifications → Sender email**.

Shopify will ask you to verify the domain by adding DNS records — SPF, DKIM, and
usually a CNAME. Without them, order confirmations land in spam, which for a store
where customers are anxious about delivery dates directly generates support email.
Add the records Shopify gives you at the same time as the `shop` CNAME.
