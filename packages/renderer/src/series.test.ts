import { describe, expect, it } from 'vitest'

import { resolveSeries } from './series'
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
