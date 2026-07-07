import createClient from 'openapi-fetch'

import { config } from '../config'
import type { paths } from './schema'

export type { paths } from './schema'

export const api = createClient<paths>({ baseUrl: config.apiOrigin })
