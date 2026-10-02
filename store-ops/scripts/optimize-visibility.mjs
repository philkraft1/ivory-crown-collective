#!/usr/bin/env node
/**
 * Storefront visibility pass for ivorycrowncollective.store
 * - Shop + collection SEO
 * - Trust pages (shipping, returns, size guide, about, FAQ)
 * - Product SEO title/description when blank (does not rewrite product bodies or handles)
 * - Hide empty/retired collections from search
 * - Main menu: Women · Men · Costumes · Holiday
 * - Homepage + announcement theme files
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SHOP = process.env.SHOPIFY_SHOP || "1wtpc0-c2.myshopify.com";
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";
const THEME_ID =
  process.env.SHOPIFY_THEME_ID || "gid://shopify/OnlineStoreTheme/160471417077";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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

function plain(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clip(text, max) {
  const t = plain(text);
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > 40 ? cut.slice(0, space) : cut).trim()}…`;
}

const COLLECTIONS = [
  {
    handle: "women",
    seoTitle: "Women's Apparel & Accessories | Ivory Crown",
    seoDescription:
      "Shop women's clothing, accessories, and beauty at Ivory Crown Collective. US shipping and 30-day returns.",
    html: `<p>Women's apparel, accessories, and beauty — ready to wear, not a lookbook. Filter by price and availability, then check the size notes on each product before you check out.</p>
<p><a href="/collections/women-apparel">Apparel</a> · <a href="/collections/women-accessories">Accessories</a> · <a href="/collections/beauty">Beauty</a></p>`,
  },
  {
    handle: "men",
    seoTitle: "Men's Clothing & Accessories | Ivory Crown",
    seoDescription:
      "Shop men's shirts, pants, and accessories at Ivory Crown Collective. US shipping and 30-day returns.",
    html: `<p>Men's apparel and accessories for everyday wear. Sizes and fit notes are on each product. Shipping is calculated at checkout for US addresses.</p>
<p><a href="/collections/men-apparel">Apparel</a> · <a href="/collections/men-accessories">Accessories</a></p>`,
  },
  {
    handle: "costumes",
    seoTitle: "Kids Costumes for School & Halloween | Ivory Crown",
    seoDescription:
      "Kids costumes for Halloween, school plays, and book character day. Shop by age. US shipping, 30-day returns.",
    html: `<p>Kids costumes for Halloween, school plays, book character day, and recitals. Start with age — Toddler, Little Kids, or Big Kids — then read the size notes on the product before you order. Orders are processed in 1–3 business days and ship inside the United States.</p>
<p><a href="/collections/toddler">Toddler</a> · <a href="/collections/little-kids">Little Kids</a> · <a href="/collections/big-kids">Big Kids</a> · <a href="/collections/book-character-day">Book Character Day</a> · <a href="/collections/halloween">Halloween</a></p>`,
  },
  {
    handle: "holiday-seasonal",
    seoTitle: "Halloween & Seasonal Costumes | Ivory Crown",
    seoDescription:
      "Halloween costumes and seasonal finds at Ivory Crown Collective. Shop holiday looks and gifts under $40.",
    html: `<p>Halloween, holiday pageants, and seasonal gifts in one catalog. Order early enough to try the costume on — exchanges need time to ship back before the event.</p>
<p><a href="/collections/halloween">Halloween</a> · <a href="/collections/under-40">Under $40</a> · <a href="/collections/new-arrivals">New Arrivals</a></p>`,
  },
  {
    handle: "halloween",
    seoTitle: "Halloween Costumes for Kids | Ivory Crown",
    seoDescription:
      "Kids Halloween costumes for parties, school, and trick-or-treat. US shipping. Order early for size exchanges.",
    html: `<p>Kids Halloween costumes for school, parties, and trick-or-treat. Pair with the <a href="/pages/size-guide">size guide</a> and order with enough time to exchange a size before the date.</p>`,
  },
  {
    handle: "book-character-day",
    seoTitle: "Book Character Day Costumes | Ivory Crown",
    seoDescription:
      "Book character day costumes for school. Shop kids dress-up by age at Ivory Crown Collective.",
    html: `<p>Dress-up for book character day and school plays. Shop by age, then confirm measurements on the product page.</p>`,
  },
];

const HIDE_HANDLES = [
  "footwear",
  "food-supplements",
  "mens-clothing-retired",
  "frontpage",
];

const PAGES = [
  {
    handle: "shipping",
    title: "Shipping",
    seoTitle: "Shipping | Ivory Crown Collective",
    seoDescription:
      "US shipping from Ivory Crown Collective. Orders process in 1–3 business days. Standard delivery 7–15 business days.",
    body: `<p>Costumes are for a date on the calendar. Here is what to expect. Full policy: <a href="/policies/shipping-policy">Shipping policy</a>.</p>
<h2>Processing</h2>
<p>Orders are processed within 1–3 business days. Weekend and holiday orders start the next business day.</p>
<h2>Delivery</h2>
<p>We ship to addresses in the United States only.</p>
<ul>
<li><strong>Standard:</strong> 7–15 business days after processing. Cost is calculated at checkout.</li>
<li><strong>Expedited:</strong> 3–7 business days after processing. Cost is calculated at checkout.</li>
</ul>
<p>The store banner advertises free shipping over $50 when that rate is offered. The price shown at checkout is the price you pay.</p>
<h2>Before a school play or Halloween</h2>
<p>Order early enough to try the costume on. A size exchange still has to ship, and we cannot guarantee it arrives if you request it the week of the event.</p>`,
  },
  {
    handle: "returns",
    title: "Returns",
    seoTitle: "Returns & Exchanges | Ivory Crown Collective",
    seoDescription:
      "30-day returns and exchanges at Ivory Crown Collective. Items must be unworn. A 10% restocking fee applies.",
    body: `<p>You have 30 days from the delivery date to request a return or exchange. Full policy: <a href="/policies/refund-policy">Return policy</a>.</p>
<h2>Condition</h2>
<p>Items must be unworn, unwashed, and in original condition with tags. All items are subject to a 10% restocking fee.</p>
<h2>Event costumes</h2>
<p>Halloween, school plays, recitals, and pageants are date-specific. Request a size exchange as soon as you try the costume on. We cannot guarantee a replacement arrives if the request is too close to the event.</p>
<p>Questions: use the <a href="/pages/contact">contact page</a>.</p>`,
  },
  {
    handle: "size-guide",
    title: "Size Guide",
    seoTitle: "Size Guide | Ivory Crown Collective",
    seoDescription:
      "How to measure for Ivory Crown Collective apparel and kids costumes. Use the size notes on each product.",
    body: `<p>Every product has its own size notes. Measure before you order, and compare those numbers to the chart on the product — do not guess from age alone.</p>
<h2>Kids costumes</h2>
<ul>
<li>Height, from the floor to the top of the head, without shoes.</li>
<li>Chest, around the fullest part.</li>
<li>Waist, around the natural waist.</li>
<li>Hip, around the fullest part.</li>
</ul>
<p>Shop by age as a starting point: <a href="/collections/toddler">Toddler</a>, <a href="/collections/little-kids">Little Kids</a>, <a href="/collections/big-kids">Big Kids</a>. If a measurement falls between sizes, choose the larger size for costumes worn over clothes.</p>
<h2>Women and men apparel</h2>
<p>Use the same chest, waist, and hip measurements and match them to the chart on that product. Brand fits differ. If you are between sizes, check whether the description says the item runs small.</p>
<p>Need a different size after it arrives? See <a href="/pages/returns">Returns</a>. Order early when the costume is for a specific date.</p>`,
  },
  {
    handle: "about",
    title: "About",
    seoTitle: "About Ivory Crown Collective",
    seoDescription:
      "Ivory Crown Collective is a US shop for women's and men's apparel and kids costumes for school, Halloween, and holidays.",
    body: `<p>Ivory Crown Collective is a United States shop for women's apparel, men's apparel, and kids costumes — school plays, book character day, Halloween, and holidays.</p>
<p>Shop the four catalogs: <a href="/collections/women">Women</a>, <a href="/collections/men">Men</a>, <a href="/collections/costumes">Costumes</a>, and <a href="/collections/holiday-seasonal">Holiday &amp; Seasonal</a>.</p>
<p>Orders are processed in 1–3 business days and ship inside the US. You have 30 days after delivery to start a return or exchange. Read <a href="/pages/shipping">Shipping</a>, <a href="/pages/returns">Returns</a>, and the <a href="/pages/size-guide">Size guide</a> before you order a costume for a specific date.</p>`,
  },
  {
    handle: "faq",
    title: "FAQ",
    seoTitle: "FAQ | Shipping, Sizing & Returns | Ivory Crown",
    seoDescription:
      "Answers on shipping times, US delivery, kids costume sizing, and 30-day returns at Ivory Crown Collective.",
    body: `<h2>Where do you ship?</h2>
<p>United States addresses only. Standard delivery is typically 7–15 business days after processing. Expedited is typically 3–7 business days. The checkout rate is the rate that applies.</p>
<h2>How fast do orders ship?</h2>
<p>We process orders in 1–3 business days. Orders placed on weekends or holidays start the next business day.</p>
<h2>Is there free shipping?</h2>
<p>The store banner advertises free shipping over $50 when that rate is offered. Confirm the shipping price at checkout.</p>
<h2>How do I pick a costume size?</h2>
<p>Measure height, chest, waist, and hip, then compare them to the chart on the product. Age collections (Toddler, Little Kids, Big Kids) are a starting point, not a guarantee. See the <a href="/pages/size-guide">size guide</a>.</p>
<h2>Can I return a costume?</h2>
<p>Yes, within 30 days of delivery if it is unworn, unwashed, and in original condition. A 10% restocking fee applies. Order early if you may need a size exchange before a play or Halloween.</p>
<h2>What do you sell?</h2>
<p>Women's apparel and accessories, men's apparel and accessories, kids costumes, and seasonal holiday finds.</p>`,
  },
];

async function collectionByHandle(handle) {
  const data = await gql(
    `query ($q: String!) {
      collections(first: 1, query: $q) {
        nodes { id handle title productsCount { count } }
      }
    }`,
    { q: `handle:${handle}` },
  );
  return data.collections.nodes[0] || null;
}

async function updateCollections() {
  for (const col of COLLECTIONS) {
    const node = await collectionByHandle(col.handle);
    if (!node) {
      console.warn(`missing collection ${col.handle}`);
      continue;
    }
    const res = await gql(
      `mutation ($input: CollectionInput!) {
        collectionUpdate(input: $input) {
          collection { handle }
          userErrors { field message }
        }
      }`,
      {
        input: {
          id: node.id,
          descriptionHtml: col.html,
          seo: { title: col.seoTitle, description: col.seoDescription },
        },
      },
    );
    const errors = res.collectionUpdate.userErrors;
    console.log(
      `collection ${col.handle}`,
      errors?.length ? errors : "ok",
    );
  }
}

async function hideEmpty() {
  const metafields = [];
  for (const handle of HIDE_HANDLES) {
    const node = await collectionByHandle(handle);
    if (!node) continue;
    const count = node.productsCount?.count ?? 0;
    if (count > 0 && handle !== "mens-clothing-retired" && handle !== "frontpage") {
      console.log(`skip hide ${handle} count=${count}`);
      continue;
    }
    metafields.push({
      ownerId: node.id,
      namespace: "seo",
      key: "hidden",
      type: "number_integer",
      value: "1",
    });
  }
  if (!metafields.length) return;
  const res = await gql(
    `mutation ($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { key }
        userErrors { field message }
      }
    }`,
    { metafields },
  );
  console.log("hide collections", res.metafieldsSet.userErrors?.length ? res.metafieldsSet.userErrors : "ok");
}

async function setShopSeo() {
  const shop = await gql(`{ shop { id name } }`);
  const res = await gql(
    `mutation ($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { key }
        userErrors { field message }
      }
    }`,
    {
      metafields: [
        {
          ownerId: shop.shop.id,
          namespace: "global",
          key: "title_tag",
          type: "single_line_text_field",
          value: "Ivory Crown Collective | Costumes & Apparel",
        },
        {
          ownerId: shop.shop.id,
          namespace: "global",
          key: "description_tag",
          type: "single_line_text_field",
          value:
            "Shop kids costumes for Halloween and school plays, plus women's and men's apparel. US shipping and 30-day returns.",
        },
      ],
    },
  );
  console.log(
    "shop seo",
    shop.shop.name,
    res.metafieldsSet.userErrors?.length ? res.metafieldsSet.userErrors : "ok",
  );
}

async function upsertPages() {
  for (const page of PAGES) {
    const existing = await gql(
      `query ($q: String!) { pages(first: 1, query: $q) { nodes { id } } }`,
      { q: `handle:${page.handle}` },
    );
    const metafields = [
      {
        namespace: "global",
        key: "title_tag",
        type: "single_line_text_field",
        value: page.seoTitle,
      },
      {
        namespace: "global",
        key: "description_tag",
        type: "single_line_text_field",
        value: page.seoDescription,
      },
    ];
    const node = existing.pages.nodes[0];
    if (node) {
      const res = await gql(
        `mutation ($id: ID!, $page: PageUpdateInput!) {
          pageUpdate(id: $id, page: $page) {
            page { handle }
            userErrors { field message }
          }
        }`,
        {
          id: node.id,
          page: {
            title: page.title,
            body: page.body,
            isPublished: true,
            metafields,
          },
        },
      );
      console.log(`page ${page.handle}`, res.pageUpdate.userErrors?.length ? res.pageUpdate.userErrors : "updated");
    } else {
      const res = await gql(
        `mutation ($page: PageCreateInput!) {
          pageCreate(page: $page) {
            page { handle }
            userErrors { field message }
          }
        }`,
        {
          page: {
            title: page.title,
            handle: page.handle,
            body: page.body,
            isPublished: true,
            metafields,
          },
        },
      );
      console.log(`page ${page.handle}`, res.pageCreate.userErrors?.length ? res.pageCreate.userErrors : "created");
    }
  }
}

async function productSeo() {
  let cursor = null;
  let updated = 0;
  let scanned = 0;
  for (;;) {
    const data = await gql(
      `query ($cursor: String) {
        products(first: 40, after: $cursor, query: "status:active") {
          pageInfo { hasNextPage endCursor }
          nodes { id title description seo { title description } }
        }
      }`,
      { cursor },
    );
    for (const product of data.products.nodes) {
      scanned++;
      const hasSeo =
        (product.seo?.title || "").trim().length > 8 &&
        (product.seo?.description || "").trim().length > 40;
      if (hasSeo) continue;
      const title = clip(product.seo?.title || product.title, 60);
      const fromBody = plain(product.description);
      const description = clip(
        product.seo?.description ||
          (fromBody.length > 40
            ? fromBody
            : `${product.title}. Shop at Ivory Crown Collective. US shipping and 30-day returns.`),
        155,
      );
      const res = await gql(
        `mutation ($input: ProductInput!) {
          productUpdate(input: $input) {
            product { id }
            userErrors { field message }
          }
        }`,
        { input: { id: product.id, seo: { title, description } } },
      );
      const errors = res.productUpdate.userErrors;
      if (errors?.length) {
        console.warn("product seo", product.title, errors);
      } else {
        updated++;
      }
    }
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }
  console.log(`product seo scanned=${scanned} updated=${updated}`);
}

async function colId(handle) {
  const node = await collectionByHandle(handle);
  return node?.id;
}

async function updateMenu() {
  const data = await gql(`{
    menus(first: 20) { nodes { id handle title } }
  }`);
  const main =
    data.menus.nodes.find((m) => m.handle === "main-menu") ||
    data.menus.nodes.find((m) => /main/i.test(m.handle));
  if (!main) {
    console.warn("no main menu");
    return;
  }
  const item = async (title, handle, children = []) => {
    const resourceId = await colId(handle);
    if (!resourceId) return null;
    const items = [];
    for (const child of children) {
      const id = await colId(child.handle);
      if (id) items.push({ title: child.title, type: "COLLECTION", resourceId: id });
    }
    return { title, type: "COLLECTION", resourceId, items };
  };
  const items = [
    await item("Women", "women", [
      { title: "Apparel", handle: "women-apparel" },
      { title: "Accessories", handle: "women-accessories" },
      { title: "Beauty", handle: "beauty" },
    ]),
    await item("Men", "men", [
      { title: "Apparel", handle: "men-apparel" },
      { title: "Accessories", handle: "men-accessories" },
    ]),
    await item("Costumes", "costumes", [
      { title: "Toddler", handle: "toddler" },
      { title: "Little Kids", handle: "little-kids" },
      { title: "Big Kids", handle: "big-kids" },
      { title: "Book Character Day", handle: "book-character-day" },
    ]),
    await item("Holiday & Seasonal", "holiday-seasonal", [
      { title: "Halloween", handle: "halloween" },
      { title: "Under $40", handle: "under-40" },
      { title: "New Arrivals", handle: "new-arrivals" },
    ]),
    { title: "FAQ", type: "HTTP", url: "/pages/faq", items: [] },
  ].filter(Boolean);

  const res = await gql(
    `mutation ($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
      menuUpdate(id: $id, title: $title, items: $items) {
        menu { handle }
        userErrors { field message }
      }
    }`,
    { id: main.id, title: main.title || "Main menu", items },
  );
  console.log("menu", res.menuUpdate.userErrors?.length ? res.menuUpdate.userErrors : "ok");
}

async function upsertTheme() {
  const files = ["templates/index.json", "sections/header-group.json"].map((filename) => {
    const local =
      filename === "templates/index.json"
        ? path.join(ROOT, "theme/index.json")
        : path.join(ROOT, "theme/header-group.json");
    return {
      filename,
      body: { type: "TEXT", value: fs.readFileSync(local, "utf8") },
    };
  });
  const res = await gql(
    `mutation ($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
      themeFilesUpsert(themeId: $themeId, files: $files) {
        upsertedFiles { filename }
        userErrors { field message }
      }
    }`,
    { themeId: THEME_ID, files },
  );
  console.log(
    "theme",
    res.themeFilesUpsert.userErrors?.length
      ? res.themeFilesUpsert.userErrors
      : res.themeFilesUpsert.upsertedFiles.map((f) => f.filename).join(","),
  );
}

async function main() {
  await setShopSeo();
  await updateCollections();
  await hideEmpty();
  await upsertPages();
  await productSeo();
  try {
    await updateMenu();
  } catch (error) {
    console.warn("menu skipped", error.message);
  }
  try {
    await upsertTheme();
  } catch (error) {
    console.warn("theme skipped", error.message);
  }
  console.log("visibility pass done");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
