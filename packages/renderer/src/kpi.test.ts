import { describe, expect, it } from 'vitest'

import { deltaMeta, formatKpiValue } from './kpi'
import type { RenderTheme } from './types'

const theme: RenderTheme = {
  colorBg: '#fff',
  colorSurface: '#eee',
  colorText: '#111',
  colorMuted: '#888',
  colorAccent: '#ffd400',
  colorSeries: ['#ffd400'],
  fontFamily: 'Inter',
}

describe('formatKpiValue', () => {
  it('formats without fraction digits by default', () => {
    expect(formatKpiValue(5, 0)).toBe('5')
  })

  it('applies the requested number of decimals', () => {
    expect(formatKpiValue(5, 2)).toMatch(/^5\D00$/)
    expect(formatKpiValue(5, 2)).not.toBe(formatKpiValue(5, 0))
  })
})

describe('deltaMeta', () => {
  it('marks positive deltas green with an up arrow and a plus sign', () => {
    const meta = deltaMeta(11.4, theme)
    expect(meta.arrow).toBe('▲')
    expect(meta.color).toBe('#22c55e')
    expect(meta.text.startsWith('+')).toBe(true)
    expect(meta.text.endsWith('%')).toBe(true)
  })

  it('marks negative deltas red with a down arrow', () => {
    const meta = deltaMeta(-3, theme)
    expect(meta.arrow).toBe('▼')
    expect(meta.color).toBe('#ef4444')
    expect(meta.text.startsWith('-')).toBe(true)
  })

  it('treats zero as neutral using the muted theme color', () => {
    const meta = deltaMeta(0, theme)
    expect(meta.arrow).toBe('—')
    expect(meta.color).toBe(theme.colorMuted)
    expect(meta.text).toBe('0%')
  })
})
