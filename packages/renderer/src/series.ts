import type { RenderInput } from './types'

export interface ResolvedSeries {
  categories: string[]
  values: number[]
}

export function resolveSeries(input: RenderInput): ResolvedSeries {
  const labelKey = input.binding.label ?? 'label'
  const valueKey = input.binding.value ?? 'value'

  const categories: string[] = []
  const values: number[] = []

  for (const row of input.data) {
    categories.push(String(row[labelKey] ?? ''))
    values.push(Number(row[valueKey] ?? 0))
  }

  return { categories, values }
}

export interface SeriesDef {
  key: string
  name: string
  dashed: boolean
  type?: 'bar' | 'line'
}

export function resolveCategories(input: RenderInput): string[] {
  const labelKey = input.binding.label ?? 'label'
  return input.data.map((row) => String(row[labelKey] ?? ''))
}

export function seriesDefs(input: RenderInput): SeriesDef[] {
  const raw = input.config.series
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
        const type =
          item.type === 'bar' ? 'bar' : item.type === 'line' ? 'line' : undefined
        return { key, name, dashed: item.dashed === true, type }
      })
  }
  const valueKey = input.binding.value ?? 'value'
  return [{ key: valueKey, name: valueKey, dashed: false }]
}

export function valuesForKey(input: RenderInput, key: string): number[] {
  return input.data.map((row) => Number(row[key] ?? 0))
}

export function resolvePoints(input: RenderInput): Array<[number, number]> {
  const xKey = input.binding.x ?? 'x'
  const yKey = input.binding.y ?? 'y'

  return input.data.map((row) => [
    Number(row[xKey] ?? 0),
    Number(row[yKey] ?? 0),
  ])
}

export function resolveScalar(input: RenderInput): number {
  const valueKey = input.binding.value ?? 'value'
  const first = input.data[0]
  return first ? Number(first[valueKey] ?? 0) : 0
}

export interface ResolvedRegion {
  name: string
  value: number
}

export function resolveRegions(input: RenderInput): ResolvedRegion[] {
  const regionKey = input.binding.region ?? 'region'
  const valueKey = input.binding.value ?? 'value'

  return input.data.map((row) => ({
    name: String(row[regionKey] ?? ''),
    value: Number(row[valueKey] ?? 0),
  }))
}
