# Phase 0 — Emergency fixes

These are live credibility problems. Every item here is Admin UI only (Shopify has no API for
store name, policies, or domains), so work through it by hand. Budget 20–30 minutes.

Store: `1wtpc0-c2.myshopify.com`

---

## 1. Rename the store — highest leverage single field

**Settings → Store details → Store name**

Change `My Store` to:

```
Ivory Crown Collective
```

This one field currently poisons six places at once. Verified in the live storefront HTML:

```html
<title> My Store </title>
<meta property="og:site_name" content="My Store">
<meta property="og:title" content="My Store">
<meta property="og:description" content="My Store">
```

```json
{ "@type": "Organization", "name": "My Store",
  "logo": ".../Ivory_Crown_Collective_Logo_v2_....png" }
```

Note the contradiction that shoppers already see: the announcement bar says
`WELCOME TO IVORY CROWN COLLECTIVE!`, the policies say "Ivory Crown Collective", and the uploaded
logo file is literally `Ivory_Crown_Collective_Logo_v2.png` — but the store name says "My Store".
The brand is half-installed.

While you're on this screen, also set:

- **Sender email** → `phil@ivorycrowncollective.com`
- **Store phone** → `(732) 233-8516`
- **Billing/business address** → your real business address (required for the Contact Information
  policy in step 6, and for Google Merchant Center later)

---

## 2. Remove the `Black girl` colour option — do this first if you only do one thing

There is a product with a **`Color` dropdown containing the selectable value `Black girl`**. It is
live and clickable. This is not a colour, and as a customer-facing label on a children's costume
store it is a genuine liability. It came straight from the eProlo supplier feed untranslated.

`Color` is being used as a junk drawer generally. Other non-colour values confirmed live in that
same option across the catalog:

| Value | Why it's wrong |
| --- | --- |
| `Black girl` | Not a colour. Remove immediately. |
| `Complete Set` | Bundle contents, not a colour |
| `Set includes wig and glasses` | Bundle contents |
| `Including socks` | Bundle contents |
| `Black Wig with Glasses` | Bundle contents |
| `Adult`, `Children`, `Kids`, `Children's King`, `Black Boy's` | Audience/size, not a colour |
| `Britney`, `AI Robot Tulle Skirt` | Style name, not a colour |
| `Bloodstain`, `Floral Print`, `Red Checkered`, `Black and white stripes`, `Pink blue stripes` | Pattern, not a colour |

**To find every affected product exactly**, once your Admin token is in place (see
[scripts/shopify/README.md](../../scripts/shopify/README.md)):

```bash
node scripts/shopify/11-find-emergency-issues.mjs
```

That prints product IDs, handles, and the offending option values so you don't have to hunt.

**How to fix each one:** open the product → Variants → edit the option. Either rename the value to
a real colour, or move it out of `Color` into a proper second option (`Set` / `Bundle` / `Pattern`).
Phase 1's `07-sizing.mjs` handles the systematic version of this, but `Black girl` should not wait
for a scripted pass.

---

## 3. Fix the unfilled placeholder in the shipping policy

**Settings → Policies → Shipping policy**

The live page currently ends with:

> If your order has not arrived within 20 business days, please contact us at **[your support email]**.

Replace `[your support email]` with `phil@ivorycrowncollective.com`.

Full corrected policy text is in [policies/shipping-policy.md](policies/shipping-policy.md).

---

## 4. Unpublish the 4 products with zero images

These are live and purchasable with no photo at all. A shopper can add a costume to cart having
seen nothing.

- `Long sleeved lapel dress` — being cut in Phase 1 anyway (adult womenswear)
- `Style summer short sleeve T-shirt wide-leg pants casual elegant women's set` — cut in Phase 1
- `Boy's Greek Zeus Costume Halloween Party Role Play Costume` — **on-niche, keep and re-image**
- `Halloween Costume Shepherd Sleeveless Long Robe Shawl Ancient Parent-Child Beige Blue Clothing` — **on-niche, keep and re-image**

For each: open the product → **Status → Draft**.

The two on-niche ones get re-imported from eProlo with images before going back to Active. The Zeus
costume matters — Greek/Roman toga costumes are a real school-play search.

---

## 5. Unpublish the empty `Men's Clothing` collection

**Products → Collections → Men's Clothing**

It is published with **0 products** and a hero image, so anyone who finds it hits a guaranteed dead
end. Set its sales channel availability off, or delete it — the new architecture in
[02-store-architecture.md](02-store-architecture.md) doesn't use it, since the store is narrowing to
children's costumes.

---

## 6. Add the two missing policies

**Settings → Policies**

You currently have only Privacy, Shipping, and Refund. Missing:

- **Terms of Service** → paste [policies/terms-of-service.md](policies/terms-of-service.md)
- **Contact Information** → paste [policies/contact-information.md](policies/contact-information.md)

Terms of Service matters more than it sounds: it's where you set the limitation of liability and the
costume-specific safety language (flame resistance, supervision, choking hazards on small
accessories). Selling children's products without it is an avoidable exposure.

---

## 7. Reconcile the return window with actual shipping times

Right now the two policies contradict each other:

- Refund policy: returns accepted within **14 days of delivery**
- Shipping policy: standard delivery **7–15 business days**

A parent ordering a school-play costume waits up to three weeks, then gets a two-week window. Worse,
the refund policy says "We do not offer direct exchanges" — which for a sizing-driven children's
apparel store is the single most damaging line on the site, because wrong size is the #1 return
reason and exchange is what the customer actually wants.

Replace both with the corrected versions:

- [policies/refund-policy.md](policies/refund-policy.md) — 30 days from delivery, exchanges allowed
- [policies/shipping-policy.md](policies/shipping-policy.md) — placeholder fixed, adds the
  order-by-date guidance that this niche lives on

---

## 8. Turn off the storefront password when you're ready

The store is currently password-protected (`/products.json` returns 401). That's the right call
while the overhaul is in progress — keep it on until Phase 2 is done, then:

**Online Store → Preferences → Restrict access to visitors with the password** → uncheck.

Do not remove it before the catalog surgery in Phase 1 lands, or Google will index 118 products
titled after their supplier.

---

## Verification

After steps 1–7, re-check the storefront and confirm:

```bash
# store name propagated to title, og tags, and Organization schema
curl -s https://1wtpc0-c2.myshopify.com/ | Select-String -Pattern '<title>|og:site_name'

# placeholder gone
curl -s https://1wtpc0-c2.myshopify.com/policies/shipping-policy | Select-String -Pattern 'your support email'

# terms of service now resolves (was 404)
curl -s -o /dev/null -w "%{http_code}" https://1wtpc0-c2.myshopify.com/policies/terms-of-service
```

Or once the token is set, just run:

```bash
node scripts/shopify/12-verify.mjs
```
