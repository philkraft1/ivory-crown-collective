# Ivory Crown Collective

Main website for **Ivory Crown Collective LLC** — web design, software & apps, and IT solutions.

- **Live:** https://ivorycrowncollective.com
- **Secrets** (Stripe, Resend, Upstash, Turnstile) live in Vercel environment variables, never in git.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Brand notes

- Logo: `public/brand/logo.png`
- Visual system lives in `src/app/globals.css` (ink / pearl / gold tokens).
- Homepage pillars: **Web Design**, **Software & Apps**, and **IT Solutions**.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- Stripe Checkout, Resend, Upstash, Cloudflare Turnstile

See [`docs/security.md`](docs/security.md) for production environment setup.
