export interface ApiClientOptions {
  baseUrl: string
  fetchFn?: typeof fetch
}

export class ApiClient {
  private readonly baseUrl: string
  private readonly fetchFn: typeof fetch

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '')
    this.fetchFn = options.fetchFn ?? fetch
  }

  async get<T>(path: string): Promise<T> {
    const response = await this.fetchFn(this.buildUrl(path))
    if (!response.ok) {
      throw new Error(`GET ${path} failed with status ${response.status}`)
    }
    return (await response.json()) as T
  }

  private buildUrl(path: string): string {
    const normalized = path.startsWith('/') ? path : `/${path}`
    return `${this.baseUrl}${normalized}`
  }
}
