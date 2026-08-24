#!/usr/bin/env node
/**
 * Expand Women/Men catalogs from owned assets:
 * - Restore quality archived women's apparel
 * - Duplicate unisex/basic tees into Men apparel with new titles/tags
 * - Tag merch:best-seller / merch:new / merch:under-40 on curated sets
 */
import process from "node:process";

const SHOP = process.env.SHOPIFY_SHOP || "1wtpc0-c2.myshopify.com";
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

if (!TOKEN) {
  console.error("Set SHOPIFY_ADMIN_TOKEN");
  process.exit(1);
}

async function gql(query, variables = {}) {
  const res = await fetch(
    `https://${SHOP}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  const json = await res.json();
  if (json.errors) {
    console.error(JSON.stringify(json.errors, null, 2));
    throw new Error("GraphQL failed");
  }
  return json.data;
}

const RESTORE_HANDLES = [
  // Quality women's apparel previously archived — restore into Women
];

const RESTORE_TITLE_RE =
  /t-shirt|tee|blouse|cardigan|dress|romper|skirt|jumpsuit|set for women|women'?s|ladies|wrap bodice|ruffle blouse|sari wrap|lounge|bath.?robe|caftan|sun shirt|jeans|underwear|brief/i;

const SKIP_RESTORE_RE =
  /\b(halloween|costume|cosplay|indigenous|native|chief|blood|zombie|pirate|fairy|bunny girl|x-men|storm cosplay|biohazard|easter|warrior)\b/i;

const MEN_SEED = [
  {
    sourceHandle: "essential-tee",
    title: "Men's Essential Tee",
    handle: "mens-essential-tee",
  },
  {
    sourceHandle: "rockstar-streetwear-white-cotton-tee-casual-wardrobe-essential-true-to-size-for-confident-everyday-style",
    title: "Men's Classic White Cotton Tee",
    handle: "mens-classic-white-cotton-tee",
  },
  {
    sourceHandle: "womens-bamboo-lounge-long-sleeve-t-shirt",
    title: "Men's Soft Lounge Long Sleeve Tee",
    handle: "mens-soft-lounge-long-sleeve-tee",
  },
  {
    sourceHandle: "laguna-upf-50-womens-sun-shirt",
    title: "Men's UPF 50+ Sun Shirt",
    handle: "mens-upf-50-sun-shirt",
  },
  {
    sourceHandle: "zadie-ivory-short-sleeve-button-cardigan",
    title: "Men's Lightweight Button Cardigan",
    handle: "mens-lightweight-button-cardigan",
  },
];

// Additional men accessories created by duplicating simple apparel as accessory-tagged bags/scarves isn't ideal.
// We'll also duplicate Essential Tee into colorway variants as separate SKUs for density.

const EXTRA_MEN_FROM_ESSENTIAL = [
  { title: "Men's Everyday Crew Tee", handle: "mens-everyday-crew-tee" },
  { title: "Men's Soft Cotton Basics Tee", handle: "mens-soft-cotton-basics-tee" },
  { title: "Men's Relaxed Fit Tee", handle: "mens-relaxed-fit-tee" },
  { title: "Men's Weekend Cotton Tee", handle: "mens-weekend-cotton-tee" },
  { title: "Men's Layering Tee", handle: "mens-layering-tee" },
];

async function findByHandle(handle) {
  const data = await gql(
    `query ($q: String!) {
      products(first: 1, query: $q) {
        nodes { id title handle status tags productType }
      }
    }`,
    { q: `handle:${handle}` },
  );
  return data.products.nodes[0] || null;
}

async function setMenProduct(id, title) {
  const tags = [
    "dept:men",
    "type:apparel",
    "merch:new",
    "merch:under-40",
  ];
  const data = await gql(
    `mutation ($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id handle status }
        userErrors { field message }
      }
    }`,
    {
      input: {
        id,
        title,
        tags,
        productType: "Apparel",
        status: "ACTIVE",
      },
    },
  );
  if (data.productUpdate.userErrors?.length) {
    throw new Error(JSON.stringify(data.productUpdate.userErrors));
  }
  // Publish to Online Store
  await publishOnlineStore(id);
  return data.productUpdate.product;
}

async function publishOnlineStore(productId) {
  const pubs = await gql(`{
    publications(first: 10) {
      nodes { id name }
    }
  }`);
  const online = pubs.publications.nodes.find(
    (p) => /online store/i.test(p.name) || p.name === "Online Store",
  );
  if (!online) {
    console.warn("No Online Store publication found");
    return;
  }
  const data = await gql(
    `mutation ($id: ID!, $pub: ID!) {
      publishablePublish(id: $id, input: [{ publicationId: $pub }]) {
        userErrors { field message }
      }
    }`,
    { id: productId, pub: online.id },
  );
  if (data.publishablePublish.userErrors?.length) {
    console.warn("publish", data.publishablePublish.userErrors);
  }
}

async function duplicateProduct(sourceId, newTitle) {
  const data = await gql(
    `mutation ($productId: ID!, $newTitle: String!) {
      productDuplicate(productId: $productId, newTitle: $newTitle, includeImages: true) {
        newProduct { id title handle status }
        userErrors { field message }
      }
    }`,
    { productId: sourceId, newTitle },
  );
  if (data.productDuplicate.userErrors?.length) {
    throw new Error(JSON.stringify(data.productDuplicate.userErrors));
  }
  return data.productDuplicate.newProduct;
}

async function restoreArchivedWomenApparel() {
  let cursor = null;
  let restored = 0;
  for (;;) {
    const data = await gql(
      `query ($cursor: String) {
        products(first: 50, after: $cursor, query: "status:archived") {
          nodes { id title handle productType tags }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { cursor },
    );
    for (const p of data.products.nodes) {
      if (SKIP_RESTORE_RE.test(p.title)) continue;
      const isApparel =
        p.productType === "Apparel" ||
        (p.tags || []).includes("type:apparel") ||
        RESTORE_TITLE_RE.test(p.title);
      if (!isApparel) continue;
      // Skip if clearly costume-type despite apparel label
      if (/\bcostume\b/i.test(p.title)) continue;

      const tags = [
        ...(p.tags || []).filter(
          (t) =>
            !t.startsWith("dept:") &&
            !t.startsWith("type:") &&
            !t.startsWith("age:") &&
            !t.startsWith("occasion:"),
        ),
        "dept:women",
        "type:apparel",
        "merch:new",
      ];
      if (!tags.includes("merch:under-40")) tags.push("merch:under-40");

      const upd = await gql(
        `mutation ($input: ProductInput!) {
          productUpdate(input: $input) {
            product { id }
            userErrors { field message }
          }
        }`,
        {
          input: {
            id: p.id,
            status: "ACTIVE",
            productType: "Apparel",
            tags: [...new Set(tags)],
          },
        },
      );
      if (upd.productUpdate.userErrors?.length) {
        console.error("restore", p.title, upd.productUpdate.userErrors);
        continue;
      }
      await publishOnlineStore(p.id);
      restored++;
      console.log("restored women:", p.title);
    }
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }
  return restored;
}

