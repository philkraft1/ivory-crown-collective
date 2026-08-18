#!/usr/bin/env node
/**
 * Map existing catalog tags → taxonomy tags from TAXONOMY.md
 * Requires SHOPIFY_ADMIN_TOKEN
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

function deriveTags(product) {
  const existing = new Set(product.tags || []);
  const add = new Set();
  const title = (product.title || "").toLowerCase();
  const type = (product.productType || "").toLowerCase();

  const ages = [...existing].filter((t) => t.startsWith("age:"));
  if (
    ages.some((t) =>
      ["age:2-3t", "age:2-3T", "age:toddler"].includes(t.toLowerCase()),
    ) ||
    ages.includes("age:2-3T")
  ) {
    add.add("age:toddler");
  }
  if (
    ages.some((t) =>
      ["age:4-5", "age:6-7", "age:little-kids"].includes(t.toLowerCase()),
    )
  ) {
    add.add("age:little-kids");
  }
  if (
    ages.some((t) =>
      ["age:8-10", "age:11-12", "age:13-14", "age:big-kids"].includes(
        t.toLowerCase(),
      ),
    )
  ) {
    add.add("age:big-kids");
  }
  // fallback if only audience:kids and no age mapped
  if (![...add].some((t) => t.startsWith("age:")) && existing.has("audience:kids")) {
    add.add("age:little-kids");
  }

  if (
    title.includes("halloween") ||
    [...existing].some((t) => t.toLowerCase().includes("halloween"))
  ) {
    add.add("occasion:halloween");
  }
  if (
    title.includes("school play") ||
    title.includes("recital") ||
    title.includes("stage") ||
    existing.has("occasion:school-play")
  ) {
    add.add("occasion:stage");
  }
  if (
    title.includes("book") ||
    title.includes("character") ||
    title.includes("school play") ||
    title.includes("teacher") ||
    title.includes("sherlock")
  ) {
    add.add("occasion:book-character");
  }
  if (
    title.includes("dress-up") ||
    title.includes("everyday") ||
    existing.has("audience:kids")
  ) {
    add.add("occasion:everyday");
  }

  if (
    type.includes("costume") ||
    title.includes("costume") ||
    title.includes("dress") ||
    title.includes("tutu")
  ) {
    add.add("type:costume");
  }
  if (
    type.includes("accessor") ||
    title.includes("wand") ||
    title.includes("mask") ||
    title.includes("cape") ||
    title.includes("pack")
  ) {
    add.add("type:accessory");
  }
  if (
    type.includes("footwear") ||
    title.includes("boot") ||
    title.includes("shoe") ||
    title.includes("slipper")
  ) {
    add.add("type:footwear");
  }
  if (![...add].some((t) => t.startsWith("type:"))) {
    add.add("type:costume");
  }

  // price-based under-40 from first variant if present
  const price = Number(product.priceRangeV2?.minVariantPrice?.amount || 0);
  if (price > 0 && price < 40) add.add("merch:under-40");
  if (price > 0 && price < 25) add.add("merch:under-25");

  const merged = [...new Set([...existing, ...add])];
  return { merged, add: [...add] };
}

async function fetchAllProducts() {
  const products = [];
  let cursor = null;
  for (;;) {
    const data = await gql(
      `query ($cursor: String) {
        products(first: 50, after: $cursor) {
          nodes {
            id
            title
            productType
            tags
            priceRangeV2 { minVariantPrice { amount } }
          }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { cursor },
    );
    products.push(...data.products.nodes);
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }
  return products;
}

async function main() {
  const products = await fetchAllProducts();
  console.log(`products=${products.length}`);
  let updated = 0;
  for (const p of products) {
    const { merged, add } = deriveTags(p);
    const need =
      add.some((t) => !p.tags.includes(t)) ||
      (p.productType !== "Costume" &&
        add.includes("type:costume") &&
        !p.productType);

    if (!need && p.productType) {
      // still update if missing taxonomy tags
      if (add.every((t) => p.tags.includes(t))) continue;
    }

    const productType =
      add.includes("type:footwear")
        ? "Footwear"
        : add.includes("type:accessory") && !add.includes("type:costume")
          ? "Accessory"
          : "Costume";

    const data = await gql(
      `mutation ($input: ProductInput!) {
        productUpdate(input: $input) {
          product { id tags productType }
          userErrors { field message }
        }
      }`,
      {
        input: {
          id: p.id,
          tags: merged,
          productType,
        },
      },
    );
    if (data.productUpdate.userErrors?.length) {
      console.error(p.title, data.productUpdate.userErrors);
      continue;
    }
    updated++;
    if (updated % 20 === 0) console.log(`updated ${updated}...`);
  }
  console.log(`done updated=${updated}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
