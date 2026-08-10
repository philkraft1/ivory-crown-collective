# Store architecture and merchandising

## Positioning

Use this one-sentence promise throughout the store:

> Character-ready costumes for school plays, book days, recitals, pageants,
> and Halloween.

Primary buyer: a parent, teacher, drama leader, dance instructor, or church
program organizer who needs the right character, a usable size chart, and a
realistic arrival expectation.

## Product decision rule

Keep products that fit at least one of these:

- Children's or family costume.
- Recognizable storybook, historical, mythology, animal, or stage character.
- School play, book character day, recital, church/Christmas pageant, or
  Halloween use.
- Family/teacher matching set with a clear relationship to the children's
  range.

Archive:

- All unrelated adult fashion, including the beach bag.
- Adult-only nightclub, sexy, or generic party costumes.
- Duplicates.
- Products with no images.
- Any product whose contents, sizing, safety, or delivery cannot be verified.

The scripted default is intentionally narrow: kids/family stays; off-niche
fashion and adult-only costumes are archived. Dry-run report
`03-prune-*.json` lists every decision before it is applied.

## Automated collections

After step 04 applies structured tags, create the following automated
collections under **Products > Collections**. Use “Product tag is equal to”
the tag shown.

| Navigation label | Collection title | Tag |
| --- | --- | --- |
| School Plays | School Play & Drama Costumes | `occasion:school-play` |
| Book Character Day | Book Character Day Costumes | `occasion:book-character-day` |
| Christmas & Church | Christmas & Church Pageant Costumes | `occasion:christmas-pageant` |
| Dance & Recital | Dance & Recital Costumes | `occasion:recital` |
| Halloween | Kids' Halloween Costumes | `occasion:halloween` |
| Storybook | Storybook Character Costumes | `theme:storybook` |
| Mythology | Greek & Mythology Costumes | `theme:mythology` |
| Historical | Historical Character Costumes | `theme:historical` |
| Animals | Animal Character Costumes | `theme:animals` |
| Ages 2–4 | Costumes for Ages 2–4 | `age:2-4` |
| Ages 4–7 | Costumes for Ages 4–7 | `age:4-7` |
| Ages 8–12 | Costumes for Ages 8–12 | `age:8-12` |
| Family | Family & Teacher Matching Costumes | `audience:family-matching` |

Before publishing a collection, require at least four products and a collection
image with descriptive alt text. Do not publish empty placeholders.

## Header navigation

Replace `Home / Catalog / Contact / Search` with:

```text
Shop by Occasion
  School Plays
  Book Character Day
  Christmas & Church
  Dance & Recital
  Halloween

Shop by Character
  Storybook
  Historical
  Greek & Mythology
  Animals & Creatures

Shop by Age
  Ages 2–4
  Ages 4–7
  Ages 8–12
  Family & Teacher Matching

Size Guide
FAQ
Contact
```

Keep Search, Account, and Cart as icons. On mobile, make Size Guide and Contact
top-level links rather than hiding them under another submenu.

## Horizon homepage

Build sections in this order:

1. **Announcement bar**
   - `School play coming up? Order early for time to try on.`
2. **Hero**
   - Eyebrow: `Ivory Crown Collective Kids`
   - Heading: `Every child deserves to look ready for the role.`
   - Copy: `Storybook, stage, recital, pageant, and Halloween costumes with
     sizing parents can actually use.`
   - Primary CTA: `Shop school-play costumes`
   - Secondary CTA: `Find a character`
3. **Shop by occasion**
   - Four visual tiles: School Plays, Book Character Day, Christmas Pageants,
     Halloween.
4. **Featured characters**
   - Tin Man, Alice in Wonderland, Little Match Girl, Detective, Scarecrow,
     and Greek Mythology, but only when each destination has inventory.
5. **Shop by age**
   - Ages 2–4, 4–7, 8–12. Link each to its automated collection.
6. **Delivery-date block**
   - Heading: `Need it for a specific date?`
   - Copy: `Check the delivery estimate before ordering and leave time for a
     try-on. Contact us before ordering if your event is close.`
   - CTA: `Read the costume-by-date guide`
7. **Trust row**
   - `Clear size charts`
   - `30-day returns after delivery`
   - `Order tracking`
   - `Real customer support`
8. **Reviews**
   - Hide this section until genuine reviews exist. Never seed fabricated
     testimonials.
9. **Email capture**
   - Heading: `The next role is coming.`
   - Copy: `Get seasonal costume checklists, character ideas, and new arrivals.`

## Product template

In **Online Store > Themes > Customize > Products > Default product**, add:

- Review stars below title (only genuine verified reviews).
- A `Size guide` pop-up immediately next to the size selector.
- Three concise trust rows below Add to Cart:
  - `Tracked US delivery`
  - `30-day returns after delivery`
  - `Questions? phil@ivorycrowncollective.com`
- A delivery-expectation block above the description.
- Collapsible rows: `What's included`, `Size & fit`, `Shipping`, `Returns`.
- Related products from the same character/occasion collection.

Do not use fake scarcity (“Only 2 left”) unless Shopify inventory is real and
supplier-synchronized.

## Required pages

### About

> Ivory Crown Collective helps creative work meet the moment. Our children's
> costume collection is curated for school stages, book character days,
> recitals, pageants, and celebrations. We focus on recognizable roles, useful
> sizing, and straightforward support so families and program leaders can spend
> less time searching and more time getting ready.

### Size guide

Explain how to measure height, chest, waist, and garment length. State:

> Supplier size labels vary. Always use the measurements on the individual
> product page. Age is a guide, not a guarantee. If a child falls between
> sizes, choose the larger size for movement and layering.

Include both inches and centimeters. Do not publish one universal size chart
for every supplier garment.

### Costume by date

> Add processing time and the full delivery estimate, then leave at least
> seven extra days for a try-on. If the event is closer than the latest
> estimated arrival date, do not rely on standard shipping.

### FAQ

Cover what is included, how to choose a size, US-only shipping, tracking,
delivery estimates, event-date orders, returns, damaged/wrong items, care, and
how to contact support.
