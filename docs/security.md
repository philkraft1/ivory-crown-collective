# Security hardening

Ivory Crown Collective’s public site uses multiple defense layers. This note
covers the production secrets and checks you need after deploy.

## Required production environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for Stripe redirects + CSRF Origin allowlist. **Required in prod.** Set to `https://ivorycrowncollective.com`. |
| `STRIPE_SECRET_KEY` | Server-side Checkout (redirect mode — no publishable key needed) |
| `STRIPE_WEBHOOK_SECRET` | Verifies `/api/stripe/webhook` (`checkout.session.completed`) |
| `CONTACT_TO_EMAIL` | Inbox for contact form deliveries |
| `RESEND_API_KEY` | Contact delivery (FormSubmit is disabled in production) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limits on contact + checkout |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile on **contact and checkout** |

Set these in **Vercel → Project → Settings → Environment Variables → Production**, then redeploy. Missing Upstash, Turnstile, Resend, or site URL in production causes the affected API to **fail closed** (HTTP 503 / 403), not open.

Stripe Dashboard webhook URL: `https://ivorycrowncollective.com/api/stripe/webhook` (event: `checkout.session.completed`).

## Layers

1. **Browser headers** — CSP (+ Report-Only twin), CSP reporting to `/api/csp-report`, prod-only HSTS preload, COOP/CORP, locked-down Permissions-Policy (`next.config.ts`)
2. **Proxy** (`src/proxy.ts`, Next 16) — Origin/Referer allowlist + Upstash sliding-window limits on `POST /api/contact` and `POST /api/checkout`
3. **Zod validation** — length caps, interest allowlist, offering ID enum, header-injection stripping
4. **Turnstile** — bot check on contact **and** checkout (skipped in local dev when keys are absent)
5. **Stripe integrity** — pinned success/cancel URLs, webhook signature verify, success page retrieves the session before claiming payment, Checkout idempotency keys (offering + IP + 2-minute bucket)

## Setup recipes

### Upstash

1. Create a free Redis database at [upstash.com](https://upstash.com)
2. Copy REST URL + token into `.env.local` / Vercel env

Limits (per IP):

- Contact: **3** requests / 10 minutes
- Checkout: **5** requests / 10 minutes

### Cloudflare Turnstile

1. Add a widget at [dash.cloudflare.com → Turnstile](https://dash.cloudflare.com)
2. Set hostnames for `ivorycrowncollective.com` (and localhost for testing)
3. Put site key + secret in env — used by both contact and pay sections

### Stripe webhook

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

In the Dashboard, point a live endpoint at
`https://ivorycrowncollective.com/api/stripe/webhook` and subscribe to
`checkout.session.completed`. Store the signing secret as `STRIPE_WEBHOOK_SECRET`.

### CSP reports

Browsers POST violations to `/api/csp-report`. Reports are logged (redacted) and
discarded — nothing sensitive is stored. A `Content-Security-Policy-Report-Only`
header mirrors the enforcing policy for visibility.

## Manual smoke checks

- Cross-origin `POST /api/contact` → 403
- Burst contact requests → 429 with `Retry-After`
- Checkout / contact without Turnstile in prod → 403
- Fake `/pay/success?session_id=cs_test_fake` → does **not** show “Payment received”
- Webhook with bad signature → 400
- Homepage has no construction banner
