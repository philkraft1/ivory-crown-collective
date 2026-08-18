#!/usr/bin/env bash
# Verify costume storefront is reachable (not redirected to agency site).
set -euo pipefail

URL="${1:-https://1wtpc0-c2.myshopify.com}"
AGENCY="ivorycrowncollective.com"

echo "== HEAD $URL =="
HEADERS=$(curl -sI "$URL" | tr -d '\r')
echo "$HEADERS" | head -25

STATUS=$(echo "$HEADERS" | awk 'NR==1{print $2}')
LOCATION=$(echo "$HEADERS" | awk -F': ' 'tolower($1)=="location"{print $2; exit}')
REASON=$(echo "$HEADERS" | awk -F': ' 'tolower($1)=="x-redirect-reason"{print $2; exit}')

echo
echo "status=$STATUS"
echo "location=${LOCATION:-}"
echo "redirect_reason=${REASON:-}"

if [[ "${REASON:-}" == *primary_domain_redirection* ]] || [[ "${LOCATION:-}" == *"$AGENCY"* ]]; then
  echo
  echo "FAIL: Store still redirects to agency ($AGENCY)."
  echo "Complete store-ops/UNLOCK.md (set myshopify or shop. subdomain as Shopify primary)."
  exit 1
fi

# Follow redirects and check final host
FINAL=$(curl -sI -L "$URL" | tr -d '\r' | awk 'tolower($1)=="location"{loc=$2} END{print loc}')
BODY_HOST_HINT=$(curl -sL "$URL" | head -c 4000 || true)

if echo "$BODY_HOST_HINT" | grep -qi 'Ivory Crown Collective' && echo "$BODY_HOST_HINT" | grep -qi 'Web Design\|Software & Apps\|IT Solutions'; then
  echo
  echo "FAIL: Final page looks like the agency Next.js site, not the Shopify storefront."
  exit 1
fi

if [[ "$STATUS" == "200" ]] || [[ "$STATUS" == "302" && "${LOCATION:-}" == *password* ]]; then
  echo
  echo "OK: No primary_domain_redirection to agency."
  if [[ "${LOCATION:-}" == *password* ]] || echo "$BODY_HOST_HINT" | grep -qi 'storefront.*password\|Enter store using password'; then
    echo "NOTE: Password protection still on — disable in Online Store → Preferences."
    exit 2
  fi
  exit 0
fi

echo
echo "WARN: Unexpected status $STATUS — inspect manually."
exit 3
