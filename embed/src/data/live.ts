import type { EmbedData } from '../renderer/engine'

export type LiveCallback = (data: EmbedData) => void

export class LiveConnection {
  private socket: WebSocket | null = null

  constructor(
    private readonly wsUrl: string,
    private readonly onData: LiveCallback,
  ) {}

  start(): void {
    try {
      const socket = new WebSocket(this.wsUrl)
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data)) as {
            type?: string
            payload?: EmbedData
          }
          if (message.type === 'panelka:data' && message.payload) {
            this.onData(message.payload)
          }
        } catch (error) {
          void error
        }
      }
      this.socket = socket
    } catch (error) {
      void error
    }
  }

  stop(): void {
    if (this.socket) {
      this.socket.onmessage = null
      this.socket.close()
      this.socket = null
    }
  }
}
