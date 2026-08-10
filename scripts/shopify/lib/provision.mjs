import { executionMode, getConfig } from "./config.mjs";
import {
  createCollection,
  createPage,
  fetchCollections,
  fetchPages,
  fetchStoreIdentity,
  timestamp,
  writeJson,
} from "./shopify.mjs";
import {
  COLLECTION_BLUEPRINTS,
  PAGE_BLUEPRINTS,
} from "./storefront-content.mjs";

function escapeHtml(value) {
  return String(value)
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&#39;");
}

export function planCollections(existingCollections, blueprints) {
  const byHandle = new Map(
    existingCollections.map((collection) => [collection.handle, collection]),
  );

  return blueprints.reduce(
    (plan, blueprint) => {
      const existing = byHandle.get(blueprint.handle);
      if (existing) {
        plan.existing.push({
          id: existing.id,
          handle: existing.handle,
          title: existing.title,
          expectedTitle: blueprint.title,
          action: "No automatic overwrite; review existing collection manually.",
        });
        return plan;
      }

      plan.toCreate.push({
        title: blueprint.title,
        handle: blueprint.handle,
        descriptionHtml: `<p>${escapeHtml(blueprint.description)}</p>`,
        sortOrder: "BEST_SELLING",
        seo: {
          title: `${blueprint.title} | Ivory Crown Collective`,
          description: blueprint.description,
        },
        sources: [
          {
            source: {
              title: `${blueprint.title} products`,
              targetType: "PRODUCTS",
              inclusion: {
                matchType: "ALL",
                conditions: [
                  {
                    productTag: {
                      relation: "TAGGED_WITH",
                      values: [blueprint.tag],
                      matchType: "ANY",
                    },
                  },
                ],
              },
            },
          },
        ],
      });
      return plan;
    },
    { toCreate: [], existing: [] },
  );
}

export function planPages(existingPages, blueprints) {
  const byHandle = new Map(existingPages.map((page) => [page.handle, page]));

  return blueprints.reduce(
    (plan, blueprint) => {
      const existing = byHandle.get(blueprint.handle);
      if (existing) {
        plan.existing.push({
          id: existing.id,
          handle: existing.handle,
          title: existing.title,
          published: existing.isPublished,
          action: "No automatic overwrite; preserve merchant-edited page.",
        });
        return plan;
      }

      plan.toCreate.push({
        title: blueprint.title,
        handle: blueprint.handle,
        body: blueprint.body,
        isPublished: false,
      });
      return plan;
    },
    { toCreate: [], existing: [] },
  );
}

async function verifiedShop() {
  const config = getConfig();
  const shop = await fetchStoreIdentity();
  if (shop.myshopifyDomain !== config.storeDomain) {
    throw new Error(
      `Store identity mismatch: expected ${config.storeDomain}, received ${shop.myshopifyDomain}.`,
    );
  }
  return shop;
}

async function report(name, mode, shop, plan) {
  const path = await writeJson(`${name}-${timestamp()}.json`, {
    generatedAt: new Date().toISOString(),
    mode: mode.label,
    shop: {
      id: shop.id,
      name: shop.name,
      myshopifyDomain: shop.myshopifyDomain,
      primaryDomain: shop.primaryDomain,
    },
    ...plan,
  });
  console.log(`${mode.label}: wrote ${path}`);
}

async function provisionCollections(mode) {
  const [shop, existingCollections] = await Promise.all([
    verifiedShop(),
    fetchCollections(),
  ]);
  const plan = planCollections(existingCollections, COLLECTION_BLUEPRINTS);
  await report("11-collections", mode, shop, {
    ...plan,
    publication:
      "New collections remain unpublished for merchant review. Publish only collections with at least four verified products and an image.",
  });
  if (!mode.apply) return;

  for (const collection of plan.toCreate) {
    await createCollection(collection);
  }
  console.log(
    `APPLY: created ${plan.toCreate.length} unpublished automated collections.`,
  );
}

async function provisionPages(mode) {
  const [shop, existingPages] = await Promise.all([
    verifiedShop(),
    fetchPages(),
  ]);
  const plan = planPages(existingPages, PAGE_BLUEPRINTS);
  await report("12-pages", mode, shop, {
    ...plan,
    publication:
      "New pages are drafts. Review content, policies, links, and theme rendering before publishing.",
  });
  if (!mode.apply) return;

  for (const page of plan.toCreate) {
    await createPage(page);
  }
  console.log(`APPLY: created ${plan.toCreate.length} unpublished pages.`);
}

const PROVISIONERS = {
  collections: provisionCollections,
  pages: provisionPages,
};

export async function mainProvision(kind) {
  try {
    const mode = executionMode();
    console.log(`${mode.label}: provision ${kind}`);
    await PROVISIONERS[kind](mode);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
