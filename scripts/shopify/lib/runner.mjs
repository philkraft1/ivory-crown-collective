import {
  decideDispositions,
  imageAlt,
  problematicOptions,
  rewrittenDescription,
  roundedRetailPrice,
  sizingPlan,
  taxonomyFor,
  titleSuggestion,
} from "./transforms.mjs";
import { executionMode, getConfig } from "./config.mjs";
import {
  fetchProducts,
  fetchStoreIdentity,
  timestamp,
  updateFiles,
  updateOption,
  updateProduct,
  updateVariants,
  writeJson,
} from "./shopify.mjs";

function summarize(products) {
  return {
    products: products.length,
    variants: products.reduce(
      (total, product) => total + product.variants.nodes.length,
      0,
    ),
    images: products.reduce(
      (total, product) => total + product.media.nodes.length,
      0,
    ),
    active: products.filter((product) => product.status === "ACTIVE").length,
    vendors: Object.fromEntries(
      Object.entries(
        products.reduce((counts, product) => {
          counts[product.vendor || "(blank)"] =
            (counts[product.vendor || "(blank)"] || 0) + 1;
          return counts;
        }, {}),
      ).sort((left, right) => right[1] - left[1]),
    ),
  };
}

async function context() {
  const config = getConfig();
  const [shop, products] = await Promise.all([
    fetchStoreIdentity(),
    fetchProducts(),
  ]);

  if (shop.myshopifyDomain !== config.storeDomain) {
    throw new Error(
      `Store identity mismatch: expected ${config.storeDomain}, received ${shop.myshopifyDomain}.`,
    );
  }

  return { config, products, shop };
}

function keepProducts(products) {
  const disposition = new Map(
    decideDispositions(products).map((item) => [item.id, item]),
  );
  return products.filter(
    (product) => disposition.get(product.id)?.proposedStatus !== "ARCHIVED",
  );
}

async function writeReport(step, mode, shop, payload) {
  const filename = `${step}-${timestamp()}.json`;
  const path = await writeJson(filename, {
    generatedAt: new Date().toISOString(),
    mode: mode.label,
    shop: {
      id: shop.id,
      name: shop.name,
      myshopifyDomain: shop.myshopifyDomain,
      primaryDomain: shop.primaryDomain,
    },
    ...payload,
  });
  console.log(`${mode.label}: wrote ${path}`);
  return path;
}

async function auditExport(mode) {
  const { products, shop } = await context();
  await writeReport("01-audit-export", mode, shop, {
    summary: summarize(products),
    warnings: {
      eproloVendor: products.filter(
        (product) => product.vendor.toLocaleLowerCase("en-US") === "eprolo",
      ).length,
      emptyProductType: products.filter((product) => !product.productType).length,
      emptyTags: products.filter((product) => product.tags.length === 0).length,
      emptyAltText: products.reduce(
        (total, product) =>
          total + product.media.nodes.filter((media) => !media.alt).length,
        0,
      ),
      zeroImages: products
        .filter((product) => product.media.nodes.length === 0)
        .map((product) => ({ id: product.id, title: product.title })),
      problematicOptions: products.flatMap((product) =>
        problematicOptions(product).map((option) => ({
          id: product.id,
          title: product.title,
          ...option,
        })),
      ),
    },
    products,
  });
}

async function vendorBrand(mode) {
  const { products, shop } = await context();
  const changes = products
    .filter((product) => product.vendor !== "Ivory Crown Collective")
    .map((product) => ({
      id: product.id,
      title: product.title,
      from: product.vendor,
      to: "Ivory Crown Collective",
    }));

  await writeReport("02-vendor-brand", mode, shop, { changes });
  if (!mode.apply) return;

  for (const change of changes) {
    await updateProduct({
      id: change.id,
      vendor: change.to,
    });
  }
  console.log(`APPLY: updated ${changes.length} product vendors.`);
}

async function prune(mode) {
  const { products, shop } = await context();
  const dispositions = decideDispositions(products);
  const changes = dispositions.filter(
    (item) =>
      item.proposedStatus === "ARCHIVED" && item.currentStatus !== "ARCHIVED",
  );

  await writeReport("03-prune", mode, shop, {
    strategy:
      "Keep kids/family costumes. Archive zero-image, duplicate, off-niche apparel, and adult-only costume products.",
    changes,
    kept: dispositions.filter((item) => item.proposedStatus !== "ARCHIVED"),
  });
  if (!mode.apply) return;

  for (const change of changes) {
    await updateProduct({ id: change.id, status: "ARCHIVED" });
  }
  console.log(`APPLY: archived ${changes.length} products.`);
}

async function taxonomy(mode) {
  const { products, shop } = await context();
  const kept = keepProducts(products);
  const changes = kept.map((product) => ({
    id: product.id,
    title: product.title,
    current: {
      productType: product.productType,
      tags: product.tags,
      category: product.category,
    },
    proposed: taxonomyFor(product),
    categoryAction:
      "Select Apparel & Accessories > Costumes & Accessories > Costumes in Shopify Admin; no taxonomy GID is guessed by this script.",
  }));

  await writeReport("04-taxonomy", mode, shop, { changes });
  if (!mode.apply) return;

  for (const change of changes) {
    await updateProduct({
      id: change.id,
      productType: change.proposed.productType,
      tags: change.proposed.tags,
    });
  }
  console.log(`APPLY: classified ${changes.length} products.`);
}

