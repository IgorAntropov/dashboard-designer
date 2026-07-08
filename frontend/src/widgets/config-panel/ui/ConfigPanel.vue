<script setup lang="ts">
import { computed } from 'vue'

import type { SchemaField } from '@entities/widget'
import { AppButton } from '@shared/ui'
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

const HAS_MAX = new Set(['gauge', 'progress'])
const MAP_SCOPE_OPTIONS = ['world', 'custom']

function asNumber(value: unknown): number {
  return typeof value === 'number' ? value : 100
}

function onConfigText(key: string, event: Event): void {
  if (widget.value) {
    store.updateConfig(
      widget.value.id,
      key,
      (event.target as HTMLInputElement).value,
    )
  }
}

function onConfigNumber(key: string, event: Event): void {
  if (widget.value) {
    const raw = (event.target as HTMLInputElement).value
    const parsed = Number(raw)
    store.updateConfig(
      widget.value.id,
      key,
      raw !== '' && Number.isFinite(parsed) ? parsed : undefined,
    )
  }
}

interface SeriesItem {
  key: string
  name?: string
  type?: string
  dashed?: boolean
}

const CARTESIAN = new Set(['bar-chart', 'line-chart', 'area-chart'])
const SERIES_TYPES = ['auto', 'bar', 'line']

function seriesList(): SeriesItem[] {
  const raw = widget.value?.config.series
  return Array.isArray(raw) ? (raw as SeriesItem[]) : []
}

function setSeries(next: SeriesItem[]): void {
  if (widget.value) {
    store.updateConfig(widget.value.id, 'series', next)
  }
}

function addSeries(): void {
  setSeries([...seriesList(), { key: 'value', name: '' }])
}

function removeSeries(index: number): void {
  setSeries(seriesList().filter((_, position) => position !== index))
}

function patchSeries(index: number, patch: Partial<SeriesItem>): void {
  setSeries(
    seriesList().map((item, position) =>
      position === index ? { ...item, ...patch } : item,
    ),
  )
}

function seriesTypeValue(item: SeriesItem): string {
  return item.type === 'bar' || item.type === 'line' ? item.type : 'auto'
}

function onSeriesType(index: number, event: Event): void {
  const value = (event.target as HTMLSelectElement).value
  patchSeries(index, { type: value === 'auto' ? undefined : value })
}

function onSeriesKey(index: number, event: Event): void {
  patchSeries(index, { key: (event.target as HTMLInputElement).value })
}

function onSeriesName(index: number, event: Event): void {
  patchSeries(index, { name: (event.target as HTMLInputElement).value })
}

function onSeriesDashed(index: number, event: Event): void {
  patchSeries(index, { dashed: (event.target as HTMLInputElement).checked })
}

function onMapScope(event: Event): void {
  if (widget.value) {
    store.updateConfig(
      widget.value.id,
      'map',
      (event.target as HTMLSelectElement).value,
    )
  }
}

function onMapUrl(event: Event): void {
  if (widget.value) {
    store.updateConfig(
      widget.value.id,
      'mapUrl',
      (event.target as HTMLInputElement).value,
    )
  }
}

function onMax(event: Event): void {
  if (widget.value) {
    const parsed = Number((event.target as HTMLInputElement).value)
    store.updateConfig(
      widget.value.id,
      'max',
      Number.isFinite(parsed) && parsed > 0 ? parsed : 100,
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

      <template v-if="widget.type === 'stat-tile'">
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

      <template v-if="CARTESIAN.has(widget.type)">
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

        <div class="config-field">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="config-field__name">{{ $t('config.series') }}</span>
            <AppButton size="sm" variant="ghost" icon="plus" @click="addSeries">
              {{ $t('config.addSeries') }}
            </AppButton>
          </div>

          <div
            v-for="(item, index) in seriesList()"
            :key="index"
            class="pk-series"
          >
            <input
              class="form-control form-control-sm mb-1"
              :value="item.key"
              :placeholder="$t('config.dataKey')"
              @input="(event) => onSeriesKey(index, event)"
            >
            <input
              class="form-control form-control-sm mb-1"
              :value="item.name ?? ''"
              :placeholder="$t('config.seriesName')"
              @input="(event) => onSeriesName(index, event)"
            >
            <div class="d-flex gap-2 align-items-center">
              <select
                class="form-select form-select-sm"
                :value="seriesTypeValue(item)"
                @change="(event) => onSeriesType(index, event)"
              >
                <option v-for="option in SERIES_TYPES" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <label class="form-check-label small d-flex align-items-center gap-1">
                <input
                  type="checkbox"
                  class="form-check-input mt-0"
                  :checked="item.dashed === true"
                  @change="(event) => onSeriesDashed(index, event)"
                >
                {{ $t('config.dashed') }}
              </label>
              <AppButton
                size="sm"
                variant="ghost"
                icon="trash"
                icon-only
                :aria-label="$t('config.remove')"
                @click="removeSeries(index)"
              />
            </div>
          </div>
        </div>
      </template>

      <template v-if="widget.type === 'svg-map'">
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
