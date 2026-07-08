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

Themes (1.6): `packages/renderer` ships 5 dashboard token sets (`light-minimal`, `dark-pro`, `neon`,
`pastel`, `corporate-blue`) as `RenderTheme`s via `getTheme(key)`. The canvas store holds `themeKey`;
`DashboardCanvas` applies the theme's colors as inline CSS vars on the grid (so DOM widgets/surfaces
follow it) and passes the `RenderTheme` to `WidgetView` (charts). `widgets/theme-switcher/ThemeSelector`
changes it; the editor loads it from the dashboard's `theme_key`. This dashboard theme is independent
from the app's light/dark color-mode.

Autosave (1.7): the editor hydrates the canvas store from `dashboard.layout.widgets` + `theme_key`,
then a debounced watch persists `{ layout: { widgets }, theme_key }` via `PATCH /dashboards/{id}`
(with an explicit Save button and a saving/saved indicator). The store keeps a debounced JSON history
(`hydrate`/`record`/`undo`/`redo`, `canUndo`/`canRedo`) so structural edits and settled typing collapse
into undoable steps. This closes Phase 1 (Editor MVP).

Publish + embed (Phase 2): `embed_tokens` table (opaque revocable token + domain allowlist);
`POST /dashboards/{id}/publish` marks the dashboard published and upserts its token. The public,
auth-free `GET /public/embed/{token}` returns a read-only `PublishedConfig` (theme, layout,
attribution derived from the owner's tier) cached in Redis (60s, fails open to DB). A public Nuxt route
`/embed/[token]` (layout-less, bypasses the auth guard) fetches that config and renders the dashboard
read-only with `@panelka/renderer`, accepts `postMessage {type:'panelka:data'}` and reports its height
back to the parent (`panelka:height`). The dashboards page exposes an Embed modal (publish + copy link
and iframe snippet).

Embed SDK (Phase 3): `embed/` is a Vite lib-mode package `@panelka/embed`. `src/index.ts` auto-registers
the `<panelka-dashboard>` Web Component (Shadow DOM, isolated) which fetches the public config and
renders via a `DashboardEngine` built on `@panelka/renderer`; a `render(target, opts)` helper serves the
NPM path. Data arrives three ways: runtime push (`el.data`), URL pull (`data-url`/`refresh` attrs, ~1 MB
cap), and live WebSocket (`live` attr → `/public/embed/{token}/live`, backend `LiveChannelManager`
broadcasts frames pushed to the token-scoped `POST` ingest; in-memory now, Redis pub/sub for scale).
Builds emit ESM + UMD (script-tag) + `.d.ts`. Docs for all three integration methods live in `embed/README.md`.

Billing (Phase 4): a swappable `BillingProvider` interface (`services/billing/`) with a CloudPayments
implementation (checkout session + HMAC webhook verification) behind `get_billing_provider`. `POST
/billing/subscribe` returns a CloudPayments checkout for a paid tier; `POST /billing/webhook/{provider}`
verifies the signature, dedupes on a `processed_webhooks` row (idempotent), and drives the subscription
lifecycle via `BillingService` (activate/downgrade/past_due on the `subscriptions` table + `users.tier`).
Quotas are server-side: dashboard count and a free-tier 5-widget cap (`services/quota`). `POST
/dashboards/{id}/export` (paid tiers only) returns the dashboard config as a JSON download. Migrations
`0005_subscriptions`, `0006_processed_webhooks`. (Async job queue + PNG/PDF export remain future work.)

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
before expiry) and a reactive guard — the shared api client intercepts `401` (non-auth paths), runs the
refresh, retries idempotent requests, and on refresh failure logs out and redirects to `/login`. Single active session is enforced over a WebSocket
`GET /api/v1/ws/session?token=` — an in-memory `SessionConnectionManager` keeps one live socket per
user and, on a new login, sends `{"type":"kicked"}` to the previous socket and closes it; the client
shows a modal and logs out. (In-memory is per-process — production scales this via Redis pub/sub, §9.4.)

