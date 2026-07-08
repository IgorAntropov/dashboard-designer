import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { WidgetInstance } from '@entities/widget'

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

export const useCanvasStore = defineStore('canvas', () => {
  const widgets = ref<WidgetInstance[]>([])

  function setWidgets(next: WidgetInstance[]): void {
    widgets.value = next
  }

  function add(type: string, size: { w: number; h: number }): WidgetInstance {
    const widget: WidgetInstance = {
      id: createId(),
      type,
      x: 0,
      y: 0,
      w: size.w,
      h: size.h,
      config: {},
      schema: {},
      binding: {},
    }
    widgets.value.push(widget)
    return widget
  }

  function updatePosition(id: string, position: WidgetPosition): void {
    const widget = widgets.value.find((item) => item.id === id)
    if (widget) {
      widget.x = position.x
      widget.y = position.y
      widget.w = position.w
      widget.h = position.h
    }
  }

  function remove(id: string): void {
    widgets.value = widgets.value.filter((item) => item.id !== id)
  }

  return { widgets, setWidgets, add, updatePosition, remove }
})
