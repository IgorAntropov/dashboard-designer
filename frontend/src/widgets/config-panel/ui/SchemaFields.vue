<script setup lang="ts">
import { FIELD_TYPES, useWidgetConfig } from '../model/useWidgetConfig'

const { widget, schemaEntries, onLabel, onType, onDataKey } = useWidgetConfig()
</script>

<template>
  <template v-if="widget">
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
</template>
