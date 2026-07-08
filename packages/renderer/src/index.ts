import * as echarts from 'echarts'

import { buildGeoOption, ensureMap, mapNameForUrl } from './map'
import { mapUrlFor } from './maps/scopes'
import { buildChartOption } from './option'
import type { RenderInput, WidgetHandle } from './types'

export type { RenderInput, RenderTheme, WidgetHandle } from './types'
export {
  resolvePoints,
  resolveRegions,
  resolveScalar,
  resolveSeries,
} from './series'
export { buildChartOption } from './option'
export { buildGeoOption, ensureMap } from './map'
export { MAP_SCOPES, DEFAULT_MAP_SCOPE, mapUrlFor, scopeKeyOf } from './maps/scopes'
export { DASHBOARD_THEMES, DEFAULT_THEME_KEY, getTheme } from './themes'

const CHART_TYPES = new Set([
  'bar-chart',
  'line-chart',
  'area-chart',
  'pie-chart',
  'donut-chart',
  'scatter-chart',
  'radar-chart',
  'gauge',
])

function renderStat(el: HTMLElement, input: RenderInput): void {
  const valueKey = input.binding.value ?? 'value'
  const first = input.data[0]

  el.replaceChildren()
  const wrap = document.createElement('div')
  wrap.className = 'pk-stat'

  const value = document.createElement('div')
  value.className = 'pk-stat__value'
  value.textContent = first ? String(first[valueKey] ?? '') : '—'

  const label = document.createElement('div')
  label.className = 'pk-stat__label'
  label.textContent = typeof input.config.title === 'string' ? input.config.title : ''

  wrap.append(value, label)
  el.append(wrap)
}

function renderText(el: HTMLElement, input: RenderInput): void {
  const raw =
    (typeof input.config.text === 'string' && input.config.text) ||
    (typeof input.config.title === 'string' && input.config.title) ||
    'Text'

  el.replaceChildren()
  const block = document.createElement('div')
  block.className = 'pk-text'
  block.textContent = raw
  el.append(block)
}

function renderProgress(el: HTMLElement, input: RenderInput): void {
  const valueKey = input.binding.value ?? 'value'
  const first = input.data[0]
  const value = first ? Number(first[valueKey] ?? 0) : 0
  const max = typeof input.config.max === 'number' ? input.config.max : 100
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0

  el.replaceChildren()
  const wrap = document.createElement('div')
  wrap.className = 'pk-progress'

  const label = document.createElement('div')
  label.className = 'pk-progress__label'
  label.style.color = input.theme.colorMuted
  label.textContent = typeof input.config.title === 'string' ? input.config.title : ''

  const valueEl = document.createElement('div')
  valueEl.className = 'pk-progress__value'
  valueEl.style.color = input.theme.colorText
  valueEl.textContent = `${Math.round(pct)}%`

  const track = document.createElement('div')
  track.className = 'pk-progress__track'

  const bar = document.createElement('div')
  bar.className = 'pk-progress__bar'
  bar.style.width = `${pct}%`
  bar.style.backgroundColor = input.theme.colorAccent

  track.append(bar)
  wrap.append(label, valueEl, track)
  el.append(wrap)
}

const DOM_RENDERERS: Record<
  string,
  (el: HTMLElement, input: RenderInput) => void
> = {
  'stat-tile': renderStat,
  progress: renderProgress,
  'text-block': renderText,
}

function renderEcharts(
  el: HTMLElement,
  input: RenderInput,
  build: (input: RenderInput) => Record<string, unknown>,
): WidgetHandle {
  const chart = echarts.init(el)
  chart.setOption(build(input))
  return {
    update: (next) => chart.setOption(build(next), true),
    resize: () => chart.resize(),
    dispose: () => chart.dispose(),
  }
}

function errorOption(input: RenderInput, message: string): Record<string, unknown> {
  return {
    backgroundColor: 'transparent',
    title: {
      text: message,
      left: 'center',
      top: 'center',
      textStyle: { color: input.theme.colorMuted, fontSize: 12, fontWeight: 'normal' },
    },
  }
}

function renderGeoMap(el: HTMLElement, input: RenderInput): WidgetHandle {
  const chart = echarts.init(el)
  let current = input
  let disposed = false
  let loadedUrl = ''

  function apply(next: RenderInput): void {
    current = next
    const url = mapUrlFor(next.config)
    chart.showLoading()
    ensureMap(next.config)
      .then((name) => {
        if (disposed) {
          return
        }
        loadedUrl = url
        chart.hideLoading()
        chart.setOption(buildGeoOption(current, name), true)
      })
      .catch(() => {
        if (disposed) {
          return
        }
        chart.hideLoading()
        chart.setOption(errorOption(current, 'Map data unavailable'), true)
      })
  }

  apply(input)

  return {
    update: (next) => {
      if (mapUrlFor(next.config) === loadedUrl && loadedUrl) {
        current = next
        chart.setOption(buildGeoOption(next, mapNameForUrl(loadedUrl)), true)
      } else {
        apply(next)
      }
    },
    resize: () => chart.resize(),
    dispose: () => {
      disposed = true
      chart.dispose()
    },
  }
}

export function renderWidget(el: HTMLElement, input: RenderInput): WidgetHandle {
  if (input.type === 'svg-map') {
    return renderGeoMap(el, input)
  }

  if (CHART_TYPES.has(input.type)) {
    return renderEcharts(el, input, buildChartOption)
  }

  const renderDom = DOM_RENDERERS[input.type] ?? renderText
  renderDom(el, input)
  return {
    update: (next) => renderDom(el, next),
    resize: () => undefined,
    dispose: () => el.replaceChildren(),
  }
}
