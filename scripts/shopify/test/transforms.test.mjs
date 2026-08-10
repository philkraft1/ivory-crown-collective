import assert from "node:assert/strict";
import test from "node:test";
import {
  decideDispositions,
  problematicOptions,
  rewrittenDescription,
  roundedRetailPrice,
  sizingPlan,
  taxonomyFor,
  titleSuggestion,
} from "../lib/transforms.mjs";

function product(overrides = {}) {
  return {
    id: "gid://shopify/Product/1",
    createdAt: "2026-08-01T00:00:00Z",
    title:
      "Cosplay Halloween Tin Man Costume for Kids, The Wizard of Oz Iron Man Outfit",
    descriptionHtml:
      '<p>Material: Polyester</p><p>Unit: cm</p><table><tr><th>Size</th><th>Chest</th></tr><tr><td>XS/2-4yrs</td><td>82</td></tr></table><img src="https://shopifyfile.oss-accelerate.aliyuncs.com/example.jpg">',
    vendor: "eprolo",
    productType: "",
    tags: [],
    status: "ACTIVE",
    category: null,
    options: [
      {
        id: "gid://shopify/ProductOption/1",
        name: "Suitable for height",
        position: 1,
        optionValues: [
          {
            id: "gid://shopify/ProductOptionValue/1",
            name: "XS",
            hasVariants: true,
          },
        ],
      },
    ],
    variants: {
      nodes: [
        {
          id: "gid://shopify/ProductVariant/1",
          price: "37.82",
          compareAtPrice: null,
          sku: "TIN-XS",
        },
      ],
    },
    media: {
      nodes: [
        {
          __typename: "MediaImage",
          id: "gid://shopify/MediaImage/1",
          alt: "",
        },
      ],
    },
    ...overrides,
  };
}

test("niche disposition keeps kids and archives off-niche or adult-only products", () => {
  const kids = product();
  const apparel = product({
    id: "gid://shopify/Product/2",
    title: "Women's V-Neck Ruffle Blouse",
    descriptionHtml: "<p>Everyday blouse</p>",
  });
  const adultCostume = product({
    id: "gid://shopify/Product/3",
    title: "Women's Nightclub Bunny Costume",
    descriptionHtml: "<p>Adult party costume</p>",
  });

  const result = decideDispositions([kids, apparel, adultCostume]);
  assert.equal(result[0].proposedStatus, "ACTIVE");
  assert.deepEqual(result[1].reasons, ["off-niche-apparel"]);
  assert.deepEqual(result[2].reasons, ["adult-only-costume"]);
});

test("duplicate handling keeps the listing with better image coverage", () => {
  const first = product({
    id: "gid://shopify/Product/1",
    media: { nodes: [{ id: "image-1" }] },
  });
  const better = product({
    id: "gid://shopify/Product/2",
    media: { nodes: [{ id: "image-1" }, { id: "image-2" }] },
  });

  const result = decideDispositions([first, better]);
  assert.ok(result[0].reasons.includes("duplicate-title"));
  assert.ok(!result[1].reasons.includes("duplicate-title"));
});

test("taxonomy creates occasion, character, theme, age, and gender tags", () => {
  const taxonomy = taxonomyFor(product());
  assert.equal(taxonomy.productType, "Kids' Costumes");
  assert.ok(taxonomy.tags.includes("occasion:book-character-day"));
  assert.ok(taxonomy.tags.includes("occasion:halloween"));
  assert.ok(taxonomy.tags.includes("character:tin-man"));
  assert.ok(taxonomy.tags.includes("theme:storybook"));
  assert.ok(taxonomy.tags.includes("age:2-4"));
  assert.ok(taxonomy.tags.includes("gender:unisex"));
});

test("safe title suggestions stay within search-friendly length", () => {
  const suggestion = titleSuggestion(product());
  assert.equal(suggestion.confidence, "safe");
  assert.ok(suggestion.suggestedTitle.includes("Tin Man"));
  assert.ok(suggestion.suggestedTitle.length <= 70);
});

test("description removes supplier image and converts a size table", () => {
  const description = rewrittenDescription(product());
  assert.ok(!description.includes("aliyuncs"));
  assert.ok(description.includes("82 cm / 32.3 in"));
  assert.ok(description.includes("Props, wigs, shoes, and accessories"));
});

test("sizing only maps age ranges explicitly found in source copy", () => {
  const plan = sizingPlan(product());
  assert.deepEqual(plan.option, {
    id: "gid://shopify/ProductOption/1",
    name: "Size",
  });
  assert.deepEqual(plan.optionValuesToUpdate, [
    {
      id: "gid://shopify/ProductOptionValue/1",
      name: "XS / 2-4 years",
    },
  ]);
  assert.deepEqual(plan.unmappedValues, []);
});

test("retail pricing rounds upward without creating compare-at prices", () => {
  assert.equal(roundedRetailPrice("37.82"), "37.95");
  assert.equal(roundedRetailPrice("39.98"), "39.99");
  assert.equal(roundedRetailPrice("45.99"), "45.99");
});

test("problematic option values are reported case-insensitively", () => {
  const affected = product({
    options: [
      {
        id: "option-1",
        name: "Color",
        optionValues: [
          { id: "value-1", name: "Black girl", hasVariants: true },
          { id: "value-2", name: "Blue", hasVariants: true },
        ],
      },
    ],
  });

  assert.deepEqual(problematicOptions(affected), [
    { option: "Color", value: "Black girl" },
  ]);
});
