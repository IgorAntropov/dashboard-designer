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

export const WIDGET_TYPES: WidgetTypeDef[] = [
  {
    key: 'stat-tile',
    label: 'Stat',
    category: 'kpi',
    defaultSize: { w: 3, h: 2 },
    defaultConfig: { title: 'Stat' },
    defaultSchema: { value: { key: 'value', type: 'number', label: 'Value' } },
    defaultBinding: { value: 'value' },
  },
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
    key: 'pie-chart',
    label: 'Pie chart',
    category: 'charts',
    defaultSize: { w: 4, h: 4 },
    defaultConfig: { title: 'Pie chart' },
    defaultSchema: CHART_SCHEMA,
    defaultBinding: CHART_BINDING,
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

export function widgetTypeByKey(key: string): WidgetTypeDef | undefined {
  return WIDGET_TYPES.find((definition) => definition.key === key)
}
