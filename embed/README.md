# @panelka/embed

Framework-agnostic embed SDK for Panelka dashboards. It renders a **published** dashboard from its
embed token, sharing the exact rendering core (`@panelka/renderer`) used by the editor, so the output
is identical everywhere. The Web Component renders inside **Shadow DOM** so it never clashes with the
host page's CSS/JS.

## Build

```bash
pnpm --filter @panelka/embed build
```

Outputs to `dist/`:

- `panelka-embed.js` — ES module (NPM `import`)
- `panelka-embed.umd.cjs` — UMD build for a `<script>` tag (auto-registers `<panelka-dashboard>`)
- `index.d.ts` — type declarations

## Integration methods

### 1. iframe (most isolated)

The published dashboard is also served at `https://embed.panelka.app/embed/EMBED_TOKEN`:

```html
<iframe src="https://embed.panelka.app/embed/EMBED_TOKEN" width="100%" height="600"></iframe>
```

Pass data / read height via `postMessage`:

```js
iframe.contentWindow.postMessage({ type: 'panelka:data', payload: DATA }, '*')
window.addEventListener('message', (e) => {
  if (e.data?.type === 'panelka:height') iframe.style.height = e.data.height + 'px'
})
```

### 2. Script tag + Web Component (recommended)

```html
<script src="https://cdn.panelka.app/panelka-embed.umd.cjs" async></script>
<panelka-dashboard token="EMBED_TOKEN" origin="https://api.panelka.app"></panelka-dashboard>
```

### 3. NPM package

```bash
npm i @panelka/embed
```

```js
import { render } from '@panelka/embed'

const el = render('#dashboard', {
  token: 'EMBED_TOKEN',
  origin: 'https://api.panelka.app',
})
```

## Feeding data (three modes)

`data` is a map of `widgetId → rows`; each widget reads its slice via its binding.

**Runtime push** (default):

```js
el.data = { WIDGET_ID: [{ label: 'Mon', value: 12 }] }
// or el.setData({ ... })
```

**Pull from your URL** — the component fetches the URL on load and every `refresh` seconds
(response capped at ~1 MB):

```html
<panelka-dashboard token="EMBED_TOKEN" data-url="https://your.app/metrics.json" refresh="30">
</panelka-dashboard>
```

**Live (WebSocket)** — add the `live` attribute; the component subscribes to
`/api/v1/public/embed/EMBED_TOKEN/live`. Your backend pushes frames:

```html
<panelka-dashboard token="EMBED_TOKEN" live></panelka-dashboard>
```

```bash
curl -X POST https://api.panelka.app/api/v1/public/embed/EMBED_TOKEN/live \
  -H 'Content-Type: application/json' \
  -d '{"WIDGET_ID":[{"label":"Mon","value":42}]}'
```

If the socket drops, runtime-push and URL-pull keep working.

> Note: the live push endpoint is currently token-scoped; a dedicated ingest key and Redis pub/sub
> fan-out across workers are the production hardening steps (§9.4).
