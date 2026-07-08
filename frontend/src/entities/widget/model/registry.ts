import type { WidgetBinding, WidgetSchema } from '@panelka/contract'

export interface WidgetTypeDef {
  key: string
  label: string
  category: string
  defaultSize: { w: number; h: number }
  defaultConfig: Record<string, unknown>
  defaultSchema: WidgetSchema
  defaultBinding: WidgetBinding
}

const CHART_SCHEMA: WidgetSchema = {
  label: { key: 'label', type: 'string', label: 'Label' },
  value: { key: 'value', type: 'number', label: 'Value' },
}

const CHART_BINDING: WidgetBinding = { label: 'label', value: 'value' }

const POINT_SCHEMA: WidgetSchema = {
  x: { key: 'x', type: 'number', label: 'X' },
  y: { key: 'y', type: 'number', label: 'Y' },
}

const POINT_BINDING: WidgetBinding = { x: 'x', y: 'y' }

const VALUE_SCHEMA: WidgetSchema = {
  value: { key: 'value', type: 'number', label: 'Value' },
}

const VALUE_BINDING: WidgetBinding = { value: 'value' }

const REGION_SCHEMA: WidgetSchema = {
  region: { key: 'region', type: 'string', label: 'Region' },
  value: { key: 'value', type: 'number', label: 'Value' },
}

const REGION_BINDING: WidgetBinding = { region: 'region', value: 'value' }

export const WIDGET_TYPES: WidgetTypeDef[] = [
  {
    key: 'bar-chart',
    label: 'Bar chart',
    category: 'charts',
    defaultSize: { w: 6, h: 4 },
    defaultConfig: { title: 'Bar chart' },
    defaultSchema: CHART_SCHEMA,
    defaultBinding: CHART_BINDING,
  },
  {
    key: 'line-chart',
    label: 'Line chart',
    category: 'charts',
    defaultSize: { w: 6, h: 4 },
    defaultConfig: { title: 'Line chart' },
    defaultSchema: CHART_SCHEMA,
    defaultBinding: CHART_BINDING,
  },
  {
    key: 'area-chart',
    label: 'Area chart',
    category: 'charts',
    defaultSize: { w: 6, h: 4 },
    defaultConfig: { title: 'Area chart' },
    defaultSchema: CHART_SCHEMA,
    defaultBinding: CHART_BINDING,
  },
  {
    key: 'pie-chart',
    label: 'Pie chart',
    category: 'charts',
    defaultSize: { w: 4, h: 4 },
    defaultConfig: { title: 'Pie chart' },
    defaultSchema: CHART_SCHEMA,
    defaultBinding: CHART_BINDING,
  },
  {
    key: 'donut-chart',
    label: 'Donut chart',
    category: 'charts',
    defaultSize: { w: 4, h: 4 },
    defaultConfig: { title: 'Donut chart' },
    defaultSchema: CHART_SCHEMA,
    defaultBinding: CHART_BINDING,
  },
  {
    key: 'scatter-chart',
    label: 'Scatter',
    category: 'charts',
    defaultSize: { w: 6, h: 4 },
    defaultConfig: { title: 'Scatter' },
    defaultSchema: POINT_SCHEMA,
    defaultBinding: POINT_BINDING,
  },
  {
    key: 'radar-chart',
    label: 'Radar',
    category: 'charts',
    defaultSize: { w: 5, h: 4 },
    defaultConfig: { title: 'Radar' },
    defaultSchema: CHART_SCHEMA,
    defaultBinding: CHART_BINDING,
  },
  {
    key: 'stat-tile',
    label: 'Stat',
    category: 'kpi',
    defaultSize: { w: 3, h: 2 },
    defaultConfig: { title: 'Stat' },
    defaultSchema: VALUE_SCHEMA,
    defaultBinding: VALUE_BINDING,
  },
  {
    key: 'gauge',
    label: 'Gauge',
    category: 'kpi',
    defaultSize: { w: 4, h: 4 },
    defaultConfig: { title: 'Gauge', max: 100 },
    defaultSchema: VALUE_SCHEMA,
    defaultBinding: VALUE_BINDING,
  },
  {
    key: 'progress',
    label: 'Progress',
    category: 'kpi',
    defaultSize: { w: 4, h: 2 },
    defaultConfig: { title: 'Progress', max: 100 },
    defaultSchema: VALUE_SCHEMA,
    defaultBinding: VALUE_BINDING,
  },
  {
    key: 'svg-map',
    label: 'World map',
    category: 'geo',
    defaultSize: { w: 6, h: 5 },
    defaultConfig: { title: 'World map' },
    defaultSchema: REGION_SCHEMA,
    defaultBinding: REGION_BINDING,
  },
  {
    key: 'text-block',
    label: 'Text',
    category: 'text',
    defaultSize: { w: 4, h: 2 },
    defaultConfig: { text: 'Text' },
    defaultSchema: {},
    defaultBinding: {},
  },
]

export const WIDGET_CATEGORIES = ['charts', 'kpi', 'geo', 'text'] as const

export function widgetTypeByKey(key: string): WidgetTypeDef | undefined {
  return WIDGET_TYPES.find((definition) => definition.key === key)
}
