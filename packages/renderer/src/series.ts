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
