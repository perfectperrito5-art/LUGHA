#!/usr/bin/env sh
set -e

echo "→ Waiting for MySQL at ${DB_HOST}:${DB_PORT}..."
python - <<'PY'
import os, socket, sys, time

host = os.environ.get("DB_HOST", "mysql")
port = int(os.environ.get("DB_PORT", "3306"))

for attempt in range(90):
    try:
        with socket.create_connection((host, port), timeout=3):
            print(f"  MySQL reachable (attempt {attempt + 1})")
            sys.exit(0)
    except OSError as e:
        if attempt % 5 == 0:
            print(f"  still waiting… ({host}:{port}) — {e}")
        time.sleep(2)

print(f"MySQL not reachable at {host}:{port}", file=sys.stderr)
print("Tip: run  docker compose down && docker compose up -d --build", file=sys.stderr)
sys.exit(1)
PY

echo "→ Seeding database (idempotent)..."
python -m app.seed

if [ "${UVICORN_RELOAD:-0}" = "1" ]; then
  echo "→ Starting API (dev reload) on :8000"
  exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
fi

echo "→ Starting API on :8000"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
