#!/bin/sh
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install it from https://nodejs.org and run this again."
  exit 1
fi
if [ ! -d node_modules ]; then
  echo "Installing Wheel of Paradise..."
  npm install
fi
exec node server.js
