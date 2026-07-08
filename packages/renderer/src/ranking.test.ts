import { describe, expect, it } from 'vitest'

import { rankRows } from './ranking'
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
    type: 'ranking',
    config: {},
    binding: {},
    theme,
    data: [
      { label: 'A', value: 3, delta: 5 },
      { label: 'B', value: 9, delta: -2 },
      { label: 'C', value: 6, delta: 0 },
    ],
    ...over,
  }
}

describe('rankRows', () => {
  it('sorts descending and scales the bar to the top value by default', () => {
    const { rows, max } = rankRows(input())
    expect(rows.map((row) => row.name)).toEqual(['B', 'C', 'A'])
    expect(max).toBe(9)
  })

  it('sorts ascending for the bottom direction', () => {
    const { rows } = rankRows(input({ config: { direction: 'bottom' } }))
    expect(rows.map((row) => row.name)).toEqual(['A', 'C', 'B'])
  })

  it('limits to the requested count', () => {
    const { rows } = rankRows(input({ config: { limit: 2 } }))
    expect(rows.map((row) => row.name)).toEqual(['B', 'C'])
  })

  it('keeps delta as null when absent', () => {
    const { rows } = rankRows(
      input({ data: [{ label: 'X', value: 1 }] }),
    )
    expect(rows[0].delta).toBeNull()
  })
})
