import type { EmbedData } from '../renderer/engine'

const MAX_RESPONSE_BYTES = 1_000_000

export type PullCallback = (data: EmbedData) => void

export class UrlPuller {
  private timer: ReturnType<typeof setInterval> | null = null

  constructor(
    private readonly url: string,
    private readonly onData: PullCallback,
    private readonly refreshSeconds: number,
  ) {}

  start(): void {
    void this.pull()
    if (this.refreshSeconds > 0) {
      this.timer = setInterval(() => {
        void this.pull()
      }, this.refreshSeconds * 1000)
    }
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  private async pull(): Promise<void> {
    try {
      const response = await fetch(this.url)
      if (!response.ok) {
        return
      }
      const text = await response.text()
      if (text.length > MAX_RESPONSE_BYTES) {
        return
      }
      this.onData(JSON.parse(text) as EmbedData)
    } catch (error) {
      void error
    }
  }
}
