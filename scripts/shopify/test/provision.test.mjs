import assert from "node:assert/strict";
import test from "node:test";
import {
  planArticles,
  planCollections,
  planMenu,
  planPages,
} from "../lib/provision.mjs";

test("collection planning creates missing tag-driven drafts", () => {
  const plan = planCollections([], [
    {
      handle: "school-play-costumes",
      title: "School Play & Drama Costumes",
      tag: "occasion:school-play",
      description: "Costumes for school productions.",
    },
  ]);

  assert.equal(plan.toCreate.length, 1);
  assert.equal(plan.existing.length, 0);
  assert.deepEqual(
    plan.toCreate[0].sources[0].source.inclusion.conditions[0],
    {
      productTag: {
        relation: "TAGGED_WITH",
        values: ["occasion:school-play"],
        matchType: "ANY",
      },
    },
  );
});

test("collection planning never overwrites an existing handle", () => {
  const plan = planCollections(
    [
      {
        id: "gid://shopify/Collection/1",
        handle: "school-play-costumes",
        title: "Merchant-edited title",
      },
    ],
    [
      {
        handle: "school-play-costumes",
        title: "School Play & Drama Costumes",
        tag: "occasion:school-play",
        description: "Costumes for school productions.",
      },
    ],
  );

  assert.equal(plan.toCreate.length, 0);
  assert.equal(plan.existing.length, 1);
  assert.match(plan.existing[0].action, /No automatic overwrite/u);
});

test("page planning creates unpublished pages and preserves existing pages", () => {
  const plan = planPages(
    [
      {
        id: "gid://shopify/Page/1",
        handle: "about-ivory-crown-kids",
        title: "Edited About",
        isPublished: true,
      },
    ],
    [
      {
        handle: "about-ivory-crown-kids",
        title: "About Ivory Crown Collective Kids",
        body: "<p>About</p>",
      },
      {
        handle: "costume-size-guide",
        title: "Children's Costume Size Guide",
        body: "<p>Measure first.</p>",
      },
    ],
  );

  assert.equal(plan.existing.length, 1);
  assert.deepEqual(plan.toCreate, [
    {
      handle: "costume-size-guide",
      title: "Children's Costume Size Guide",
      body: "<p>Measure first.</p>",
      isPublished: false,
    },
  ]);
});

test("menu planning blocks until every linked resource exists", () => {
  const plan = planMenu([], [], [], {
    handle: "review-menu",
    title: "Review Menu",
    groups: [
      {
        title: "Shop",
        fallbackUrl: "/collections/all",
        links: [["School Plays", "collection", "school-play-costumes"]],
      },
    ],
    pages: [["Size Guide", "costume-size-guide"]],
  });

  assert.equal(plan.toCreate, null);
  assert.deepEqual(plan.missingResources, [
    "collection:school-play-costumes",
    "page:costume-size-guide",
  ]);
});

test("menu planning creates an unassigned resource-linked menu", () => {
  const plan = planMenu(
    [],
    [
      {
        id: "gid://shopify/Collection/1",
        handle: "school-play-costumes",
      },
    ],
    [
      {
        id: "gid://shopify/Page/1",
        handle: "costume-size-guide",
      },
    ],
    {
      handle: "review-menu",
      title: "Review Menu",
      groups: [
        {
          title: "Shop",
          fallbackUrl: "/collections/all",
          links: [["School Plays", "collection", "school-play-costumes"]],
        },
      ],
      pages: [["Size Guide", "costume-size-guide"]],
    },
  );

  assert.equal(plan.missingResources.length, 0);
  assert.equal(plan.toCreate.items[0].items[0].type, "COLLECTION");
  assert.equal(
    plan.toCreate.items[0].items[0].resourceId,
    "gid://shopify/Collection/1",
  );
  assert.equal(plan.toCreate.items[1].type, "PAGE");
  assert.equal(plan.toCreate.items.at(-1).title, "Contact");
});

test("article planning creates drafts and preserves existing handles", () => {
  const plan = planArticles(
    [
      {
        id: "gid://shopify/Blog/1",
        title: "News",
        handle: "news",
        articles: {
          nodes: [
            {
              id: "gid://shopify/Article/1",
              handle: "existing-guide",
              title: "Merchant guide",
              isPublished: true,
            },
          ],
        },
      },
    ],
    [
      {
        handle: "existing-guide",
        title: "Generated existing guide",
        summary: "Existing",
        body: "<p>Existing</p>",
        tags: ["Guide"],
      },
      {
        handle: "new-guide",
        title: "New guide",
        summary: "New",
        body: "<p>New</p>",
        tags: ["Guide"],
      },
    ],
  );

  assert.equal(plan.existing.length, 1);
  assert.equal(plan.toCreate.length, 1);
  assert.equal(plan.toCreate[0].blogId, "gid://shopify/Blog/1");
  assert.equal(plan.toCreate[0].isPublished, false);
});
