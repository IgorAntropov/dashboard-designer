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

Error handling & toasts: the backend raises a typed `AppError(status_code, code, detail)`
(`app/core/errors.py`, registered via `add_exception_handler`) so failures carry a machine-readable
`code` in the JSON body (`{"code", "detail"}`). Dashboard quotas distinguish `quota_dashboards` vs
`quota_widgets` (the service's `DashboardQuotaExceededError` gained a `reason`); export gating uses
`export_paid`; missing/owned-by-another resources use `not_found`. On the frontend, the shared api
client exposes `setErrorHandler`; its `onResponse` interceptor now surfaces every non-401 error (parsing
`code` from a cloned response) while the 401 branch still drives the silent refresh/retry. A client
plugin (`plugins/errors.client.ts`) maps `code`→localized message (`errors.*`) and calls `pushToast`
from a tiny reactive store (`shared/notify`), rendered by `shared/ui/ToastHost` (teleported, auto-dismiss,
theme-aware) mounted in `app.vue`. Auth-path failures (login/register/refresh) are skipped so those
screens keep their inline messaging. The editor autosave previously retried on any failure (causing a
duplicate PATCH + duplicate toast on a 403 quota); `updateDashboard` now returns `{ data, status }` and
the editor retries only on `401` (post-refresh), so a quota rejection is a single request with a single
toast.

Geo maps → GeoJSON (5.3 revised): the schematic bundled-SVG world map was replaced by real GeoJSON
choropleth. `packages/renderer/maps/scopes.ts` holds a scope registry (`world` → a public CDN GeoJSON
URL) plus `scopeKeyOf`/`mapUrlFor` (a `custom` scope + `config.mapUrl` override lets a widget point at
any GeoJSON — country, region, oblast — e.g. a self-hosted file). `map.ts` fetches the GeoJSON lazily
(cached per URL), registers it once via `echarts.registerMap(mapNameForUrl(url), geoJson)`, and
`buildGeoOption` builds a roamable `type:'map'` choropleth (visualMap `0..max`, tooltip, theme colors,
`region→value` binding via `resolveRegions`). Because loading is async, `renderWidget` has a dedicated
`renderGeoMap` path: it inits the chart, shows ECharts loading, resolves the map, then applies the
option; on fetch failure it renders a muted "Map data unavailable" title; `update` re-resolves only when
the URL changes (otherwise re-applies data synchronously). The config panel exposes a map-scope select
(`config.mapScope`) and a custom GeoJSON URL field (`config.mapUrl`); `sampleDataFor('svg-map')` returns
world-country preview rows. GeoJSON is loaded at runtime (needs network in the host env; not bundled),
so in an offline sandbox only the pure helpers/option are unit-tested (`map.test.ts`). More detailed or
regional maps are added by registering a scope URL or supplying a custom one. Full gap analysis toward
reference-grade dashboards lives in `docs/gap-analysis-dashboards.md`.

KPI tile 2.0 (5.4): the `stat-tile` widget was upgraded from value+label into a reference-grade KPI
tile, still DOM-rendered in the shared core (`renderKpi`, theme colors inline so it matches editor and
embed Shadow DOM). It shows: title + optional info tooltip (native `title` from `config.info`, i.e.
source/methodology), a formatted value + `config.unit`, a delta badge (▲/▼ + %, green/red/neutral) from
a bound `delta` field, a `config.period` caption, and — when `config.target` is set — a progress bar
`value/target` with a target caption. Pure helpers live in `packages/renderer/kpi.ts`: `formatKpiValue`
(Intl number formatting, `config.decimals`) and `deltaMeta` (arrow/color/sign), both unit-tested
(`kpi.test.ts`). The registry gives `stat-tile` its own `{value, delta}` schema (KPI_SCHEMA) and default
config (unit/period/info); `sampleDataFor` returns `{value, delta}`; the config panel exposes
unit/period/info/target/decimals (`config.*`). Old `.pk-stat*` styles were replaced by `.pk-kpi*` in
both `assets/css/theme.css` and the embed `renderer/styles.ts`.

Multi-series charts (5.5): bar/line/area charts render N series. `packages/renderer/series.ts` gained
`resolveCategories`, `seriesDefs` (reads `config.series: [{key,name,type?,dashed?}]`, falling back to a
single series from `binding.value`), and `valuesForKey`. `option.ts` builds one ECharts series per def
with per-series palette color, `type` override (bar/line — enabling bar+line combos), dashed line style
(for forecast/estimate), and area fill on area charts; a legend appears when >1 series. Number
formatting is centralized: `valueFormatter(input)` (unit + `config.decimals`, via `formatKpiValue`) feeds
the tooltip, and the yAxis label formatter formats ticks — applied to cartesian and pie tooltips. The
config panel gained a series editor for cartesian charts (add/remove rows; each row edits data key,
display name, type auto/bar/line, dashed) plus unit/decimals inputs; `sampleDataFor` adds a `value2`
column so multi-series preview shows data. Backward compatible: charts without `config.series` render a
single series exactly as before. Covered by `series.test.ts` + `option.test.ts`.

Ranking Top-N (5.6): a `ranking` widget (new `data` palette category) renders a leaders/outsiders list —
each row shows rank, name, formatted value (+unit), an inline bar scaled to the top value, and a colored
delta badge. Pure logic is in `packages/renderer/ranking.ts` (`rankRows`: sorts by value desc for `top`
or asc for `bottom` via `config.direction`, applies `config.limit`, returns the rows + max for bar
scaling), unit-tested in `ranking.test.ts`. `renderRanking` (DOM, theme colors inline; reuses
`formatKpiValue`/`deltaMeta`) is registered in `DOM_RENDERERS` and styled by `.pk-rank*` in both
`assets/css/theme.css` and the embed `renderer/styles.ts`. The registry adds the `ranking` type
(label/value/delta schema) and `data` to `WIDGET_CATEGORIES`; `sampleDataFor` returns region-style rows;
the config panel exposes limit / direction (leaders vs bottom) / unit / decimals.

Data table (5.7): a `table` widget (data category) renders a sortable multi-column table. Pure logic in
`packages/renderer/table.ts`: `tableColumns` (from `config.columns: [{key,name,type}]` or inferred from
the first data row, numeric vs text by value) and `sortRows` (numeric or localeCompare, non-mutating),
unit-tested in `table.test.ts`. Rendering needs local sort state, so — like the geo map — `table` has a
dedicated stateful `renderTable` handle (not a plain DOM_RENDERER): it draws a `<table>` with a sticky,
clickable header (toggles asc/desc, shows ▲/▼), right-aligns and formats numeric cells via
`formatKpiValue` (`config.decimals`), and re-renders on header click or `update`. Styled by `.pk-table*`
in both `assets/css/theme.css` and the embed `renderer/styles.ts`. The registry adds the `table` type
(empty schema — columns drive it) with a `columns` config; `sampleDataFor` returns region rows; the
config panel has a columns editor (add/remove; key/name/type text|number) plus decimals.

Sections (5.8): a `section` widget (text category, full-width default 12×1) provides on-canvas grouping
headers (e.g. Транспорт → Авиа/ЖД). `renderSection` (DOM, in `DOM_RENDERERS`) draws a bold title +
optional subtitle with an accent left border, theme colors inline. Registry adds the type with
`{title, subtitle}` config; `sampleDataFor` returns `[]` (no data); the config panel shows a subtitle
field alongside the shared title. Styled by `.pk-section*` in `assets/css/theme.css` + embed
`renderer/styles.ts`. Multi-page dashboards and drill-down were dropped from the roadmap by the
maintainer; remaining polish is custom themes and embed-load analytics.

Custom themes (5.9): a dashboard can carry custom theme tokens instead of only a built-in key.
Backend: `dashboards.theme_tokens` (JSONB nullable, migration 0007) on the model + DashboardUpdate/Out +
PublishedConfig; `DashboardService.update` gates it — setting non-null `theme_tokens` on the free tier
raises `DashboardCustomThemeError` → `AppError(403, custom_theme_paid)`; the embed public config now
includes `theme_tokens`. Renderer: `resolveTheme(key, tokens)` merges partial custom tokens over the
base theme (keeps base series/font when absent), unit-tested (`themes.test.ts`). Frontend: the canvas
store holds `customTheme` + an `effectiveTheme` computed (`resolveTheme(themeKey, themeKey==='custom' ?
customTheme : null)`), persisted in undo snapshots and hydrate; `DashboardCanvas` renders with
`effectiveTheme`. `ThemeSelector` gains a paid-gated "custom" option and an edit button opening a
`ThemeEditor` modal (color pickers for bg/surface/text/muted/accent + 5 series colors + font), which
writes tokens to the store; the editor page saves `theme_tokens` in autosave and hydrates it on load.
Embed engine resolves the theme the same way from `config.theme_tokens`. Errors plugin maps
`custom_theme_paid` → `errors.customThemePaid` toast; all labels are i18n (`theme.custom`,
`themeEditor.*`) across 7 locales. NOTE: migration 0007 requires a backend container restart to apply.

Embed analytics (5.10): embed loads are counted per dashboard per day. `embed_events` (dashboard_id,
day, count, unique(dashboard_id, day); model + migration 0008 + registered in models/__init__).
`AnalyticsService.record_load` does a portable upsert (UPDATE count+1; INSERT if no row) so it works on
both SQLite (tests) and Postgres; the public config route (`GET /public/embed/{token}`) calls it on
every load — cache hit or miss — wrapped fail-open so analytics never breaks an embed. Owners read
`GET /dashboards/{id}/analytics` (ownership-checked) → `{total, days:[{day,count}]}` for the last 30
days (`AnalyticsService.get_analytics`). Frontend: `getAnalytics` repository call + typed schema; the
dashboards page fetches on opening the embed modal and shows the total plus a compact daily bar chart
(`.embed-bars`, CSS). i18n `embed.analytics|loads|noData` across 7 locales. Phase 5 is complete;
multi-page dashboards and drill-down were intentionally dropped. NOTE: migration 0008 needs a backend
container restart to apply.

Secure live ingest (hardening): the live push endpoint is now authenticated. Publishing generates a
secret `ingest_key` on the embed token (model + migration 0009) returned in PublishResponse; the
customer's backend must send it as `X-Ingest-Key` to `POST /public/embed/{token}/live`
(`EmbedService.verify_ingest`, constant-time compare) — 403 otherwise (previously anyone with the public
token could push). Fan-out across workers: `LiveChannelManager.broadcast` publishes to a Redis channel
`embed:live:{token}`; a lazily-started per-process subscriber (`psubscribe embed:live:*`) delivers to its
local sockets — all fail-open, falling back to direct local delivery when Redis is down. The embed modal
now shows the ingest key + a ready `curl` live-push example. NOTE: migration 0009 needs a backend restart.

Refresh token in httpOnly cookie (hardening): the refresh token is no longer stored in JS-readable
storage. `app/core/cookies.py` sets `panelka_refresh` as HttpOnly, SameSite=Lax, Secure in production,
scoped to `path=/api/v1/auth`. Login, refresh-rotation and the OAuth callback set the cookie and blank
the `refresh_token` field in the JSON body (schema unchanged); `POST /auth/refresh` reads the token from
the cookie (body optional, kept for non-browser clients) and `POST /auth/logout` clears it. Frontend: the
session store dropped its `panelka_refresh` JS cookie — `refresh()` posts with no body, `logout()` calls
`/auth/logout`; the shared api client sends `credentials: 'include'` so the cookie flows on same-site
cross-origin requests. The access token stays a short-lived bearer in a JS cookie + Authorization header.
This resolves the earlier ARCHITECTURE FIXME about refresh-token XSS exposure.

Async export queue (hardening): dashboard export is now job-based instead of a synchronous file
response. `export_jobs` (id, dashboard_id, user_id, status pending|done|failed, result jsonb; model +
migration 0010 + registered). `POST /dashboards/{id}/export` (still paid-gated) creates a job and runs
`ExportService.process` to fill the result, returning `ExportJobOut {id, status, result}`; owners poll
`GET /dashboards/exports/{job_id}` (ownership-checked). The frontend `exportDashboard` creates the job,
polls until `done`, then downloads the JSON blob — same UX, queue-ready API. Processing is currently
inline (export is just serializing the dashboard); the `ExportService.create`/`process` split is the
executor boundary, so swapping in an arq/Celery worker (calling `process` off-request) is a drop-in with
no API change. NOTE: migration 0010 needs a backend restart.

CloudPayments widget (frontend, feature-flagged): the profile page now drives real checkout. Choosing a
paid tier calls `POST /billing/subscribe` (`entities/billing.createCheckout`) which returns the
`public_id` (from backend config) + amount/currency/description/accountId/invoiceId/tier. If `public_id`
is empty (no CloudPayments account configured), it falls back to the dev mock (`session.setTier`). If
set, `entities/billing.openCheckout` lazily loads the CloudPayments widget script and calls
`cp.pay('charge', …, {data:{tier}})` so the tier is echoed back to the webhook; on `onSuccess` a toast is
shown and the client polls `/me` (webhook is the authoritative activation path). Downgrade to free stays
a direct mock. So the integration is code-complete and activates purely by setting
`PANELKA_CLOUDPAYMENTS_PUBLIC_ID` (+ api secret for webhooks) in env — no code change needed to go live.

CloudPayments doc alignment: verified against current developers.cloudpayments.ru. The widget call was
updated to the current intent API — `new cp.CloudPayments().start({ publicTerminalId, amount, currency,
paymentSchema:'Single', description, externalId, userInfo:{accountId}, metadata:{tier} })` returning a
Promise (was the legacy `.pay('charge', {…, invoiceId, data}, {onSuccess,onFail})`). Field renames the
docs now use: data→metadata, invoiceId→externalId, charge/auth→paymentSchema Single/Dual,
accountId→userInfo.accountId, publicId→publicTerminalId. A fiscal receipt (54-ФЗ `receipt`) is optional
(only when CloudKassir is enabled), so no receipt is sent. Backend webhook parser now reads the custom
payload from `Data` or `Metadata` for forward-compat, keeping `tier` activation working.

Rate limiting & SSRF guard (hardening): `app/core/rate_limit.py` provides a Redis-backed fixed-window
limiter as a FastAPI dependency (`rate_limit_dep(bucket, limit, window)`, keyed by client IP) that raises
`AppError(429, rate_limited)` when exceeded and fails open if Redis is unavailable (`hit()` is
unit-tested). Applied: the whole `auth` router (login/register/refresh/logout/change-password share one
bucket), the public embed-config GET, the live-ingest POST, and the pull-data GET — limits are settings
(`rate_limit_auth_per_min` 20, `_public_per_min` 120, `_ingest_per_min` 120). A new guarded server-side
pull proxy `GET /public/embed/{token}/data` fetches the dashboard's configured pull URL through
`app/core/ssrf.py`: `is_safe_url` rejects non-http(s) schemes and any host resolving to a
private/loopback/link-local/reserved/multicast IP (incl. the 169.254.169.254 metadata address), and
`safe_fetch` adds a timeout, size cap and disables redirects. `is_safe_url` is unit-tested with literal
IPs. Known follow-up: pin the connection to the validated IP to fully close the DNS-rebinding (TOCTOU)
window. Errors plugin maps `rate_limited` → `errors.rateLimited` toast across 7 locales.

Security headers, embed frame-ancestors, CI scan (hardening):
- Backend adds a `security_headers` HTTP middleware (main.py) setting `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, a locked
  `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'` (API returns only JSON), and HSTS
  in production. Unit-tested (`test_security_headers.py`).
- Frontend adds a Nitro server middleware (`server/middleware/security.ts`) applying nosniff/referrer +
  HSTS(prod) globally and an app CSP + `X-Frame-Options: DENY` on all routes EXCEPT `/embed/*`.
- Embed framing is allowlist-driven: `PublishedConfig` now exposes `allowed_domains`, and the embed page
  sets, during SSR, `Content-Security-Policy: frame-ancestors <domains>` from the token's allowlist
  (empty allowlist → `*`, matching the "empty = any" publish semantics), so a published dashboard can
  only be iframed by approved domains.
- CI gains a `security` job (`continue-on-error`) running `pip-audit` (backend) and `pnpm audit
  --audit-level high` (frontend) for dependency vulnerability scanning.
Follow-up: tighten the app CSP toward nonce-based script-src (currently allows 'unsafe-inline' for
Nuxt hydration + known CDNs: fonts, CloudPayments widget).
