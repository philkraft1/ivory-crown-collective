import assert from "node:assert/strict";
import test from "node:test";
import {
  APPLY_CONFIRMATION,
  executionMode,
  getConfig,
} from "../lib/config.mjs";

test("migration commands default to dry-run", () => {
  assert.deepEqual(executionMode([]), { apply: false, label: "DRY RUN" });
});

test("apply mode requires the exact confirmation phrase", () => {
  assert.throws(
    () => executionMode(["--apply"]),
    /Applying changes requires/u,
  );
  assert.deepEqual(
    executionMode(["--apply", `--confirm=${APPLY_CONFIRMATION}`]),
    { apply: true, label: "APPLY" },
  );
});

test("store configuration normalizes the myshopify hostname", () => {
  const previousDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const previousVersion = process.env.SHOPIFY_API_VERSION;
  process.env.SHOPIFY_STORE_DOMAIN =
    "https://1wtpc0-c2.myshopify.com/admin";
  process.env.SHOPIFY_API_VERSION = "2026-07";

  const config = getConfig({ requireToken: false });
  assert.equal(config.storeDomain, "1wtpc0-c2.myshopify.com");
  assert.equal(
    config.endpoint,
    "https://1wtpc0-c2.myshopify.com/admin/api/2026-07/graphql.json",
  );

  if (previousDomain === undefined) delete process.env.SHOPIFY_STORE_DOMAIN;
  else process.env.SHOPIFY_STORE_DOMAIN = previousDomain;
  if (previousVersion === undefined) delete process.env.SHOPIFY_API_VERSION;
  else process.env.SHOPIFY_API_VERSION = previousVersion;
});
