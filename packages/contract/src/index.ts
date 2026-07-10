export type FieldType = 'string' | 'number' | 'boolean' | 'date'

export interface SchemaField {
  key: string
  type: FieldType
  label?: string
  required?: boolean
}

export type WidgetSchema = Record<string, SchemaField>

export type WidgetBinding = Record<string, string>

export interface WidgetInstance {
  id: string
  type: string
  x: number
  y: number
  w: number
  h: number
  config: Record<string, unknown>
  schema: WidgetSchema
  binding: WidgetBinding
}

export interface DashboardLayout {
  widgets: WidgetInstance[]
}

export type DataSourceMode = 'runtime' | 'pull' | 'live'

export interface DataSource {
  mode: DataSourceMode
  url?: string
  refresh_sec?: number
}

export type SubscriptionTier = 'free' | 'pro' | 'unlimited'

export type ThemeTokens = Record<string, unknown>

export interface PublishedConfig {
  dashboard_id: string
  theme_key: string
  theme_tokens?: ThemeTokens | null
  layout: DashboardLayout
  data_source?: DataSource
  allowed_domains?: string[]
  attribution: boolean
}

export type PanelkaData = Record<string, Array<Record<string, unknown>>>
