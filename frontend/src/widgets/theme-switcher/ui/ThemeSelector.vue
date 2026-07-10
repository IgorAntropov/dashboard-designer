<script setup lang="ts">
import { DASHBOARD_THEMES } from '@panelka/renderer'
import { onMounted, ref } from 'vue'

import type { UserTheme } from '@entities/user-theme'
import { listUserThemes } from '@entities/user-theme'
import { useCanvasStore } from '@widgets/canvas'

const store = useCanvasStore()
const builtinKeys = Object.keys(DASHBOARD_THEMES)
const userThemes = ref<UserTheme[]>([])

onMounted(async () => {
  userThemes.value = await listUserThemes()
})

function onChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value
  const userTheme = userThemes.value.find((theme) => theme.id === value)
  if (userTheme) {
    store.applyUserTheme(userTheme.id, userTheme.tokens)
  } else {
    store.setTheme(value)
  }
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
    <option v-for="key in builtinKeys" :key="key" :value="key">
      {{ $t(`theme.${key}`) }}
    </option>
    <optgroup v-if="userThemes.length" :label="$t('themes.title')">
      <option v-for="theme in userThemes" :key="theme.id" :value="theme.id">
        {{ theme.name }}
      </option>
    </optgroup>
  </select>
</template>
