# Phase 2 — Store architecture, navigation, and homepage

Collections and pages are created by script. Navigation menus and theme layout have
no Admin API, so this is the spec to build by hand.

Theme: **Horizon 4.1.3**

```bash
node scripts/shopify/11-collections.mjs --apply   # creates the collections first
node scripts/shopify/12-pages.mjs --apply
```

---

## 1. Navigation

### The problem being fixed

The live header is `Home / Catalog / Contact / Search`. It links to **zero
collections**. All 99 Halloween products, all 18 Women's Fashion products, and the
empty Men's Clothing collection are unreachable unless a shopper lands on them
directly from search. `Catalog` dumps `/collections/all` in alphabetical order, which
is why the first thing anyone sees is "Boy's Foreign Fashion Halloween Costume…".

A shopper arriving for a school play has an occasion, a character, and a child's age.
The menu should be those three things.

### Main menu

**Online Store → Navigation → Main menu.** Rebuild as:

```
Shop by Occasion  (link: /collections/school-plays)
├── School Play Costumes        /collections/school-plays
├── Book Character Day          /collections/book-character-day
├── Christmas & Church Pageants /collections/christmas-pageants
├── Dance & Recital             /collections/dance-and-recital
└── Halloween                   /collections/halloween

Shop by Character  (link: /collections/storybook-classics)
├── Storybook Classics          /collections/storybook-classics
├── History & Mythology         /collections/history-and-mythology
└── Animals & Creatures         /collections/animals-and-creatures

Shop by Age  (link: /collections/little-kids-costumes)
├── Toddler (2-3T)              /collections/toddler-costumes
├── Little Kids (4-7)           /collections/little-kids-costumes
├── Big Kids (8-12)             /collections/big-kids-costumes
└── Family & Teacher Matching   /collections/family-matching

Size Guide                      /pages/size-guide
Need It By a Date?              /pages/costume-by-date
```

Two notes:

- **Top-level items must link somewhere**, not sit as dead dropdown headers. On
  mobile Horizon renders a parent as a tappable row, and a dead one is a dead end.
- **`Size Guide` and `Need It By a Date?` belong in the main nav**, not buried in the
  footer. They are the two objections that stop this exact purchase: *will it fit* and
  *will it arrive*. Putting them in the header is the single cheapest conversion win
  available.

### Footer menu

Currently only Privacy / Shipping / Refund. Rebuild as three groups:

```
Shop                    Help                        Company
Book Character Day      Size Guide                  About Us
School Plays            Costume by Date             Contact
Christmas Pageants      FAQ                         Terms of Service
Halloween               Shipping Policy             Privacy Policy
All Costumes            Return & Exchange Policy
```

Add social links once the accounts exist — the footer currently has none, which reads
as abandoned.

### Announcement bar

Currently `WELCOME TO IVORY CROWN COLLECTIVE!`, which is a wasted line. Rotate
something that carries information instead:

- `Free shipping on orders over $75`
- `Free return shipping on your first size exchange`
- Seasonally: `Order by [date] for Book Character Day delivery`

---

## 2. Homepage

### The problem being fixed

The live homepage has **two content sections**: one product list and one generic
section. It is an alphabetical product dump with no hero, no value proposition, no
seasonal push, and no social proof. Nothing tells a visitor what the store is for.

### Section order

Build in the theme editor, top to bottom:

**1. Hero** — one image of a child mid-performance, not a flat product shot.

> **Costumes built for the performance, not the party aisle**
> Storybook characters for school plays, pageants, and recitals. US kids sizing in
> inches, and free return shipping on your first size exchange.
>
> `[Shop by Occasion]` `[Find My Size]`

**2. Trust row** — four items, icons plus one line each. This sits directly under the
hero because the objections are immediate:

| | |
| --- | --- |
| Sized in inches | Measure once, order right |
| Free first exchange | We cover return shipping on size swaps |
| Made for the stage | Survives rehearsals, not just one photo |
| Honest dates | We flag orders that won't arrive in time |

