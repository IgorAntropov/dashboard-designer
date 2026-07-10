import { describe, expect, it } from 'vitest'

import { DASHBOARD_THEMES, getTheme, resolveTheme } from './themes'

describe('resolveTheme', () => {
  it('returns the base theme when no tokens are given', () => {
    expect(resolveTheme('dark-pro')).toEqual(DASHBOARD_THEMES['dark-pro'])
  })

  it('overrides base tokens with custom values', () => {
    const theme = resolveTheme('light-minimal', {
      colorAccent: '#ff0000',
      colorBg: '#101010',
    })
    expect(theme.colorAccent).toBe('#ff0000')
    expect(theme.colorBg).toBe('#101010')
    expect(theme.colorText).toBe(getTheme('light-minimal').colorText)
  })

  it('keeps the base series when custom series is empty', () => {
    const base = getTheme('light-minimal')
    expect(resolveTheme('light-minimal', { colorSeries: [] }).colorSeries).toEqual(
      base.colorSeries,
    )
    expect(
      resolveTheme('light-minimal', { colorSeries: ['#111', '#222'] }).colorSeries,
    ).toEqual(['#111', '#222'])
  })
})
