<script setup lang="ts">
import { computed } from 'vue'

import type { SchemaField } from '@entities/widget'
import { useCanvasStore } from '@widgets/canvas'

const store = useCanvasStore()
const widget = computed(() => store.selectedWidget)

const FIELD_TYPES: SchemaField['type'][] = ['string', 'number', 'boolean', 'date']

function schemaEntries(): [string, SchemaField][] {
  return widget.value ? Object.entries(widget.value.schema) : []
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function onTitle(event: Event): void {
  if (widget.value) {
    store.updateConfig(
      widget.value.id,
      'title',
      (event.target as HTMLInputElement).value,
    )
  }
}

function onText(event: Event): void {
  if (widget.value) {
    store.updateConfig(
      widget.value.id,
      'text',
      (event.target as HTMLInputElement).value,
    )
  }
}

function onLabel(key: string, event: Event): void {
  if (widget.value) {
    store.updateSchemaField(widget.value.id, key, {
      label: (event.target as HTMLInputElement).value,
    })
  }
}

function onType(key: string, event: Event): void {
  if (widget.value) {
    store.updateSchemaField(widget.value.id, key, {
      type: (event.target as HTMLSelectElement).value as SchemaField['type'],
    })
  }
}

function onDataKey(key: string, event: Event): void {
  if (widget.value) {
    store.updateBinding(
      widget.value.id,
      key,
      (event.target as HTMLInputElement).value,
    )
  }
}
</script>

<template>
  <aside class="config-panel">
    <h2 class="h6 mb-3">{{ $t('config.heading') }}</h2>

    <p v-if="!widget" class="text-muted small">{{ $t('config.hint') }}</p>

    <template v-else>
      <div v-if="widget.type === 'text-block'" class="mb-3">
        <label class="form-label small">{{ $t('config.text') }}</label>
        <input
          class="form-control form-control-sm"
          :value="asString(widget.config.text)"
          @input="onText"
        >
      </div>
      <div v-else class="mb-3">
        <label class="form-label small">{{ $t('config.titleField') }}</label>
        <input
          class="form-control form-control-sm"
          :value="asString(widget.config.title)"
          @input="onTitle"
        >
      </div>

      <div v-for="[key, field] in schemaEntries()" :key="key" class="config-field">
        <div class="config-field__name">{{ key }}</div>

        <label class="form-label small mb-1">{{ $t('config.label') }}</label>
        <input
          class="form-control form-control-sm mb-2"
          :value="field.label ?? ''"
          @input="(event) => onLabel(key, event)"
        >

        <label class="form-label small mb-1">{{ $t('config.type') }}</label>
        <select
          class="form-select form-select-sm mb-2"
          :value="field.type"
          @change="(event) => onType(key, event)"
        >
          <option v-for="option in FIELD_TYPES" :key="option" :value="option">
            {{ option }}
          </option>
        </select>

        <label class="form-label small mb-1">{{ $t('config.dataKey') }}</label>
        <input
          class="form-control form-control-sm"
          :value="widget.binding[key] ?? ''"
          @input="(event) => onDataKey(key, event)"
        >
      </div>
    </template>
  </aside>
</template>
