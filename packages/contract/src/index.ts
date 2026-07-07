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
  refreshSec?: number
}

export type SubscriptionTier = 'free' | 'pro' | 'unlimited'

export interface PublishedConfig {
  dashboardId: string
  themeKey: string
  layout: DashboardLayout
  dataSource: DataSource
  attribution: boolean
}

export type PanelkaData = Record<string, unknown[]>