**3. Shop by Occasion** — five collection tiles with images. This is the primary
navigation path and should be the first thing below the fold.

**4. Seasonal feature** — one wide banner, swapped through the year. It is currently
August, so this should be Halloween plus Book Character Day, then move to Christmas
pageants in October.

Rotation to follow:

| Months | Feature |
| --- | --- |
| Aug – Oct | Halloween + Book Character Day |
| Oct – Dec | Christmas & church pageants |
| Jan – Mar | Book Character Day, Read Across America (Mar 2) |
| Mar – Jun | Spring musicals, dance recitals |
| Jun – Aug | Drama camp, evergreen storybook |

**5. Shop by Age** — four tiles (2-3T, 4-7, 8-12, Family). Parents shop by their
child's age before anything else.

**6. Best sellers** — a product list, but set to **Best Selling**, not alphabetical.
Until there is order history, hand-pick the 8 products with the strongest galleries
(see `docs/shopify/image-worklist.json`).

**7. "Need it by a date?"** — a band linking `/pages/costume-by-date` with the current
order-by date spelled out. Deadline anxiety is the main reason this shopper abandons.

**8. Reviews** — Judge.me widget. Leave it out until there are at least 5 real
reviews; an empty review section is worse than none.

**9. Email capture** — already present, but the copy is generic ("Get exclusive deals
and early access"). Replace with something worth an address:

> **Get the costume calendar.** Order-by dates for Book Character Day, spring
> musicals, and Christmas pageants, sent before you need them.

---

## 3. Product page

Verified missing on the live PDP: review widget, size guide link, shipping estimate,
returns blurb, and stock indicator.

Add to the product template, in this order after the price:

1. **Size selector**, with a `Size guide` link opening `/pages/size-guide` in a drawer
2. **A single sizing line** directly under the selector — this is the highest-value
   text on the page:
   > Costume sizing runs small. Order by chest measurement, and size up if between
   > sizes. Free return shipping on your first exchange.
3. **Delivery estimate**: `Standard 8-18 business days · Expedited 4-10`, linking to
   `/pages/costume-by-date`
4. **Event date field** (order note) — "Performing on a specific date? Tell us and
   we'll flag your order."
5. **Reviews** once Judge.me is collecting
6. **You may also like** — already present, keep it

The rebuilt descriptions from `06-descriptions.mjs` already carry the size chart in
inches, the sizing guidance, the delivery note, and the safety block.

---

## 4. Search and filtering

The tags from `04-taxonomy.mjs` enable storefront filters. In
**Online Store → Navigation → Filters**, add:

- Size (`age:` tags)
- Occasion (`occasion:` tags)
- Character (`character:` tags)
- Theme (`theme:` tags)
- Price

Without filters, a 60-product collection is a scroll. With them, a parent narrows to
"size 6-7, school play" in two taps.

---

## 5. Before you remove the storefront password

Checklist. The store is currently password-protected, which is correct while this is
in progress.

- [ ] Phase 0 emergency fixes done ([00-emergency-fixes.md](00-emergency-fixes.md))
- [ ] `03-prune.mjs --apply` — no off-niche or liability products active
- [ ] `04-taxonomy.mjs --apply` — every product tagged and typed
- [ ] `05-titles.mjs --apply` — no title over 70 characters
- [ ] `06-descriptions.mjs --apply` — no supplier CDN references
- [ ] `09-alt-text.mjs --apply` — no empty alt text
- [ ] `11-collections.mjs --apply` — collections exist and are non-empty
- [ ] `12-pages.mjs --apply` — size guide, costume by date, FAQ, about all live
- [ ] Navigation rebuilt per this document
- [ ] Homepage sections built
- [ ] No product active with zero images
- [ ] `node scripts/shopify/verify.mjs` exits 0

Do not lift the password before the catalog work lands, or Google will index 118
products titled after their supplier.
