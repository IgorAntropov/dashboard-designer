<script setup lang="ts">
import type { GridStack, GridStackNode } from 'gridstack'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import type { WidgetTypeDef } from '@entities/widget'
import { WIDGET_TYPES } from '@entities/widget'

import { useCanvasStore } from '../model/store'

const store = useCanvasStore()
const gridElement = ref<HTMLDivElement | null>(null)
let grid: GridStack | null = null

function elementFor(id: string): HTMLElement | null {
  return gridElement.value?.querySelector<HTMLElement>(`[gs-id="${id}"]`) ?? null
}

onMounted(async () => {
  if (!gridElement.value) {
    return
  }
  const { GridStack } = await import('gridstack')
  grid = GridStack.init(
    { column: 12, cellHeight: 80, margin: 8, float: true },
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
})

onBeforeUnmount(() => {
  grid?.destroy(false)
  grid = null
})

async function onAdd(definition: WidgetTypeDef): Promise<void> {
  const widget = store.add(definition.key, definition.defaultSize)
  await nextTick()
  const element = elementFor(widget.id)
  if (element && grid) {
    grid.makeWidget(element)
  }
}

function onRemove(id: string): void {
  const element = elementFor(id)
  if (element && grid) {
    grid.removeWidget(element)
  }
  store.remove(id)
}
</script>

<template>
  <div>
    <div class="btn-group mb-3">
      <button
        v-for="definition in WIDGET_TYPES"
        :key="definition.key"
        class="btn btn-outline-primary btn-sm"
        type="button"
        @click="onAdd(definition)"
      >
        + {{ definition.label }}
      </button>
    </div>

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
  </div>
</template>
