import { SITE } from "@/lib/site";

export type StoreProduct = {
  id: string;
  title: string;
  handle: string;
  url: string;
  imageUrl: string | null;
  imageAlt: string;
  priceLabel: string;
};

export type StorePreviewResult = {
  products: StoreProduct[];
  storeUrl: string;
  isMock: boolean;
  collection: string | null;
};

const DEFAULT_LIMIT = 4;
const REQUEST_TIMEOUT_MS = 2500;

function getConfig() {
  const rawDomain =
    process.env.SHOPIFY_STORE_DOMAIN?.trim() || "1wtpc0-c2.myshopify.com";
  const domain = rawDomain.replace(/^https?:\/\//u, "").replace(/\/.*$/u, "");
  // Public Storefront API token (distinct from the SHOPIFY_ADMIN_TOKEN used by
  // the catalog scripts). Without it we render branded preview products.
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN?.trim();
  const apiVersion = process.env.SHOPIFY_API_VERSION?.trim() || "2026-07";
  return { domain, token, apiVersion, storeUrl: SITE.shopUrl };
}

type ShopifyMoney = { amount: string; currencyCode: string };
type ShopifyImage = { url: string; altText: string | null } | null;
type ShopifyProductNode = {
  id: string;
  title: string;
  handle: string;
  onlineStoreUrl: string | null;
  featuredImage: ShopifyImage;
  priceRange: { minVariantPrice: ShopifyMoney };
};

function formatPrice(money: ShopifyMoney): string {
  const amount = Number.parseFloat(money.amount);
  if (Number.isNaN(amount)) return "";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currencyCode,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${money.currencyCode} ${money.amount}`;
  }
}

function mapNode(node: ShopifyProductNode, storeUrl: string): StoreProduct {
  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    url: node.onlineStoreUrl ?? `${storeUrl}/products/${node.handle}`,
    imageUrl: node.featuredImage?.url ?? null,
    imageAlt: node.featuredImage?.altText ?? node.title,
    priceLabel: formatPrice(node.priceRange.minVariantPrice),
  };
}

const PRODUCT_FIELDS = `
  id
  title
  handle
  onlineStoreUrl
  featuredImage { url altText }
  priceRange { minVariantPrice { amount currencyCode } }
`;

const COLLECTION_QUERY = `
  query PreviewByCollection($handle: String!, $limit: Int!) {
    collection(handle: $handle) {
      products(first: $limit) { nodes { ${PRODUCT_FIELDS} } }
    }
  }
`;

const FEATURED_QUERY = `
  query PreviewFeatured($limit: Int!) {
    products(first: $limit, sortKey: BEST_SELLING) { nodes { ${PRODUCT_FIELDS} } }
  }
`;

/**
 * Fetches up to `limit` products from the Shopify Storefront API.
 *
 * When a collection handle is supplied (e.g. derived from an ad campaign), the
 * feed is tailored to that collection; otherwise best-selling products are used.
 * If credentials are missing or the request fails, a branded mock set is
 * returned so the UI still renders in development and preview environments.
 */
export async function getStorePreview(
  collection: string | null,
  limit: number = DEFAULT_LIMIT,
): Promise<StorePreviewResult> {
  const { domain, token, apiVersion, storeUrl } = getConfig();

  if (!token) {
    return { ...getMockPreview(collection, limit), storeUrl };
  }

  const query = collection ? COLLECTION_QUERY : FEATURED_QUERY;
  const variables = collection ? { handle: collection, limit } : { limit };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://${domain}/api/${apiVersion}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": token,
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) {
      throw new Error(`Shopify responded ${response.status}`);
    }

    const json = (await response.json()) as {
      data?: {
        collection?: { products: { nodes: ShopifyProductNode[] } } | null;
        products?: { nodes: ShopifyProductNode[] };
      };
      errors?: unknown;
    };

    if (json.errors) {
      throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`);
    }

    const nodes = collection
      ? (json.data?.collection?.products.nodes ?? [])
      : (json.data?.products?.nodes ?? []);

    if (nodes.length === 0) {
      return { ...getMockPreview(collection, limit), storeUrl };
    }

    return {
      products: nodes.slice(0, limit).map((node) => mapNode(node, storeUrl)),
      storeUrl,
      isMock: false,
      collection,
    };
  } catch (error) {
    console.warn(
      "[shopify] Falling back to mock preview:",
      error instanceof Error ? error.message : error,
    );
    return { ...getMockPreview(collection, limit), storeUrl };
  } finally {
    clearTimeout(timeout);
  }
}

const MOCK_PRODUCTS: StoreProduct[] = [
  {
    id: "mock-wizard-robe",
    title: "Storybook Wizard Robe",
    handle: "storybook-wizard-robe",
    url: "#",
    imageUrl: null,
    imageAlt: "Storybook Wizard Robe",
    priceLabel: "$39.95",
  },
  {
    id: "mock-red-cape",
    title: "Little Red Riding Cape",
    handle: "little-red-riding-cape",
    url: "#",
    imageUrl: null,
    imageAlt: "Little Red Riding Cape",
    priceLabel: "$29.95",
  },
  {
    id: "mock-knight-set",
    title: "Brave Knight Armor Set",
    handle: "brave-knight-armor-set",
    url: "#",
    imageUrl: null,
    imageAlt: "Brave Knight Armor Set",
    priceLabel: "$44.99",
  },
  {
    id: "mock-princess-gown",
    title: "Fairytale Princess Gown",
    handle: "fairytale-princess-gown",
    url: "#",
    imageUrl: null,
    imageAlt: "Fairytale Princess Gown",
    priceLabel: "$42.95",
  },
  {
    id: "mock-pirate",
    title: "Pirate Captain Costume",
    handle: "pirate-captain-costume",
    url: "#",
    imageUrl: null,
    imageAlt: "Pirate Captain Costume",
    priceLabel: "$36.99",
  },
  {
    id: "mock-dorothy",
    title: "Ruby Slipper Pinafore Set",
    handle: "ruby-slipper-pinafore-set",
    url: "#",
    imageUrl: null,
    imageAlt: "Ruby Slipper Pinafore Set",
    priceLabel: "$34.95",
  },
];

function getMockPreview(
  collection: string | null,
  limit: number,
): Omit<StorePreviewResult, "storeUrl"> {
  // Deterministically rotate the mock set based on the collection/campaign so
  // that the "ad-tailored" behaviour is visible even without live credentials.
  let offset = 0;
  if (collection) {
    offset =
      [...collection].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
      MOCK_PRODUCTS.length;
  }
  const rotated = [
    ...MOCK_PRODUCTS.slice(offset),
    ...MOCK_PRODUCTS.slice(0, offset),
  ];
  return {
    products: rotated.slice(0, limit),
    isMock: true,
    collection,
  };
}
