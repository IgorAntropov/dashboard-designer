export { WIDGET_CATEGORIES, WIDGET_TYPES, widgetTypeByKey } from './model/registry'
export type { WidgetTypeDef } from './model/registry'
export { sampleDataFor } from './model/sample'
export { getRenderTheme } from './model/theme'
export { default as WidgetView } from './ui/WidgetView.vue'
export { default as WidgetGlyph } from './ui/WidgetGlyph.vue'
export type {
  SchemaField,
  WidgetBinding,
  WidgetInstance,
  WidgetSchema,
} from '@panelka/contract'
