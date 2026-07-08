import * as echarts from 'echarts'

import { buildChartOption } from './option'
import type { RenderInput, WidgetHandle } from './types'

export type { RenderInput, RenderTheme, WidgetHandle } from './types'
export { resolveSeries } from './series'
export { buildChartOption } from './option'

const CHART_TYPES = new Set(['bar-chart', 'line-chart', 'pie-chart'])

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

export function renderWidget(el: HTMLElement, input: RenderInput): WidgetHandle {
  if (CHART_TYPES.has(input.type)) {
    const chart = echarts.init(el)
    chart.setOption(buildChartOption(input))
    return {
      update: (next) => chart.setOption(buildChartOption(next), true),
      resize: () => chart.resize(),
      dispose: () => chart.dispose(),
    }
  }

  const renderDom = input.type === 'stat-tile' ? renderStat : renderText
  renderDom(el, input)
  return {
    update: (next) => renderDom(el, next),
    resize: () => undefined,
    dispose: () => el.replaceChildren(),
  }
}
