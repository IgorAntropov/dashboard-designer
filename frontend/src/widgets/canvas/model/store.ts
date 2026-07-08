import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { SchemaField, WidgetInstance } from '@entities/widget'
import { widgetTypeByKey } from '@entities/widget'

export interface WidgetPosition {
  x: number
  y: number
  w: number
  h: number
}

function createId(): string {
  const globalCrypto = globalThis.crypto
  if (globalCrypto && 'randomUUID' in globalCrypto) {
    return globalCrypto.randomUUID()
  }
  return `w-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export const useCanvasStore = defineStore('canvas', () => {
  const widgets = ref<WidgetInstance[]>([])
  const selectedId = ref<string | null>(null)
  const themeKey = ref('light-minimal')

  function setTheme(key: string): void {
    themeKey.value = key
  }

  const selectedWidget = computed(
    () => widgets.value.find((item) => item.id === selectedId.value) ?? null,
  )

  function find(id: string): WidgetInstance | undefined {
    return widgets.value.find((item) => item.id === id)
  }

  function setWidgets(next: WidgetInstance[]): void {
    widgets.value = next
  }

  function add(type: string, size: { w: number; h: number }): WidgetInstance {
    return addAt(type, { x: 0, y: 0, w: size.w, h: size.h })
  }

  function addAt(type: string, box: WidgetPosition): WidgetInstance {
    const definition = widgetTypeByKey(type)
    const widget: WidgetInstance = {
      id: createId(),
      type,
      x: box.x,
      y: box.y,
      w: box.w,
      h: box.h,
      config: definition ? clone(definition.defaultConfig) : {},
      schema: definition ? clone(definition.defaultSchema) : {},
      binding: definition ? clone(definition.defaultBinding) : {},
    }
    widgets.value.push(widget)
    selectedId.value = widget.id
    return widget
  }

  function select(id: string | null): void {
    selectedId.value = id
  }

  function updatePosition(id: string, position: WidgetPosition): void {
    const widget = find(id)
    if (widget) {
      widget.x = position.x
      widget.y = position.y
      widget.w = position.w
      widget.h = position.h
    }
  }

  function updateConfig(id: string, key: string, value: unknown): void {
    const widget = find(id)
    if (widget) {
      widget.config = { ...widget.config, [key]: value }
    }
  }

  function updateBinding(id: string, key: string, value: string): void {
    const widget = find(id)
    if (widget) {
      widget.binding = { ...widget.binding, [key]: value }
    }
  }

  function updateSchemaField(
    id: string,
    fieldKey: string,
    patch: Partial<SchemaField>,
  ): void {
    const widget = find(id)
    const field = widget?.schema[fieldKey]
    if (widget && field) {
      widget.schema = {
        ...widget.schema,
        [fieldKey]: { ...field, ...patch },
      }
    }
  }

  function remove(id: string): void {
    widgets.value = widgets.value.filter((item) => item.id !== id)
    if (selectedId.value === id) {
      selectedId.value = null
    }
  }

  return {
    widgets,
    selectedId,
    selectedWidget,
    themeKey,
    setTheme,
    setWidgets,
    add,
    addAt,
    select,
    updatePosition,
    updateConfig,
    updateBinding,
    updateSchemaField,
    remove,
  }
})
