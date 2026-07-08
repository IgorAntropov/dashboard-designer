import type { RenderInput } from './types'

export interface RankRow {
  name: string
  value: number
  delta: number | null
}

export interface RankResult {
  rows: RankRow[]
  max: number
}

export function rankRows(input: RenderInput): RankResult {
  const labelKey = input.binding.label ?? 'label'
  const valueKey = input.binding.value ?? 'value'
  const deltaKey = input.binding.delta ?? 'delta'

  const all: RankRow[] = input.data.map((row) => ({
    name: String(row[labelKey] ?? ''),
    value: Number(row[valueKey] ?? 0),
    delta:
      row[deltaKey] != null && row[deltaKey] !== ''
        ? Number(row[deltaKey])
        : null,
  }))

  const bottom = input.config.direction === 'bottom'
  all.sort((a, b) => (bottom ? a.value - b.value : b.value - a.value))

  const limit =
    typeof input.config.limit === 'number' && input.config.limit > 0
      ? Math.floor(input.config.limit)
      : 5
  const rows = all.slice(0, limit)
  const max = Math.max(1, ...rows.map((row) => Math.abs(row.value)))

  return { rows, max }
}