async function titles(mode) {
  const { products, shop } = await context();
  const kept = keepProducts(products);
  const suggestions = kept.map((product) => ({
    id: product.id,
    currentTitle: product.title,
    ...titleSuggestion(product),
  }));
  const titleCounts = suggestions.reduce((counts, suggestion) => {
    counts[suggestion.suggestedTitle] =
      (counts[suggestion.suggestedTitle] || 0) + 1;
    return counts;
  }, {});
  const safeChanges = suggestions.filter(
    (suggestion) =>
      suggestion.confidence === "safe" &&
      suggestion.currentTitle !== suggestion.suggestedTitle &&
      titleCounts[suggestion.suggestedTitle] === 1,
  );
  const manualReview = suggestions.filter(
    (suggestion) =>
      suggestion.confidence !== "safe" ||
      titleCounts[suggestion.suggestedTitle] > 1,
  );

  await writeReport("05-titles", mode, shop, { safeChanges, manualReview });
  if (!mode.apply) return;

  for (const change of safeChanges) {
    await updateProduct({
      id: change.id,
      title: change.suggestedTitle,
      seo: {
        title: change.suggestedTitle,
        description:
          "Shop a kids' costume for school plays, book character day, pageants, recitals, and Halloween at Ivory Crown Collective.",
      },
    });
  }
  console.log(
    `APPLY: updated ${safeChanges.length} titles; ${manualReview.length} require review.`,
  );
}

async function descriptions(mode) {
  const { products, shop } = await context();
  const kept = keepProducts(products);
  const changes = kept.map((product) => ({
    id: product.id,
    title: product.title,
    supplierImagesRemoved: /aliyuncs|alicdn|shopifyfile\.oss-accelerate/iu.test(
      product.descriptionHtml,
    ),
    proposedDescriptionHtml: rewrittenDescription(product),
  }));

  await writeReport("06-descriptions", mode, shop, { changes });
  if (!mode.apply) return;

  for (const change of changes) {
    await updateProduct({
      id: change.id,
      descriptionHtml: change.proposedDescriptionHtml,
    });
  }
  console.log(`APPLY: rewrote ${changes.length} descriptions.`);
}

async function sizing(mode) {
  const { products, shop } = await context();
  const changes = keepProducts(products).flatMap((product) => {
    const plan = sizingPlan(product);
    return plan ? [{ id: product.id, title: product.title, ...plan }] : [];
  });

  await writeReport("07-sizing", mode, shop, {
    changes,
    note:
      "Only age mappings explicitly present in each source description are applied. Unmapped values remain unchanged.",
  });
  if (!mode.apply) return;

  for (const change of changes) {
    await updateOption(
      change.id,
      change.option,
      change.optionValuesToUpdate,
    );
  }
  console.log(`APPLY: normalized ${changes.length} size option names.`);
}

async function pricing(mode) {
  const { products, shop } = await context();
  const changes = keepProducts(products).map((product) => ({
    id: product.id,
    title: product.title,
    variants: product.variants.nodes
      .map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        from: variant.price,
        to: roundedRetailPrice(variant.price),
        compareAtPrice: variant.compareAtPrice,
      }))
      .filter((variant) => variant.from !== variant.to),
  }));
  const actionable = changes.filter((change) => change.variants.length > 0);

  await writeReport("08-pricing", mode, shop, {
    policy:
      "Round retail prices upward to .95 or .99. Existing compare-at prices are preserved; fake discount anchors are never created.",
    changes: actionable,
  });
  if (!mode.apply) return;

  for (const change of actionable) {
    await updateVariants(
      change.id,
      change.variants.map((variant) => ({
        id: variant.id,
        price: variant.to,
      })),
    );
  }
  console.log(`APPLY: repriced ${actionable.length} products.`);
}

async function altText(mode) {
  const { products, shop } = await context();
  const files = keepProducts(products).flatMap((product) =>
    product.media.nodes.flatMap((media, index) => {
      if (media.__typename !== "MediaImage" || media.alt) return [];
      return [
        {
          id: media.id,
          alt: imageAlt(product, index),
          productId: product.id,
          productTitle: product.title,
        },
      ];
    }),
  );

  await writeReport("09-alt-text", mode, shop, { files });
  if (!mode.apply) return;

  await updateFiles(files.map(({ id, alt }) => ({ id, alt })));
  console.log(`APPLY: added alt text to ${files.length} images.`);
}

async function imageAudit(mode) {
  const { products, shop } = await context();
  const findings = keepProducts(products)
    .filter((product) => product.media.nodes.length < 5)
    .map((product) => ({
      id: product.id,
      title: product.title,
      imageCount: product.media.nodes.length,
      action:
        product.media.nodes.length === 0
          ? "Keep archived until images are supplied."
          : `Add ${5 - product.media.nodes.length} original or supplier-approved images.`,
    }));

  await writeReport("10-image-audit", mode, shop, {
    minimumRecommendedImages: 5,
    findings,
  });
}

const STEPS = {
  "01-audit-export": auditExport,
  "02-vendor-brand": vendorBrand,
  "03-prune": prune,
  "04-taxonomy": taxonomy,
  "05-titles": titles,
  "06-descriptions": descriptions,
  "07-sizing": sizing,
  "08-pricing": pricing,
  "09-alt-text": altText,
  "10-image-audit": imageAudit,
};

export async function runStep(step) {
  const handler = STEPS[step];
  if (!handler) throw new Error(`Unknown Shopify migration step: ${step}`);
  const mode = executionMode();
  console.log(`${mode.label}: ${step}`);
  await handler(mode);
}

export async function main(step) {
  try {
    await runStep(step);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
