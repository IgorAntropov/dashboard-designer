import type { RenderInput } from './types'

export interface TableColumn {
  key: string
  name: string
  type: 'text' | 'number'
}

export type SortDirection = 'asc' | 'desc'

export function tableColumns(input: RenderInput): TableColumn[] {
  const raw = input.config.columns
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as Record<string, unknown>).key === 'string' &&
          ((item as Record<string, unknown>).key as string).length > 0,
      )
      .map((item) => {
        const key = item.key as string
        const name = typeof item.name === 'string' && item.name ? item.name : key
        return { key, name, type: item.type === 'number' ? 'number' : 'text' }
      })
  }

  const first = input.data[0]
  if (!first) {
    return []
  }
  return Object.keys(first).map((key) => ({
    key,
    name: key,
    type: typeof first[key] === 'number' ? 'number' : 'text',
  }))
}

export function sortRows(
  rows: Array<Record<string, unknown>>,
  column: TableColumn,
  direction: SortDirection,
): Array<Record<string, unknown>> {
  const factor = direction === 'asc' ? 1 : -1
  return rows.slice().sort((a, b) => {
    if (column.type === 'number') {
      return (Number(a[column.key] ?? 0) - Number(b[column.key] ?? 0)) * factor
    }
    return (
      String(a[column.key] ?? '').localeCompare(String(b[column.key] ?? '')) *
      factor
    )
  })
}
