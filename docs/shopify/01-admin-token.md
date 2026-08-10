# Creating the Admin API token

About five minutes. You'll create a private app that exists only in your store — this is
not a public app, there's no review process, and nobody else can install it.

---

## 1. Open the app developer area

Go to your Shopify admin, then:

**Settings** (bottom left) **→ Apps and sales channels → Develop apps**

Direct link: [admin.shopify.com/store/1wtpc0-c2/settings/apps/development](https://admin.shopify.com/store/1wtpc0-c2/settings/apps/development)

If you see a button saying **Allow custom app development**, click it and confirm. Shopify
shows a warning about custom apps having access to store data — that's expected, and it's
your own app.

## 2. Create the app

Click **Create an app**.

- **App name:** `ICC Catalog Tools`
- **App developer:** leave as your own account

Click **Create app**.

## 3. Grant the API scopes

This is the step that matters. Click **Configure Admin API scopes**.

There's a long checkbox list. Use the search box at the top and tick exactly these ten:

| Scope | Needed for |
| --- | --- |
| `read_products` | Reading the catalog — every script needs this |
| `write_products` | Titles, descriptions, vendor, tags, type, status, prices, options |
| `read_files` | Reading image records |
| `write_files` | Image alt text (`09-alt-text.mjs`) |
| `read_content` | Reading pages, blogs, collections |
| `write_content` | Pages, blog articles, collections (`11`, `12`, `13`) |
| `read_publications` | Checking sales channel availability |
| `write_publications` | Publishing collections to the online store |
| `read_themes` | Reading theme settings |
| `write_themes` | Reserved for theme work; safe to include |

Do **not** grant customer, order, or payment scopes. These scripts never touch those, and
a token that can't read customer data can't leak it.

Click **Save**.

## 4. Install the app and reveal the token

Go to the **API credentials** tab and click **Install app**, then confirm.

Under **Admin API access token**, click **Reveal token once**.

**Shopify shows this exactly once.** Copy it immediately. It starts with `shpat_`. If you
navigate away before copying, you'll need to uninstall and reinstall the app to get a new
one.

## 5. Put it in .env.local

Open `.env.local` in the repo root — it already exists with your Stripe keys — and add
two lines:

```
SHOPIFY_ADMIN_TOKEN=shpat_paste_your_token_here
SHOPIFY_STORE_DOMAIN=1wtpc0-c2.myshopify.com
```

`.env*` is already in `.gitignore`, so this will not be committed. Do not paste the token
into a chat, an issue, or a commit message. If it ever leaks, uninstall the app in the
admin — that revokes the token instantly.

## 6. Confirm it works

```bash
node scripts/shopify/01-audit-export.mjs
```

This is read-only. It should print your shop name, product counts, the catalog health
numbers, and the niche classification, then write `docs/shopify/snapshot.json`.

**Keep that snapshot.** It's what `restore.mjs` rolls back to.

---

## If something goes wrong

**`Shopify rejected the token (HTTP 401)`** — the token was copied incompletely, or the
app isn't installed. Re-check step 4.

**`Shopify rejected the token (HTTP 403)`** — the token is valid but missing a scope.
Return to **Configure Admin API scopes**, add the missing one, save, and note that
existing tokens pick up new scopes without needing reinstallation.

**`Admin API returned 404 for version "2025-10"`** — Shopify retired that version. Add
a newer one to `.env.local`:

```
SHOPIFY_API_VERSION=2026-04
```

**`Missing SHOPIFY_ADMIN_TOKEN`** — the file isn't being read. Confirm it's named exactly
`.env.local` in the repo root, that the line has no spaces around the `=`, and that you're
running the command from the repo root.

---

## Then what

Once `01-audit-export.mjs` runs clean, work through
[scripts/shopify/README.md](../../scripts/shopify/README.md) in order. Everything is
dry-run by default, so run each script bare first and read the output before adding
`--apply`.

The cautious first live run:

```bash
node scripts/shopify/05-titles.mjs                    # read the full plan
node scripts/shopify/05-titles.mjs --apply --limit=3  # commit 3, check them in the admin
node scripts/shopify/05-titles.mjs --apply            # then the rest
```
