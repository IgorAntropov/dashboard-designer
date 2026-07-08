export interface WidgetTypeDef {
  key: string
  label: string
  category: string
  defaultSize: { w: number; h: number }
}

export const WIDGET_TYPES: WidgetTypeDef[] = [
  { key: 'stat-tile', label: 'Stat', category: 'kpi', defaultSize: { w: 3, h: 2 } },
  { key: 'bar-chart', label: 'Bar chart', category: 'charts', defaultSize: { w: 6, h: 4 } },
  { key: 'line-chart', label: 'Line chart', category: 'charts', defaultSize: { w: 6, h: 4 } },
  { key: 'pie-chart', label: 'Pie chart', category: 'charts', defaultSize: { w: 4, h: 4 } },
  { key: 'text-block', label: 'Text', category: 'text', defaultSize: { w: 4, h: 2 } },
]
