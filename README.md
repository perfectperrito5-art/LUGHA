# LUGHA

**African linguistic intelligence infrastructure** — community-verified knowledge graph, contributions, cultural playground, and API-first design.

Repository: [github.com/perfectperrito5-art/LUGHA](https://github.com/perfectperrito5-art/LUGHA.git)

---

## Quick start with Docker (recommended)

No local Python, Node, or MySQL install required — only [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/).

```bash
git clone https://github.com/perfectperrito5-art/LUGHA.git
cd LUGHA

cp .env.example .env
# optional: edit .env (DB_PASSWORD, JWT_SECRET)

docker compose up -d --build
```

Or use the helper script / Makefile:

```bash
chmod +x scripts/docker-up.sh
./scripts/docker-up.sh

# equivalent:
make up
```

| Service   | URL |
|-----------|-----|
| **App**   | http://localhost:5173 |
| **API**   | http://localhost:8000 |
| **Docs**  | http://localhost:8000/docs |

**Demo login:** `demo@lugha.africa` / `demo1234`

### Useful commands

```bash
docker compose ps              # status
docker compose logs -f         # all logs
docker compose logs -f backend # API only
docker compose down            # stop
docker compose down -v         # stop + wipe database volume
make restart                   # rebuild & restart detached
make seed                      # re-run seed in running backend
```

### Production-style stack (nginx)

Serves a built frontend on port **80** with API proxy:

```bash
docker compose -f docker-compose.prod.yml up -d --build
# open http://localhost
```

---

## Project layout

```
LUGHA/
├── docker-compose.yml          # dev: MySQL + API + Vite (hot reload)
├── docker-compose.prod.yml     # prod: MySQL + API + nginx
├── .env.example
├── Makefile
├── scripts/docker-up.sh
└── lugha_mvp/
    ├── backend/                # FastAPI
    │   ├── Dockerfile
    │   └── docker-entrypoint.sh
    ├── frontend/               # React + Vite
    │   ├── Dockerfile          # dev server
    │   ├── Dockerfile.prod     # nginx build
    │   └── nginx.conf
    └── database/schema.sql
```

---

## Manual setup (without Docker)

See [lugha_mvp/README.md](lugha_mvp/README.md) for Ubuntu / MySQL Workbench setup with `setup.sh`.

---

## Environment variables

Copy `.env.example` → `.env` at the **repo root** (used by Docker Compose).

| Variable | Default | Notes |
|----------|---------|--------|
| `DB_PASSWORD` | *(required)* | MySQL root password |
| `DB_NAME` | `lugha_db` | Database name |
| `JWT_SECRET` | change me | Use a long random string in production |
| `AI_PROVIDER` | `mock` | `openai` or `gemini` + `AI_API_KEY` for real AI |
| `FRONTEND_PORT` | `5173` | Host port (dev compose) |
| `BACKEND_PORT` | `8000` | Host port |

---

## License & contribution

Built for preserving Africa's 2K+ living languages. Pull requests welcome — fork, modify `lugha_mvp/`, and run with Docker.
