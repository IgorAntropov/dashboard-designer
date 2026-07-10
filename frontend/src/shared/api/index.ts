import createClient from 'openapi-fetch'

import { config } from '../config'
import type { paths } from './schema'

export type { paths, components } from './schema'

let accessToken: string | null = null
let onUnauthorized: (() => Promise<boolean>) | null = null
let onAuthFailed: (() => Promise<void> | void) | null = null
let onError: ((status: number, code: string | null) => void) | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function setUnauthorizedHandler(handler: () => Promise<boolean>): void {
  onUnauthorized = handler
}

export function setAuthFailedHandler(handler: () => Promise<void> | void): void {
  onAuthFailed = handler
}

export function setErrorHandler(
  handler: (status: number, code: string | null) => void,
): void {
  onError = handler
}

async function notifyError(response: Response): Promise<void> {
  if (!onError) {
    return
  }
  let code: string | null = null
  try {
    const body = (await response.clone().json()) as { code?: unknown }
    code = typeof body.code === 'string' ? body.code : null
  } catch {
    code = null
  }
  onError(response.status, code)
}

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh']

function isAuthPath(url: string): boolean {
  return AUTH_PATHS.some((path) => url.includes(path))
}

export const api = createClient<paths>({
  baseUrl: config.apiOrigin,
  credentials: 'include',
})

const retryClones = new WeakMap<Request, Request>()

function buildRetry(request: Request): Request | null {
  if (request.method === 'GET' || request.method === 'DELETE') {
    return new Request(request.url, {
      method: request.method,
      headers: new Headers(request.headers),
      credentials: request.credentials,
    })
  }
  return retryClones.get(request) ?? null
}

api.use({
  onRequest({ request }) {
    if (accessToken) {
      request.headers.set('Authorization', `Bearer ${accessToken}`)
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      retryClones.set(request, request.clone())
    }
    return request
  },
  async onResponse({ request, response }) {
    if (response.ok || isAuthPath(request.url)) {
      return response
    }

    if (response.status !== 401) {
      await notifyError(response)
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

    const retry = buildRetry(request)
    if (!retry) {
      return response
    }
    retry.headers.set('Authorization', `Bearer ${accessToken}`)
    retry.headers.set('x-pk-retry', '1')
    return fetch(retry)
  },
})
