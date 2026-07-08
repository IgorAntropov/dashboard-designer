<script setup lang="ts">
import { onMounted } from 'vue'

import type { WidgetTypeDef } from '@entities/widget'
import { WIDGET_TYPES } from '@entities/widget'
import { useCanvasStore } from '@widgets/canvas'

const store = useCanvasStore()

onMounted(async () => {
  const { GridStack } = await import('gridstack')
  GridStack.setupDragIn('.palette-item', { appendTo: 'body', helper: 'clone' })
})

function onAdd(definition: WidgetTypeDef): void {
  store.add(definition.key, definition.defaultSize)
}
</script>

<template>
  <div class="palette">
    <button
      v-for="definition in WIDGET_TYPES"
      :key="definition.key"
      type="button"
      class="palette-item"
      :gs-w="definition.defaultSize.w"
      :gs-h="definition.defaultSize.h"
      :data-widget-type="definition.key"
      @click="onAdd(definition)"
    >
      <span class="palette-item__label">{{ definition.label }}</span>
      <span class="palette-item__cat">{{ definition.category }}</span>
    </button>
  </div>
</template>
