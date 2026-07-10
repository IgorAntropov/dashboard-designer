<script setup lang="ts">
import { AppButton } from '@shared/ui'

import { SERIES_TYPES, useWidgetConfig } from '../model/useWidgetConfig'

const {
  widget,
  asString,
  onConfigText,
  onConfigNumber,
  seriesList,
  addSeries,
  removeSeries,
  seriesTypeValue,
  onSeriesType,
  onSeriesKey,
  onSeriesName,
  onSeriesDashed,
} = useWidgetConfig()
</script>

<template>
  <template v-if="widget">
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

      <div v-for="(item, index) in seriesList()" :key="index" class="pk-series">
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
</template>
