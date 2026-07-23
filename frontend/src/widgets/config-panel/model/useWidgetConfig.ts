import { computed } from 'vue'

import type { SchemaField } from '@entities/widget'
import { useCanvasStore } from '@widgets/canvas'

export interface SeriesItem {
  key: string
  name?: string
  type?: string
  dashed?: boolean
}

export interface ColumnItem {
  key: string
  name?: string
  type?: string
}

export const FIELD_TYPES: SchemaField['type'][] = [
  'string',
  'number',
  'boolean',
  'date',
]
export const SERIES_TYPES = ['auto', 'bar', 'line']
export const COLUMN_TYPES = ['text', 'number', 'image']
export const DIRECTION_OPTIONS = ['top', 'bottom']
export const MAP_SCOPE_OPTIONS = ['world', 'custom']
export const HAS_MAX = new Set(['gauge', 'progress'])
export const CARTESIAN = new Set([
  'bar-chart',
  'line-chart',
  'area-chart',
  'combo',
  'timeseries',
])

export function useWidgetConfig() {
  const store = useCanvasStore()
  const widget = computed(() => store.selectedWidget)

  function asString(value: unknown): string {
    return typeof value === 'string' ? value : ''
  }

  function asNumber(value: unknown): number {
    return typeof value === 'number' ? value : 100
  }

  function setConfig(key: string, value: unknown): void {
    if (widget.value) {
      store.updateConfig(widget.value.id, key, value)
    }
  }

  function onConfigText(key: string, event: Event): void {
    setConfig(key, (event.target as HTMLInputElement).value)
  }

  function onConfigNumber(key: string, event: Event): void {
    const raw = (event.target as HTMLInputElement).value
    const parsed = Number(raw)
    setConfig(key, raw !== '' && Number.isFinite(parsed) ? parsed : undefined)
  }

  function onMax(event: Event): void {
    const parsed = Number((event.target as HTMLInputElement).value)
    setConfig('max', Number.isFinite(parsed) && parsed > 0 ? parsed : 100)
  }

  function seriesList(): SeriesItem[] {
    const raw = widget.value?.config.series
    return Array.isArray(raw) ? (raw as SeriesItem[]) : []
  }

  function setSeries(next: SeriesItem[]): void {
    setConfig('series', next)
  }

  function addSeries(): void {
    setSeries([...seriesList(), { key: 'value', name: '' }])
  }

  function removeSeries(index: number): void {
    setSeries(seriesList().filter((_, position) => position !== index))
  }

  function patchSeries(index: number, patch: Partial<SeriesItem>): void {
    setSeries(
      seriesList().map((item, position) =>
        position === index ? { ...item, ...patch } : item,
      ),
    )
  }

  function seriesTypeValue(item: SeriesItem): string {
    return item.type === 'bar' || item.type === 'line' ? item.type : 'auto'
  }

  function onSeriesType(index: number, event: Event): void {
    const value = (event.target as HTMLSelectElement).value
    patchSeries(index, { type: value === 'auto' ? undefined : value })
  }

  function onSeriesKey(index: number, event: Event): void {
    patchSeries(index, { key: (event.target as HTMLInputElement).value })
  }

  function onSeriesName(index: number, event: Event): void {
    patchSeries(index, { name: (event.target as HTMLInputElement).value })
  }

  function onSeriesDashed(index: number, event: Event): void {
    patchSeries(index, { dashed: (event.target as HTMLInputElement).checked })
  }

  function columnsList(): ColumnItem[] {
    const raw = widget.value?.config.columns
    return Array.isArray(raw) ? (raw as ColumnItem[]) : []
  }

  function setColumns(next: ColumnItem[]): void {
    setConfig('columns', next)
  }

  function addColumn(): void {
    setColumns([...columnsList(), { key: '', name: '', type: 'text' }])
  }

  function removeColumn(index: number): void {
    setColumns(columnsList().filter((_, position) => position !== index))
  }

  function patchColumn(index: number, patch: Partial<ColumnItem>): void {
    setColumns(
      columnsList().map((item, position) =>
        position === index ? { ...item, ...patch } : item,
      ),
    )
  }

  function onColumnKey(index: number, event: Event): void {
    patchColumn(index, { key: (event.target as HTMLInputElement).value })
  }

  function onColumnName(index: number, event: Event): void {
    patchColumn(index, { name: (event.target as HTMLInputElement).value })
  }

  function onColumnType(index: number, event: Event): void {
    patchColumn(index, { type: (event.target as HTMLSelectElement).value })
  }

  function onLabel(key: string, event: Event): void {
    if (widget.value) {
      store.updateSchemaField(widget.value.id, key, {
        label: (event.target as HTMLInputElement).value,
      })
    }
  }

  function onType(key: string, event: Event): void {
    if (widget.value) {
      store.updateSchemaField(widget.value.id, key, {
        type: (event.target as HTMLSelectElement).value as SchemaField['type'],
      })
    }
  }

  function onDataKey(key: string, event: Event): void {
    if (widget.value) {
      store.updateBinding(
        widget.value.id,
        key,
        (event.target as HTMLInputElement).value,
      )
    }
  }

  function schemaEntries(): [string, SchemaField][] {
    return widget.value ? Object.entries(widget.value.schema) : []
  }

  return {
    widget,
    asString,
    asNumber,
    setConfig,
    onConfigText,
    onConfigNumber,
    onMax,
    seriesList,
    addSeries,
    removeSeries,
    seriesTypeValue,
    onSeriesType,
    onSeriesKey,
    onSeriesName,
    onSeriesDashed,
    columnsList,
    addColumn,
    removeColumn,
    onColumnKey,
    onColumnName,
    onColumnType,
    onLabel,
    onType,
    onDataKey,
    schemaEntries,
  }
}
