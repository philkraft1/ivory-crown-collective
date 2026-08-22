#!/usr/bin/env node
/**
 * Create clothing-shop department collections + thin pages; publish to Online Store.
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

const COLLECTIONS = [
  {
    title: "Women",
    handle: "women",
    rule: { column: "TAG", relation: "EQUALS", condition: "dept:women" },
  },
  {
    title: "Women Apparel",
    handle: "women-apparel",
    rules: [
      { column: "TAG", relation: "EQUALS", condition: "dept:women" },
      { column: "TAG", relation: "EQUALS", condition: "type:apparel" },
    ],
  },
  {
    title: "Women Accessories",
    handle: "women-accessories",
    rules: [
      { column: "TAG", relation: "EQUALS", condition: "dept:women" },
      { column: "TAG", relation: "EQUALS", condition: "type:accessory" },
    ],
  },
  {
    title: "Beauty",
    handle: "beauty",
    rule: { column: "TAG", relation: "EQUALS", condition: "type:beauty" },
  },
  {
    title: "Men",
    handle: "men",
    rule: { column: "TAG", relation: "EQUALS", condition: "dept:men" },
  },
  {
    title: "Men Apparel",
    handle: "men-apparel",
    rules: [
      { column: "TAG", relation: "EQUALS", condition: "dept:men" },
      { column: "TAG", relation: "EQUALS", condition: "type:apparel" },
    ],
  },
  {
    title: "Men Accessories",
    handle: "men-accessories",
    rules: [
      { column: "TAG", relation: "EQUALS", condition: "dept:men" },
      { column: "TAG", relation: "EQUALS", condition: "type:accessory" },
    ],
  },
  {
    title: "Kids & Costumes",
    handle: "kids-costumes",
    rule: { column: "TAG", relation: "EQUALS", condition: "dept:kids" },
  },
];

async function ensureCollection({ title, handle, rule, rules }) {
  const existing = await gql(
    `query ($q: String!) {
      collections(first: 1, query: $q) {
        nodes { id handle title }
      }
    }`,
    { q: `handle:${handle}` },
  );
  if (existing.collections.nodes[0]) {
    console.log(`exists: ${handle}`);
    return existing.collections.nodes[0];
  }
  const ruleList = rules || [rule];
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
          rules: ruleList,
        },
      },
    },
  );
  if (data.collectionCreate.userErrors?.length) {
    console.error(handle, data.collectionCreate.userErrors);
    throw new Error(`collectionCreate failed: ${handle}`);
  }
  console.log(`created: ${handle}`);
  return data.collectionCreate.collection;
}

async function tightenCostumes() {
  const existing = await gql(
    `query {
      collections(first: 1, query: "handle:costumes") {
        nodes { id }
      }
    }`,
  );
  const id = existing.collections.nodes[0]?.id;
  if (!id) return;
  const data = await gql(
    `mutation ($input: CollectionInput!) {
      collectionUpdate(input: $input) {
        collection { handle }
        userErrors { field message }
      }
    }`,
    {
      input: {
        id,
        ruleSet: {
          appliedDisjunctively: false,
          rules: [
            { column: "TAG", relation: "EQUALS", condition: "dept:kids" },
            { column: "TAG", relation: "EQUALS", condition: "type:costume" },
          ],
        },
      },
    },
  );
  console.log("tightened costumes", data.collectionUpdate.userErrors || "ok");
}

async function publishAll(handles) {
  const pubs = await gql(`{ publications(first: 10) { nodes { id name } } }`);
  const online = pubs.publications.nodes.find((p) =>
    p.name.toLowerCase().includes("online"),
  )?.id;
  if (!online) throw new Error("Online Store publication not found");

  for (const handle of handles) {
    const col = await gql(
      `query ($q: String!) {
        collections(first: 1, query: $q) {
          nodes {
            id
            handle
            resourcePublications(first: 10) {
              nodes { isPublished publication { name } }
            }
          }
        }
      }`,
      { q: `handle:${handle}` },
    );
    const node = col.collections.nodes[0];
    if (!node) continue;
    const already = node.resourcePublications.nodes.some(
      (p) => p.isPublished && p.publication.name.includes("Online"),
    );
    if (already) {
      console.log(`published already: ${handle}`);
      continue;
    }
    const res = await gql(
      `mutation ($id: ID!, $pub: ID!) {
        publishablePublish(id: $id, input: [{ publicationId: $pub }]) {
          userErrors { message }
        }
      }`,
      { id: node.id, pub: online },
    );
    console.log(
      `publish ${handle}`,
      res.publishablePublish.userErrors?.length
        ? res.publishablePublish.userErrors
        : "ok",
    );
  }
}

async function ensurePage(handle, title, bodyHtml) {
  const existing = await gql(
    `query ($q: String!) {
      pages(first: 1, query: $q) { nodes { id handle } }
    }`,
    { q: `handle:${handle}` },
  );
  if (existing.pages.nodes[0]) {
    console.log(`page exists: ${handle}`);
    return;
  }
  const data = await gql(
    `mutation ($page: PageCreateInput!) {
      pageCreate(page: $page) {
        page { handle }
        userErrors { message }
      }
    }`,
    {
      page: {
        title,
        handle,
        body: bodyHtml,
        isPublished: true,
      },
    },
  );
  console.log(
    `page ${handle}`,
    data.pageCreate.userErrors?.length ? data.pageCreate.userErrors : "created",
  );
}

async function main() {
  const created = [];
  for (const c of COLLECTIONS) {
    created.push(await ensureCollection(c));
  }
  await tightenCostumes();
  await publishAll([
    ...COLLECTIONS.map((c) => c.handle),
    "costumes",
  ]);

  await ensurePage(
    "women",
    "Women",
    `<p>Apparel, accessories, and beauty — sharp essentials for everyday and evening.</p>
<ul>
<li><a href="/collections/women-apparel">Women Apparel</a></li>
<li><a href="/collections/women-accessories">Women Accessories</a></li>
<li><a href="/collections/beauty">Beauty</a></li>
</ul>
<p><a href="/collections/women">Shop all Women</a></p>`,
  );
  await ensurePage(
    "men",
    "Men",
    `<p>Clean apparel and accessories. Building the assortment — shop what is live now.</p>
<ul>
<li><a href="/collections/men-apparel">Men Apparel</a></li>
<li><a href="/collections/men-accessories">Men Accessories</a></li>
</ul>
<p><a href="/collections/men">Shop all Men</a></p>`,
  );
  await ensurePage(
    "kids-costumes",
    "Kids & Costumes",
    `<p>School plays, Halloween, and everyday dress-up — shop by age or occasion.</p>
<ul>
<li><a href="/collections/toddler">Toddler</a></li>
<li><a href="/collections/little-kids">Little Kids</a></li>
<li><a href="/collections/big-kids">Big Kids</a></li>
<li><a href="/collections/book-character-day">Book Character Day</a></li>
<li><a href="/collections/halloween">Halloween</a></li>
</ul>
<p><a href="/collections/kids-costumes">Shop all Kids &amp; Costumes</a></p>`,
  );

  console.log("done collections+pages");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
