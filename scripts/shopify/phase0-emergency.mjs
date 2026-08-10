/**
 * Automates the Phase 0 items that have an Admin API path:
 * draft zero-image products, remove liability Color values, unpublish empty Men's Clothing.
 * Policies still need the Admin UI (or write_legal scope).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { REPO_ROOT } from "./lib/env.mjs";
import { graphql, mutate, fetchAllProducts } from "./lib/client.mjs";
import { PRODUCT_UPDATE, PRODUCT_OPTION_UPDATE, COLLECTION_UPDATE } from "./lib/mutations.mjs";
import { log, FLAGS } from "./lib/cli.mjs";

/** Rename (don't delete) when these are the only Color values — Shopify forbids emptying an option. */
const RENAME_COLOR_VALUES = new Map([
  ["black girl", "Black"],
  ["black boy's", "Black"],
  ["black boys", "Black"],
]);

async function draftZeroImageProducts(products) {
  const targets = products.filter((p) => p.status === "ACTIVE" && p.images.length === 0);
  log.step(`Draft ${targets.length} zero-image ACTIVE product(s)`);

  for (const product of targets) {
    log.warn(product.title);
    if (FLAGS.dryRun) continue;
    await mutate(
      PRODUCT_UPDATE,
      { product: { id: product.id, status: "DRAFT" } },
      "productUpdate",
    );
    log.ok(`drafted ${product.handle}`);
  }
}

async function removeBadColorValues(products) {
  log.step("Rename liability Color option values");

  for (const product of products) {
    const color = product.options?.find((o) => o.name.toLowerCase() === "color");
    if (!color) continue;

    const bad = (color.optionValues || []).filter((v) =>
      RENAME_COLOR_VALUES.has(v.name.trim().toLowerCase()),
    );
    if (!bad.length) continue;

    log.err(`${product.title}`);
    const updates = bad.map((v) => {
      const next = RENAME_COLOR_VALUES.get(v.name.trim().toLowerCase());
      log.detail(`"${v.name}" -> "${next}"`);
      return { id: v.id, name: next };
    });

    // If both bad values map to the same name, keep the first rename and delete the rest.
    const seen = new Set();
    const optionValuesToUpdate = [];
    const optionValuesToDelete = [];
    for (const u of updates) {
      const key = u.name.toLowerCase();
      if (seen.has(key)) optionValuesToDelete.push(u.id);
      else {
        seen.add(key);
        optionValuesToUpdate.push(u);
      }
    }

    if (FLAGS.dryRun) continue;

    await mutate(
      PRODUCT_OPTION_UPDATE,
      {
        productId: product.id,
        option: { id: color.id },
        optionValuesToUpdate,
        optionValuesToDelete: optionValuesToDelete.length ? optionValuesToDelete : undefined,
        variantStrategy: "MANAGE",
      },
      "productOptionUpdate",
    );
    log.ok(`cleaned ${product.handle}`);
  }
}

async function unpublishMensClothing() {
  log.step("Unpublish empty Men's Clothing collection");

  const data = await graphql(`
    query AllCollections($cursor: String) {
      collections(first: 50, after: $cursor) {
        edges {
          cursor
          node {
            id
            title
            handle
            productsCount { count }
          }
        }
        pageInfo { hasNextPage }
      }
    }
  `);

  const collection = data.collections.edges
    .map((e) => e.node)
    .find((c) => /men.?s\s+clothing/i.test(c.title) && !/retired/i.test(c.title));

  if (!collection) {
    log.info("No Men's Clothing collection found (already gone).");
    return;
  }

  log.warn(`${collection.title} (${collection.productsCount.count} products) — ${collection.handle}`);

  if (FLAGS.dryRun) return;

  // Soft-retire: rename handle/title so it falls out of navigation and SEO.
  await mutate(
    COLLECTION_UPDATE,
    {
      input: {
        id: collection.id,
        title: "Men's Clothing (retired)",
        handle: "mens-clothing-retired",
        seo: {
          title: "Retired",
          description: "This collection is no longer used.",
        },
      },
    },
    "collectionUpdate",
  );

  const pubs = await graphql(
    `
      query Pubs($id: ID!) {
        collection(id: $id) {
          resourcePublicationsV2(first: 20) {
            edges {
              node {
                isPublished
                publication { id name }
              }
            }
          }
        }
      }
    `,
    { id: collection.id },
  );

  const publicationIds = (pubs.collection?.resourcePublicationsV2?.edges || [])
    .filter((e) => e.node.isPublished)
    .map((e) => e.node.publication.id);

  if (publicationIds.length) {
    await mutate(
      `
        mutation Unpublish($id: ID!, $input: [PublicationInput!]!) {
          publishableUnpublish(id: $id, input: $input) {
            userErrors { field message }
          }
        }
      `,
      {
        id: collection.id,
        input: publicationIds.map((publicationId) => ({ publicationId })),
      },
      "publishableUnpublish",
    );
  }

  log.ok("Men's Clothing unpublished / retired");
}

async function tryUpdatePolicies() {
  log.step("Shop policies (best-effort)");

  const files = [
    ["TERMS_OF_SERVICE", "terms-of-service.md"],
    ["CONTACT_INFORMATION", "contact-information.md"],
    ["SHIPPING_POLICY", "shipping-policy.md"],
    ["REFUND_POLICY", "refund-policy.md"],
  ];

  for (const [type, file] of files) {
    const raw = readFileSync(resolve(REPO_ROOT, "docs/shopify/policies", file), "utf8");
    // Use content after the --- separator (paste-ready body), falling back to full file.
    const paste = raw.includes("\n---\n") ? raw.split("\n---\n").slice(1).join("\n---\n") : raw;
    const body = paste.replace(/^#[^\n]*\n+/, "").trim();

    const html = body
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .split(/\n{2,}/)
      .map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return "";
        if (trimmed.startsWith("<h2>") || trimmed.startsWith("<h3>")) return trimmed;
        if (trimmed.startsWith("|")) {
          // Keep markdown tables as preformatted text — good enough for policy paste.
          return `<pre>${trimmed}</pre>`;
        }
        return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
      })
      .filter(Boolean)
      .join("\n");

    if (FLAGS.dryRun) {
      log.info(`would upsert ${type} (${html.length} chars html)`);
      continue;
    }

    try {
      await mutate(
        `
          mutation PolicyUpdate($policy: ShopPolicyInput!) {
            shopPolicyUpdate(shopPolicy: $policy) {
              shopPolicy { type title url }
              userErrors { field message }
            }
          }
        `,
        { policy: { type, body: html } },
        "shopPolicyUpdate",
      );
      log.ok(`updated ${type}`);
    } catch (error) {
      log.warn(`${type}: ${error.message}`);
      log.detail("Paste manually from docs/shopify/policies/ if write_legal scope is missing.");
    }
  }
}

log.banner("Phase 0 — API emergency fixes", "Draft zero-image products, remove bad Color values, retire Men's Clothing");

const products = await fetchAllProducts();
await draftZeroImageProducts(products);
await removeBadColorValues(products);
await unpublishMensClothing();
await tryUpdatePolicies();

if (FLAGS.dryRun) {
  log.info("Re-run with --apply to commit Phase 0 API fixes.");
} else {
  log.ok("Phase 0 API fixes applied.");
}
