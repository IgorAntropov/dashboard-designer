<script setup lang="ts">
import { computed, onMounted } from 'vue'

import type { WidgetTypeDef } from '@entities/widget'
import { WIDGET_CATEGORIES, WIDGET_TYPES } from '@entities/widget'
import { useCanvasStore } from '@widgets/canvas'

const store = useCanvasStore()

const groups = computed(() =>
  WIDGET_CATEGORIES.map((category) => ({
    category,
    items: WIDGET_TYPES.filter((definition) => definition.category === category),
  })).filter((group) => group.items.length > 0),
)

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
    <section
      v-for="group in groups"
      :key="group.category"
      class="palette-group"
    >
      <h3 class="palette-group__title">{{ $t(`palette.${group.category}`) }}</h3>
      <div class="palette-group__row">
        <button
          v-for="definition in group.items"
          :key="definition.key"
          type="button"
          class="palette-item"
          :gs-w="definition.defaultSize.w"
          :gs-h="definition.defaultSize.h"
          :data-widget-type="definition.key"
          @click="onAdd(definition)"
        >
          <span class="palette-item__label">{{ definition.label }}</span>
          <span class="palette-item__cat">{{ $t(`palette.${group.category}`) }}</span>
        </button>
      </div>
    </section>
  </div>
</template>
