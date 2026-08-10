import { mkdir, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { DATA_DIR, getConfig } from "./config.mjs";

const PRODUCTS_QUERY = `#graphql
  query CatalogProducts($after: String) {
    products(first: 50, after: $after, sortKey: TITLE) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        legacyResourceId
        createdAt
        updatedAt
        title
        handle
        descriptionHtml
        vendor
        productType
        tags
        status
        category {
          id
          name
          fullName
        }
        seo {
          title
          description
        }
        options {
          id
          name
          position
          optionValues {
            id
            name
            hasVariants
          }
        }
        variants(first: 100) {
          nodes {
            id
            title
            sku
            price
            compareAtPrice
            selectedOptions {
              name
              value
            }
          }
        }
        media(first: 100) {
          nodes {
            __typename
            id
            alt
            status
            ... on MediaImage {
              image {
                url
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;

const SHOP_QUERY = `#graphql
  query StoreIdentity {
    shop {
      id
      name
      myshopifyDomain
      primaryDomain {
        host
        url
      }
    }
  }
`;

const PRODUCT_UPDATE_MUTATION = `#graphql
  mutation UpdateProduct($product: ProductUpdateInput!) {
    productUpdate(product: $product) {
      product {
        id
        title
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const VARIANTS_UPDATE_MUTATION = `#graphql
  mutation UpdateVariants(
    $productId: ID!
    $variants: [ProductVariantsBulkInput!]!
  ) {
    productVariantsBulkUpdate(
      productId: $productId
      variants: $variants
    ) {
      productVariants {
        id
        price
        compareAtPrice
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const OPTION_UPDATE_MUTATION = `#graphql
  mutation UpdateOption(
    $productId: ID!
    $option: OptionUpdateInput!
    $optionValuesToUpdate: [OptionValueUpdateInput!]
  ) {
    productOptionUpdate(
      productId: $productId
      option: $option
      optionValuesToUpdate: $optionValuesToUpdate
      variantStrategy: LEAVE_AS_IS
    ) {
      product {
        id
        options {
          id
          name
          position
          optionValues {
            id
            name
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const FILE_UPDATE_MUTATION = `#graphql
  mutation UpdateFiles($files: [FileUpdateInput!]!) {
    fileUpdate(files: $files) {
      files {
        id
        alt
        fileStatus
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function wait(milliseconds) {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, milliseconds);
  });
}

function userErrorsFrom(data) {
  if (!data || typeof data !== "object") return [];
  return Object.values(data).flatMap((payload) =>
    Array.isArray(payload?.userErrors) ? payload.userErrors : [],
  );
}

export async function adminGraphql(
  query,
  variables = {},
  { attempts = 4 } = {},
) {
  const config = getConfig();

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": config.token,
      },
      body: JSON.stringify({ query, variables }),
    });

    if ((response.status === 429 || response.status >= 500) && attempt < attempts) {
      const retryAfter = Number(response.headers.get("retry-after"));
      await wait(Number.isFinite(retryAfter) ? retryAfter * 1_000 : attempt * 1_000);
      continue;
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        `Shopify Admin API returned ${response.status}: ${JSON.stringify(payload)}`,
      );
    }

    if (payload?.errors?.length) {
      throw new Error(`Shopify GraphQL errors: ${JSON.stringify(payload.errors)}`);
    }

    const userErrors = userErrorsFrom(payload?.data);
    if (userErrors.length) {
      throw new Error(`Shopify user errors: ${JSON.stringify(userErrors)}`);
    }

    return payload.data;
  }

  throw new Error("Shopify Admin API retry limit reached.");
}

export async function fetchStoreIdentity() {
  return (await adminGraphql(SHOP_QUERY)).shop;
}

export async function fetchProducts() {
  const products = [];
  let after = null;

  do {
    const data = await adminGraphql(PRODUCTS_QUERY, { after });
    products.push(...data.products.nodes);
    after = data.products.pageInfo.hasNextPage
      ? data.products.pageInfo.endCursor
      : null;
  } while (after);

  return products;
}

export async function updateProduct(product) {
  return adminGraphql(PRODUCT_UPDATE_MUTATION, { product });
}

export async function updateVariants(productId, variants) {
  return adminGraphql(VARIANTS_UPDATE_MUTATION, { productId, variants });
}

export async function updateOption(
  productId,
  option,
  optionValuesToUpdate = [],
) {
  return adminGraphql(OPTION_UPDATE_MUTATION, {
    productId,
    option,
    optionValuesToUpdate:
      optionValuesToUpdate.length > 0 ? optionValuesToUpdate : null,
  });
}

export async function updateFiles(files) {
  const chunks = [];
  for (let index = 0; index < files.length; index += 100) {
    chunks.push(files.slice(index, index + 100));
  }

  const results = [];
  for (const chunk of chunks) {
    results.push(await adminGraphql(FILE_UPDATE_MUTATION, { files: chunk }));
  }
  return results;
}

export async function writeJson(filename, value) {
  await mkdir(DATA_DIR, { recursive: true });
  const destination = resolve(DATA_DIR, filename);
  const temporary = `${destination}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporary, destination);
  return destination;
}

export function timestamp() {
  return new Date().toISOString().replace(/[:.]/gu, "-");
}
