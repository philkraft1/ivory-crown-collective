"use strict";

const USUAL_OVERLAY = "https://ivorycrowncollective.com/overlay/wheel.html";

const GENERATED_NOTE = "Paste this into TikTok LIVE Studio as a Link source. It is the site overlay, over HTTPS.";
const USUAL_NOTE = "TikTok rejects 127.0.0.1. This is the public overlay address. It 404s until the live site is deployed with public/overlay/wheel.html.";

function generatedOrigin(text) {
  const origin = String(text || "").trim().replace(/\/$/, "");
  if (!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(origin)) return "";
  return origin;
}

function tiktokOverlay(originText) {
  const origin = generatedOrigin(originText);
  if (origin) {
    return {
      url: `${origin}/overlay/wheel.html`,
      live: true,
      note: GENERATED_NOTE,
    };
  }
  return { url: USUAL_OVERLAY, live: false, note: USUAL_NOTE };
}

module.exports = { USUAL_OVERLAY, generatedOrigin, tiktokOverlay };
