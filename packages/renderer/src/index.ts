import * as echarts from 'echarts'

import { deltaMeta, formatKpiValue } from './kpi'
import { buildGeoOption, ensureMap, mapNameForUrl } from './map'
import { mapUrlFor } from './maps/scopes'
import { buildChartOption } from './option'
import { rankRows } from './ranking'
import { sortRows, tableColumns } from './table'
import type { SortDirection } from './table'
import type { RenderInput, WidgetHandle } from './types'

export type { RenderInput, RenderTheme, WidgetHandle } from './types'
export { formatKpiValue, deltaMeta } from './kpi'
export { rankRows } from './ranking'
export { tableColumns, sortRows } from './table'
export {
  resolvePoints,
  resolveRegions,
  resolveScalar,
  resolveSeries,
} from './series'
export { buildChartOption } from './option'
export { buildGeoOption, ensureMap } from './map'
export { MAP_SCOPES, DEFAULT_MAP_SCOPE, mapUrlFor, scopeKeyOf } from './maps/scopes'
export { DASHBOARD_THEMES, DEFAULT_THEME_KEY, getTheme, resolveTheme } from './themes'
export { WIDGET_CSS, ENGINE_CSS } from './styles'
export { DashboardEngine } from './engine'
export type { EmbedConfig, EmbedData, EmbedWidget } from './engine'

