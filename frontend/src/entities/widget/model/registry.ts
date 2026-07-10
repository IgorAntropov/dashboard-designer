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

const KPI_SCHEMA: WidgetSchema = {
  value: { key: 'value', type: 'number', label: 'Value' },
  delta: { key: 'delta', type: 'number', label: 'Delta %' },
}

const KPI_BINDING: WidgetBinding = { value: 'value', delta: 'delta' }

const REGION_SCHEMA: WidgetSchema = {
  region: { key: 'region', type: 'string', label: 'Region' },
  value: { key: 'value', type: 'number', label: 'Value' },
}

const REGION_BINDING: WidgetBinding = { region: 'region', value: 'value' }

const RANK_SCHEMA: WidgetSchema = {
  label: { key: 'label', type: 'string', label: 'Name' },
  value: { key: 'value', type: 'number', label: 'Value' },
  delta: { key: 'delta', type: 'number', label: 'Delta %' },
}

const RANK_BINDING: WidgetBinding = {
  label: 'label',
  value: 'value',
  delta: 'delta',
}

export const WIDGET_TYPES: WidgetTypeDef[] = [
  {
    key: 'bar-chart',
    label: 'Bar chart',
    category: 'charts',
    defaultSize: { w: 24, h: 16 },
    defaultConfig: { title: 'Bar chart' },
    defaultSchema: CHART_SCHEMA,
    defaultBinding: CHART_BINDING,
  },
  {
    key: 'line-chart',
    label: 'Line chart',
    category: 'charts',
    defaultSize: { w: 24, h: 16 },
    defaultConfig: { title: 'Line chart' },
    defaultSchema: CHART_SCHEMA,
    defaultBinding: CHART_BINDING,
  },
  {
    key: 'area-chart',
    label: 'Area chart',
    category: 'charts',
    defaultSize: { w: 24, h: 16 },
    defaultConfig: { title: 'Area chart' },
    defaultSchema: CHART_SCHEMA,
    defaultBinding: CHART_BINDING,
  },
  {
    key: 'pie-chart',
    label: 'Pie chart',
    category: 'charts',
    defaultSize: { w: 16, h: 16 },
    defaultConfig: { title: 'Pie chart' },
    defaultSchema: CHART_SCHEMA,
    defaultBinding: CHART_BINDING,
  },
  {
    key: 'donut-chart',
    label: 'Donut chart',
    category: 'charts',
    defaultSize: { w: 16, h: 16 },
    defaultConfig: { title: 'Donut chart' },
    defaultSchema: CHART_SCHEMA,
    defaultBinding: CHART_BINDING,
  },
  {
    key: 'scatter-chart',
    label: 'Scatter',
    category: 'charts',
    defaultSize: { w: 24, h: 16 },
    defaultConfig: { title: 'Scatter' },
    defaultSchema: POINT_SCHEMA,
    defaultBinding: POINT_BINDING,
  },
  {
    key: 'radar-chart',
    label: 'Radar',
    category: 'charts',
    defaultSize: { w: 20, h: 16 },
    defaultConfig: { title: 'Radar' },
    defaultSchema: CHART_SCHEMA,
    defaultBinding: CHART_BINDING,
  },
  {
    key: 'stat-tile',
    label: 'KPI',
    category: 'kpi',
    defaultSize: { w: 12, h: 12 },
    defaultConfig: { title: 'KPI', unit: '', period: '', info: '' },
    defaultSchema: KPI_SCHEMA,
    defaultBinding: KPI_BINDING,
  },
  {
    key: 'gauge',
    label: 'Gauge',
    category: 'kpi',
    defaultSize: { w: 16, h: 16 },
    defaultConfig: { title: 'Gauge', max: 100 },
    defaultSchema: VALUE_SCHEMA,
    defaultBinding: VALUE_BINDING,
  },
  {
    key: 'progress',
    label: 'Progress',
    category: 'kpi',
    defaultSize: { w: 16, h: 8 },
    defaultConfig: { title: 'Progress', max: 100 },
    defaultSchema: VALUE_SCHEMA,
    defaultBinding: VALUE_BINDING,
  },
  {
    key: 'svg-map',
    label: 'Map',
    category: 'geo',
    defaultSize: { w: 24, h: 20 },
    defaultConfig: { title: 'Map', map: 'world', mapUrl: '' },
    defaultSchema: REGION_SCHEMA,
    defaultBinding: REGION_BINDING,
  },
  {
    key: 'ranking',
    label: 'Ranking',
    category: 'data',
    defaultSize: { w: 16, h: 16 },
    defaultConfig: { title: 'Ranking', limit: 5, direction: 'top', unit: '' },
    defaultSchema: RANK_SCHEMA,
    defaultBinding: RANK_BINDING,
  },
  {
    key: 'table',
    label: 'Table',
    category: 'data',
    defaultSize: { w: 24, h: 16 },
    defaultConfig: { title: 'Table', columns: [] },
    defaultSchema: {},
    defaultBinding: {},
  },
  {
    key: 'section',
    label: 'Section',
    category: 'text',
    defaultSize: { w: 48, h: 4 },
    defaultConfig: { title: 'Section', subtitle: '' },
    defaultSchema: {},
    defaultBinding: {},
  },
  {
    key: 'text-block',
    label: 'Text',
    category: 'text',
    defaultSize: { w: 16, h: 8 },
    defaultConfig: { text: 'Text' },
    defaultSchema: {},
    defaultBinding: {},
  },
]

export const WIDGET_CATEGORIES = ['charts', 'kpi', 'geo', 'data', 'text'] as const

export function widgetTypeByKey(key: string): WidgetTypeDef | undefined {
  return WIDGET_TYPES.find((definition) => definition.key === key)
}

export function localizedConfigPatch(
  type: string,
  t: (key: string) => string,
): Record<string, string> {
  const definition = widgetTypeByKey(type)
  if (!definition) {
    return {}
  }
  const label = t(`widget.${type}`)
  const patch: Record<string, string> = {}
  if (typeof definition.defaultConfig.title === 'string') {
    patch.title = label
  }
  if (typeof definition.defaultConfig.text === 'string') {
    patch.text = label
  }
  return patch
}
