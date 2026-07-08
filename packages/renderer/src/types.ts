export interface RenderTheme {
  colorBg: string
  colorSurface: string
  colorText: string
  colorMuted: string
  colorAccent: string
  colorSeries: string[]
  fontFamily: string
}

export interface RenderInput {
  type: string
  config: Record<string, unknown>
  binding: Record<string, string>
  data: Array<Record<string, unknown>>
  theme: RenderTheme
}

export interface WidgetHandle {
  update: (input: RenderInput) => void
  resize: () => void
  dispose: () => void
}
