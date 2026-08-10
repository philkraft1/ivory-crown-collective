# Ivory Crown Collective

Main website for **Ivory Crown Collective LLC** — a 50/50 studio for web/software design and DJ gigs.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Shopify retail arm

The children's storybook and stage-costume retail arm is being prepared on
Shopify. Start with the audit and migration runbook in
[`docs/shopify/README.md`](docs/shopify/README.md).

```bash
cp .env.example .env.local
npm run shopify:audit
```

Catalog scripts are dry-run by default. Never commit `.env.local` or the
generated `shopify-data/` snapshots.

### Live product preview on the site

The landing page renders a 4-product preview feed and a "Check out my Shopify
store" link. It reads from the Shopify Storefront API and tailors the feed to
the referring ad campaign via `?utm_campaign=` / `?utm_content=` / `?collection=`
query params. Set `SHOPIFY_STOREFRONT_TOKEN` (read-only Storefront API token) to
show live catalog items; without it the site renders branded placeholder
products so the layout stays intact.

## Brand notes

- Temporary mark: `public/brand/mark.svg` — replace with your logo when ready (e.g. `public/brand/logo.png`) and update `SiteHeader`.
- Visual system lives in `src/app/globals.css` (ink / pearl / brass tokens).
- Homepage treats **Design** and **DJ** as co-equal pillars (nav, hero CTAs, split sections, contact interest options).

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
