import { describe, expect, it } from 'vitest'

import { buildMapOption } from './map'
import { WORLD_MAP_NAME } from './maps/world'
import { resolveRegions } from './series'
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

function input(over: Partial<RenderInput> = {}): RenderInput {
  return {
    type: 'svg-map',
    config: {},
    binding: {},
    theme,
    data: [
      { region: 'Europe', value: 40 },
      { region: 'Asia', value: 90 },
    ],
    ...over,
  }
}

describe('resolveRegions', () => {
  it('maps rows to {name, value} via binding and coerces types', () => {
    const resolved = resolveRegions(
      input({
        binding: { region: 'r', value: 'v' },
        data: [{ r: 'Africa', v: '12' }],
      }),
    )
    expect(resolved).toEqual([{ name: 'Africa', value: 12 }])
  })
})

describe('buildMapOption', () => {
  it('builds a map series bound to the registered world map', () => {
    const option = buildMapOption(input())
    const series = (option.series as Array<Record<string, unknown>>)[0]
    expect(series.type).toBe('map')
    expect(series.map).toBe(WORLD_MAP_NAME)
    expect(series.data).toEqual([
      { name: 'Europe', value: 40 },
      { name: 'Asia', value: 90 },
    ])
  })

  it('scales the visual map to the largest region value', () => {
    const option = buildMapOption(input())
    expect((option.visualMap as Record<string, unknown>).max).toBe(90)
  })

  it('keeps a positive visual-map max for empty data', () => {
    const option = buildMapOption(input({ data: [] }))
    expect((option.visualMap as Record<string, unknown>).max).toBe(1)
  })
})
