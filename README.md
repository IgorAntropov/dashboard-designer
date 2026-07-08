# Panelka

SaaS dashboard constructor: build dashboards from a widget library by drag-and-drop, theme them,
and embed them into your own app (iframe / embed script + Web Component / NPM). Bring-your-own-data
at runtime. See `ARCHITECTURE.md` for the technical map.

## Monorepo layout

```
backend/            FastAPI service (Python)
frontend/           Nuxt 3 editor + landing (FSD)
embed/              framework-agnostic embed SDK (Vite lib mode)
packages/contract/  shared TS types (data schema/binding, published config)
```

## Run locally (one command)

The only requirement is **Docker Desktop** (running). No local Python, Node, or pnpm needed —
everything runs in containers.

```bash
./scripts/dev.sh        # or: make dev
```

This starts Postgres, Redis, the backend (migrations + hot reload) and the frontend:

- Frontend: http://localhost:3000
- Backend API + Swagger docs: http://localhost:8000/docs

Stop with `Ctrl+C`, or `make down`. First run builds images and installs deps, so it takes a few
minutes; later runs are fast.

> If you see "Cannot connect to the Docker daemon", start Docker Desktop first.
>
> If a port is already in use (e.g. a local Postgres on 5432), change the host ports in `.env`
> (`POSTGRES_PORT`, `REDIS_PORT`, `BACKEND_PORT`, `FRONTEND_PORT`). Defaults are 5433/6380/8000/3000
> to avoid clashing with a local database.

## Native dev (optional, without Docker)

macOS ships Python as `python3`, and pnpm comes bundled with Node via corepack.

```bash
# backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
alembic upgrade head
uvicorn app.main:app --reload

# frontend (separate terminal)
corepack enable
pnpm install
pnpm --filter @panelka/frontend dev
```

Native dev still needs Postgres and Redis running (e.g. `docker compose up -d postgres redis`).

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
