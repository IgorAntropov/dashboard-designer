<script setup lang="ts">
import { useWidgetConfig } from '../model/useWidgetConfig'

const { widget, asString, onConfigText, onConfigNumber } = useWidgetConfig()
</script>

<template>
  <template v-if="widget">
    <div class="mb-3">
      <label class="form-label small">{{ $t('config.unit') }}</label>
      <input
        class="form-control form-control-sm"
        :value="asString(widget.config.unit)"
        @input="(event) => onConfigText('unit', event)"
      >
    </div>
    <div class="mb-3">
      <label class="form-label small">{{ $t('config.period') }}</label>
      <input
        class="form-control form-control-sm"
        :value="asString(widget.config.period)"
        @input="(event) => onConfigText('period', event)"
      >
    </div>
    <div class="mb-3">
      <label class="form-label small">{{ $t('config.info') }}</label>
      <input
        class="form-control form-control-sm"
        :value="asString(widget.config.info)"
        @input="(event) => onConfigText('info', event)"
      >
    </div>
    <div class="row g-2 mb-3">
      <div class="col">
        <label class="form-label small">{{ $t('config.target') }}</label>
        <input
          type="number"
          class="form-control form-control-sm"
          :value="typeof widget.config.target === 'number' ? widget.config.target : ''"
          @input="(event) => onConfigNumber('target', event)"
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
