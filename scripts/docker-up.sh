#!/usr/bin/env bash
# Start Lugha in Docker (detached). Run from repo root.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  echo "→ Creating .env from .env.example"
  cp .env.example .env
  echo "  Edit .env if you need a custom DB password."
fi

echo "→ Building & starting Lugha (detached)…"
docker compose up -d --build

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Lugha is running in Docker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  App:      http://localhost:5173"
echo "  API:      http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo ""
echo "  Demo:     demo@lugha.africa / demo1234"
echo ""
echo "  Logs:     docker compose logs -f"
echo "  Stop:     docker compose down"
echo ""
