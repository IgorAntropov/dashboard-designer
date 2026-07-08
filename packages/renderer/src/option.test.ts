import { describe, expect, it } from 'vitest'

import { buildChartOption } from './option'
import type { RenderInput, RenderTheme } from './types'

const theme: RenderTheme = {
  colorBg: '#fff',
  colorSurface: '#eee',
  colorText: '#111',
  colorMuted: '#888',
  colorAccent: '#ffd400',
  colorSeries: ['#ffd400'],
  fontFamily: 'Inter',
}

function input(type: string, over: Partial<RenderInput> = {}): RenderInput {
  return {
    type,
    config: {},
    binding: {},
    theme,
    data: [
      { label: 'A', value: 4 },
      { label: 'B', value: 8 },
    ],
    ...over,
  }
}

function firstSeries(option: Record<string, unknown>): Record<string, unknown> {
  return (option.series as Array<Record<string, unknown>>)[0]
}

describe('buildChartOption', () => {
  it('renders bar as a cartesian bar series', () => {
    const option = buildChartOption(input('bar-chart'))
    expect(firstSeries(option).type).toBe('bar')
    expect(option.xAxis).toBeTruthy()
  })

  it('renders line as a smooth line series', () => {
    const series = firstSeries(buildChartOption(input('line-chart')))
    expect(series.type).toBe('line')
    expect(series.smooth).toBe(true)
  })

  it('renders area as a filled line series', () => {
    const series = firstSeries(buildChartOption(input('area-chart')))
    expect(series.type).toBe('line')
    expect(series.areaStyle).toEqual({ opacity: 0.35 })
  })

  it('uses a wider hole for donut than pie', () => {
    const pie = firstSeries(buildChartOption(input('pie-chart')))
    const donut = firstSeries(buildChartOption(input('donut-chart')))
    expect((pie.radius as string[])[0]).toBe('42%')
    expect((donut.radius as string[])[0]).toBe('58%')
  })

  it('maps scatter points through x/y binding', () => {
    const option = buildChartOption(
      input('scatter-chart', {
        binding: { x: 'px', y: 'py' },
        data: [
          { px: 1, py: 2 },
          { px: 3, py: 4 },
        ],
      }),
    )
    const series = firstSeries(option)
    expect(series.type).toBe('scatter')
    expect(series.data).toEqual([
      [1, 2],
      [3, 4],
    ])
  })

  it('builds radar indicators from categories', () => {
    const option = buildChartOption(input('radar-chart'))
    const radar = option.radar as { indicator: Array<{ name: string }> }
    expect(firstSeries(option).type).toBe('radar')
    expect(radar.indicator.map((entry) => entry.name)).toEqual(['A', 'B'])
  })

  it('reads gauge max from config and value from first row', () => {
    const option = buildChartOption(
      input('gauge', { config: { max: 200 }, data: [{ value: 50 }] }),
    )
    const series = firstSeries(option)
    expect(series.type).toBe('gauge')
    expect(series.max).toBe(200)
    expect(series.data).toEqual([{ value: 50 }])
  })
})
