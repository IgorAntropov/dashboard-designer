import type { RenderTheme } from './types'

const DELTA_POSITIVE = '#22c55e'
const DELTA_NEGATIVE = '#ef4444'

export function formatKpiValue(value: number, decimals?: number): string {
  const options: Intl.NumberFormatOptions = {}
  if (typeof decimals === 'number' && decimals >= 0) {
    options.minimumFractionDigits = decimals
    options.maximumFractionDigits = decimals
  }
  return value.toLocaleString(undefined, options)
}

export interface DeltaMeta {
  arrow: string
  text: string
  color: string
}

export function deltaMeta(delta: number, theme: RenderTheme): DeltaMeta {
  if (delta > 0) {
    return { arrow: '▲', text: `+${formatKpiValue(delta, 1)}%`, color: DELTA_POSITIVE }
  }
  if (delta < 0) {
    return { arrow: '▼', text: `${formatKpiValue(delta, 1)}%`, color: DELTA_NEGATIVE }
  }
  return { arrow: '—', text: '0%', color: theme.colorMuted }
}
