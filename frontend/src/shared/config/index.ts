const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1'

export interface AppConfig {
  apiBaseUrl: string
}

export const config: AppConfig = {
  apiBaseUrl: DEFAULT_API_BASE_URL,
}
