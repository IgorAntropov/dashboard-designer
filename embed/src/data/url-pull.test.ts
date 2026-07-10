import { afterEach, describe, expect, it, vi } from 'vitest'

import { UrlPuller } from './url-pull'

interface FakeInit {
  ok?: boolean
  contentLength?: number
}

function fakeResponse(bytes: Uint8Array, init: FakeInit = {}): unknown {
  const { ok = true, contentLength } = init
  let sent = false
  return {
    ok,
    headers: {
      get: (key: string) =>
        key.toLowerCase() === 'content-length' && contentLength != null
          ? String(contentLength)
          : null,
    },
    body: {
      getReader() {
        return {
          read() {
            if (sent) {
              return Promise.resolve({ done: true, value: undefined })
            }
            sent = true
            return Promise.resolve({ done: false, value: bytes })
          },
          cancel() {
            return Promise.resolve()
          },
        }
      },
    },
  }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 5))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('UrlPuller', () => {
  it('parses a small response and forwards data', async () => {
    const payload = new TextEncoder().encode('{"w1":[{"v":1}]}')
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(fakeResponse(payload))),
    )
    const received: unknown[] = []

    new UrlPuller('https://data.example/x', (data) => received.push(data), 0).start()
    await flush()

    expect(received).toEqual([{ w1: [{ v: 1 }] }])
  })

  it('rejects an oversized response declared by content-length', async () => {
    const payload = new TextEncoder().encode('{"w1":[]}')
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(fakeResponse(payload, { contentLength: 5_000_000 })),
      ),
    )
    const received: unknown[] = []

    new UrlPuller('https://data.example/x', (data) => received.push(data), 0).start()
    await flush()

    expect(received).toHaveLength(0)
  })

  it('aborts when streamed bytes exceed the cap', async () => {
    const oversized = new Uint8Array(1_000_001).fill(0x20)
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(fakeResponse(oversized))),
    )
    const received: unknown[] = []

    new UrlPuller('https://data.example/x', (data) => received.push(data), 0).start()
    await flush()

    expect(received).toHaveLength(0)
  })
})
