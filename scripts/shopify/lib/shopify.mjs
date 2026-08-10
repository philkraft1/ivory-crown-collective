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

const COLLECTIONS_QUERY = `#graphql
  query StoreCollections($after: String) {
    collections(first: 100, after: $after, sortKey: TITLE) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        handle
        descriptionHtml
        seo {
          title
          description
        }
      }
    }
  }
`;

const PAGES_QUERY = `#graphql
  query StorePages($after: String) {
    pages(first: 100, after: $after, sortKey: TITLE) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        handle
        body
        isPublished
      }
    }
  }
`;

const MENUS_QUERY = `#graphql
  query StoreMenus($after: String) {
    menus(first: 100, after: $after, sortKey: TITLE) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        handle
        isDefault
      }
    }
  }
`;

const BLOGS_QUERY = `#graphql
  query StoreBlogs($after: String) {
    blogs(first: 50, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        handle
        articles(first: 100) {
          nodes {
            id
            title
            handle
            isPublished
          }
        }
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

const COLLECTION_CREATE_MUTATION = `#graphql
  mutation CreateCollection($collection: CollectionCreateInput!) {
    collectionCreate(collection: $collection) {
      collection {
        id
        title
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PAGE_CREATE_MUTATION = `#graphql
  mutation CreatePage($page: PageCreateInput!) {
    pageCreate(page: $page) {
      page {
        id
        title
        handle
        isPublished
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const MENU_CREATE_MUTATION = `#graphql
  mutation CreateMenu(
    $title: String!
    $handle: String!
    $items: [MenuItemCreateInput!]!
  ) {
    menuCreate(title: $title, handle: $handle, items: $items) {
      menu {
        id
        title
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const ARTICLE_CREATE_MUTATION = `#graphql
  mutation CreateArticle($article: ArticleCreateInput!) {
    articleCreate(article: $article) {
      article {
        id
        title
        handle
        isPublished
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

export async function fetchCollections() {
  const collections = [];
  let after = null;

  do {
    const data = await adminGraphql(COLLECTIONS_QUERY, { after });
    collections.push(...data.collections.nodes);
    after = data.collections.pageInfo.hasNextPage
      ? data.collections.pageInfo.endCursor
      : null;
  } while (after);

  return collections;
}

export async function fetchPages() {
  const pages = [];
  let after = null;

  do {
    const data = await adminGraphql(PAGES_QUERY, { after });
    pages.push(...data.pages.nodes);
    after = data.pages.pageInfo.hasNextPage
      ? data.pages.pageInfo.endCursor
      : null;
  } while (after);

  return pages;
}

export async function fetchMenus() {
  const menus = [];
  let after = null;

  do {
    const data = await adminGraphql(MENUS_QUERY, { after });
    menus.push(...data.menus.nodes);
    after = data.menus.pageInfo.hasNextPage
      ? data.menus.pageInfo.endCursor
      : null;
  } while (after);

  return menus;
}

export async function fetchBlogs() {
  const blogs = [];
  let after = null;

  do {
    const data = await adminGraphql(BLOGS_QUERY, { after });
    blogs.push(...data.blogs.nodes);
    after = data.blogs.pageInfo.hasNextPage
      ? data.blogs.pageInfo.endCursor
      : null;
  } while (after);

  return blogs;
}

export async function updateProduct(product) {
  return adminGraphql(PRODUCT_UPDATE_MUTATION, { product });
}

export async function createCollection(collection) {
  return adminGraphql(COLLECTION_CREATE_MUTATION, { collection });
}

export async function createPage(page) {
  return adminGraphql(PAGE_CREATE_MUTATION, { page });
}

export async function createMenu(title, handle, items) {
  return adminGraphql(MENU_CREATE_MUTATION, { title, handle, items });
}

export async function createArticle(article) {
  return adminGraphql(ARTICLE_CREATE_MUTATION, { article });
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
