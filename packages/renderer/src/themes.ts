import type { RenderTheme } from './types'

const FONT = 'Inter, system-ui, sans-serif'

export const DASHBOARD_THEMES: Record<string, RenderTheme> = {
  'light-minimal': {
    colorBg: '#ffffff',
    colorSurface: '#f6f6f7',
    colorText: '#1a1a1a',
    colorMuted: '#6b7280',
    colorAccent: '#ffd400',
    colorSeries: ['#ffd400', '#4f9df7', '#22c55e', '#f97316', '#a855f7'],
    fontFamily: FONT,
  },
  'dark-pro': {
    colorBg: '#0f1115',
    colorSurface: '#171a21',
    colorText: '#e5e7eb',
    colorMuted: '#9aa3b2',
    colorAccent: '#ffd400',
    colorSeries: ['#ffd400', '#60a5fa', '#34d399', '#fb923c', '#c084fc'],
    fontFamily: FONT,
  },
  neon: {
    colorBg: '#0a0a12',
    colorSurface: '#12121f',
    colorText: '#e6f7ff',
    colorMuted: '#7aa0b8',
    colorAccent: '#39ff14',
    colorSeries: ['#39ff14', '#00e5ff', '#ff2fb0', '#faff00', '#7c4dff'],
    fontFamily: FONT,
  },
  pastel: {
    colorBg: '#fbf7f4',
    colorSurface: '#f3ece7',
    colorText: '#4b4453',
    colorMuted: '#9b91a3',
    colorAccent: '#f6a5c0',
    colorSeries: ['#f6a5c0', '#a0d8ef', '#b5e7a0', '#ffd3b6', '#c9b6e4'],
    fontFamily: FONT,
  },
  'corporate-blue': {
    colorBg: '#ffffff',
    colorSurface: '#f0f4f8',
    colorText: '#10233b',
    colorMuted: '#5b6b7d',
    colorAccent: '#1e6fd9',
    colorSeries: ['#1e6fd9', '#3aa0ff', '#00b4a0', '#f6a609', '#8a63d2'],
    fontFamily: FONT,
  },
}

export const DEFAULT_THEME_KEY = 'light-minimal'

export function getTheme(key: string): RenderTheme {
  return DASHBOARD_THEMES[key] ?? DASHBOARD_THEMES[DEFAULT_THEME_KEY]
}

export function resolveTheme(
  key: string,
  tokens?: Partial<RenderTheme> | null,
): RenderTheme {
  const base = getTheme(key)
  if (!tokens || typeof tokens !== 'object') {
    return base
  }
  const series =
    Array.isArray(tokens.colorSeries) && tokens.colorSeries.length > 0
      ? tokens.colorSeries
      : base.colorSeries
  return { ...base, ...tokens, colorSeries: series }
}