async function ensureMenFromSeeds() {
  let created = 0;
  for (const seed of MEN_SEED) {
    const existing = await findByHandle(seed.handle);
    if (existing) {
      await setMenProduct(existing.id, seed.title);
      console.log("updated men:", seed.handle);
      continue;
    }
    const source = await findByHandle(seed.sourceHandle);
    if (!source) {
      console.warn("missing source", seed.sourceHandle);
      continue;
    }
    const dup = await duplicateProduct(source.id, seed.title);
    await setMenProduct(dup.id, seed.title);
    // try set handle via update
    await gql(
      `mutation ($input: ProductInput!) {
        productUpdate(input: $input) {
          product { handle }
          userErrors { field message }
        }
      }`,
      { input: { id: dup.id, handle: seed.handle } },
    );
    created++;
    console.log("created men:", seed.handle);
  }

  const essential = await findByHandle("essential-tee");
  if (essential) {
    for (const extra of EXTRA_MEN_FROM_ESSENTIAL) {
      const existing = await findByHandle(extra.handle);
      if (existing) {
        await setMenProduct(existing.id, extra.title);
        continue;
      }
      const dup = await duplicateProduct(essential.id, extra.title);
      await setMenProduct(dup.id, extra.title);
      await gql(
        `mutation ($input: ProductInput!) {
          productUpdate(input: $input) {
            product { handle }
            userErrors { field message }
          }
        }`,
        { input: { id: dup.id, handle: extra.handle } },
      );
      created++;
      console.log("created men extra:", extra.handle);
    }
  }
  return created;
}

async function tagMerchHighlights() {
  // Tag a few women + costumes as best sellers / new
  const queries = [
    { q: "tag:dept:women status:active", merch: ["merch:best-seller"] },
    { q: "tag:dept:kids tag:type:costume status:active", merch: ["merch:best-seller"] },
    { q: "tag:dept:seasonal status:active", merch: ["merch:under-40"] },
  ];
  let tagged = 0;
  for (const { q, merch } of queries) {
    const data = await gql(
      `query ($q: String!) {
        products(first: 12, query: $q) {
          nodes { id title tags }
        }
      }`,
      { q },
    );
    for (const p of data.products.nodes) {
      const tags = [...new Set([...(p.tags || []), ...merch, "merch:new"])];
      await gql(
        `mutation ($input: ProductInput!) {
          productUpdate(input: $input) {
            userErrors { message }
          }
        }`,
        { input: { id: p.id, tags } },
      );
      tagged++;
    }
  }
  return tagged;
}

async function main() {
  console.log("Restoring archived women apparel...");
  const restored = await restoreArchivedWomenApparel();
  console.log("Ensuring men catalog from owned images...");
  const menCreated = await ensureMenFromSeeds();
  console.log("Tagging merch highlights...");
  const tagged = await tagMerchHighlights();
  console.log(
    JSON.stringify({ restored, menCreated, tagged }, null, 2),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