const CHART_TYPES = new Set([
  'bar-chart',
  'line-chart',
  'area-chart',
  'pie-chart',
  'donut-chart',
  'scatter-chart',
  'scatter-trend',
  'radar-chart',
  'combo',
  'timeseries',
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
      infoEl.className = 'pk-kpi__info pk-info'
      infoEl.textContent = 'i'
      infoEl.tabIndex = 0
      infoEl.setAttribute('data-pk-tip', info)
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

function renderRanking(el: HTMLElement, input: RenderInput): void {
  const { rows, max } = rankRows(input)
  const decimals =
    typeof input.config.decimals === 'number' ? input.config.decimals : undefined
  const unit = textConfig(input, 'unit')

  el.replaceChildren()
  const wrap = document.createElement('div')
  wrap.className = 'pk-rank'

  const title = textConfig(input, 'title')
  if (title) {
    const head = document.createElement('div')
    head.className = 'pk-rank__title'
    head.style.color = input.theme.colorMuted
    head.textContent = title
    wrap.append(head)
  }

  rows.forEach((row, index) => {
    const rowEl = document.createElement('div')
    rowEl.className = 'pk-rank__row'

    const rank = document.createElement('span')
    rank.className = 'pk-rank__num'
    rank.style.color = input.theme.colorMuted
    rank.textContent = String(index + 1)

    const body = document.createElement('div')
    body.className = 'pk-rank__body'

    const top = document.createElement('div')
    top.className = 'pk-rank__top'

    const name = document.createElement('span')
    name.className = 'pk-rank__name'
    name.style.color = input.theme.colorText
    name.textContent = row.name

    const value = document.createElement('span')
    value.className = 'pk-rank__value'
    value.style.color = input.theme.colorText
    value.textContent = `${formatKpiValue(row.value, decimals)}${unit ? ` ${unit}` : ''}`

    top.append(name, value)

    const track = document.createElement('div')
    track.className = 'pk-rank__track'
    const bar = document.createElement('div')
    bar.className = 'pk-rank__bar'
    bar.style.width = `${Math.max(0, Math.min(100, (Math.abs(row.value) / max) * 100))}%`
    bar.style.backgroundColor = input.theme.colorAccent
    track.append(bar)

    body.append(top, track)
    rowEl.append(rank, body)

    if (row.delta != null && Number.isFinite(row.delta)) {
      const delta = deltaMeta(row.delta, input.theme)
      const badge = document.createElement('span')
      badge.className = 'pk-rank__delta'
      badge.style.color = delta.color
      badge.textContent = `${delta.arrow} ${delta.text}`
      rowEl.append(badge)
    }

    wrap.append(rowEl)
  })

  el.append(wrap)
}

function renderSection(el: HTMLElement, input: RenderInput): void {
  el.replaceChildren()
  const wrap = document.createElement('div')
  wrap.className = 'pk-section'
  wrap.style.borderColor = input.theme.colorAccent

  const title = document.createElement('div')
  title.className = 'pk-section__title'
  title.style.color = input.theme.colorText
  title.textContent = textConfig(input, 'title')
  wrap.append(title)

  const subtitle = textConfig(input, 'subtitle')
  if (subtitle) {
    const sub = document.createElement('div')
    sub.className = 'pk-section__subtitle'
    sub.style.color = input.theme.colorMuted
    sub.textContent = subtitle
    wrap.append(sub)
  }

  el.append(wrap)
}

const DOM_RENDERERS: Record<
  string,
  (el: HTMLElement, input: RenderInput) => void
> = {
  'stat-tile': renderKpi,
  progress: renderProgress,
  ranking: renderRanking,
  section: renderSection,
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

function renderTable(el: HTMLElement, input: RenderInput): WidgetHandle {
  let current = input
  let sortKey: string | null = null
  let sortDir: SortDirection = 'desc'

  function draw(): void {
    const columns = tableColumns(current)
    const decimals =
      typeof current.config.decimals === 'number' ? current.config.decimals : undefined
    let rows = current.data
    const active = columns.find((column) => column.key === sortKey)
    if (active) {
      rows = sortRows(rows, active, sortDir)
    }

    el.replaceChildren()
    const wrap = document.createElement('div')
    wrap.className = 'pk-table'

    const table = document.createElement('table')
    table.className = 'pk-table__el'

    const thead = document.createElement('thead')
    const headRow = document.createElement('tr')
    columns.forEach((column) => {
      const th = document.createElement('th')
      th.className = 'pk-table__th'
      if (column.type === 'number') {
        th.classList.add('pk-table__num')
      }
      th.style.color = current.theme.colorMuted
      const arrow =
        sortKey === column.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''
      th.textContent = `${column.name}${arrow}`
      th.addEventListener('click', () => {
        if (sortKey === column.key) {
          sortDir = sortDir === 'asc' ? 'desc' : 'asc'
        } else {
          sortKey = column.key
          sortDir = 'desc'
        }
        draw()
      })
      headRow.append(th)
    })
    thead.append(headRow)
    table.append(thead)

    const tbody = document.createElement('tbody')
    for (const row of rows) {
      const tr = document.createElement('tr')
      columns.forEach((column) => {
        const td = document.createElement('td')
        td.className = 'pk-table__td'
        td.style.color = current.theme.colorText
        const raw = row[column.key]
        if (column.type === 'number') {
          td.classList.add('pk-table__num')
          const value = Number(raw ?? 0)
          td.textContent = Number.isFinite(value)
            ? formatKpiValue(value, decimals)
            : ''
        } else if (column.type === 'image') {
          td.classList.add('pk-table__imgcell')
          if (raw != null && String(raw)) {
            const img = document.createElement('img')
            img.className = 'pk-table__img'
            img.src = String(raw)
            img.alt = ''
            img.loading = 'lazy'
            td.append(img)
          }
        } else {
          td.textContent = raw != null ? String(raw) : ''
        }
        tr.append(td)
      })
      tbody.append(tr)
    }
    table.append(tbody)

    wrap.append(table)
    el.append(wrap)
  }

  draw()

  return {
    update: (next) => {
      current = next
      draw()
    },
    resize: () => undefined,
    dispose: () => el.replaceChildren(),
  }
}

export function renderWidget(el: HTMLElement, input: RenderInput): WidgetHandle {
  if (input.type === 'svg-map') {
    return renderGeoMap(el, input)
  }

  if (input.type === 'table') {
    return renderTable(el, input)
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
