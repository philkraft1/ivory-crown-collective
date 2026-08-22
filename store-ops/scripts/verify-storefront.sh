#!/usr/bin/env bash
# Verify costume storefront is reachable (not redirected to the agency apex).
set -euo pipefail

URL="${1:-https://1wtpc0-c2.myshopify.com}"
# Agency marketing site (Next.js on Vercel) — must NOT be the Shopify primary.
AGENCY_APEX="ivorycrowncollective.com"
# Allowed Shopify storefront hosts after unlock.
STORE_OK_REGEX='(myshopify\.com|ivorycrowncollective\.store)'

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

# Fail only if redirected to the agency apex (or bare apex without .store).
if [[ "${LOCATION:-}" == "https://${AGENCY_APEX}/" ]] || \
   [[ "${LOCATION:-}" == "https://${AGENCY_APEX}" ]] || \
   [[ "${LOCATION:-}" == "https://www.${AGENCY_APEX}/" ]] || \
   [[ "${LOCATION:-}" == "https://www.${AGENCY_APEX}" ]]; then
  echo
  echo "FAIL: Store still redirects to agency apex ($AGENCY_APEX)."
  echo "Complete store-ops/UNLOCK.md (demote apex; set .store or myshopify as primary)."
  exit 1
fi

BODY=$(curl -sL "$URL" | head -c 8000 || true)

if echo "$BODY" | grep -qi 'Web Design\|Software & Apps\|IT Solutions' && \
   echo "$BODY" | grep -qi 'Ivory Crown Collective' && \
   ! echo "$BODY" | grep -qi 'powered.by.Shopify\|Shopify\.theme\|cdn.shopify.com'; then
  echo
  echo "FAIL: Final page looks like the agency Next.js site, not the Shopify storefront."
  exit 1
fi

FINAL_HOST=$(curl -sI -L "$URL" | tr -d '\r' | awk 'BEGIN{h=""} tolower($1)=="location:"{h=$2} END{print h}')
# Follow to final: if no Location on last response, use effective URL via -w
EFFECTIVE=$(curl -sL -o /dev/null -w '%{url_effective}' "$URL")
echo "effective_url=$EFFECTIVE"

if ! echo "$EFFECTIVE" | grep -qiE "$STORE_OK_REGEX"; then
  echo
  echo "FAIL: Effective URL is not a costume store host: $EFFECTIVE"
  exit 1
fi

if echo "$BODY" | grep -qi 'Enter store using password\|storefront-password'; then
  echo
  echo "NOTE: Password protection still on — disable in Online Store → Preferences."
  exit 2
fi

echo
echo "OK: Storefront reachable at $EFFECTIVE (not agency apex)."
exit 0
