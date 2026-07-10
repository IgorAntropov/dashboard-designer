import { renderWidget } from './index'
import { ENGINE_CSS } from './styles'
import { resolveTheme } from './themes'
import type { RenderInput, RenderTheme, WidgetHandle } from './types'

export interface EmbedWidget {
  id: string
  type: string
  x: number
  y: number
  w: number
  h: number
  config: Record<string, unknown>
  binding: Record<string, string>
}

export interface EmbedConfig {
  dashboard_id: string
  theme_key: string
  theme_tokens?: Partial<RenderTheme> | null
  layout: { widgets?: EmbedWidget[] }
  attribution: boolean
}

export type EmbedData = Record<string, Array<Record<string, unknown>>>

export class DashboardEngine {
  private readonly grid: HTMLElement
  private readonly handles = new Map<string, WidgetHandle>()
  private data: EmbedData = {}
  private config: EmbedConfig | null = null

  constructor(private readonly container: HTMLElement | ShadowRoot) {
    const style = document.createElement('style')
    style.textContent = ENGINE_CSS
    this.container.append(style)

    this.grid = document.createElement('div')
    this.grid.className = 'pk-embed-grid'
    this.container.append(this.grid)
  }

  private widgets(): EmbedWidget[] {
    return this.config?.layout.widgets ?? []
  }

  private inputFor(widget: EmbedWidget, theme: RenderTheme): RenderInput {
    return {
      type: widget.type,
      config: widget.config,
      binding: widget.binding,
      data: this.data[widget.id] ?? [],
      theme,
    }
  }

  mount(config: EmbedConfig): void {
    this.config = config
    const theme = resolveTheme(config.theme_key, config.theme_tokens)

    this.grid.style.setProperty('--pk-bg', theme.colorBg)
    this.grid.style.setProperty('--pk-surface', theme.colorSurface)
    this.grid.style.setProperty('--pk-text', theme.colorText)
    this.grid.style.setProperty('--pk-muted', theme.colorMuted)
    this.grid.style.setProperty('--pk-accent', theme.colorAccent)

    this.grid.replaceChildren()
    this.handles.clear()

    for (const widget of this.widgets()) {
      const cell = document.createElement('div')
      cell.className = 'pk-embed-cell'
      cell.style.gridColumn = `${widget.x + 1} / span ${widget.w}`
      cell.style.gridRow = `${widget.y + 1} / span ${widget.h}`

      const body = document.createElement('div')
      body.className = 'pk-embed-body'
      cell.append(body)
      this.grid.append(cell)

      this.handles.set(widget.id, renderWidget(body, this.inputFor(widget, theme)))
    }

    if (config.attribution) {
      const attribution = document.createElement('div')
      attribution.className = 'pk-embed-attr'
      attribution.textContent = 'Made with Panelka'
      this.container.append(attribution)
    }
  }

  setData(data: EmbedData): void {
    this.data = { ...this.data, ...data }
    if (!this.config) {
      return
    }
    const theme = resolveTheme(this.config.theme_key, this.config.theme_tokens)
    for (const widget of this.widgets()) {
      this.handles.get(widget.id)?.update(this.inputFor(widget, theme))
    }
  }

  resize(): void {
    this.handles.forEach((handle) => handle.resize())
  }

  destroy(): void {
    this.handles.forEach((handle) => handle.dispose())
    this.handles.clear()
  }
}
