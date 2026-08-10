# Phase 4 — Growth infrastructure

The store has **no analytics or advertising pixels of any kind** beyond Shopify's
built-in tracking, no reviews app, no published blog posts, and no social links.
Verified by inspecting the live storefront HTML: not a single app script tag.

The practical consequence: **you cannot currently run paid traffic.** Any money spent
on Meta or TikTok today would be unmeasurable and unoptimizable, because the platforms
would never learn which clicks became purchases.

Do these in order. Tracking first, because it needs to be collecting data *before* you
drive traffic, not after.

---

## 1. Analytics and pixels

Shopify's **Customer Events** (Settings → Customer events) is the right place for all
of these. It's server-side-assisted, survives theme changes, and respects the consent
banner. Do not paste raw script tags into `theme.liquid`.

### Google Analytics 4

1. Create a GA4 property at [analytics.google.com](https://analytics.google.com)
2. Install the **Google & YouTube** Shopify app and connect the property — this wires
   up purchase, `add_to_cart`, and `view_item` events without custom code
3. Confirm events land in GA4 Realtime before moving on

### Meta pixel

1. Create the pixel in Meta Events Manager
2. Install the **Facebook & Instagram** Shopify app and connect it
3. Enable the **Conversions API** alongside the browser pixel. This matters more than
   usual here: iOS signal loss is severe, and your buyer is a parent on a phone

### TikTok pixel

Install the **TikTok** Shopify app and connect. Worth having even before you advertise,
because TikTok's organic reach for "costume reveal" content is unusually strong and
this catalog is visually native to the platform.

### Consent

**Settings → Customer privacy** → enable the cookie banner and set region to at least
the US states with privacy laws. Shopify gates the pixels on consent automatically once
the banner is on.

### Verification

```bash
curl -s https://shop.ivorycrowncollective.com/ | Select-String -Pattern 'gtag|fbevents|analytics\.tiktok'
```

You should see all three. Cross-check in GA4 Realtime, Meta Test Events, and TikTok
Pixel Helper.

---

## 2. Reviews

There is currently zero social proof on any product page. For a store selling to
parents, on an unfamiliar domain, with 7–15 day shipping, this is the single largest
trust gap.

**Install Judge.me** (free tier covers what you need).

Configure:

- **Review request email at 21 days after fulfillment**, not the default 7. Standard
  delivery is 8–18 business days, so a 7-day request arrives before the costume does.
- **Ask for photos.** A photo of a real child in the costume on a real stage is worth
  more than any copy on the page, and it's the one thing Amazon listings for these
  same products don't have.
- **Add the star rating to collection pages**, not just product pages.
- **Ask a second question: "Did the size fit as expected?"** This gives you sizing data
  you currently guess at, and future shoppers a straight answer.

Do not add the homepage review section until you have at least 5 reviews. An empty
review widget actively reduces trust.

---

## 3. Email

The email capture form already exists on the storefront, but nothing is sent to anyone
who fills it in. Two automations in **Shopify Email** cover most of the value:

### Welcome, triggered on subscribe

The current form copy promises "exclusive deals and early access," which is a promise
you don't need to make. Replace it with the costume calendar (see
[02-store-architecture.md](02-store-architecture.md)) and deliver exactly that:

1. **Immediately** — the order-by calendar for the next three occasions, plus a link to
   the size guide
2. **Day 3** — how to measure a child for a costume, linking `/pages/size-guide`
3. **Day 7** — the current seasonal collection

### Abandoned checkout

Shopify's default is one email. Use three: 1 hour, 24 hours, 72 hours.

For this store the recovery angle is not a discount, it's **the deadline**. "Your event
is coming and standard shipping takes 8–18 business days" recovers carts that a 10%
code won't, and it doesn't train customers to wait for discounts.

### Seasonal calendar

Send the order-by reminder roughly 6 weeks before each occasion:

| Send | For |
| --- | --- |
| Mid-January | Book Character Day / Read Across America |
| Late February | Spring musicals |
| Mid-March | Dance recitals |
| Mid-September | Halloween |
| Late October | Christmas pageants |

This calendar *is* the business. One well-timed email per occasion beats generic
promotional sends.

---

## 4. Google Merchant Center

Only viable now that Phase 1 has fixed the three things that would have caused
immediate disapproval:

- `vendor` no longer reads `eprolo`, so the feed's `brand` is correct
- `productType` is populated, so products can be categorized
- Titles are under 70 characters, so they aren't truncated in Shopping results

Setup:

1. Create the Merchant Center account and verify `shop.ivorycrowncollective.com`
2. Connect via the **Google & YouTube** Shopify app, which builds the feed
3. Confirm the shipping and returns policies are readable — Google checks for these, and
   your Terms of Service and Contact Information policies from Phase 0 are part of why
   it passes
4. Set up the **age group** (`kids`, `toddler`) and **gender** attributes from the
   `age:` and `gender:` tags

Two warnings specific to this catalog:

- **Do not run Shopping ads on products with fewer than 3 images.** Check
  `docs/shopify/image-worklist.json` first.
- **Do not fabricate compare-at prices to make the feed look discounted.** Merchant
  Center suspends accounts for misrepresentative pricing, and it's also FTC-deceptive.
  See the note in [../../scripts/shopify/08-pricing.mjs](../../scripts/shopify/08-pricing.mjs).

---

## 5. Social

The footer currently has no social links at all, which reads as an abandoned store.
Create the accounts before adding links — a link to an empty profile is worse than none.

Realistic priority for this niche:

1. **Instagram** — parents, teachers, dance studios. Reels of a costume on a child.
2. **TikTok** — highest organic upside. "Getting ready for the school play" content.
3. **Pinterest** — genuinely underrated here. "Book character day costume ideas" is a
   high-volume evergreen Pinterest search, and pins keep driving traffic for years.

Facebook matters mainly as an ads surface, not organic.

---

## 6. What to do first

If you only do part of this:

1. **GA4 + Meta pixel** — without them, everything downstream is guesswork
2. **Judge.me** — closes the biggest trust gap
3. **Abandoned checkout emails** — the highest-ROI automation in ecommerce
4. **Pinterest** — cheapest organic fit for this specific niche
5. Everything else

Skip until you have consistent orders: loyalty apps, upsell apps, subscription apps,
SMS. They optimize a funnel that doesn't have traffic yet.
