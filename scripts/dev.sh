#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Pulling latest from GitHub..."
git pull --ff-only

echo "==> Installing API dependencies..."
(cd "$ROOT/api" && npm install)

echo "==> Installing Web dependencies..."
(cd "$ROOT/web/app" && npm install)

API_PID=""
WEB_PID=""

cleanup() {
  if [[ -n "$API_PID" ]]; then
    kill "$API_PID" 2>/dev/null || true
  fi
  if [[ -n "$WEB_PID" ]]; then
    kill "$WEB_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "==> Starting API (http://localhost:3000)..."
(cd "$ROOT/api" && npm run dev) &
API_PID=$!

echo "==> Starting web app (http://localhost:4200)..."
(cd "$ROOT/web/app" && npm run start) &
WEB_PID=$!

echo "==> Both servers running. Press Ctrl+C to stop."

wait