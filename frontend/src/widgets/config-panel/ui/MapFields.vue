<script setup lang="ts">
import { MAP_SCOPE_OPTIONS, useWidgetConfig } from '../model/useWidgetConfig'

const { widget, asString, setConfig } = useWidgetConfig()

function onMapScope(event: Event): void {
  setConfig('map', (event.target as HTMLSelectElement).value)
}

function onMapUrl(event: Event): void {
  setConfig('mapUrl', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <template v-if="widget">
    <div class="mb-3">
      <label class="form-label small">{{ $t('config.mapScope') }}</label>
      <select
        class="form-select form-select-sm"
        :value="asString(widget.config.map) || 'world'"
        @change="onMapScope"
      >
        <option v-for="scope in MAP_SCOPE_OPTIONS" :key="scope" :value="scope">
          {{ $t(`mapScope.${scope}`) }}
        </option>
      </select>
    </div>

    <div v-if="asString(widget.config.map) === 'custom'" class="mb-3">
      <label class="form-label small">{{ $t('config.mapUrl') }}</label>
      <input
        class="form-control form-control-sm"
        :value="asString(widget.config.mapUrl)"
        placeholder="https://…/regions.geojson"
        @input="onMapUrl"
      >
    </div>
  </template>
</template>
