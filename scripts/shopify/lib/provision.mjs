import { executionMode, getConfig } from "./config.mjs";
import {
  createArticle,
  createCollection,
  createMenu,
  createPage,
  fetchBlogs,
  fetchCollections,
  fetchMenus,
  fetchPages,
  fetchStoreIdentity,
  timestamp,
  writeJson,
} from "./shopify.mjs";
import {
  ARTICLE_BLUEPRINTS,
  COLLECTION_BLUEPRINTS,
  MENU_BLUEPRINT,
  PAGE_BLUEPRINTS,
} from "./storefront-content.mjs";

function escapeHtml(value) {
  return String(value)
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&#39;");
}

export function planCollections(existingCollections, blueprints) {
  const byHandle = new Map(
    existingCollections.map((collection) => [collection.handle, collection]),
  );

  return blueprints.reduce(
    (plan, blueprint) => {
      const existing = byHandle.get(blueprint.handle);
      if (existing) {
        plan.existing.push({
          id: existing.id,
          handle: existing.handle,
          title: existing.title,
          expectedTitle: blueprint.title,
          action: "No automatic overwrite; review existing collection manually.",
        });
        return plan;
      }

      plan.toCreate.push({
        title: blueprint.title,
        handle: blueprint.handle,
        descriptionHtml: `<p>${escapeHtml(blueprint.description)}</p>`,
        sortOrder: "BEST_SELLING",
        seo: {
          title: `${blueprint.title} | Ivory Crown Collective`,
          description: blueprint.description,
        },
        sources: [
          {
            source: {
              title: `${blueprint.title} products`,
              targetType: "PRODUCTS",
              inclusion: {
                matchType: "ALL",
                conditions: [
                  {
                    productTag: {
                      relation: "TAGGED_WITH",
                      values: [blueprint.tag],
                      matchType: "ANY",
                    },
                  },
                ],
              },
            },
          },
        ],
      });
      return plan;
    },
    { toCreate: [], existing: [] },
  );
}

export function planPages(existingPages, blueprints) {
  const byHandle = new Map(existingPages.map((page) => [page.handle, page]));

  return blueprints.reduce(
    (plan, blueprint) => {
      const existing = byHandle.get(blueprint.handle);
      if (existing) {
        plan.existing.push({
          id: existing.id,
          handle: existing.handle,
          title: existing.title,
          published: existing.isPublished,
          action: "No automatic overwrite; preserve merchant-edited page.",
        });
        return plan;
      }

      plan.toCreate.push({
        title: blueprint.title,
        handle: blueprint.handle,
        body: blueprint.body,
        isPublished: false,
      });
      return plan;
    },
    { toCreate: [], existing: [] },
  );
}

export function planMenu(
  existingMenus,
  collections,
  pages,
  blueprint,
) {
  const existing = existingMenus.find(
    (menu) => menu.handle === blueprint.handle,
  );
  if (existing) {
    return {
      existing,
      missingResources: [],
      toCreate: null,
      action: "No automatic overwrite; assign or edit the existing menu manually.",
    };
  }

  const collectionsByHandle = new Map(
    collections.map((collection) => [collection.handle, collection]),
  );
  const pagesByHandle = new Map(pages.map((page) => [page.handle, page]));
  const missingResources = [];

  const groups = blueprint.groups.map((group) => ({
    title: group.title,
    type: "CATALOG",
    url: group.fallbackUrl,
    items: group.links.flatMap(([title, kind, handle]) => {
      const resource =
        kind === "collection"
          ? collectionsByHandle.get(handle)
          : pagesByHandle.get(handle);
      if (!resource) {
        missingResources.push(`${kind}:${handle}`);
        return [];
      }
      return [
        {
          title,
          type: kind === "collection" ? "COLLECTION" : "PAGE",
          resourceId: resource.id,
          url:
            kind === "collection"
              ? `/collections/${resource.handle}`
              : `/pages/${resource.handle}`,
          items: [],
        },
      ];
    }),
  }));

  const pageItems = blueprint.pages.flatMap(([title, handle]) => {
    const page = pagesByHandle.get(handle);
    if (!page) {
      missingResources.push(`page:${handle}`);
      return [];
    }
    return [
      {
        title,
        type: "PAGE",
        resourceId: page.id,
        url: `/pages/${page.handle}`,
        items: [],
      },
    ];
  });

  return {
    existing: null,
    missingResources,
    toCreate:
      missingResources.length === 0
        ? {
            title: blueprint.title,
            handle: blueprint.handle,
            items: [
              ...groups,
              ...pageItems,
              {
                title: "Contact",
                type: "HTTP",
                url: "/pages/contact",
                items: [],
              },
            ],
          }
        : null,
    action:
      missingResources.length === 0
        ? "Create an unassigned review menu; it does not replace the live main menu."
        : "Create collections/pages first, then rerun.",
  };
}

