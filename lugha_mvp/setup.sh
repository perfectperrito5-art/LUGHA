#!/usr/bin/env bash
# Lugha — one-shot setup script for Ubuntu
set -e

GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; NC='\033[0m'
say() { echo -e "${CYAN}==>${NC} $1"; }
ok()  { echo -e "${GREEN}✓${NC} $1"; }
warn(){ echo -e "${YELLOW}!${NC} $1"; }

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# --- prerequisites ---
say "Checking prerequisites"
for c in python3 pip3 mysql node npm; do
  command -v "$c" >/dev/null || { echo "Missing: $c. Install it first."; exit 1; }
done
ok "All prerequisites found"

# --- MySQL ---
say "Setting up MySQL database 'lugha_db'"
read -rp "MySQL user [root]: " DBUSER; DBUSER=${DBUSER:-root}
read -rsp "MySQL password for $DBUSER: " DBPASS; echo
read -rp "MySQL host [127.0.0.1]: " DBHOST; DBHOST=${DBHOST:-127.0.0.1}
read -rp "MySQL port [3306]: " DBPORT; DBPORT=${DBPORT:-3306}

mysql -u"$DBUSER" -p"$DBPASS" -h"$DBHOST" -P"$DBPORT" -e \
  "CREATE DATABASE IF NOT EXISTS lugha_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u"$DBUSER" -p"$DBPASS" -h"$DBHOST" -P"$DBPORT" lugha_db < database/schema.sql
ok "Database created and schema loaded"

# --- backend ---
say "Setting up FastAPI backend"
cd backend
[ -d venv ] || python3 -m venv venv
# shellcheck disable=SC1091
source venv/bin/activate
pip install --upgrade pip >/dev/null
pip install -r requirements.txt
cat > .env <<EOF
DB_USER=$DBUSER
DB_PASSWORD=$DBPASS
DB_HOST=$DBHOST
DB_PORT=$DBPORT
DB_NAME=lugha_db
JWT_SECRET=$(python3 -c 'import secrets;print(secrets.token_hex(32))')
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
AI_PROVIDER=mock
AI_API_KEY=
EOF
ok "Backend .env written"

python -m app.seed
ok "Seed data inserted"
deactivate
cd ..

# --- frontend ---
say "Installing frontend"
cd frontend
npm install --silent
ok "Frontend deps installed"
cd ..

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Lugha is ready!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Start the backend (Terminal 1):"
echo "  cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000"
echo ""
echo "Start the frontend (Terminal 2):"
echo "  cd frontend && npm run dev"
echo ""
echo "Then open http://localhost:5173"
echo "Demo login → demo@lugha.africa  /  demo1234"
echo ""
warn "Optional: set AI_PROVIDER=openai (or gemini) and AI_API_KEY in backend/.env to enable real AI."
