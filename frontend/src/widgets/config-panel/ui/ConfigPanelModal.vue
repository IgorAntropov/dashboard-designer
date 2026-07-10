<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { AppModal } from '@shared/ui'
import { useCanvasStore } from '@widgets/canvas'

import ConfigPanel from './ConfigPanel.vue'

const store = useCanvasStore()
const { t } = useI18n()
const dirty = ref(false)

const open = computed({
  get: () => store.selectedId !== null,
  set: (value: boolean) => {
    if (!value) {
      store.select(null)
    }
  },
})

watch(
  () => store.selectedId,
  () => {
    dirty.value = false
  },
)

watch(
  () => store.selectedWidget,
  (next, prev) => {
    if (next && prev && next.id === prev.id) {
      dirty.value = true
    }
  },
  { deep: true },
)

function beforeClose(): boolean {
  if (!dirty.value) {
    return true
  }
  return window.confirm(t('editor.closeConfirm'))
}
</script>

<template>
  <AppModal
    v-model="open"
    :title="$t('editor.widgetSettings')"
    :before-close="beforeClose"
  >
    <ConfigPanel />
  </AppModal>
</template>
