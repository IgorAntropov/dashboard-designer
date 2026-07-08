import type { RenderTheme } from '@panelka/renderer'

function readVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') {
    return fallback
  }
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  return value || fallback
}

export function getRenderTheme(): RenderTheme {
  const accent = readVar('--pk-accent', '#ffd400')
  return {
    colorBg: readVar('--pk-bg', '#ffffff'),
    colorSurface: readVar('--pk-surface', '#f6f6f7'),
    colorText: readVar('--pk-text', '#1a1a1a'),
    colorMuted: readVar('--pk-muted', '#6b7280'),
    colorAccent: accent,
    colorSeries: [accent, '#4f9df7', '#22c55e', '#f97316', '#a855f7'],
    fontFamily: 'Inter, system-ui, sans-serif',
  }
}
