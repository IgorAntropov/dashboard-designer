import { config } from '../config'
import { ApiClient } from './client'

export { ApiClient } from './client'
export type { ApiClientOptions } from './client'

export const apiClient = new ApiClient({ baseUrl: config.apiBaseUrl })
