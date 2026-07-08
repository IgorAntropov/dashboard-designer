import { describe, expect, it } from 'vitest'

import { buildGeoOption, mapNameForUrl } from './map'
import { DEFAULT_MAP_SCOPE, MAP_SCOPES, mapUrlFor, scopeKeyOf } from './maps/scopes'
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
      { region: 'Russia', value: 40 },
      { region: 'China', value: 90 },
    ],
    ...over,
  }
}

describe('map scopes', () => {
  it('defaults to the world scope url', () => {
    expect(scopeKeyOf({})).toBe(DEFAULT_MAP_SCOPE)
    expect(mapUrlFor({})).toBe(MAP_SCOPES.world.url)
  })

  it('prefers a custom url when provided', () => {
    const url = 'https://example.com/regions.geojson'
    expect(mapUrlFor({ map: 'custom', mapUrl: url })).toBe(url)
  })

  it('falls back to world url for an unknown scope without custom url', () => {
    expect(mapUrlFor({ map: 'moon' })).toBe(MAP_SCOPES.world.url)
  })

  it('derives a stable map name from the url', () => {
    expect(mapNameForUrl('https://x/y.json')).toBe('pk-map:https://x/y.json')
  })
})

describe('resolveRegions', () => {
  it('maps rows to {name, value} via binding and coerces types', () => {
    const resolved = resolveRegions(
      input({ binding: { region: 'r', value: 'v' }, data: [{ r: 'India', v: '12' }] }),
    )
    expect(resolved).toEqual([{ name: 'India', value: 12 }])
  })
})

describe('buildGeoOption', () => {
  it('builds a roamable choropleth map series', () => {
    const option = buildGeoOption(input(), 'pk-map:test')
    const series = (option.series as Array<Record<string, unknown>>)[0]
    expect(series.type).toBe('map')
    expect(series.map).toBe('pk-map:test')
    expect(series.roam).toBe(true)
    expect(series.data).toEqual([
      { name: 'Russia', value: 40 },
      { name: 'China', value: 90 },
    ])
  })

  it('scales the visual map to the largest region value', () => {
    const option = buildGeoOption(input(), 'pk-map:test')
    expect((option.visualMap as Record<string, unknown>).max).toBe(90)
  })

  it('keeps a positive visual-map max for empty data', () => {
    const option = buildGeoOption(input({ data: [] }), 'pk-map:test')
    expect((option.visualMap as Record<string, unknown>).max).toBe(1)
  })
})
