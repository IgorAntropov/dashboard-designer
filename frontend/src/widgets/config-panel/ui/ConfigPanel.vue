<script setup lang="ts">
import { CARTESIAN, useWidgetConfig } from '../model/useWidgetConfig'
import CartesianFields from './CartesianFields.vue'
import GeneralFields from './GeneralFields.vue'
import KpiFields from './KpiFields.vue'
import MapFields from './MapFields.vue'
import RankingFields from './RankingFields.vue'
import SchemaFields from './SchemaFields.vue'
import TableFields from './TableFields.vue'

const { widget } = useWidgetConfig()
</script>

<template>
  <aside class="config-panel">
    <h2 class="h6 mb-3">{{ $t('config.heading') }}</h2>

    <p v-if="!widget" class="text-muted small">{{ $t('config.hint') }}</p>

    <template v-else>
      <GeneralFields />
      <KpiFields v-if="widget.type === 'stat-tile'" />
      <CartesianFields v-if="CARTESIAN.has(widget.type)" />
      <RankingFields v-if="widget.type === 'ranking'" />
      <TableFields v-if="widget.type === 'table'" />
      <MapFields v-if="widget.type === 'svg-map'" />
      <SchemaFields />
    </template>
  </aside>
</template>
