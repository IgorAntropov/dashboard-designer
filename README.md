# Panelka

SaaS dashboard constructor: build dashboards from a widget library by drag-and-drop, theme them,
and embed them into your own app (iframe / embed script + Web Component / NPM). Bring-your-own-data
at runtime. See `CLAUDE.md` for the full product vision and rules, and `ARCHITECTURE.md` for the
technical map.

## Monorepo layout

```
backend/            FastAPI service (Python)
frontend/           Nuxt 3 editor + landing (FSD)
embed/              framework-agnostic embed SDK (Vite lib mode)
packages/contract/  shared TS types (data schema/binding, published config)
```

## Prerequisites

- Python 3.11+
- Node 20+ and pnpm 9+
- Docker + docker-compose (for Postgres/Redis)

## Quick start

Bring up Postgres, Redis and the backend:

```bash
cp .env.example .env
docker compose up -d postgres redis
```

Backend (local):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

Frontend (local):

```bash
pnpm install
pnpm --filter @panelka/frontend dev
```

## Typed API client

The frontend talks to the backend through a typed `openapi-fetch` client (`src/shared/api`).
Regenerate the types from the running backend's OpenAPI schema:

```bash
cd frontend
pnpm gen:api            # reads $NUXT_PUBLIC_API_ORIGIN/openapi.json (default http://localhost:8000)
```

The API origin is configured via `NUXT_PUBLIC_API_ORIGIN` (see `frontend/.env.example`).

## Versioning

App version lives in `VERSION` (`X.Y.Z`). Each commit auto-increments the patch via a git hook.
Enable it once after cloning:

```bash
git config core.hooksPath .githooks
```

## Checks before commit

```bash
cd backend && ruff check . && black --check . && mypy && pytest
pnpm -r lint && pnpm -r test
```
