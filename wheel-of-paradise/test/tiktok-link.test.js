"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { tiktokOverlay, USUAL_OVERLAY } = require("../lib/tiktok-link");

test("with no generated origin, the TikTok link is the public site overlay", () => {
  const link = tiktokOverlay("");
  assert.equal(link.url, USUAL_OVERLAY);
  assert.equal(link.live, false);
  assert.equal(link.url.includes("127.0.0.1"), false);
});

test("a generated https origin points at the same overlay file", () => {
  const link = tiktokOverlay("https://random-name.trycloudflare.com/\n");
  assert.equal(link.url, "https://random-name.trycloudflare.com/overlay/wheel.html");
  assert.equal(link.live, true);
});

test("rejects non-https origins", () => {
  assert.equal(tiktokOverlay("http://example.com").url, USUAL_OVERLAY);
  assert.equal(tiktokOverlay("javascript:alert(1)").url, USUAL_OVERLAY);
});
