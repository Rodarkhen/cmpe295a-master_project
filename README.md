# CMPE_295A_master_project

Master project: multi-agent retail pricing with edge IoT and manager dashboard.

## Manager dashboard (code)

The runnable dashboard stack (Docker Compose, FastAPI, React) lives in **`manager-dashboard/`** so it does not sit next to workbook and meeting materials at the repo root.

Quick start (Docker running, from **repository root**):

```bash
make up
```

That starts Mosquitto, Postgres, the API (MQTT → WebSocket bridge), and the Vite dev server. Details, URLs, and env vars: [manager-dashboard/README.md](manager-dashboard/README.md).

## Project overview

*(To be expanded.)*

## File structure

- `manager-dashboard/` — Postgres + API + Vite; see `manager-dashboard/README.md`.
- `meetings/` — meeting logs.
- `workbook_assignment_1.md` — workbook reference.
- `assignment_info_context_docs/`, `ideation_docs/`, `template_docs/`, `other_context/` — course and project context.

## Collaborators

*(Team list.)*
