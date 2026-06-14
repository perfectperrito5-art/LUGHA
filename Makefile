.PHONY: up down build logs ps restart prod prod-down clean seed

# Development stack (detached) — MySQL + API + Vite with hot reload
up:
	docker compose up -d --build

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

ps:
	docker compose ps

restart:
	docker compose down && docker compose up -d --build

# Re-run seed inside running backend
seed:
	docker compose exec backend python -m app.seed

# Production-style stack (nginx + built frontend)
prod:
	docker compose -f docker-compose.prod.yml up -d --build

prod-down:
	docker compose -f docker-compose.prod.yml down

# Remove containers + volumes (fresh database)
clean:
	docker compose down -v
	docker compose -f docker-compose.prod.yml down -v 2>/dev/null || true
