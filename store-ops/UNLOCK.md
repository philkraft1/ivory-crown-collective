# Unlock storefront (hard blocker)

## Status (API check)

| Check | Status |
|-------|--------|
| Storefront password | **Off** |
| Primary domain | **`www.ivorycrowncollective.store`** |
| Reachable storefront | **Yes** — `https://www.ivorycrowncollective.store` (myshopify redirects here) |
| Agency apex | Still on Vercel (`ivorycrowncollective.com`) — separate from the shop |

## Symptom (confirmed)

`https://1wtpc0-c2.myshopify.com` returns **301** → `https://ivorycrowncollective.com/` with header:

`x-redirect-reason: primary_domain_redirection`

Shoppers never see costumes. The agency Next.js site must stay on the apex; the **costume store** needs its own primary domain.

## Why automation cannot finish this step

- Changing Shopify **primary domain** is Admin UI only (no Admin GraphQL mutation).
- Cloud agent browsers hit Cloudflare on `admin.shopify.com` / `accounts.shopify.com` and cannot complete login or device auth.
- Do this once from your laptop (Opera/Chrome where you are already logged in).

## Steps (do in order)

### 1. Demote apex (exact clicks)

1. Open [Settings → Domains](https://admin.shopify.com/store/1wtpc0-c2/settings/domains)
2. Click **`ivorycrowncollective.com`** (current primary)
3. Choose **Change domain type** / **Set as redirect** (demote) — Shopify will make `1wtpc0-c2.myshopify.com` primary automatically
4. Optionally disconnect **`ivorycrowncollective.com`** and **`www.ivorycrowncollective.com`** from this store entirely (apex must stay on Vercel for the agency site)
5. Prefer keeping **`ivorycrowncollective.store`** (or later `shop.ivorycrowncollective.com`) as the customer-facing costume domain once primary is fixed

There is **no Admin API mutation** for primary domain — this step is UI-only.

### 2. Custom shop subdomain (when ready)

At GoDaddy (authoritative NS: `ns35`/`ns36.domaincontrol.com`):

- Add `CNAME shop` → `shops.myshopify.com` (or the target Shopify shows in Domains)
- In Shopify Domains, connect `shop.ivorycrowncollective.com`, verify, then optionally make **it** primary later

Do **not** point apex `ivorycrowncollective.com` at Shopify.

### 3. Turn off storefront password

1. Open [Online Store → Preferences](https://admin.shopify.com/store/1wtpc0-c2/online_store/preferences)
2. Under **Password protection**, disable “Restrict access to visitors with the password”
3. Save

### 4. Verify

From any machine:

```bash
./scripts/verify-storefront.sh
```

Expect:

- `https://1wtpc0-c2.myshopify.com` → **200** (or password page only if you left password on)
- **No** `primary_domain_redirection` to `ivorycrowncollective.com`
- Response body is the Horizon storefront, not the agency landing page

### 5. Optional Admin API token (for taxonomy script)

1. Shopify Admin → Settings → Apps and sales channels → Develop apps
2. Create app → enable Admin API scopes: `read_products`, `write_products`, `write_content`, `write_online_store_navigation`, `read_themes`, `write_themes`
3. Install → copy Admin API access token
4. Export as `SHOPIFY_ADMIN_TOKEN` and run `node scripts/apply-taxonomy.mjs`

Paste the token into the next agent chat if you want collections/nav applied automatically.
