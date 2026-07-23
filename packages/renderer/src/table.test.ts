import { describe, expect, it } from 'vitest'

import { sortRows, tableColumns } from './table'
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
    type: 'table',
    config: {},
    binding: {},
    theme,
    data: [
      { region: 'B', trips: 9 },
      { region: 'A', trips: 3 },
    ],
    ...over,
  }
}

describe('tableColumns', () => {
  it('infers columns and types from the first row', () => {
    expect(tableColumns(input())).toEqual([
      { key: 'region', name: 'region', type: 'text' },
      { key: 'trips', name: 'trips', type: 'number' },
    ])
  })

  it('uses configured columns and drops entries without a key', () => {
    const cols = tableColumns(
      input({
        config: {
          columns: [
            { key: 'region', name: 'Регион', type: 'text' },
            { key: 'trips', name: 'Поездки', type: 'number' },
            { name: 'no key' },
          ],
        },
      }),
    )
    expect(cols).toEqual([
      { key: 'region', name: 'Регион', type: 'text' },
      { key: 'trips', name: 'Поездки', type: 'number' },
    ])
  })

  it('supports an image column type', () => {
    const cols = tableColumns(
      input({
        config: {
          columns: [
            { key: 'icon', name: '', type: 'image' },
            { key: 'name', name: 'Товар', type: 'text' },
          ],
        },
      }),
    )
    expect(cols[0]).toEqual({ key: 'icon', name: '', type: 'image' })
  })
})

describe('sortRows', () => {
  it('sorts numeric columns numerically', () => {
    const rows = sortRows(input().data, { key: 'trips', name: 't', type: 'number' }, 'desc')
    expect(rows.map((row) => row.trips)).toEqual([9, 3])
  })

  it('sorts text columns alphabetically and does not mutate input', () => {
    const original = input().data
    const rows = sortRows(original, { key: 'region', name: 'r', type: 'text' }, 'asc')
    expect(rows.map((row) => row.region)).toEqual(['A', 'B'])
    expect(original.map((row) => row.region)).toEqual(['B', 'A'])
  })
})
