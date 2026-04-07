# Retail dashboard stack — Postgres + FastAPI + Vite (see README Quick start).
COMPOSE := docker compose -f docker/docker-compose.yml

.PHONY: up down logs ps rebuild web-reset-deps

up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

rebuild:
	$(COMPOSE) build --no-cache && $(COMPOSE) up -d

# Drop cached frontend node_modules volume (fixes "Failed to resolve chart.js" after new deps).
web-reset-deps:
	-$(COMPOSE) stop dashboard-web
	-docker volume rm $$(docker volume ls -q | grep dashboard_web_node_modules || true)
	$(COMPOSE) up -d dashboard-web