Landing (5.1): the public marketing page (`pages/index.vue`, `layout: false`) is composed from a
`widgets/landing` FSD slice with a single public `index.ts`. Sections: `LandingHeader` (sticky, glass
blur, session-aware CTA — "My dashboards" when authenticated, else login/start), `LandingHero`
(parallax hero driven by a `lib/useScrollY` composable, with `HeroChart` — a pure CSS/SVG animated
dashboard mock: staggered rising bars, an SVG area line drawn via `stroke-dashoffset`, a donut gauge,
and rAF count-up stat tiles), `LandingFeatures`, `LandingHow` (3-step use case), `LandingPricing`
(Free/Pro/Unlimited cards mirroring §10 tiers and the `490/990 ₽` plan prices; CTA routes to
`/profile` when authenticated, else `/register`), `LandingCta`, `LandingFooter`. Scroll-reveal uses a
shared `lib/useReveal` IntersectionObserver composable; anchor nav relies on `scroll-padding-top` +
`scroll-behavior: smooth` (both disabled under `prefers-reduced-motion`). All copy is i18n-driven under
the `landing.*` namespace across the 7 locales; styling is scoped per component on `--pk-*` tokens so
light/dark themes cascade. The old `blank` layout still serves auth pages.

Widget library (5.2): the shared rendering core (`packages/renderer`) now covers 11 widget types.
ECharts-backed via `buildChartOption`: `bar-chart`, `line-chart`, `area-chart`, `pie-chart`,
`donut-chart` (wider inner radius), `scatter-chart` (x/y points via `resolvePoints`), `radar-chart`
(indicators from categories), and `gauge` (single value via `resolveScalar`, `config.max`). DOM-rendered
(no ECharts) via a `DOM_RENDERERS` map: `stat-tile`, `progress` (accent bar, `config.max`, colors taken
from the theme inline so it works both in the editor and inside the embed Shadow DOM), and `text-block`.
Both the editor (`entities/widget/WidgetView`) and the embed engine call the same `renderWidget`, so a
new type appears everywhere at once. The `entities/widget` registry gained the new type defs (with
`POINT`/`VALUE` schema+binding presets) and a `WIDGET_CATEGORIES` order; `sampleDataFor` returns
type-appropriate preview data (scatter points, gauge/progress scalars). The palette (`widgets/palette`)
is grouped by localized category headers (`palette.charts|kpi|text`); the config panel exposes a `max`
field for gauge/progress (`config.max`). New progress styles live in both `assets/css/theme.css` and the
embed `renderer/styles.ts`. Renderer logic is unit-tested (`option.test.ts`, `series.test.ts`).

SVG geo maps (5.3): a `svg-map` widget (new `geo` palette category) renders a choropleth over a
bundled, self-contained SVG world map. `packages/renderer/maps/world.ts` holds the SVG (six named
continent regions via the `name` attribute) and `WORLD_MAP_NAME`; `map.ts` lazily registers it once
with `echarts.registerMap(name, { svg })` (`ensureWorldMap`, idempotent) and builds the option
(`buildMapOption`) — a `type: 'map'` series plus a `visualMap` that scales `0..max(value)` from
`colorSurface` to `colorAccent`, all theme-driven. Region values come from a `region`→`value` binding
via `resolveRegions`. `renderWidget` gained a `svg-map` branch and a shared `renderEcharts(el, input,
build)` helper (removing the init/update/resize/dispose duplication across charts and maps). The
registry adds the `svg-map` type (REGION schema/binding) and `geo` to `WIDGET_CATEGORIES`;
`sampleDataFor` returns region rows whose names match the SVG. Editor and embed share the same path, so
the map renders identically in both. Unit-tested in `map.test.ts`. The map is intentionally a compact
schematic (continent-level) — swapping in a detailed GeoJSON/SVG per country is a later extension.