export function planArticles(blogs, blueprints) {
  const blog = blogs.find((candidate) => candidate.handle === "news") || blogs[0];
  if (!blog) {
    return {
      blog: null,
      toCreate: [],
      existing: [],
      action: "Create a blog container in Shopify Admin, then rerun.",
    };
  }

  const existingByHandle = new Map(
    blog.articles.nodes.map((article) => [article.handle, article]),
  );
  return blueprints.reduce(
    (plan, blueprint) => {
      const existing = existingByHandle.get(blueprint.handle);
      if (existing) {
        plan.existing.push({
          id: existing.id,
          title: existing.title,
          handle: existing.handle,
          isPublished: existing.isPublished,
          action: "No automatic overwrite; preserve merchant-edited article.",
        });
        return plan;
      }

      plan.toCreate.push({
        blogId: blog.id,
        title: blueprint.title,
        handle: blueprint.handle,
        summary: blueprint.summary,
        body: blueprint.body,
        tags: blueprint.tags,
        author: { name: "Ivory Crown Collective" },
        isPublished: false,
      });
      return plan;
    },
    {
      blog: { id: blog.id, title: blog.title, handle: blog.handle },
      toCreate: [],
      existing: [],
      action: "Create missing articles as drafts.",
    },
  );
}

async function verifiedShop() {
  const config = getConfig();
  const shop = await fetchStoreIdentity();
  if (shop.myshopifyDomain !== config.storeDomain) {
    throw new Error(
      `Store identity mismatch: expected ${config.storeDomain}, received ${shop.myshopifyDomain}.`,
    );
  }
  return shop;
}

async function report(name, mode, shop, plan) {
  const path = await writeJson(`${name}-${timestamp()}.json`, {
    generatedAt: new Date().toISOString(),
    mode: mode.label,
    shop: {
      id: shop.id,
      name: shop.name,
      myshopifyDomain: shop.myshopifyDomain,
      primaryDomain: shop.primaryDomain,
    },
    ...plan,
  });
  console.log(`${mode.label}: wrote ${path}`);
}

async function provisionCollections(mode) {
  const [shop, existingCollections] = await Promise.all([
    verifiedShop(),
    fetchCollections(),
  ]);
  const plan = planCollections(existingCollections, COLLECTION_BLUEPRINTS);
  await report("11-collections", mode, shop, {
    ...plan,
    publication:
      "New collections remain unpublished for merchant review. Publish only collections with at least four verified products and an image.",
  });
  if (!mode.apply) return;

  for (const collection of plan.toCreate) {
    await createCollection(collection);
  }
  console.log(
    `APPLY: created ${plan.toCreate.length} unpublished automated collections.`,
  );
}

async function provisionPages(mode) {
  const [shop, existingPages] = await Promise.all([
    verifiedShop(),
    fetchPages(),
  ]);
  const plan = planPages(existingPages, PAGE_BLUEPRINTS);
  await report("12-pages", mode, shop, {
    ...plan,
    publication:
      "New pages are drafts. Review content, policies, links, and theme rendering before publishing.",
  });
  if (!mode.apply) return;

  for (const page of plan.toCreate) {
    await createPage(page);
  }
  console.log(`APPLY: created ${plan.toCreate.length} unpublished pages.`);
}

async function provisionMenu(mode) {
  const [shop, existingMenus, collections, pages] = await Promise.all([
    verifiedShop(),
    fetchMenus(),
    fetchCollections(),
    fetchPages(),
  ]);
  const plan = planMenu(
    existingMenus,
    collections,
    pages,
    MENU_BLUEPRINT,
  );
  await report("13-navigation", mode, shop, {
    ...plan,
    assignment:
      "The new menu is not assigned to Horizon. Review it, then select it in the theme header settings.",
  });
  if (!mode.apply || !plan.toCreate) return;

  await createMenu(
    plan.toCreate.title,
    plan.toCreate.handle,
    plan.toCreate.items,
  );
  console.log("APPLY: created one unassigned review navigation menu.");
}

async function provisionArticles(mode) {
  const [shop, blogs] = await Promise.all([verifiedShop(), fetchBlogs()]);
  const plan = planArticles(blogs, ARTICLE_BLUEPRINTS);
  await report("14-articles", mode, shop, {
    ...plan,
    publication:
      "Articles are drafts without hero images. Review claims, add original images and internal links, then publish intentionally.",
  });
  if (!mode.apply || !plan.blog) return;

  for (const article of plan.toCreate) {
    await createArticle(article);
  }
  console.log(`APPLY: created ${plan.toCreate.length} draft articles.`);
}

const PROVISIONERS = {
  articles: provisionArticles,
  collections: provisionCollections,
  menu: provisionMenu,
  pages: provisionPages,
};

export async function mainProvision(kind) {
  try {
    const mode = executionMode();
    console.log(`${mode.label}: provision ${kind}`);
    await PROVISIONERS[kind](mode);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
