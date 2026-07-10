<script setup lang="ts">
import { DIRECTION_OPTIONS, useWidgetConfig } from '../model/useWidgetConfig'

const { widget, asString, onConfigText, onConfigNumber } = useWidgetConfig()
</script>

<template>
  <template v-if="widget">
    <div class="row g-2 mb-3">
      <div class="col">
        <label class="form-label small">{{ $t('config.limit') }}</label>
        <input
          type="number"
          min="1"
          max="50"
          class="form-control form-control-sm"
          :value="typeof widget.config.limit === 'number' ? widget.config.limit : 5"
          @input="(event) => onConfigNumber('limit', event)"
        >
      </div>
      <div class="col">
        <label class="form-label small">{{ $t('config.direction') }}</label>
        <select
          class="form-select form-select-sm"
          :value="asString(widget.config.direction) || 'top'"
          @change="(event) => onConfigText('direction', event)"
        >
          <option v-for="option in DIRECTION_OPTIONS" :key="option" :value="option">
            {{ $t(`direction.${option}`) }}
          </option>
        </select>
      </div>
    </div>
    <div class="row g-2 mb-3">
      <div class="col">
        <label class="form-label small">{{ $t('config.unit') }}</label>
        <input
          class="form-control form-control-sm"
          :value="asString(widget.config.unit)"
          @input="(event) => onConfigText('unit', event)"
        >
      </div>
      <div class="col">
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
    </div>
  </template>
</template>
