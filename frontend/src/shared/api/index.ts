import createClient from 'openapi-fetch'

import { config } from '../config'
import type { paths } from './schema'

export type { paths, components } from './schema'

let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export const api = createClient<paths>({ baseUrl: config.apiOrigin })

api.use({
  onRequest({ request }) {
    if (accessToken) {
      request.headers.set('Authorization', `Bearer ${accessToken}`)
    }
    return request
  },
})
