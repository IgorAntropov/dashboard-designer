<script setup lang="ts">
import { DASHBOARD_THEMES } from '@panelka/renderer'

import { useCanvasStore } from '@widgets/canvas'

const store = useCanvasStore()
const keys = Object.keys(DASHBOARD_THEMES)

function pretty(key: string): string {
  return key.replace(/-/g, ' ')
}

function onChange(event: Event): void {
  store.setTheme((event.target as HTMLSelectElement).value)
}
</script>

<template>
  <select
    class="form-select form-select-sm"
    style="width: auto"
    :value="store.themeKey"
    :aria-label="$t('editor.theme')"
    @change="onChange"
  >
    <option v-for="key in keys" :key="key" :value="key">{{ pretty(key) }}</option>
  </select>
</template>
