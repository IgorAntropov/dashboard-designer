import * as echarts from 'echarts'

import { deltaMeta, formatKpiValue } from './kpi'
import { buildGeoOption, ensureMap, mapNameForUrl } from './map'
import { mapUrlFor } from './maps/scopes'
import { buildChartOption } from './option'
import type { RenderInput, WidgetHandle } from './types'

export type { RenderInput, RenderTheme, WidgetHandle } from './types'
export { formatKpiValue, deltaMeta } from './kpi'
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

function textConfig(input: RenderInput, key: string): string {
  const value = input.config[key]
  return typeof value === 'string' ? value : ''
}

function renderKpi(el: HTMLElement, input: RenderInput): void {
  const valueKey = input.binding.value ?? 'value'
  const deltaKey = input.binding.delta ?? 'delta'
  const first = input.data[0]
  const decimals =
    typeof input.config.decimals === 'number' ? input.config.decimals : undefined
  const rawValue = first != null ? Number(first[valueKey] ?? 0) : null
  const rawDelta =
    first != null && first[deltaKey] != null && first[deltaKey] !== ''
      ? Number(first[deltaKey])
      : null
  const unit = textConfig(input, 'unit')
  const period = textConfig(input, 'period')
  const info = textConfig(input, 'info')
  const title = textConfig(input, 'title')
  const target =
    typeof input.config.target === 'number' && input.config.target > 0
      ? input.config.target
      : null

  el.replaceChildren()
  const wrap = document.createElement('div')
  wrap.className = 'pk-kpi'

  if (title || info) {
    const head = document.createElement('div')
    head.className = 'pk-kpi__head'
    const titleEl = document.createElement('span')
    titleEl.className = 'pk-kpi__title'
    titleEl.style.color = input.theme.colorMuted
    titleEl.textContent = title
    head.append(titleEl)
    if (info) {
      const infoEl = document.createElement('span')
      infoEl.className = 'pk-kpi__info'
      infoEl.textContent = 'i'
      infoEl.title = info
      infoEl.style.borderColor = input.theme.colorMuted
      infoEl.style.color = input.theme.colorMuted
      head.append(infoEl)
    }
    wrap.append(head)
  }

  const valueRow = document.createElement('div')
  valueRow.className = 'pk-kpi__valueRow'
  const valueEl = document.createElement('span')
  valueEl.className = 'pk-kpi__value'
  valueEl.style.color = input.theme.colorText
  valueEl.textContent =
    rawValue != null && Number.isFinite(rawValue)
      ? formatKpiValue(rawValue, decimals)
      : '—'
  valueRow.append(valueEl)
  if (unit) {
    const unitEl = document.createElement('span')
    unitEl.className = 'pk-kpi__unit'
    unitEl.style.color = input.theme.colorMuted
    unitEl.textContent = unit
    valueRow.append(unitEl)
  }
  wrap.append(valueRow)

  const meta = document.createElement('div')
  meta.className = 'pk-kpi__meta'
  if (rawDelta != null && Number.isFinite(rawDelta)) {
    const delta = deltaMeta(rawDelta, input.theme)
    const badge = document.createElement('span')
    badge.className = 'pk-kpi__delta'
    badge.style.color = delta.color
    badge.textContent = `${delta.arrow} ${delta.text}`
    meta.append(badge)
  }
  if (period) {
    const periodEl = document.createElement('span')
    periodEl.className = 'pk-kpi__period'
    periodEl.style.color = input.theme.colorMuted
    periodEl.textContent = period
    meta.append(periodEl)
  }
  if (meta.childNodes.length > 0) {
    wrap.append(meta)
  }

  if (target != null && rawValue != null && Number.isFinite(rawValue)) {
    const pct = Math.max(0, Math.min(100, (rawValue / target) * 100))
    const track = document.createElement('div')
    track.className = 'pk-kpi__track'
    const bar = document.createElement('div')
    bar.className = 'pk-kpi__bar'
    bar.style.width = `${pct}%`
    bar.style.backgroundColor = input.theme.colorAccent
    track.append(bar)
    wrap.append(track)

    const caption = document.createElement('div')
    caption.className = 'pk-kpi__target'
    caption.style.color = input.theme.colorMuted
    caption.textContent = `${formatKpiValue(target, decimals)}${unit ? ` ${unit}` : ''}`
    wrap.append(caption)
  }

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
  'stat-tile': renderKpi,
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
