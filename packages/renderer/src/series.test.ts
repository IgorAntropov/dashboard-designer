import { describe, expect, it } from 'vitest'

import {
  resolveCategories,
  resolvePoints,
  resolveScalar,
  resolveSeries,
  seriesDefs,
  valuesForKey,
} from './series'
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

describe('resolveSeries', () => {
  it('maps rows through the binding keys', () => {
    const input: RenderInput = {
      type: 'bar-chart',
      config: {},
      binding: { label: 'category', value: 'amount' },
      theme,
      data: [
        { category: 'A', amount: 5 },
        { category: 'B', amount: 9 },
      ],
    }

    expect(resolveSeries(input)).toEqual({
      categories: ['A', 'B'],
      values: [5, 9],
    })
  })

  it('falls back to label/value keys and coerces types', () => {
    const input: RenderInput = {
      type: 'line-chart',
      config: {},
      binding: {},
      theme,
      data: [{ label: 'X', value: '3' }],
    }

    expect(resolveSeries(input)).toEqual({ categories: ['X'], values: [3] })
  })
})

describe('resolvePoints', () => {
  it('maps rows to [x, y] tuples via binding and coerces types', () => {
    const input: RenderInput = {
      type: 'scatter-chart',
      config: {},
      binding: { x: 'px', y: 'py' },
      theme,
      data: [
        { px: 1, py: '2' },
        { px: 3, py: 4 },
      ],
    }

    expect(resolvePoints(input)).toEqual([
      [1, 2],
      [3, 4],
    ])
  })
})

describe('seriesDefs', () => {
  it('defaults to a single series from the value binding', () => {
    const defs = seriesDefs({
      type: 'bar-chart',
      config: {},
      binding: { value: 'amount' },
      theme,
      data: [],
    })
    expect(defs).toEqual([{ key: 'amount', name: 'amount', dashed: false }])
  })

  it('reads named/dashed/typed series from config and drops invalid entries', () => {
    const defs = seriesDefs({
      type: 'line-chart',
      config: {
        series: [
          { key: 'y2023', name: '2023' },
          { key: 'y2024', name: '2024', dashed: true, type: 'line' },
          { name: 'no key' },
        ],
      },
      binding: {},
      theme,
      data: [],
    })
    expect(defs).toEqual([
      { key: 'y2023', name: '2023', dashed: false, type: undefined },
      { key: 'y2024', name: '2024', dashed: true, type: 'line' },
    ])
  })
})

describe('valuesForKey / resolveCategories', () => {
  it('extracts a numeric column and the category axis', () => {
    const input: RenderInput = {
      type: 'bar-chart',
      config: {},
      binding: { label: 'month' },
      theme,
      data: [
        { month: 'Jan', v: '3' },
        { month: 'Feb', v: 5 },
      ],
    }
    expect(resolveCategories(input)).toEqual(['Jan', 'Feb'])
    expect(valuesForKey(input, 'v')).toEqual([3, 5])
  })
})

describe('resolveScalar', () => {
  it('returns the first row value via binding', () => {
    const input: RenderInput = {
      type: 'gauge',
      config: {},
      binding: { value: 'amount' },
      theme,
      data: [{ amount: 42 }, { amount: 9 }],
    }

    expect(resolveScalar(input)).toBe(42)
  })

  it('returns 0 for empty data', () => {
    const input: RenderInput = {
      type: 'gauge',
      config: {},
      binding: {},
      theme,
      data: [],
    }

    expect(resolveScalar(input)).toBe(0)
  })
})
