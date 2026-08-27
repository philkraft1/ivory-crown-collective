/**
 * Push cleaned theme layouts via Playwright + Shopify Admin session cookies.
 * Uses admin.shopify.com online-store GraphQL (session auth), not shpat.
 */
const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

const STORE = "1wtpc0-c2";
const THEME_GID = "gid://shopify/OnlineStoreTheme/160471417077";

async function main() {
  const chromePath =
    process.env.CHROME_PATH ||
    "/usr/bin/google-chrome" ||
    "/usr/bin/chromium-browser";

  const context = await chromium.launchPersistentContext(
    "/tmp/chrome-shopify-profile",
    {
      executablePath: chromePath,
      headless: false,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--profile-directory=Default",
      ],
      ignoreDefaultArgs: ["--enable-automation"],
      viewport: { width: 1400, height: 900 },
    },
  );

  const page = context.pages()[0] || (await context.newPage());
  const themeLiquid = fs.readFileSync(
    path.join(__dirname, "../theme/layout/theme.liquid"),
    "utf8",
  );
  const passwordLiquid = fs.readFileSync(
    path.join(__dirname, "../theme/layout/password.liquid"),
    "utf8",
  );
  const stubSnippet =
    "{% comment %} Deprecated: store GA4 is provided by Shopify Google channel web pixel (G-M5TL69BJF8). Do not render this snippet. {% endcomment %}\n";

  console.log("goto admin themes...");
  await page.goto(`https://admin.shopify.com/store/${STORE}`, {
    waitUntil: "domcontentloaded",
    timeout: 180000,
  });
  await page.waitForTimeout(10000);
  console.log("url", page.url(), "title", await page.title());

  const html = await page.content();
  if (/just a moment|cf-browser-verification|challenge-platform/i.test(html)) {
    console.error("CLOUDFLARE_CHALLENGE");
    // wait longer for auto-pass
    await page.waitForTimeout(30000);
    console.log("after wait url", page.url(), "title", await page.title());
  }

  // Probe which GraphQL endpoints work with cookies
  const probe = await page.evaluate(async () => {
    const shop = location.pathname.split("/")[2];
    const attempts = [];
    const urls = [
      `https://admin.shopify.com/api/online-store/${shop}/graphql`,
      `https://admin.shopify.com/api/shopify/${shop}`,
      `https://${shop}.myshopify.com/admin/internal/web/graphql/core`,
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ query: "{ __typename }" }),
        });
        attempts.push({
          url,
          status: res.status,
          body: (await res.text()).slice(0, 300),
        });
      } catch (e) {
        attempts.push({ url, error: String(e) });
      }
    }
    return { shop, href: location.href, attempts };
  });
  console.log(JSON.stringify(probe, null, 2));

  // If we got a working endpoint, upsert files
  const working = (probe.attempts || []).find(
    (a) => a.status === 200 && a.body && !/html/i.test(a.body.slice(0, 20)),
  );
  if (!working) {
    console.error("NO_WORKING_GQL_ENDPOINT");
    await context.close();
    process.exit(3);
  }

  const upsert = await page.evaluate(
    async ({ endpoint, themeId, files }) => {
      const mutation = `mutation themeFilesUpsert($themeId: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
        themeFilesUpsert(themeId: $themeId, files: $files) {
          upsertedThemeFiles { filename }
          userErrors { field message }
        }
      }`;
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: mutation,
          variables: { themeId, files },
        }),
      });
      return { status: res.status, body: await res.text() };
    },
    {
      endpoint: working.url,
      themeId: THEME_GID,
      files: [
        {
          filename: "layout/theme.liquid",
          body: { type: "TEXT", value: themeLiquid },
        },
        {
          filename: "layout/password.liquid",
          body: { type: "TEXT", value: passwordLiquid },
        },
        {
          filename: "snippets/google-tag.liquid",
          body: { type: "TEXT", value: stubSnippet },
        },
      ],
    },
  );
  console.log("upsert", upsert.status, upsert.body.slice(0, 1500));
  await context.close();
  if (upsert.status !== 200 || /userErrors\":\[\{/.test(upsert.body)) {
    process.exit(4);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
