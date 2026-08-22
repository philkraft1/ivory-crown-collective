# Ivory Crown Collective

Marketing/landing website for Ivory Crown Collective LLC. See `README.md` for the project overview and stack (Next.js App Router + TypeScript + Tailwind CSS v4).

## Cursor Cloud specific instructions

This is a single-service, static Next.js site — there is no backend, database, or external service to run. Dependencies are installed via the startup update script (`npm ci`), so a fresh Cloud VM is ready to go.

- Standard commands live in `package.json` scripts: `npm run dev` (dev server on port 3000), `npm run lint`, `npm run build`, `npm run start` (serves a production build).
- Package manager is npm (the repo has `package-lock.json`; do not switch to pnpm/yarn).
- The dev server uses Turbopack and binds to `http://localhost:3000`. Verify it's up with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` (expect `200`).
- The homepage is fully static (`Route (app) ○ /` is prerendered), so `npm run build` output has no dynamic routes — this is expected, not a misconfiguration.
- The "Get in touch" button is a `mailto:` link, so clicking it opens the OS mail-handler dialog rather than navigating in-browser.

### Costume Shopify store (separate)

The costume store (`1wtpc0-c2.myshopify.com`) is **not** part of this Next.js app. Ops docs live in `store-ops/` only.

- Cloud VMs usually cannot pass Cloudflare on `admin.shopify.com`. Domain primary + password unlock must be done by a human in Admin (see `store-ops/UNLOCK.md`).
- After unlock, set `SHOPIFY_ADMIN_TOKEN` and run `node store-ops/scripts/apply-taxonomy.mjs`, then apply `store-ops/UX.md` in the theme editor.
- Verify with `store-ops/scripts/verify-storefront.sh` (must not 301 to `ivorycrowncollective.com`).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
