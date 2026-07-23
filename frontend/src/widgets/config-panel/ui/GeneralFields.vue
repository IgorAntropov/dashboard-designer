<script setup lang="ts">
import { HAS_MAX, useWidgetConfig } from '../model/useWidgetConfig'

const { widget, asString, asNumber, onConfigText, onMax, setConfig } =
  useWidgetConfig()

function onTitle(event: Event): void {
  setConfig('title', (event.target as HTMLInputElement).value)
}

function onText(event: Event): void {
  setConfig('text', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <template v-if="widget">
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

    <div v-if="HAS_MAX.has(widget.type)" class="mb-3">
      <label class="form-label small">{{ $t('config.max') }}</label>
      <input
        type="number"
        min="1"
        class="form-control form-control-sm"
        :value="asNumber(widget.config.max)"
        @input="onMax"
      >
    </div>

    <div v-if="widget.type === 'section'" class="mb-3">
      <label class="form-label small">{{ $t('config.subtitle') }}</label>
      <input
        class="form-control form-control-sm"
        :value="asString(widget.config.subtitle)"
        @input="(event) => onConfigText('subtitle', event)"
      >
    </div>

    <div
      v-if="
        widget.type !== 'section' &&
        widget.type !== 'text-block' &&
        widget.type !== 'stat-tile'
      "
      class="mb-3"
    >
      <label class="form-label small">{{ $t('config.info') }}</label>
      <input
        class="form-control form-control-sm"
        :placeholder="$t('config.infoPlaceholder')"
        :value="asString(widget.config.info)"
        @input="(event) => onConfigText('info', event)"
      >
    </div>
  </template>
</template>
