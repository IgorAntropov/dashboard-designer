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
      if (!response.ok || !response.body) {
        return
      }
      const declared = response.headers.get('content-length')
      if (declared && Number(declared) > MAX_RESPONSE_BYTES) {
        return
      }

      const reader = response.body.getReader()
      const chunks: Uint8Array[] = []
      let total = 0
      let done = false
      while (!done) {
        const result = await reader.read()
        done = result.done
        if (result.value) {
          total += result.value.byteLength
          if (total > MAX_RESPONSE_BYTES) {
            await reader.cancel()
            return
          }
          chunks.push(result.value)
        }
      }

      const merged = new Uint8Array(total)
      let offset = 0
      for (const chunk of chunks) {
        merged.set(chunk, offset)
        offset += chunk.byteLength
      }
      const text = new TextDecoder().decode(merged)
      this.onData(JSON.parse(text) as EmbedData)
    } catch (error) {
      void error
    }
  }
}
