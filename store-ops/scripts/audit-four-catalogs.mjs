#!/usr/bin/env node
/**
 * Audit catalog into Women / Men / Costumes / Holiday-Seasonal.
 * Archives grocery/supplement/gadget noise. Retags remaining products.
 * Writes store-ops/reports/four-catalog-audit.json
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SHOP = process.env.SHOPIFY_SHOP || "1wtpc0-c2.myshopify.com";
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-01";
const DRY = process.env.DRY_RUN === "1";

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

const NOISE_RE =
  /\b(protein|collagen\+|collagen blend|spirulina|mushroom complex|supplement|electrolyte|hydration multiplier|mre\b|energybits|meal booster|cheddar|cheesy cheese|phorm|level-1 bar|grocery|emf\b|emf shield|light therapy x|redcon1|liquid i\.?v\.?|freshcap|pasteur pharmacy|duo grocery|goal five|ultimate sport nutrition)\b/i;

const PRESTIGE_FRAG_RE =
  /\b(tom ford|acqua di parma|oud wood|quercia)\b/i;

const BEAUTY_KEEP_RE =
  /\b(beauty|skincare|skin care|soap|serum|lotion|moisturizer|sunscreen|spf|toner|kojic|turmeric|shampoo|cosmetic|hand soap|tallow|lip\b|joseon|amvital|nava beauty|prai|asia beautymall)\b/i;

const COSTUME_RE =
  /\b(costume|cosplay|school play|halloween|book character|dress-up|dress up|toga|recital|nativity|masquerade|cape set|jumpsuit costume)\b/i;

const KIDS_RE =
  /\b(for kids|kids'|children|toddler|2t|3t|4t|audience:kids|age:toddler|age:little|age:big|dept:kids)\b/i;

const WOMEN_RE =
  /\b(women'?s?|woman|ladies|female|blouse|wrap dress|bodice|bra top|workout shorts|twirl dress|lounge set|dept:women)\b/i;

const MEN_RE =
  /\b(men'?s?|for men|gentleman|male polo|men'?s tee|men'?s shirt|men'?s pant|dept:men)\b/i;

const APPAREL_RE =
  /\b(dress|blouse|tee|t-shirt|shirt|skirt|shorts|pants|jumpsuit|jacket|top|romper|legging|hoodie|sweater|polo|hoodie)\b/i;

const ACCESSORY_RE =
  /\b(accessory|wand|mask|cape|jewelry|belt|handbag|earrings|scarf|beanie|cap\b|hat\b|bag\b|socks)\b/i;

const SEASONAL_RE =
  /\b(halloween|fall|autumn|holiday|christmas|thanksgiving|seasonal|gift set|sibling)\b/i;

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
  "dept:seasonal",
]);
const MERCH_SEASONAL = "merch:seasonal";

function shouldArchive(product) {
  const blob = `${product.title} ${(product.tags || []).join(" ")} ${product.vendor || ""} ${product.productType || ""}`;
  if (NOISE_RE.test(blob)) return true;
  // Sold-out prestige fragrance cluttering women rails — archive unless clearly beauty-kept soap/skincare
  if (PRESTIGE_FRAG_RE.test(blob) && !BEAUTY_KEEP_RE.test(product.title)) return true;
  return false;
}

function classify(product) {
  const title = product.title || "";
  const tags = product.tags || [];
  const tagStr = tags.join(" ");
  const blob = `${title} ${tagStr} ${product.productType || ""} ${product.vendor || ""}`;

  const seasonal =
    SEASONAL_RE.test(blob) ||
    tags.includes("occasion:halloween") ||
    tags.includes(MERCH_SEASONAL);

  if (BEAUTY_KEEP_RE.test(blob) && !COSTUME_RE.test(title)) {
    return {
      primary: "women",
      dept: "dept:women",
      typeTag: "type:beauty",
      productType: "Beauty",
      seasonal: false,
      stripKids: true,
    };
  }

  if (MEN_RE.test(blob) && !KIDS_RE.test(blob) && !COSTUME_RE.test(title)) {
    const accessory = ACCESSORY_RE.test(blob) && !APPAREL_RE.test(title);
    return {
      primary: "men",
      dept: "dept:men",
      typeTag: accessory ? "type:accessory" : "type:apparel",
      productType: accessory ? "Accessory" : "Apparel",
      seasonal: false,
      stripKids: true,
    };
  }

  if (
    (WOMEN_RE.test(blob) || product.productType === "Apparel") &&
    !KIDS_RE.test(blob) &&
    !COSTUME_RE.test(title) &&
    product.productType !== "Costume"
  ) {
    const accessory = ACCESSORY_RE.test(blob) && !APPAREL_RE.test(title);
    return {
      primary: "women",
      dept: "dept:women",
      typeTag: accessory ? "type:accessory" : "type:apparel",
      productType: accessory ? "Accessory" : "Apparel",
      seasonal: seasonal && !accessory ? false : seasonal,
      stripKids: true,
    };
  }

  // Costumes / kids default
  const isAccessory =
    /\b(accessory pack|wand|crown|mask pack|boot covers)\b/i.test(title) &&
    !/\bcostume\b/i.test(title);
  return {
    primary: seasonal && !isAccessory ? "seasonal" : "costumes",
    dept: "dept:kids",
    typeTag: isAccessory ? "type:accessory" : "type:costume",
    productType: isAccessory ? "Accessory" : "Costume",
    seasonal,
    stripKids: false,
  };
}

function mergeTags(existing, c) {
  let tags = (existing || []).filter(
    (t) => !TYPE_TAGS.has(t) && !DEPT_TAGS.has(t) && t !== MERCH_SEASONAL,
  );
  if (c.stripKids) {
    tags = tags.filter(
      (t) =>
        !t.startsWith("age:") &&
        !t.startsWith("occasion:") &&
        t !== "audience:kids",
    );
  }
  tags.push(c.dept);
  tags.push(c.typeTag);
  if (c.typeTag === "type:beauty") tags.push("dept:beauty");
  if (c.seasonal) {
    tags.push("dept:seasonal");
    tags.push(MERCH_SEASONAL);
  }
  // Halloween costumes also stay kids + seasonal
  if ((existing || []).includes("occasion:halloween") && !c.stripKids) {
    if (!tags.includes("occasion:halloween")) tags.push("occasion:halloween");
    if (!tags.includes("dept:seasonal")) tags.push("dept:seasonal");
    if (!tags.includes(MERCH_SEASONAL)) tags.push(MERCH_SEASONAL);
  }
  return [...new Set(tags)];
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
            handle
            status
            productType
            vendor
            tags
            totalInventory
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
  const report = {
    generatedAt: new Date().toISOString(),
    total: products.length,
    archive: [],
    byPrimary: { women: [], men: [], costumes: [], seasonal: [] },
    updated: 0,
    archived: 0,
    skipped: 0,
  };

  for (const p of products) {
    if (p.status === "ARCHIVED") {
      report.skipped++;
      continue;
    }

    if (shouldArchive(p)) {
      report.archive.push({
        id: p.id,
        title: p.title,
        handle: p.handle,
        vendor: p.vendor,
      });
      if (!DRY) {
        const data = await gql(
          `mutation ($input: ProductInput!) {
            productUpdate(input: $input) {
              product { id status }
              userErrors { field message }
            }
          }`,
          { input: { id: p.id, status: "ARCHIVED" } },
        );
        if (data.productUpdate.userErrors?.length) {
          console.error("archive fail", p.title, data.productUpdate.userErrors);
        } else {
          report.archived++;
        }
      }
      continue;
    }

    const c = classify(p);
    // If halloween-tagged costume, primary catalog seasonal for merchandising dual-tag
    const primary =
      c.seasonal && c.dept === "dept:kids" ? "seasonal" : c.primary;
    report.byPrimary[primary]?.push({
      title: p.title,
      handle: p.handle,
      type: c.productType,
    }) || report.byPrimary.costumes.push({ title: p.title, handle: p.handle });

    const tags = mergeTags(p.tags, c);
    const sameType = p.productType === c.productType;
    const sameTags =
      tags.length === (p.tags || []).length &&
      tags.every((t) => (p.tags || []).includes(t));
    if (sameType && sameTags) continue;

    if (DRY) {
      report.updated++;
      continue;
    }

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
    report.updated++;
    if (report.updated % 25 === 0) console.log(`updated ${report.updated}...`);
  }

  const counts = Object.fromEntries(
    Object.entries(report.byPrimary).map(([k, v]) => [k, v.length]),
  );
  console.log("primary counts (active after classify)", counts);
  console.log(
    `archive candidates=${report.archive.length} archived=${report.archived} retagged=${report.updated}`,
  );

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const out = path.join(__dirname, "../reports/four-catalog-audit.json");
  fs.writeFileSync(
    out,
    JSON.stringify(
      {
        ...report,
        byPrimary: counts,
        archiveTitles: report.archive.map((a) => a.title),
        samples: {
          women: report.byPrimary.women.slice(0, 8),
          men: report.byPrimary.men.slice(0, 8),
          costumes: report.byPrimary.costumes.slice(0, 8),
          seasonal: report.byPrimary.seasonal.slice(0, 8),
        },
      },
      null,
      2,
    ),
  );
  console.log("wrote", out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
