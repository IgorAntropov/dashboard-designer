<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { AppModal } from '@shared/ui'
import { useCanvasStore } from '@widgets/canvas'

import ConfigPanel from './ConfigPanel.vue'
import JsonFields from './JsonFields.vue'

type Tab = 'form' | 'json'

const store = useCanvasStore()
const tab = ref<Tab>('form')

const open = computed({
  get: () => store.selectedId !== null,
  set: (value: boolean) => {
    if (!value) {
      store.select(null)
    }
  },
})

watch(open, (value) => {
  if (value) {
    tab.value = 'form'
  }
})
</script>

<template>
  <AppModal v-model="open" :title="$t('editor.widgetSettings')">
    <div class="config-tabs" role="tablist">
      <button
        class="config-tabs__tab"
        type="button"
        role="tab"
        :class="{ 'config-tabs__tab--active': tab === 'form' }"
        :aria-selected="tab === 'form'"
        @click="tab = 'form'"
      >
        {{ $t('config.tabForm') }}
      </button>
      <button
        class="config-tabs__tab"
        type="button"
        role="tab"
        :class="{ 'config-tabs__tab--active': tab === 'json' }"
        :aria-selected="tab === 'json'"
        @click="tab = 'json'"
      >
        {{ $t('config.tabJson') }}
      </button>
    </div>

    <ConfigPanel v-show="tab === 'form'" />
    <JsonFields v-if="tab === 'json'" />
  </AppModal>
</template>

<style scoped>
.config-tabs {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  margin-bottom: 1rem;
  border-radius: var(--pk-radius);
  background-color: var(--pk-bg);
  border: 1px solid var(--pk-border);
}

.config-tabs__tab {
  border: 0;
  background: transparent;
  color: var(--pk-muted);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.9rem;
  border-radius: calc(var(--pk-radius) - 0.2rem);
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.config-tabs__tab:hover {
  color: var(--pk-text);
}

.config-tabs__tab--active {
  background-color: var(--pk-surface);
  color: var(--pk-text);
  box-shadow: var(--pk-shadow-card);
}
</style>
