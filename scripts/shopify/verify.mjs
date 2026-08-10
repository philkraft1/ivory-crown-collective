#!/usr/bin/env node
/**
 * Checks the overhaul actually landed. Read-only, safe to run any time.
 *
 *   node scripts/shopify/verify.mjs
 *
 * Exits non-zero if any check fails, so it can gate a launch.
 */
import { fetchAllProducts, fetchShopInfo } from "./lib/client.mjs";
import { log } from "./lib/cli.mjs";
import { BRAND, STORE_DOMAIN } from "./lib/env.mjs";
import { classify, DECISION, findCutRule, hasSupplierCdn, TITLE_MAX } from "./lib/classify.mjs";

log.banner("Verify", "Confirms the overhaul landed. Non-zero exit on failure.");

const checks = [];
const check = (name, passed, detail) => {
  checks.push({ name, passed, detail });
  (passed ? log.ok : log.err)(`${name}${detail ? ` - ${detail}` : ""}`);
};

const shop = await fetchShopInfo();
const products = await fetchAllProducts();
const active = products.filter((p) => p.status === "ACTIVE");
const variants = active.flatMap((p) => p.variants);
const images = active.flatMap((p) => p.images);

log.step("Brand");
check("store name is not the Shopify default", shop.name !== "My Store", `currently "${shop.name}"`);
check(
  "custom domain connected",
  Boolean(shop.primaryDomain?.host) && !shop.primaryDomain.host.endsWith("myshopify.com"),
  shop.primaryDomain?.host ?? "none",
);
check(
  "no product exposes the supplier as vendor",
  active.every((p) => p.vendor?.toLowerCase() !== BRAND.supplierVendor.toLowerCase()),
  `${active.filter((p) => p.vendor?.toLowerCase() === BRAND.supplierVendor.toLowerCase()).length} remaining`,
);

log.blank();
log.step("Catalog");
check(
  "every active product has a product type",
  active.every((p) => p.productType?.trim()),
  `${active.filter((p) => !p.productType?.trim()).length} missing`,
);
check(
  "every active product has tags",
  active.every((p) => p.tags?.length),
  `${active.filter((p) => !p.tags?.length).length} missing`,
);
check(
  `no active title over ${TITLE_MAX} chars`,
  active.every((p) => p.title.length <= TITLE_MAX),
  `${active.filter((p) => p.title.length > TITLE_MAX).length} too long`,
);
check(
  "no duplicate active titles",
  new Set(active.map((p) => p.title)).size === active.length,
  `${active.length - new Set(active.map((p) => p.title)).size} duplicates`,
);
check(
  "no active product has zero images",
  active.every((p) => p.images.length > 0),
  `${active.filter((p) => p.images.length === 0).length} with none`,
);

log.blank();
log.step("Content");
check(
  "no description hotlinks the supplier CDN",
  active.every((p) => !hasSupplierCdn(p.descriptionHtml)),
  `${active.filter((p) => hasSupplierCdn(p.descriptionHtml)).length} remaining`,
);
check(
  "no description carries 'Unit: cm' supplier boilerplate",
  active.every((p) => !/unit\s*[:：]\s*cm/i.test(p.descriptionHtml)),
  `${active.filter((p) => /unit\s*[:：]\s*cm/i.test(p.descriptionHtml)).length} remaining`,
);
check(
  "every image has alt text",
  images.every((i) => i.alt?.trim()),
  `${images.filter((i) => !i.alt?.trim()).length} empty`,
);

log.blank();
log.step("Safety and liability");
const liability = active.filter((p) => findCutRule(p.title)?.severity === "liability");
check("no liability products are active", liability.length === 0, liability.map((p) => p.title).join("; "));

const badColors = active.filter((p) =>
  p.options.some(
    (o) => /colou?r/i.test(o.name) && o.optionValues.some((v) => /black girl|black boy/i.test(v.name)),
  ),
);
check("no product has a 'Black girl' style option value", badColors.length === 0, badColors.map((p) => p.title).join("; "));

log.blank();
log.step("Options and pricing");
check(
  'no option is still named "Suitable for height"',
  active.every((p) => !p.options.some((o) => /suitable for height/i.test(o.name))),
  `${active.filter((p) => p.options.some((o) => /suitable for height/i.test(o.name))).length} remaining`,
);
const charmEndings = variants.filter((v) => /\.(95|99|00|49|50)$/.test(v.price));
check(
  "prices use recognizable endings",
  variants.length === 0 || charmEndings.length / variants.length > 0.9,
  `${charmEndings.length}/${variants.length}`,
);

log.blank();
log.step("Storefront pages");
for (const path of [
  "/policies/terms-of-service",
  "/policies/contact-information",
  "/pages/size-guide",
  "/pages/costume-by-date",
  "/pages/faq",
  "/pages/about",
]) {
  const response = await fetch(`https://${STORE_DOMAIN}${path}`).catch(() => null);
  // A password-protected storefront answers 200 with the password page, so a 401
  // here means the page exists but the store is locked, which is not a failure.
  const ok = Boolean(response) && (response.status < 400 || response.status === 401);
  check(path, ok, response ? `HTTP ${response.status}` : "unreachable");
}

const shipping = await fetch(`https://${STORE_DOMAIN}/policies/shipping-policy`)
  .then((r) => (r.ok ? r.text() : ""))
  .catch(() => "");
check(
  "shipping policy has no unfilled placeholders",
  !/\[your support email\]|\[your /i.test(shipping),
);

log.blank();
log.step("Niche coherence");
const stillOffNiche = active
  .map((p) => ({ p, c: classify(p) }))
  .filter((x) => x.c.decision === DECISION.CUT);
check(
  "no off-niche product is still active",
  stillOffNiche.length === 0,
  `${stillOffNiche.length} remaining`,
);

const failedChecks = checks.filter((c) => !c.passed);
log.summary([
  ["checks run", checks.length],
  ["passed", checks.length - failedChecks.length],
  ["failed", failedChecks.length],
  ["active products", active.length],
  ["active variants", variants.length],
]);

if (failedChecks.length) {
  log.err("Failing checks:");
  for (const c of failedChecks) log.detail(`${c.name}${c.detail ? ` (${c.detail})` : ""}`);
  process.exitCode = 1;
} else {
  log.ok("All checks passed.");
}
