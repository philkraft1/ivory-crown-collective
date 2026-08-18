#!/usr/bin/env bash
# Minimal Admin GraphQL helper.
# Usage: ./scripts/graphql.sh 'query { shop { name primaryDomain { host } } }'
set -euo pipefail

SHOP="${SHOPIFY_SHOP:-1wtpc0-c2.myshopify.com}"
TOKEN="${SHOPIFY_ADMIN_TOKEN:?Set SHOPIFY_ADMIN_TOKEN}"
API_VERSION="${SHOPIFY_API_VERSION:-2025-01}"
QUERY="${1:?Pass GraphQL query/mutation as first arg}"

curl -sS "https://${SHOP}/admin/api/${API_VERSION}/graphql.json" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: ${TOKEN}" \
  -d "$(jq -n --arg q "$QUERY" '{query:$q}')"
