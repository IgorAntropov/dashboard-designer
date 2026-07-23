<script setup lang="ts">
import type { GridStack, GridStackNode } from 'gridstack'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { WidgetView, localizedConfigPatch } from '@entities/widget'
import { AppButton } from '@shared/ui'

import { useCanvasStore } from '../model/store'

const { t } = useI18n()
const store = useCanvasStore()

function applyLocalizedDefaults(id: string, type: string): void {
  for (const [key, value] of Object.entries(localizedConfigPatch(type, t))) {
    store.updateConfig(id, key, value)
  }
}
const theme = computed(() => store.effectiveTheme)
const themeVars = computed(() => ({
  '--pk-bg': theme.value.colorBg,
  '--pk-surface': theme.value.colorSurface,
  '--pk-text': theme.value.colorText,
  '--pk-muted': theme.value.colorMuted,
  '--pk-accent': theme.value.colorAccent,
}))
const gridElement = ref<HTMLDivElement | null>(null)
let grid: GridStack | null = null
let syncing = false

type GsElement = HTMLElement & { gridstackNode?: GridStackNode }

function elementFor(id: string): HTMLElement | null {
  return gridElement.value?.querySelector<HTMLElement>(`[gs-id="${id}"]`) ?? null
}

function isManaged(element: HTMLElement): boolean {
  return (element as GsElement).gridstackNode != null
}

function syncWidgets(): void {
  if (!grid) {
    return
  }
  syncing = true
  for (const widget of store.widgets) {
    const element = elementFor(widget.id)
    if (element && !isManaged(element)) {
      grid.makeWidget(element)
    }
  }
  syncing = false
}

onMounted(async () => {
  if (!gridElement.value) {
    return
  }
  const { GridStack } = await import('gridstack')
  grid = GridStack.init(
    {
      column: 12,
      cellHeight: 80,
      margin: 8,
      float: true,
      acceptWidgets: true,
      resizable: { handles: 'n, ne, e, se, s, sw, w, nw' },
    },
    gridElement.value,
  )

  grid.on('change', (_event: Event, items: GridStackNode[]) => {
    if (syncing) {
      return
    }
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

  function lockOthers(activeId: string | null, locked: boolean): void {
    if (!grid) {
      return
    }
    for (const widget of store.widgets) {
      if (widget.id === activeId) {
        continue
      }
      const element = elementFor(widget.id)
      if (element) {
        grid.update(element, { locked })
      }
    }
  }

  grid.on('dragstart', (_event: Event, element: HTMLElement) => {
    lockOthers(element.getAttribute('gs-id'), true)
  })

  grid.on('dragstop', (_event: Event, element: HTMLElement) => {
    lockOthers(element.getAttribute('gs-id'), false)
  })

  grid.on('resizestart', (_event: Event, element: HTMLElement) => {
    lockOthers(element.getAttribute('gs-id'), true)
  })

  grid.on('resizestop', (_event: Event, element: HTMLElement) => {
    lockOthers(element.getAttribute('gs-id'), false)
  })

  grid.on('dropped', (_event: Event, _previous: GridStackNode, node: GridStackNode) => {
    if (!grid || !node.el) {
      return
    }
    const type = node.el.getAttribute('data-widget-type')
    const box = { x: node.x ?? 0, y: node.y ?? 0, w: node.w ?? 4, h: node.h ?? 3 }
    grid.removeWidget(node.el, true)
    if (type) {
      const widget = store.addAt(type, box)
      applyLocalizedDefaults(widget.id, type)
      void nextTick().then(syncWidgets)
    }
  })

  syncWidgets()
})

watch(
  () => store.compactSignal,
  () => {
    grid?.compact()
  },
)

watch(
  () => store.widgets.map((item) => item.id).join(','),
  async (value) => {
    const ids = value ? value.split(',') : []
    if (grid && gridElement.value) {
      const items =
        gridElement.value.querySelectorAll<HTMLElement>('.grid-stack-item')
      for (const element of items) {
        const id = element.getAttribute('gs-id')
        if (id && !ids.includes(id) && isManaged(element)) {
          grid.removeWidget(element, false)
        }
      }
    }
    await nextTick()
    syncWidgets()
  },
  { flush: 'pre' },
)

onBeforeUnmount(() => {
  grid?.destroy(false)
  grid = null
})

function onRemove(id: string): void {
  store.remove(id)
}
</script>

<template>
  <div
    ref="gridElement"
    class="grid-stack pk-canvas rounded"
    :style="themeVars"
  >
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
        class="grid-stack-item-content pk-widget"
        :class="{ 'pk-widget--selected': store.selectedId === widget.id }"
        @click="store.select(widget.id)"
      >
        <AppButton
          class="pk-widget__delete"
          variant="danger"
          size="sm"
          icon="trash"
          icon-only
          aria-label="delete"
          @click.stop.prevent="onRemove(widget.id)"
        />
        <WidgetView :widget="widget" :theme="theme" class="pk-widget__body" />
      </div>
    </div>
  </div>
</template>
