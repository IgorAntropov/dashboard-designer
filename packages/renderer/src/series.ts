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
