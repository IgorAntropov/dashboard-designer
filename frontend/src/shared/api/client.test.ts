import { describe, expect, it } from 'vitest'

import { ApiClient } from './client'

const jsonResponse = (body: unknown, ok = true, status = 200): Response =>
  ({ ok, status, json: async () => body }) as Response

describe('ApiClient', () => {
  it('joins base url and path and returns parsed json', async () => {
    const calls: string[] = []
    const fetchFn = (async (url: string) => {
      calls.push(url)
      return jsonResponse({ status: 'ok' })
    }) as unknown as typeof fetch

    const client = new ApiClient({ baseUrl: 'http://api/', fetchFn })
    const result = await client.get<{ status: string }>('health')

    expect(calls).toEqual(['http://api/health'])
    expect(result).toEqual({ status: 'ok' })
  })

  it('throws when the response is not ok', async () => {
    const fetchFn = (async () => jsonResponse(null, false, 500)) as unknown as typeof fetch
    const client = new ApiClient({ baseUrl: 'http://api', fetchFn })

    await expect(client.get('/broken')).rejects.toThrow('status 500')
  })
})
