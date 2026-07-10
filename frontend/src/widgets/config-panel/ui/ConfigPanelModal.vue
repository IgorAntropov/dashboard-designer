<script setup lang="ts">
import { computed } from 'vue'

import { AppModal } from '@shared/ui'
import { useCanvasStore } from '@widgets/canvas'

import ConfigPanel from './ConfigPanel.vue'

const store = useCanvasStore()

const open = computed({
  get: () => store.selectedId !== null,
  set: (value: boolean) => {
    if (!value) {
      store.select(null)
    }
  },
})
</script>

<template>
  <AppModal v-model="open" :title="$t('editor.widgetSettings')">
    <ConfigPanel />
  </AppModal>
</template>
