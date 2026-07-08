import { DEFAULT_ORIGIN } from './constants'
import type { EmbedConfig, EmbedData } from './renderer/engine'
import { DashboardEngine } from './renderer/engine'

export class PanelkaDashboard extends HTMLElement {
  private engine: DashboardEngine | null = null
  private pushedData: EmbedData = {}
  private resizeObserver: ResizeObserver | null = null

  static get observedAttributes(): string[] {
    return ['token', 'origin']
  }

  connectedCallback(): void {
    void this.load()
  }

  attributeChangedCallback(): void {
    if (this.isConnected) {
      void this.load()
    }
  }

  disconnectedCallback(): void {
    this.resizeObserver?.disconnect()
    this.engine?.destroy()
  }

  set data(value: EmbedData) {
    this.pushedData = value
    this.engine?.setData(value)
  }

  get data(): EmbedData {
    return this.pushedData
  }

  setData(value: EmbedData): void {
    this.data = value
  }

  protected origin(): string {
    return this.getAttribute('origin') ?? DEFAULT_ORIGIN
  }

  protected async fetchConfig(token: string): Promise<EmbedConfig | null> {
    try {
      const response = await fetch(
        `${this.origin()}/api/v1/public/embed/${token}`,
      )
      if (!response.ok) {
        return null
      }
      return (await response.json()) as EmbedConfig
    } catch (error) {
      void error
      return null
    }
  }

  protected async load(): Promise<void> {
    const token = this.getAttribute('token')
    if (!token) {
      return
    }

    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' })
    shadow.replaceChildren()

    const config = await this.fetchConfig(token)
    if (!config) {
      return
    }

    this.engine?.destroy()
    this.engine = new DashboardEngine(shadow)
    this.engine.mount(config)
    if (Object.keys(this.pushedData).length > 0) {
      this.engine.setData(this.pushedData)
    }

    this.resizeObserver?.disconnect()
    this.resizeObserver = new ResizeObserver(() => this.engine?.resize())
    this.resizeObserver.observe(this)
  }
}
