#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/deploy/apps/cupi-store"
cd "$APP_DIR"

# Keep the VPS default Node runtime untouched. Only this app opts into Node 22.
export NVM_DIR="${NVM_DIR:-/home/deploy/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  # shellcheck disable=SC1090
  source "$NVM_DIR/nvm.sh"
  nvm use 22 >/dev/null
fi

export CUPI_NODE_INTERPRETER="$(command -v node)"

git pull --ff-only
bun install --frozen-lockfile
bun run deploy:check
bun run build
mkdir -p "$APP_DIR/uploads"

if pm2 describe cupi-store >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save
