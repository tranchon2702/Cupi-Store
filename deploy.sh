#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/deploy/apps/cupi-store"
cd "$APP_DIR"

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
