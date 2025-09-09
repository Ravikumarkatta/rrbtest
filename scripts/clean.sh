#!/usr/bin/env bash
set -euo pipefail
echo "[clean] Removing node_modules, .vercel cache, and reinstalling"
rm -rf node_modules package-lock.json .vercel
echo "[clean] Installing fresh dependencies"
npm install --no-audit --no-fund
echo "[clean] Done. Run 'npm run dev' to start Vercel dev server."
