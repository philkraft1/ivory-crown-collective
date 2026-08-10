/** Shared Admin GraphQL mutations, so query strings live in one place. */

export const PRODUCT_UPDATE = `
  mutation ProductUpdate($product: ProductUpdateInput!) {
    productUpdate(product: $product) {
      product { id title vendor productType tags status }
      userErrors { field message }
    }
  }
`;

export const PRODUCT_VARIANTS_BULK_UPDATE = `
  mutation VariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      productVariants { id price compareAtPrice }
      userErrors { field message }
    }
  }
`;

export const PRODUCT_OPTION_UPDATE = `
  mutation ProductOptionUpdate(
    $productId: ID!
    $option: OptionUpdateInput!
    $optionValuesToUpdate: [OptionValueUpdateInput!]
    $optionValuesToDelete: [ID!]
    $variantStrategy: ProductOptionUpdateVariantStrategy
  ) {
    productOptionUpdate(
      productId: $productId
      option: $option
      optionValuesToUpdate: $optionValuesToUpdate
      optionValuesToDelete: $optionValuesToDelete
      variantStrategy: $variantStrategy
    ) {
      product { id options { id name optionValues { id name } } }
      userErrors { field message }
    }
  }
`;

export const FILE_UPDATE = `
  mutation FileUpdate($files: [FileUpdateInput!]!) {
    fileUpdate(files: $files) {
      files { id alt }
      userErrors { field message }
    }
  }
`;

export const COLLECTION_CREATE = `
  mutation CollectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id handle title sortOrder }
      userErrors { field message }
    }
  }
`;

export const COLLECTION_UPDATE = `
  mutation CollectionUpdate($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection { id handle title }
      userErrors { field message }
    }
  }
`;

export const COLLECTIONS_QUERY = `
  query Collections($cursor: String) {
    collections(first: 50, after: $cursor) {
      edges {
        cursor
        node {
          id
          handle
          title
          descriptionHtml
          sortOrder
          productsCount { count }
          ruleSet { appliedDisjunctively rules { column relation condition } }
        }
      }
      pageInfo { hasNextPage }
    }
  }
`;

export const PAGE_CREATE = `
  mutation PageCreate($page: PageCreateInput!) {
    pageCreate(page: $page) {
      page { id handle title }
      userErrors { field message }
    }
  }
`;

export const PAGE_UPDATE = `
  mutation PageUpdate($id: ID!, $page: PageUpdateInput!) {
    pageUpdate(id: $id, page: $page) {
      page { id handle title }
      userErrors { field message }
    }
  }
`;

export const PAGES_QUERY = `
  query Pages($cursor: String) {
    pages(first: 50, after: $cursor) {
      edges { cursor node { id handle title } }
      pageInfo { hasNextPage }
    }
  }
`;
