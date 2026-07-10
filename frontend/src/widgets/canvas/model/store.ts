import type { RenderTheme } from '@panelka/renderer'
import { resolveTheme } from '@panelka/renderer'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

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
  const lastAddedId = ref<string | null>(null)
  const themeKey = ref('light-minimal')
  const customTheme = ref<RenderTheme | null>(null)

  function setTheme(key: string): void {
    themeKey.value = key
  }

  function setCustomTheme(theme: RenderTheme | null): void {
    customTheme.value = theme
  }

  const effectiveTheme = computed(() =>
    resolveTheme(
      themeKey.value,
      themeKey.value === 'custom' ? customTheme.value : null,
    ),
  )

  const selectedWidget = computed(
    () => widgets.value.find((item) => item.id === selectedId.value) ?? null,
  )

  function find(id: string): WidgetInstance | undefined {
    return widgets.value.find((item) => item.id === id)
  }

  function setWidgets(next: WidgetInstance[]): void {
    widgets.value = next
  }

  const GRID_COLUMNS = 12

  function overlaps(
    a: { x: number; y: number; w: number; h: number },
    b: WidgetInstance,
  ): boolean {
    return (
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    )
  }

  function nextPosition(w: number, h: number): { x: number; y: number } {
    const width = Math.min(w, GRID_COLUMNS)
    for (let y = 0; ; y += 1) {
      for (let x = 0; x + width <= GRID_COLUMNS; x += 1) {
        const candidate = { x, y, w: width, h }
        if (!widgets.value.some((item) => overlaps(candidate, item))) {
          return { x, y }
        }
      }
    }
  }

  function add(type: string, size: { w: number; h: number }): WidgetInstance {
    const position = nextPosition(size.w, size.h)
    return addAt(type, { x: position.x, y: position.y, w: size.w, h: size.h })
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
    lastAddedId.value = widget.id
    return widget
  }

  function removeLast(): void {
    if (lastAddedId.value) {
      remove(lastAddedId.value)
    }
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
    if (lastAddedId.value === id) {
      lastAddedId.value = null
    }
  }

  const history = ref<string[]>([])
  const historyIndex = ref(-1)
  let applying = false
  let historyTimer: ReturnType<typeof setTimeout> | null = null

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(
    () => historyIndex.value < history.value.length - 1,
  )

  function snapshot(): string {
    return JSON.stringify({
      widgets: widgets.value,
      themeKey: themeKey.value,
      customTheme: customTheme.value,
    })
  }

  function applySnapshot(snap: string): void {
    const parsed = JSON.parse(snap) as {
      widgets: WidgetInstance[]
      themeKey: string
      customTheme?: RenderTheme | null
    }
    applying = true
    widgets.value = parsed.widgets
    themeKey.value = parsed.themeKey
    customTheme.value = parsed.customTheme ?? null
    selectedId.value = null
    applying = false
  }

  function record(): void {
    const snap = snapshot()
    if (history.value[historyIndex.value] === snap) {
      return
    }
    history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push(snap)
    historyIndex.value = history.value.length - 1
  }

  function undo(): void {
    if (canUndo.value) {
      historyIndex.value -= 1
      applySnapshot(history.value[historyIndex.value])
    }
  }

  function redo(): void {
    if (canRedo.value) {
      historyIndex.value += 1
      applySnapshot(history.value[historyIndex.value])
    }
  }

  function hydrate(
    nextWidgets: WidgetInstance[],
    key: string,
    custom: RenderTheme | null = null,
  ): void {
    applying = true
    widgets.value = nextWidgets
    themeKey.value = key
    customTheme.value = custom
    selectedId.value = null
    applying = false
    history.value = [snapshot()]
    historyIndex.value = 0
  }

  watch(
    [widgets, themeKey],
    () => {
      if (applying) {
        return
      }
      if (historyTimer) {
        clearTimeout(historyTimer)
      }
      historyTimer = setTimeout(record, 400)
    },
    { deep: true },
  )

  return {
    widgets,
    selectedId,
    selectedWidget,
    themeKey,
    customTheme,
    effectiveTheme,
    canUndo,
    canRedo,
    setTheme,
    setCustomTheme,
    setWidgets,
    hydrate,
    add,
    addAt,
    select,
    updatePosition,
    updateConfig,
    updateBinding,
    updateSchemaField,
    undo,
    redo,
    remove,
    removeLast,
    lastAddedId,
  }
})
