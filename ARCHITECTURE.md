# ARCHITECTURE.md — Panelka technical map

> Living technical map. Update in the same iteration as any change to module boundaries or shared
> contracts. This file describes how the parts wire together.

## 1. High-level topology

```
                     ┌────────────────────┐
   editor / landing  │  frontend (Nuxt 3) │  FSD layers, Pinia, Bootstrap
                     └─────────┬──────────┘
                               │ REST /api/v1 (JWT)
                     ┌─────────▼──────────┐
                     │  backend (FastAPI) │  api → services → models/db
                     │  Postgres + Redis  │
                     └─────────┬──────────┘
                               │ public read config + live channel
                     ┌─────────▼──────────┐
   customer's app    │   embed SDK        │  iframe / Web Component / NPM
                     └────────────────────┘
```

## 2. Modules

- **backend/** — FastAPI service. Layers: `api` (routers) → `services` (business logic) →
  `models`/`db`. Config in `core`. Async SQLAlchemy 2.x + Alembic migrations. Redis for cache /
  rate-limit / pub-sub (live channel). Entry point: `app.main:create_app`.
- **frontend/** — Nuxt 3 app following FSD (`app → processes → pages → widgets → features →
  entities → shared`). `srcDir = src/`. Nuxt file-based routing lives in `src/pages` and maps onto
  the FSD pages layer (each route screen is a page slice). Pinia for state, Bootstrap for chrome.
- **embed/** — framework-agnostic SDK (Vite lib mode). Not scaffolded yet (iteration 3.x).
- **packages/contract/** — shared TS types for the data contract (`WidgetSchema`, `WidgetBinding`,
  `PublishedConfig`, `PanelkaData`). Consumed by `frontend` and `embed`; mirrored by backend Pydantic.

## 3. Data / contract flow

The dashboard `layout` (widget instances + `schema` + `binding`) and `data_source` are authored in
the editor, persisted by the backend as JSONB, and served read-only via the public embed endpoint as
a `PublishedConfig`. The customer supplies `PanelkaData` at runtime (push / URL pull / WebSocket).
`packages/contract` is the single source of truth for these shapes; backend Pydantic schemas must
stay aligned with it.

## 4. Environments

Local dev via docker-compose (Postgres + Redis + backend). Frontend runs via Nuxt dev server.
Secrets via `.env` (see `.env.example`); nothing committed.

## 5. Versioning

App version is the root `VERSION` file (`X.Y.Z`, starts `0.0.0`). Every commit bumps the patch by
one via the `.githooks/pre-commit` hook; `Z` rolls over at 99 into `Y`, and `Y` rolls over at 99 into
`X` (e.g. `0.0.99 → 0.1.0`, `0.99.99 → 1.0.0`). Enable per clone with
`git config core.hooksPath .githooks`.

## 6. Status

Scaffolded: repo layout (0.1), backend base + health endpoint (0.2), frontend FSD skeleton (0.5),
version display (0.6): `GET /api/v1/version` plus a build-time `appVersion` shown on the About
screen; API-docs hardening (0.7): OpenAPI/Swagger gated in production, `BearerAuth` JWT scheme, and
reusable `UuidPkMixin` / `TimestampMixin` for future models; frontend typed API client (0.8):
`openapi-typescript` generates `src/shared/api/schema.d.ts` from the backend OpenAPI, consumed by an
`openapi-fetch` client; API origin via `NUXT_PUBLIC_API_ORIGIN`.

Auth (0.3): `users` + `refresh_tokens` tables (UUID pks); argon2 password hashing (`core/passwords`);
JWT access/refresh with rotation + server-side hashed-token revocation (`core/tokens`,
`services/auth`); routes `POST /auth/register|login|refresh` and `GET /me`; Alembic migration
`0001_auth_tables`.

OAuth (0.4): `oauth_accounts` table; a provider abstraction (`services/oauth/base.OAuthProvider`
Protocol + `OAuthIdentity`) with Yandex and VK implementations behind `build_provider` registry;
`GET /auth/oauth/{provider}/start` (state cookie + redirect) and `/callback` (exchange → upsert user
→ issue tokens); migration `0002_oauth_accounts`.

Dashboard CRUD (1.1): `dashboards` table (UUID pk, JSONB `layout`/`data_bindings`/`data_source`,
`status` enum); `DashboardService` enforces server-side ownership (foreign UUID → 404) and per-tier
quota (`services/quota`, free=1/pro=3/unlimited=∞); routes `GET/POST /dashboards`,
`GET/PATCH/DELETE /dashboards/{id}`, `POST /dashboards/{id}/duplicate`; migration `0003_dashboards`.
Frontend `entities/dashboard` (typed `openapi-fetch` repository) + `pages/dashboards` list page;
a shared auth middleware attaches the access token via `setAccessToken`.
