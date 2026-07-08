import { DEFAULT_ORIGIN } from './constants'
import { LiveConnection } from './data/live'
import { UrlPuller } from './data/url-pull'
import type { EmbedConfig, EmbedData } from './renderer/engine'
import { DashboardEngine } from './renderer/engine'

export class PanelkaDashboard extends HTMLElement {
  private engine: DashboardEngine | null = null
  private pushedData: EmbedData = {}
  private resizeObserver: ResizeObserver | null = null
  private puller: UrlPuller | null = null
  private live: LiveConnection | null = null

  static get observedAttributes(): string[] {
    return ['token', 'origin', 'data-url', 'refresh', 'live']
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
    this.puller?.stop()
    this.live?.stop()
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

    this.startPull()
    this.startLive(token)
  }

  private startPull(): void {
    this.puller?.stop()
    const url = this.getAttribute('data-url')
    if (!url) {
      return
    }
    const refresh = Number(this.getAttribute('refresh') ?? '0')
    this.puller = new UrlPuller(
      url,
      (data) => this.engine?.setData(data),
      Number.isFinite(refresh) ? refresh : 0,
    )
    this.puller.start()
  }

  private startLive(token: string): void {
    this.live?.stop()
    if (!this.hasAttribute('live')) {
      return
    }
    const wsOrigin = this.origin().replace(/^http/, 'ws')
    this.live = new LiveConnection(
      `${wsOrigin}/api/v1/public/embed/${token}/live`,
      (data) => this.engine?.setData(data),
    )
    this.live.start()
  }
}
