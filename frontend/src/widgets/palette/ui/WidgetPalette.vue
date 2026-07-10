<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'

import type { WidgetTypeDef } from '@entities/widget'
import { WIDGET_CATEGORIES, WIDGET_TYPES, WidgetGlyph } from '@entities/widget'
import { useCanvasStore } from '@widgets/canvas'

const { t } = useI18n()
const store = useCanvasStore()

const groups = computed(() =>
  WIDGET_CATEGORIES.map((category) => ({
    category,
    items: WIDGET_TYPES.filter((definition) => definition.category === category),
  })).filter((group) => group.items.length > 0),
)

const open = reactive<Record<string, boolean>>(
  Object.fromEntries(WIDGET_CATEGORIES.map((category) => [category, true])),
)

function toggle(category: string): void {
  open[category] = !open[category]
}

onMounted(async () => {
  const { GridStack } = await import('gridstack')
  GridStack.setupDragIn('.palette-item', { appendTo: 'body', helper: 'clone' })
})

function onAdd(definition: WidgetTypeDef): void {
  const widget = store.add(definition.key, definition.defaultSize)
  if (typeof definition.defaultConfig.title === 'string') {
    store.updateConfig(widget.id, 'title', t(`widget.${definition.key}`))
  }
}
</script>

<template>
  <aside class="palette">
    <h2 class="palette__title">{{ $t('palette.title') }}</h2>

    <section
      v-for="group in groups"
      :key="group.category"
      class="palette-group"
      :class="{ 'palette-group--open': open[group.category] }"
    >
      <button
        type="button"
        class="palette-group__header"
        :aria-expanded="open[group.category]"
        @click="toggle(group.category)"
      >
        <span>{{ $t(`palette.${group.category}`) }}</span>
        <svg
          class="palette-group__chevron"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div v-show="open[group.category]" class="palette-group__items">
        <button
          v-for="definition in group.items"
          :key="definition.key"
          type="button"
          class="palette-item"
          :gs-w="definition.defaultSize.w"
          :gs-h="definition.defaultSize.h"
          :data-widget-type="definition.key"
          v-tooltip:left="$t(`widget.${definition.key}`)"
          :aria-label="$t(`widget.${definition.key}`)"
          @click="onAdd(definition)"
        >
          <WidgetGlyph :type="definition.key" class="palette-item__glyph" />
        </button>
      </div>
    </section>
  </aside>
</template>
