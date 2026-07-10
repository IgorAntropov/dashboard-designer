import { afterEach, describe, expect, it, vi } from 'vitest'

import { LiveConnection } from './live'

class FakeWebSocket {
  static last: FakeWebSocket | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  closed = false

  constructor(public readonly url: string) {
    FakeWebSocket.last = this
  }

  close(): void {
    this.closed = true
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  FakeWebSocket.last = null
})

describe('LiveConnection', () => {
  it('forwards panelka:data frames to the callback', () => {
    vi.stubGlobal('WebSocket', FakeWebSocket)
    const received: unknown[] = []
    const connection = new LiveConnection('wss://x/live', (data) =>
      received.push(data),
    )
    connection.start()

    FakeWebSocket.last?.onmessage?.({
      data: JSON.stringify({ type: 'panelka:data', payload: { w1: [{ v: 2 }] } }),
    })

    expect(received).toEqual([{ w1: [{ v: 2 }] }])
  })

  it('ignores frames of other types and malformed json', () => {
    vi.stubGlobal('WebSocket', FakeWebSocket)
    const received: unknown[] = []
    const connection = new LiveConnection('wss://x/live', (data) =>
      received.push(data),
    )
    connection.start()

    FakeWebSocket.last?.onmessage?.({ data: JSON.stringify({ type: 'other' }) })
    FakeWebSocket.last?.onmessage?.({ data: 'not json' })

    expect(received).toHaveLength(0)
  })

  it('closes the socket on stop', () => {
    vi.stubGlobal('WebSocket', FakeWebSocket)
    const connection = new LiveConnection('wss://x/live', () => undefined)
    connection.start()
    const socket = FakeWebSocket.last
    connection.stop()

    expect(socket?.closed).toBe(true)
  })
})
