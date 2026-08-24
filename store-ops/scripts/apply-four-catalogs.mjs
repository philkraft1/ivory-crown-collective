#!/usr/bin/env node
/**
 * Four-catalog collections + menus:
 * Women · Men · Costumes · Holiday & Seasonal
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
    title: "Costumes",
    handle: "costumes",
    rules: [
      { column: "TAG", relation: "EQUALS", condition: "dept:kids" },
      { column: "TAG", relation: "EQUALS", condition: "type:costume" },
    ],
  },
  {
    title: "Kids & Costumes",
    handle: "kids-costumes",
    rule: { column: "TAG", relation: "EQUALS", condition: "dept:kids" },
  },
  {
    title: "Holiday & Seasonal",
    handle: "holiday-seasonal",
    rule: { column: "TAG", relation: "EQUALS", condition: "dept:seasonal" },
  },
  {
    title: "Best Sellers",
    handle: "best-sellers",
    rule: { column: "TAG", relation: "EQUALS", condition: "merch:best-seller" },
  },
  {
    title: "New Arrivals",
    handle: "new-arrivals",
    rule: { column: "TAG", relation: "EQUALS", condition: "merch:new" },
  },
  {
    title: "Under $40",
    handle: "under-40",
    rule: { column: "TAG", relation: "EQUALS", condition: "merch:under-40" },
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
  const ruleList = rules || [rule];
  if (existing.collections.nodes[0]) {
    const id = existing.collections.nodes[0].id;
    // Keep Holiday & Seasonal / merch collections rules fresh
    if (
      ["holiday-seasonal", "best-sellers", "new-arrivals", "costumes"].includes(
        handle,
      )
    ) {
      const data = await gql(
        `mutation ($input: CollectionInput!) {
          collectionUpdate(input: $input) {
            collection { handle title }
            userErrors { field message }
          }
        }`,
        {
          input: {
            id,
            title,
            ruleSet: { appliedDisjunctively: false, rules: ruleList },
          },
        },
      );
      console.log(
        `updated: ${handle}`,
        data.collectionUpdate.userErrors?.length
          ? data.collectionUpdate.userErrors
          : "ok",
      );
      return data.collectionUpdate.collection || existing.collections.nodes[0];
    }
    console.log(`exists: ${handle}`);
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
        ruleSet: { appliedDisjunctively: false, rules: ruleList },
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
      (p) => p.isPublished && /online/i.test(p.publication.name),
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
    await gql(
      `mutation ($id: ID!, $page: PageUpdateInput!) {
        pageUpdate(id: $id, page: $page) {
          page { handle }
          userErrors { message }
        }
      }`,
      {
        id: existing.pages.nodes[0].id,
        page: { title, body: bodyHtml, isPublished: true },
      },
    );
    console.log(`page updated: ${handle}`);
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
      page: { title, handle, body: bodyHtml, isPublished: true },
    },
  );
  console.log(
    `page ${handle}`,
    data.pageCreate.userErrors?.length ? data.pageCreate.userErrors : "created",
  );
}

async function tryUpdateMainMenu() {
  const data = await gql(`{
    menus(first: 20) {
      nodes { id handle title items { id title url type resourceId items { id title url } } }
    }
  }`).catch((e) => {
    console.warn("menus query failed", e.message);
    return null;
  });
  if (!data) return;

  const main =
    data.menus.nodes.find((m) => m.handle === "main-menu") ||
    data.menus.nodes.find((m) => /main/i.test(m.handle)) ||
    data.menus.nodes[0];
  if (!main) {
    console.warn("No main menu found — set nav in Admin UI");
    return;
  }

  // Resolve collection GIDs
  const handles = ["women", "men", "costumes", "holiday-seasonal"];
  const ids = {};
  for (const h of handles) {
    const c = await gql(
      `query ($q: String!) {
        collections(first: 1, query: $q) { nodes { id handle } }
      }`,
      { q: `handle:${h}` },
    );
    ids[h] = c.collections.nodes[0]?.id;
  }

  async function colId(handle) {
    const c = await gql(
      `query ($q: String!) {
        collections(first: 1, query: $q) { nodes { id } }
      }`,
      { q: `handle:${handle}` },
    );
    return c.collections.nodes[0]?.id;
  }

  const womenItems = [
    { title: "Apparel", type: "COLLECTION", resourceId: await colId("women-apparel") },
    { title: "Accessories", type: "COLLECTION", resourceId: await colId("women-accessories") },
    { title: "Beauty", type: "COLLECTION", resourceId: await colId("beauty") },
  ].filter((i) => i.resourceId);
  const menItems = [
    { title: "Apparel", type: "COLLECTION", resourceId: await colId("men-apparel") },
    { title: "Accessories", type: "COLLECTION", resourceId: await colId("men-accessories") },
  ].filter((i) => i.resourceId);
  const costumeItems = [
    { title: "Toddler", type: "COLLECTION", resourceId: await colId("toddler") },
    { title: "Little Kids", type: "COLLECTION", resourceId: await colId("little-kids") },
    { title: "Big Kids", type: "COLLECTION", resourceId: await colId("big-kids") },
    { title: "Book Character Day", type: "COLLECTION", resourceId: await colId("book-character-day") },
  ].filter((i) => i.resourceId);
  const seasonalItems = [
    { title: "Halloween", type: "COLLECTION", resourceId: await colId("halloween") },
    { title: "Under $40", type: "COLLECTION", resourceId: await colId("under-40") },
    { title: "New Arrivals", type: "COLLECTION", resourceId: await colId("new-arrivals") },
  ].filter((i) => i.resourceId);

  const menuItems = [
    { title: "Women", type: "COLLECTION", resourceId: ids.women, items: womenItems },
    { title: "Men", type: "COLLECTION", resourceId: ids.men, items: menItems },
    { title: "Costumes", type: "COLLECTION", resourceId: ids.costumes, items: costumeItems },
    {
      title: "Holiday & Seasonal",
      type: "COLLECTION",
      resourceId: ids["holiday-seasonal"],
      items: seasonalItems,
    },
  ].filter((i) => i.resourceId);

  const upd = await gql(
    `mutation ($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
      menuUpdate(id: $id, title: $title, items: $items) {
        menu { handle }
        userErrors { field message }
      }
    }`,
    { id: main.id, title: main.title || "Main menu", items: menuItems },
  ).catch(async (e) => {
    // Older API shape
    console.warn("menuUpdate failed", e.message);
    return null;
  });

  if (upd?.menuUpdate?.userErrors?.length) {
    console.warn("menuUpdate errors", upd.menuUpdate.userErrors);
    console.warn("Set Main menu manually in Admin → Navigation");
  } else if (upd) {
    console.log("main menu updated");
  }
}

async function tagMerchWithQuotedQueries() {
  const batches = [
    { q: 'tag:"dept:women" status:active', extra: ["merch:best-seller", "merch:new"] },
    { q: 'tag:"dept:men" status:active', extra: ["merch:new", "merch:under-40"] },
    { q: 'tag:"dept:kids" tag:"type:costume" status:active', extra: ["merch:best-seller"] },
    { q: 'tag:"dept:seasonal" status:active', extra: ["merch:under-40"] },
  ];
  let n = 0;
  for (const { q, extra } of batches) {
    const d = await gql(
      `query ($q: String!) { products(first: 12, query: $q) { nodes { id tags } } }`,
      { q },
    );
    for (const p of d.products.nodes) {
      const tags = [...new Set([...(p.tags || []), ...extra])];
      await gql(
        `mutation ($input: ProductInput!) {
          productUpdate(input: $input) { userErrors { message } }
        }`,
        { input: { id: p.id, tags } },
      );
      n++;
    }
  }
  console.log("merch tagged", n);
}

async function main() {
  await tagMerchWithQuotedQueries();
  for (const c of COLLECTIONS) {
    await ensureCollection(c);
  }
  await publishAll(COLLECTIONS.map((c) => c.handle));

  await ensurePage(
    "women",
    "Women",
    `<p>Apparel, accessories, and beauty — sharp essentials for every day.</p>
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
    `<p>Clean apparel and accessories for everyday layering.</p>
<ul>
<li><a href="/collections/men-apparel">Men Apparel</a></li>
<li><a href="/collections/men-accessories">Men Accessories</a></li>
</ul>
<p><a href="/collections/men">Shop all Men</a></p>`,
  );
  await ensurePage(
    "costumes",
    "Costumes",
    `<p>School plays, book character day, and dress-up — shop by age or occasion.</p>
<ul>
<li><a href="/collections/toddler">Toddler</a></li>
<li><a href="/collections/little-kids">Little Kids</a></li>
<li><a href="/collections/big-kids">Big Kids</a></li>
<li><a href="/collections/book-character-day">Book Character Day</a></li>
<li><a href="/collections/costumes">Shop all Costumes</a></li>
</ul>`,
  );
  await ensurePage(
    "holiday-seasonal",
    "Holiday & Seasonal",
    `<p>Halloween, fall needs, and gift-ready finds under one roof.</p>
<ul>
<li><a href="/collections/halloween">Halloween</a></li>
<li><a href="/collections/under-40">Under $40</a></li>
<li><a href="/collections/new-arrivals">New Arrivals</a></li>
<li><a href="/collections/holiday-seasonal">Shop Holiday &amp; Seasonal</a></li>
</ul>`,
  );

  await tryUpdateMainMenu();
  console.log("done four-catalog collections + pages");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
