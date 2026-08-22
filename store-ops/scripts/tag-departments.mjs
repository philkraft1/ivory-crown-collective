#!/usr/bin/env node
/**
 * Classify catalog into women / men / kids / beauty departments.
 * Fixes mistagged type:costume on apparel, beauty, and non-costume goods.
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

const BEAUTY_RE =
  /\b(beauty|skincare|skin care|soap|makeup|perfume|eau de|fragrance|serum|lotion|moisturizer|sunscreen|spf|toner|kojic|turmeric|tallow|lip\b|filler|mousse|tanning|shampoo|cosmetic|hand soap)\b/i;
const SUPPLEMENT_RE =
  /\b(protein|collagen|spirulina|mushroom complex|supplement|electrolyte|hydration multiplier|mre\b|energybits|meal booster|cheddar|cheesy cheese)\b/i;
const COSTUME_RE =
  /\b(costume|cosplay|school play|halloween|book character|dress-up|dress up|toga|recital|nativity|masquerade)\b/i;
const KIDS_RE =
  /\b(for kids|kids'|children|toddler|2t|3t|4t|audience:kids|age:toddler|age:little|age:big)\b/i;
const WOMEN_RE =
  /\b(women'?s?|woman|ladies|female|blouse|wrap dress|bodice|bra top|workout shorts|twirl dress|lounge set)\b/i;
const MEN_RE =
  /\b(men'?s?|for men|gentleman|male polo|men'?s tee|men'?s shirt|men'?s pant)\b/i;
const APPAREL_RE =
  /\b(dress|blouse|tee|t-shirt|shirt|skirt|shorts|pants|jumpsuit|jacket|top|romper|legging|hoodie|sweater)\b/i;
const ACCESSORY_RE =
  /\b(accessory pack|wand|mask &|cape &|jewelry|belt|handbag|earrings)\b/i;
const KIDS_ACCESSORY_RE =
  /\b(accessory pack|wand|crown pack|mask pack|boot covers)\b/i;

const COSTUME_OCCASION = new Set([
  "occasion:book-character",
  "occasion:halloween",
  "occasion:stage",
  "occasion:everyday",
]);
const TYPE_TAGS = new Set([
  "type:costume",
  "type:accessory",
  "type:apparel",
  "type:beauty",
  "type:footwear",
]);
const DEPT_TAGS = new Set([
  "dept:women",
  "dept:men",
  "dept:kids",
  "dept:beauty",
]);

function classify(product, womenFashionIds) {
  const title = product.title || "";
  const tags = product.tags || [];
  const tagStr = tags.join(" ");
  const blob = `${title} ${tagStr} ${product.productType || ""}`;
  const inWomenFashion = womenFashionIds.has(product.id);

  if (BEAUTY_RE.test(blob)) {
    return {
      dept: "dept:women",
      typeTag: "type:beauty",
      productType: "Beauty",
      stripCostumeOccasions: true,
    };
  }
  if (SUPPLEMENT_RE.test(blob) && !COSTUME_RE.test(title)) {
    // Non-apparel grocery/supplements → beauty/wellness under women for now
    return {
      dept: "dept:women",
      typeTag: "type:beauty",
      productType: "Beauty",
      stripCostumeOccasions: true,
    };
  }
  if (
    inWomenFashion ||
    (WOMEN_RE.test(blob) && !KIDS_RE.test(blob) && !COSTUME_RE.test(title))
  ) {
    const accessory =
      ACCESSORY_RE.test(blob) && !APPAREL_RE.test(title);
    return {
      dept: "dept:women",
      typeTag: accessory ? "type:accessory" : "type:apparel",
      productType: accessory ? "Accessory" : "Apparel",
      stripCostumeOccasions: true,
    };
  }
  if (MEN_RE.test(blob) && !KIDS_RE.test(blob) && !COSTUME_RE.test(title)) {
    const accessory =
      ACCESSORY_RE.test(blob) && !APPAREL_RE.test(title);
    return {
      dept: "dept:men",
      typeTag: accessory ? "type:accessory" : "type:apparel",
      productType: accessory ? "Accessory" : "Apparel",
      stripCostumeOccasions: true,
    };
  }
  // Default: kids / costumes (ignore prior mistags on type:accessory)
  const isAccessory = KIDS_ACCESSORY_RE.test(title) && !/\bcostume\b/i.test(title);
  return {
    dept: "dept:kids",
    typeTag: isAccessory ? "type:accessory" : "type:costume",
    productType: isAccessory ? "Accessory" : "Costume",
    stripCostumeOccasions: false,
  };
}

function mergeTags(existing, classification) {
  let tags = existing.filter(
    (t) => !TYPE_TAGS.has(t) && !DEPT_TAGS.has(t) && t !== "dept:beauty",
  );
  if (classification.stripCostumeOccasions) {
    tags = tags.filter((t) => !COSTUME_OCCASION.has(t));
    // drop age tags on non-kids
    tags = tags.filter((t) => !t.startsWith("age:"));
  }
  tags.push(classification.dept);
  tags.push(classification.typeTag);
  if (classification.typeTag === "type:beauty") {
    tags.push("dept:beauty"); // optional helper for beauty-only collection
  }
  return [...new Set(tags)];
}

async function fetchWomenFashionIds() {
  const data = await gql(
    `query {
      collections(first: 1, query: "handle:womens-fashion") {
        nodes {
          products(first: 100) { nodes { id } }
        }
      }
    }`,
  );
  const nodes = data.collections.nodes[0]?.products.nodes || [];
  return new Set(nodes.map((n) => n.id));
}

async function fetchAllProducts() {
  const products = [];
  let cursor = null;
  for (;;) {
    const data = await gql(
      `query ($cursor: String) {
        products(first: 50, after: $cursor) {
          nodes { id title productType tags }
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
  const womenFashionIds = await fetchWomenFashionIds();
  const products = await fetchAllProducts();
  console.log(
    `products=${products.length} womenFashion=${womenFashionIds.size}`,
  );
  const counts = {};
  let updated = 0;
  for (const p of products) {
    const c = classify(p, womenFashionIds);
    counts[`${c.dept}/${c.typeTag}`] = (counts[`${c.dept}/${c.typeTag}`] || 0) + 1;
    const tags = mergeTags(p.tags || [], c);
    const sameType = p.productType === c.productType;
    const sameTags =
      tags.length === (p.tags || []).length &&
      tags.every((t) => (p.tags || []).includes(t));
    if (sameType && sameTags) continue;

    const data = await gql(
      `mutation ($input: ProductInput!) {
        productUpdate(input: $input) {
          product { id }
          userErrors { field message }
        }
      }`,
      { input: { id: p.id, tags, productType: c.productType } },
    );
    if (data.productUpdate.userErrors?.length) {
      console.error(p.title, data.productUpdate.userErrors);
      continue;
    }
    updated++;
    if (updated % 25 === 0) console.log(`updated ${updated}...`);
  }
  console.log("buckets", counts);
  console.log(`done updated=${updated}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
