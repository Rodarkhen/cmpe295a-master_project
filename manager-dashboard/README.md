# Manager dashboard (FastAPI + React + Postgres + MQTT)

This folder contains the manager dashboard stack (Sprint 0–1) so it stays separate from course docs, meetings, and other repo files.

**Sprint 1 (Rodrigo):** FastAPI subscribes to `retail/price/#` on Mosquitto and fans out to WebSocket clients; React shows a live price table and a placeholder SHAP (Chart.js) panel. Use **Publish to MQTT** on the dashboard or `POST /api/dev/publish-price` for smoke tests.

## Quick start

**Prerequisites:** Docker Desktop (or another engine) running, with Compose v2.

From **`manager-dashboard/`** (this folder):

```bash
make up
```

Or:

```bash
docker compose -f docker/docker-compose.yml up --build -d
```

From the **repository root** (without `cd`):

```bash
make up
```

(The root `Makefile` forwards targets into this folder.)

Then open:

- **Dashboard:** http://localhost:5173  
- **API:** http://localhost:8000 — docs at http://localhost:8000/docs  
- **Postgres:** `localhost:5432` — user `retail`, password `retail_dev`, database `retail_dashboard`  
- **MQTT (Mosquitto):** `localhost:1883` — topic family `retail/price/{product_id}` with JSON body  
  `{"product_id":"SKU-001","price":"12.99","reason":"Inventory high"}` (workbook smoke test)

Stop:

```bash
make down
```

Logs:

```bash
make logs
```

### Troubleshooting: Vite cannot resolve `chart.js` in Docker

The `dashboard-web` service uses a Docker **named volume** mounted at `/app/node_modules`. If it was created before `chart.js` was added, reinstall deps.

**Do not** run `rm -rf node_modules` inside the container for that path: it is a mount point and will fail with `Resource busy`, which can leave `vite` missing and the container crash-looping.

The Compose command clears **contents** with `find …` then `npm ci` when `chart.js` is absent. Recreate the web container after updating:

```bash
docker compose -f docker/docker-compose.yml up -d --force-recreate dashboard-web
```

**Nuclear option** (delete the cached `node_modules` volume from the host):

```bash
cd manager-dashboard && make web-reset-deps
```

### Postgres only (API + web on the host)

```bash
docker compose -f docker/docker-compose.yml up -d postgres
```

Then run Mosquitto locally or `docker compose -f docker/docker-compose.yml up -d mosquitto`, set `MQTT_BROKER_HOST=127.0.0.1`, and run `uvicorn` in `services/dashboard-api` and `npm run dev` in `services/dashboard-web`.

### Optional environment (API)

| Variable | Default | Purpose |
|----------|---------|---------|
| `MQTT_BROKER_HOST` | `127.0.0.1` | Broker hostname (`mosquitto` in Compose) |
| `MQTT_BROKER_PORT` | `1883` | Broker port |
| `MQTT_ENABLED` | `true` | Set `false` to run API without MQTT |
| `DEV_MQTT_PUBLISH` | `true` | Disable `POST /api/dev/publish-price` when `false` |

## Layout

| Path | Purpose |
|------|---------|
| `docker/docker-compose.yml` | Mosquitto, Postgres, API image, Vite dev container |
| `docker/mosquitto.conf` | Dev broker (anonymous; not for production) |
| `services/dashboard-api/` | FastAPI backend |
| `services/dashboard-web/` | React + Vite + TypeScript frontend |
| `Makefile` | `up`, `down`, `logs`, `ps`, `rebuild` |
