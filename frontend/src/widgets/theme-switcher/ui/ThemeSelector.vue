<script setup lang="ts">
import { DASHBOARD_THEMES } from '@panelka/renderer'
import { computed, ref } from 'vue'

import { useSessionStore } from '@entities/session'
import { AppButton } from '@shared/ui'
import { useCanvasStore } from '@widgets/canvas'

import ThemeEditor from './ThemeEditor.vue'

const store = useCanvasStore()
const session = useSessionStore()
const keys = Object.keys(DASHBOARD_THEMES)

const canCustom = computed(
  () => (session.user?.subscription_tier ?? 'free') !== 'free',
)
const showCustomOption = computed(
  () => canCustom.value || store.themeKey === 'custom',
)
const editorOpen = ref(false)

function pretty(key: string): string {
  return key.replace(/-/g, ' ')
}

function onChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value
  if (value === 'custom' && !store.customTheme) {
    store.setCustomTheme({
      ...store.effectiveTheme,
      colorSeries: [...store.effectiveTheme.colorSeries],
    })
  }
  store.setTheme(value)
  if (value === 'custom') {
    editorOpen.value = true
  }
}
</script>

<template>
  <div class="d-flex align-items-center gap-1">
    <select
      class="form-select form-select-sm"
      style="width: auto"
      :value="store.themeKey"
      :aria-label="$t('editor.theme')"
      @change="onChange"
    >
      <option v-for="key in keys" :key="key" :value="key">{{ pretty(key) }}</option>
      <option v-if="showCustomOption" value="custom">
        {{ $t('theme.custom') }}
      </option>
    </select>

    <AppButton
      v-if="store.themeKey === 'custom'"
      size="sm"
      variant="ghost"
      icon="edit"
      icon-only
      :aria-label="$t('themeEditor.title')"
      :title="$t('themeEditor.title')"
      @click="editorOpen = true"
    />

    <ThemeEditor v-model="editorOpen" />
  </div>
</template>
