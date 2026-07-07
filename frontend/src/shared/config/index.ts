const DEFAULT_API_ORIGIN = 'http://localhost:8000'

export interface AppConfig {
  apiOrigin: string
}

export const config: AppConfig = {
  apiOrigin: process.env.NUXT_PUBLIC_API_ORIGIN ?? DEFAULT_API_ORIGIN,
}
