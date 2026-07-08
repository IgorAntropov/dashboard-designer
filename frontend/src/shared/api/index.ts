import createClient from 'openapi-fetch'

import { config } from '../config'
import type { paths } from './schema'

export type { paths, components } from './schema'

let accessToken: string | null = null
let onUnauthorized: (() => Promise<boolean>) | null = null
let onAuthFailed: (() => Promise<void> | void) | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function setUnauthorizedHandler(handler: () => Promise<boolean>): void {
  onUnauthorized = handler
}

export function setAuthFailedHandler(handler: () => Promise<void> | void): void {
  onAuthFailed = handler
}

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh']

function isAuthPath(url: string): boolean {
  return AUTH_PATHS.some((path) => url.includes(path))
}

export const api = createClient<paths>({ baseUrl: config.apiOrigin })

api.use({
  onRequest({ request }) {
    if (accessToken) {
      request.headers.set('Authorization', `Bearer ${accessToken}`)
    }
    return request
  },
  async onResponse({ request, response }) {
    if (response.status !== 401 || isAuthPath(request.url)) {
      return response
    }
    if (request.headers.get('x-pk-retry')) {
      await onAuthFailed?.()
      return response
    }

    const refreshed = onUnauthorized ? await onUnauthorized() : false
    if (!refreshed) {
      await onAuthFailed?.()
      return response
    }

    if (request.method === 'GET' || request.method === 'DELETE') {
      const retry = new Request(request.url, {
        method: request.method,
        headers: new Headers(request.headers),
        credentials: request.credentials,
      })
      retry.headers.set('Authorization', `Bearer ${accessToken}`)
      retry.headers.set('x-pk-retry', '1')
      return fetch(retry)
    }

    return response
  },
})
