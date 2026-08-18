#!/usr/bin/env bash
# Refresh expiring Admin API token from Shopify CLI client (public client; empty secret).
set -euo pipefail
SECRETS_DIR="$(cd "$(dirname "$0")/.." && pwd)/.secrets"
ENV_FILE="${SECRETS_DIR}/admin.env"
# shellcheck disable=SC1090
source "$ENV_FILE"

CLIENT_ID="${SHOPIFY_CLI_CLIENT_ID:-7e9cb568cfd431c538f36d1ad3f2b4f6}"
RESP=$(curl -sS -X POST "https://${SHOPIFY_SHOP}/admin/oauth/access_token" \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Accept: application/json' \
  --data-urlencode "client_id=${CLIENT_ID}" \
  --data-urlencode "client_secret=" \
  --data-urlencode "grant_type=refresh_token" \
  --data-urlencode "refresh_token=${SHOPIFY_REFRESH_TOKEN}")

echo "$RESP" | python3 -c 'import sys,json; d=json.load(sys.stdin); assert "access_token" in d, d; print("ok expires_in=", d.get("expires_in"))'

python3 - <<PY
import json, pathlib, os, re
resp=json.loads('''$RESP''')
path=pathlib.Path("$ENV_FILE")
text=path.read_text()
def setkv(text,k,v):
  if re.search(rf'^{k}=', text, re.M):
    return re.sub(rf'^{k}=.*$', f'{k}={v}', text, count=1, flags=re.M)
  return text+f'\n{k}={v}\n'
text=setkv(text,'SHOPIFY_ADMIN_TOKEN', resp['access_token'])
text=setkv(text,'SHOPIFY_REFRESH_TOKEN', resp['refresh_token'])
path.write_text(text)
print('updated', path)
PY
