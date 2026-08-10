import { STORE_DOMAIN, ADMIN_TOKEN, API_VERSION, requireToken } from "./env.mjs";

const ENDPOINT = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;

/** Shopify's leaky bucket refills continuously; pause when we get close to empty. */
const THROTTLE_FLOOR = 200;
const MAX_ATTEMPTS = 5;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let lastThrottleStatus = null;

export async function graphql(query, variables = {}) {
  requireToken();

  if (lastThrottleStatus && lastThrottleStatus.currentlyAvailable < THROTTLE_FLOOR) {
    const deficit = THROTTLE_FLOOR - lastThrottleStatus.currentlyAvailable;
    await sleep(Math.ceil((deficit / lastThrottleStatus.restoreRate) * 1000));
  }

  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let response;
    try {
      response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ADMIN_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
      });
    } catch (networkError) {
      lastError = networkError;
      await sleep(attempt * 1000);
      continue;
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Shopify rejected the token (HTTP ${response.status}). Check SHOPIFY_ADMIN_TOKEN and that the app has the required scopes.`,
      );
    }

    if (response.status === 404) {
      throw new Error(
        `Admin API returned 404 for version "${API_VERSION}". Set SHOPIFY_API_VERSION in .env.local to a supported version.`,
      );
    }

    if (response.status === 429 || response.status >= 500) {
      const retryAfter = Number(response.headers.get("Retry-After")) || attempt * 2;
      lastError = new Error(`HTTP ${response.status} from Shopify`);
      await sleep(retryAfter * 1000);
      continue;
    }

    const body = await response.json();

    if (body.extensions?.cost?.throttleStatus) {
      lastThrottleStatus = body.extensions.cost.throttleStatus;
    }

    // A THROTTLED top-level error is retryable; anything else is a real bug.
    const throttled = body.errors?.some((e) => e.extensions?.code === "THROTTLED");
    if (throttled) {
      lastError = new Error("Throttled by Shopify");
      await sleep(attempt * 2000);
      continue;
    }

    if (body.errors?.length) {
      throw new Error(`GraphQL error: ${JSON.stringify(body.errors, null, 2)}`);
    }

    return body.data;
  }

  throw lastError ?? new Error("Shopify request failed after retries");
}

/**
 * Runs a mutation and throws on userErrors, which GraphQL returns with HTTP 200
 * and would otherwise be silently ignored.
 */
export async function mutate(query, variables, resultKey) {
  const data = await graphql(query, variables);
  const result = data?.[resultKey];
  const userErrors = result?.userErrors ?? [];

  if (userErrors.length) {
    throw new Error(`${resultKey} failed: ${JSON.stringify(userErrors, null, 2)}`);
  }

  return result;
}

/** Pages through a connection, yielding nodes. */
export async function* paginate(query, variables, pluck) {
  let cursor = null;

  for (;;) {
    const data = await graphql(query, { ...variables, cursor });
    const connection = pluck(data);

    for (const edge of connection.edges) yield edge.node;

    if (!connection.pageInfo.hasNextPage) return;
    cursor = connection.edges.at(-1).cursor;
  }
}

export const PRODUCT_FIELDS = `
  id
  handle
  title
  descriptionHtml
  vendor
  productType
  status
  tags
  createdAt
  options { id name position optionValues { id name } }
  media(first: 25) {
    edges { node { id alt mediaContentType ... on MediaImage { image { url width height } } } }
  }
  variants(first: 100) {
    edges {
      node {
        id
        title
        sku
        price
        compareAtPrice
        inventoryQuantity
        selectedOptions { name value }
      }
    }
  }
`;

export const ALL_PRODUCTS_QUERY = `
  query AllProducts($cursor: String) {
    products(first: 50, after: $cursor) {
      edges { cursor node { ${PRODUCT_FIELDS} } }
      pageInfo { hasNextPage }
    }
  }
`;

export async function fetchAllProducts() {
  const products = [];
  for await (const node of paginate(ALL_PRODUCTS_QUERY, {}, (d) => d.products)) {
    products.push(normalizeProduct(node));
  }
  return products;
}

/** Flattens GraphQL edge/node noise into plain objects the transform code can read. */
export function normalizeProduct(node) {
  return {
    ...node,
    media: node.media.edges.map((e) => e.node),
    variants: node.variants.edges.map((e) => e.node),
    images: node.media.edges
      .map((e) => e.node)
      .filter((m) => m.mediaContentType === "IMAGE"),
  };
}

export async function fetchShopInfo() {
  const data = await graphql(`
    query ShopInfo {
      shop {
        name
        email
        myshopifyDomain
        primaryDomain { host sslEnabled }
        currencyCode
        billingAddress { address1 city provinceCode zip country phone }
      }
    }
  `);
  return data.shop;
}
