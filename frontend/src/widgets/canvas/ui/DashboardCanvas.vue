<script setup lang="ts">
import type { GridStack, GridStackNode } from 'gridstack'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useCanvasStore } from '../model/store'

const store = useCanvasStore()
const gridElement = ref<HTMLDivElement | null>(null)
let grid: GridStack | null = null
const registered = new Set<string>()

function elementFor(id: string): HTMLElement | null {
  return gridElement.value?.querySelector<HTMLElement>(`[gs-id="${id}"]`) ?? null
}

function syncWidgets(): void {
  if (!grid) {
    return
  }
  for (const widget of store.widgets) {
    if (registered.has(widget.id)) {
      continue
    }
    const element = elementFor(widget.id)
    if (element) {
      grid.makeWidget(element)
      registered.add(widget.id)
    }
  }
}

onMounted(async () => {
  if (!gridElement.value) {
    return
  }
  const { GridStack } = await import('gridstack')
  grid = GridStack.init(
    { column: 12, cellHeight: 80, margin: 8, float: true, acceptWidgets: true },
    gridElement.value,
  )

  grid.on('change', (_event: Event, items: GridStackNode[]) => {
    for (const item of items ?? []) {
      const id = item.el?.getAttribute('gs-id')
      if (id) {
        store.updatePosition(id, {
          x: item.x ?? 0,
          y: item.y ?? 0,
          w: item.w ?? 1,
          h: item.h ?? 1,
        })
      }
    }
  })

  grid.on('dropped', (_event: Event, _previous: GridStackNode, node: GridStackNode) => {
    if (!grid || !node.el) {
      return
    }
    const type = node.el.getAttribute('data-widget-type')
    const box = { x: node.x ?? 0, y: node.y ?? 0, w: node.w ?? 4, h: node.h ?? 3 }
    grid.removeWidget(node.el, true)
    if (type) {
      store.addAt(type, box)
      void nextTick().then(syncWidgets)
    }
  })

  syncWidgets()
})

watch(
  () => store.widgets.length,
  async () => {
    await nextTick()
    syncWidgets()
  },
)

onBeforeUnmount(() => {
  grid?.destroy(false)
  grid = null
})

function onRemove(id: string): void {
  const element = elementFor(id)
  if (element && grid) {
    grid.removeWidget(element)
  }
  registered.delete(id)
  store.remove(id)
}
</script>

<template>
  <div ref="gridElement" class="grid-stack border rounded bg-light">
    <div
      v-for="widget in store.widgets"
      :key="widget.id"
      class="grid-stack-item"
      :gs-id="widget.id"
      :gs-x="widget.x"
      :gs-y="widget.y"
      :gs-w="widget.w"
      :gs-h="widget.h"
    >
      <div
        class="grid-stack-item-content border rounded bg-white p-2 d-flex justify-content-between align-items-start"
      >
        <span class="small text-muted">{{ widget.type }}</span>
        <button
          class="btn btn-sm btn-outline-danger py-0"
          type="button"
          @click="onRemove(widget.id)"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>
