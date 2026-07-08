# @panelka/embed

Framework-agnostic embed SDK for Panelka dashboards. Ships a `<panelka-dashboard>` Web Component
(Shadow DOM, isolated) plus a small JS API, rendering through the shared `@panelka/renderer` core.

## Script tag + Web Component

```html
<script src="https://cdn.panelka.app/panelka-embed.umd.cjs" async></script>
<panelka-dashboard token="EMBED_TOKEN" origin="https://api.panelka.app"></panelka-dashboard>
<script>
  const el = document.querySelector('panelka-dashboard')
  el.data = { WIDGET_ID: [{ label: 'Mon', value: 12 }] } // runtime push
</script>
```

## NPM

```bash
npm i @panelka/embed
```

```js
import { render } from '@panelka/embed'

render('#dashboard', {
  token: 'EMBED_TOKEN',
  origin: 'https://api.panelka.app',
  data: { WIDGET_ID: [{ label: 'Mon', value: 12 }] },
})
```

Data is a map of `widgetId → rows`; each widget reads its slice via its binding.
