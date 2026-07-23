<script setup lang="ts">
import { AppButton } from '@shared/ui'

import { COLUMN_TYPES, useWidgetConfig } from '../model/useWidgetConfig'

const {
  widget,
  onConfigNumber,
  columnsList,
  addColumn,
  removeColumn,
  onColumnKey,
  onColumnName,
  onColumnType,
} = useWidgetConfig()
</script>

<template>
  <template v-if="widget">
    <div class="mb-3">
      <label class="form-label small">{{ $t('config.decimals') }}</label>
      <input
        type="number"
        min="0"
        max="6"
        class="form-control form-control-sm"
        :value="typeof widget.config.decimals === 'number' ? widget.config.decimals : ''"
        @input="(event) => onConfigNumber('decimals', event)"
      >
    </div>

    <div class="config-field">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="config-field__name">{{ $t('config.columns') }}</span>
        <AppButton size="sm" variant="ghost" icon="plus" @click="addColumn">
          {{ $t('config.addColumn') }}
        </AppButton>
      </div>

      <div v-for="(item, index) in columnsList()" :key="index" class="pk-series">
        <input
          class="form-control form-control-sm mb-1"
          :value="item.key"
          :placeholder="$t('config.dataKey')"
          @input="(event) => onColumnKey(index, event)"
        >
        <input
          class="form-control form-control-sm mb-1"
          :value="item.name ?? ''"
          :placeholder="$t('config.columnName')"
          @input="(event) => onColumnName(index, event)"
        >
        <div class="d-flex gap-2 align-items-center">
          <select
            class="form-select form-select-sm"
            :value="COLUMN_TYPES.includes(item.type ?? '') ? item.type : 'text'"
            @change="(event) => onColumnType(index, event)"
          >
            <option v-for="option in COLUMN_TYPES" :key="option" :value="option">
              {{ $t(`config.columnType.${option}`) }}
            </option>
          </select>
          <AppButton
            size="sm"
            variant="ghost"
            icon="trash"
            icon-only
            :aria-label="$t('config.remove')"
            @click="removeColumn(index)"
          />
        </div>
      </div>
    </div>
  </template>
</template>
