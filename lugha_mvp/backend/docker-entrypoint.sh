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

echo "→ Checking database credentials..."
python - <<'PY'
import os, sys
from urllib.parse import quote_plus

import pymysql

host = os.environ.get("DB_HOST", "mysql")
port = int(os.environ.get("DB_PORT", "3306"))
user = os.environ.get("DB_USER", "lugha")
password = os.environ.get("DB_PASSWORD", "")
database = os.environ.get("DB_NAME", "lugha_db")

try:
    conn = pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database,
        connect_timeout=5,
    )
    conn.close()
    print(f"  Connected as {user}@{host}/{database}")
except pymysql.err.OperationalError as e:
    code = e.args[0] if e.args else None
    if code == 1045:
        print("Database login failed — password mismatch with persisted MySQL volume.", file=sys.stderr)
        print("Fix: set DB_PASSWORD in .env to the password used when the volume was first created,", file=sys.stderr)
        print("     or reset the database:  docker compose down -v  then up again.", file=sys.stderr)
    else:
        print(f"Database connection failed: {e}", file=sys.stderr)
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
