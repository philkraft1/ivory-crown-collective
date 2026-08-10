import assert from "node:assert/strict";
import test from "node:test";
import {
  planCollections,
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
