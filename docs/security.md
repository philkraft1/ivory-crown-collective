# Security hardening

Ivory Crown Collective’s public site uses multiple defense layers. This note
covers the production secrets and checks you need after deploy.

## Required production environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for Stripe redirects + CSRF Origin allowlist. **Required in prod.** |
| `STRIPE_SECRET_KEY` | Server-side Checkout |
| `STRIPE_WEBHOOK_SECRET` | Verifies `/api/stripe/webhook` |
| `RESEND_API_KEY` | Contact delivery (FormSubmit is disabled in production) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limits on contact + checkout |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile on the contact form |

Missing Upstash, Turnstile, Resend, or site URL in production causes the
affected API to **fail closed** (HTTP 503 / 403), not open.

## Layers

1. **Browser headers** — CSP, HSTS preload, COOP/CORP, locked-down Permissions-Policy (`next.config.ts`)
2. **Middleware** — Origin/Referer allowlist + Upstash sliding-window limits on `POST /api/contact` and `POST /api/checkout`
3. **Zod validation** — length caps, interest allowlist, offering ID enum, header-injection stripping
4. **Turnstile** — bot check on contact (skipped in local dev when keys are absent)
5. **Stripe integrity** — pinned success/cancel URLs, webhook signature verify, success page retrieves the session before claiming payment
6. **Shopify sanitization** — collection handles must match `^[a-z0-9][a-z0-9-]{0,100}$`; product links must be `https` on allowlisted shop hosts

## Setup recipes

### Upstash

1. Create a free Redis database at [upstash.com](https://upstash.com)
2. Copy REST URL + token into `.env.local` / Vercel env

Limits (per IP):

- Contact: 5 requests / 10 minutes
- Checkout: 10 requests / 10 minutes

### Cloudflare Turnstile

1. Add a widget at [dash.cloudflare.com → Turnstile](https://dash.cloudflare.com)
2. Set hostnames for `ivorycrowncollective.com` (and localhost for testing)
3. Put site key + secret in env

### Stripe webhook

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

In the Dashboard, point a live endpoint at
`https://ivorycrowncollective.com/api/stripe/webhook` and subscribe to
`checkout.session.completed`. Store the signing secret as `STRIPE_WEBHOOK_SECRET`.

## Manual smoke checks

- Cross-origin `POST /api/contact` → 403
- Burst contact requests → 429 with `Retry-After`
- Fake `/pay/success?session_id=cs_test_fake` → does **not** show “Payment received”
- Webhook with bad signature → 400
- `?collection=../../evil` → ignored; preview falls back to featured/mock
