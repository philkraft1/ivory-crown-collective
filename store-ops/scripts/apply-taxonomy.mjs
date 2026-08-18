#!/usr/bin/env node
/**
 * Create smart collections + main/footer menus for the costume store.
 * Requires: SHOPIFY_SHOP, SHOPIFY_ADMIN_TOKEN
 *
 * Does not change primary domain (UI only) or theme JSON (see UX.md).
 */
import process from "node:process";

const SHOP = process.env.SHOPIFY_SHOP || "1wtpc0-c2.myshopify.com";
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";

if (!TOKEN) {
  console.error("Set SHOPIFY_ADMIN_TOKEN (Admin API access token).");
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
  if (!res.ok || json.errors) {
    console.error(JSON.stringify(json, null, 2));
    throw new Error("GraphQL request failed");
  }
  return json.data;
}

const COLLECTIONS = [
  {
    title: "Toddler",
    handle: "toddler",
    rule: { column: "TAG", relation: "EQUALS", condition: "age:toddler" },
  },
  {
    title: "Little Kids",
    handle: "little-kids",
    rule: { column: "TAG", relation: "EQUALS", condition: "age:little-kids" },
  },
  {
    title: "Big Kids",
    handle: "big-kids",
    rule: { column: "TAG", relation: "EQUALS", condition: "age:big-kids" },
  },
  {
    title: "Book Character Day",
    handle: "book-character-day",
    rule: {
      column: "TAG",
      relation: "EQUALS",
      condition: "occasion:book-character",
    },
  },
  {
    title: "Halloween",
    handle: "halloween",
    rule: { column: "TAG", relation: "EQUALS", condition: "occasion:halloween" },
  },
  {
    title: "Stage & Recital",
    handle: "stage-recital",
    rule: { column: "TAG", relation: "EQUALS", condition: "occasion:stage" },
  },
  {
    title: "Everyday Dress-up",
    handle: "everyday-dress-up",
    rule: { column: "TAG", relation: "EQUALS", condition: "occasion:everyday" },
  },
  {
    title: "Costumes",
    handle: "costumes",
    rule: { column: "TAG", relation: "EQUALS", condition: "type:costume" },
  },
  {
    title: "Accessories",
    handle: "accessories",
    rule: { column: "TAG", relation: "EQUALS", condition: "type:accessory" },
  },
  {
    title: "Footwear",
    handle: "footwear",
    rule: { column: "TAG", relation: "EQUALS", condition: "type:footwear" },
  },
  {
    title: "Best Sellers",
    handle: "best-sellers",
    rule: {
      column: "TAG",
      relation: "EQUALS",
      condition: "merch:best-seller",
    },
  },
  {
    title: "New Arrivals",
    handle: "new-arrivals",
    rule: { column: "TAG", relation: "EQUALS", condition: "merch:new" },
  },
  {
    title: "Under $40",
    handle: "under-40",
    rule: {
      column: "TAG",
      relation: "EQUALS",
      condition: "merch:under-40",
    },
  },
];

async function ensureCollection({ title, handle, rule }) {
  const existing = await gql(
    `query ($q: String!) {
      collections(first: 1, query: $q) {
        nodes { id handle title }
      }
    }`,
    { q: `handle:${handle}` },
  );
  if (existing.collections.nodes[0]) {
    console.log(`collection exists: ${handle}`);
    return existing.collections.nodes[0];
  }

  const data = await gql(
    `mutation ($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection { id handle title }
        userErrors { field message }
      }
    }`,
    {
      input: {
        title,
        handle,
        ruleSet: {
          appliedDisjunctively: false,
          rules: [rule],
        },
      },
    },
  );
  const errs = data.collectionCreate.userErrors;
  if (errs?.length) {
    console.error(handle, errs);
    throw new Error(`collectionCreate failed: ${handle}`);
  }
  console.log(`created collection: ${handle}`);
  return data.collectionCreate.collection;
}

async function upsertMenu(handle, title, items) {
  const list = await gql(
    `query {
      menus(first: 50) {
        nodes { id handle title }
      }
    }`,
  );
  const found = list.menus.nodes.find((m) => m.handle === handle);

  const mutation = found
    ? `mutation ($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
        menuUpdate(id: $id, title: $title, items: $items) {
          menu { id handle }
          userErrors { field message }
        }
      }`
    : `mutation ($handle: String!, $title: String!, $items: [MenuItemCreateInput!]!) {
        menuCreate(handle: $handle, title: $title, items: $items) {
          menu { id handle }
          userErrors { field message }
        }
      }`;

  const variables = found
    ? { id: found.id, title, items }
    : { handle, title, items };

  const data = await gql(mutation, variables);
  const payload = found ? data.menuUpdate : data.menuCreate;
  if (payload.userErrors?.length) {
    console.error(payload.userErrors);
    throw new Error(`menu upsert failed: ${handle}`);
  }
  console.log(`${found ? "updated" : "created"} menu: ${handle}`);
}

function collectionItem(name, handle) {
  return {
    title: name,
    type: "COLLECTION",
    resourceId: undefined, // filled after create
    url: `/collections/${handle}`,
  };
}

async function main() {
  const shop = await gql(`query { shop { name primaryDomain { host url } } }`);
  console.log("shop:", shop.shop.name, shop.shop.primaryDomain);

  const created = {};
  for (const c of COLLECTIONS) {
    created[c.handle] = await ensureCollection(c);
  }

  // Menu items: Shopify menuCreate prefers type + resourceId for collections
  const ageChildren = ["toddler", "little-kids", "big-kids"].map((h) => ({
    title: created[h].title,
    type: "COLLECTION",
    resourceId: created[h].id,
  }));
  const occasionChildren = [
    "book-character-day",
    "halloween",
    "stage-recital",
    "everyday-dress-up",
  ].map((h) => ({
    title: created[h].title,
    type: "COLLECTION",
    resourceId: created[h].id,
  }));

  await upsertMenu("main-menu", "Main menu", [
    {
      title: "Shop by Age",
      type: "HTTP",
      url: "/collections/little-kids",
      items: ageChildren,
    },
    {
      title: "Shop by Occasion",
      type: "HTTP",
      url: "/collections/book-character-day",
      items: occasionChildren,
    },
    {
      title: "Costumes",
      type: "COLLECTION",
      resourceId: created.costumes.id,
    },
    {
      title: "Accessories",
      type: "COLLECTION",
      resourceId: created.accessories.id,
    },
    {
      title: "Best Sellers",
      type: "COLLECTION",
      resourceId: created["best-sellers"].id,
    },
  ]);

  await upsertMenu("footer", "Footer", [
    { title: "Shipping", type: "HTTP", url: "/pages/shipping" },
    { title: "Returns", type: "HTTP", url: "/pages/returns" },
    { title: "Size Guide", type: "HTTP", url: "/pages/size-guide" },
    { title: "Contact", type: "HTTP", url: "/pages/contact" },
  ]);

  console.log("\nDone. Apply UX.md in the theme editor next.");
  console.log(
    "If primaryDomain.host is ivorycrowncollective.com, finish UNLOCK.md in Admin UI.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
