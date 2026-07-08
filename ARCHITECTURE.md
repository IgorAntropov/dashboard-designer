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
- **packages/renderer/** — framework-agnostic rendering core (1.4). `renderWidget(el, {type, config,
  binding, data, theme})` returns a handle (`update`/`resize`/`dispose`); charts (bar/line/pie) via
  ECharts, `stat-tile`/`text-block` via safe DOM (textContent, no innerHTML). Pure helpers
  `resolveSeries`/`buildChartOption` are unit-tested. The editor wraps it in `entities/widget/WidgetView.vue`
  (sample data + theme read from CSS vars, ResizeObserver → resize); the embed SDK will call the same core.

Config panel (1.5): widget types carry `defaultConfig`/`defaultSchema`/`defaultBinding` in the registry
and the canvas store clones them on create. The store tracks `selectedId`/`selectedWidget` and exposes
`updateConfig`/`updateBinding`/`updateSchemaField`. Clicking a canvas widget selects it (accent ring);
`widgets/config-panel/ConfigPanel.vue` edits the title/text, and per schema field the label, type and
bound data key — mutations flow back into the store so `WidgetView` re-renders live.

## 3. Data / contract flow

The dashboard `layout` (widget instances + `schema` + `binding`) and `data_source` are authored in
the editor, persisted by the backend as JSONB, and served read-only via the public embed endpoint as
a `PublishedConfig`. The customer supplies `PanelkaData` at runtime (push / URL pull / WebSocket).
`packages/contract` is the single source of truth for these shapes; backend Pydantic schemas must
stay aligned with it.

## 4. Environments

Local dev is fully containerized via `docker compose` (Postgres + Redis + backend with migrations and
hot reload + frontend via corepack/pnpm). One command: `./scripts/dev.sh` (or `make dev`); the only
host requirement is a running Docker Desktop. Frontend on `:3000`, backend on `:8000`. Native
(non-Docker) dev is also documented in the README. Secrets via `.env` (see `.env.example`); nothing
committed.

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

Canvas (1.2): FSD `widgets/canvas` — a GridStack-backed `DashboardCanvas.vue` (client-only, dynamic
import for SSR safety) driven by a Pinia store (`add`/`updatePosition`/`remove`) holding
`WidgetInstance`s; `entities/widget` exposes the widget-type registry and contract types; editor route
`/editor/:id` renders the canvas. Store logic is unit-tested with vitest.

Widget palette (1.3): FSD `widgets/palette` renders a scrollable strip of `WIDGET_TYPES`; items are
GridStack drag-in sources (`setupDragIn`, `gs-w`/`gs-h`/`data-widget-type`) and also add on click. The
canvas has `acceptWidgets: true`, converts a `dropped` node into a store `addAt(type, box)` entry, and
registers store widgets with GridStack via a `watch` + `makeWidget` sync (tracked in a `registered`
set). The editor page composes palette + canvas.

UX foundation (1.2b): `@nuxtjs/i18n` with 7 locales (ru default, en/de/pl/cs/fr/it) driven by a
`shared/i18n/config.ts` message bundle; `@nuxtjs/color-mode` (system/light/dark) mapped to Bootstrap's
`data-bs-theme` in `app.vue`; design tokens in `assets/css/theme.css` (neutral base + yellow accent);
a right-anchored app-shell `layouts/default.vue` with nav + `shared/ui` `ThemeToggle`/`LanguageSwitcher`;
landing/auth use `layouts/blank.vue`; page transitions enabled. Locale messages are injected via a
`plugins/i18n.ts` plugin (setLocaleMessage from `shared/i18n/messages.ts`) to avoid path resolution
issues; the initial locale is auto-detected from the browser (Accept-Language) with `ru` fallback and
persisted in a cookie. The blank layout floats a glass control cluster (top-right) with a flag-based
`LanguageSwitcher` and a tri-state (light/system/dark) `ThemeToggle`. Auth forms are centered with
Bootstrap floating labels. Base font is Inter (covers Latin, Latin-Extended and Cyrillic).

Auth UI (1.2c): `entities/session` Pinia store holds the current user + access/refresh tokens (cookies),
with `login`/`register`/`logout`/`refresh`/`init`; a client plugin runs `init()` on startup and the
shared api middleware attaches the access token. `login`/`register` pages (blank layout) call the typed
endpoints; a global `auth.global` middleware redirects unauthenticated users to `/login` and authed
users away from auth pages, so the right-side nav (with user email + logout) is only reached after
sign-in. FIXME: move the refresh token to a backend-set httpOnly cookie to reduce XSS exposure.

Profile (1.2d): backend adds `PATCH /me` (update display name, `UserService`) and
`POST /auth/change-password` (verify current, rehash, revoke refresh tokens). Frontend `/profile`
page shows subscription tier, edits the name, changes the password via an `AppModal`, and hosts
logout (removed from the nav). The nav gained a Profile link; its collapse toggle moved to the bottom
and is left-anchored. Reusable `shared/ui`: `AppButton`, `AppIcon`, `AppModal`, `AppBadge`, `Logo`, `PasswordField`.

Session hardening: the frontend keeps the access token alive with a proactive refresh timer (rotates
before expiry) rather than only reacting to 401s. Single active session is enforced over a WebSocket
`GET /api/v1/ws/session?token=` — an in-memory `SessionConnectionManager` keeps one live socket per
user and, on a new login, sends `{"type":"kicked"}` to the previous socket and closes it; the client
shows a modal and logs out. (In-memory is per-process — production scales this via Redis pub/sub, §9.4.)
