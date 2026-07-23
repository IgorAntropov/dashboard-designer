<script setup lang="ts">
import { computed } from 'vue'

import { AppButton } from '@shared/ui'

import type { Dashboard } from '../api/repository'

const props = withDefaults(
  defineProps<{ dashboard: Dashboard; canExport?: boolean; demo?: boolean }>(),
  { canExport: false, demo: false },
)
const emit = defineEmits<{
  delete: [id: string]
  embed: [id: string]
  export: [id: string]
}>()

interface PreviewTile {
  x: number
  y: number
  w: number
  h: number
}

const tiles = computed<PreviewTile[]>(() => {
  const layout = props.dashboard.layout as { widgets?: PreviewTile[] }
  return Array.isArray(layout?.widgets) ? layout.widgets : []
})

const published = computed(() => props.dashboard.status === 'published')

function styleFor(tile: PreviewTile): Record<string, string> {
  return {
    left: `${(tile.x / 12) * 100}%`,
    width: `${(tile.w / 12) * 100}%`,
    top: `${tile.y * 8}px`,
    height: `${tile.h * 8}px`,
  }
}
</script>

<template>
  <article class="dash-card">
    <NuxtLink :to="`/editor/${dashboard.id}`" class="dash-card__preview">
      <div
        v-for="(tile, index) in tiles"
        :key="index"
        class="dash-card__tile"
        :style="styleFor(tile)"
      />
      <span v-if="tiles.length === 0" class="dash-card__blank">
        {{ $t('dashboards.empty') }}
      </span>
    </NuxtLink>

    <div class="dash-card__body">
      <div class="dash-card__row">
        <NuxtLink :to="`/editor/${dashboard.id}`" class="dash-card__title">
          {{ dashboard.title }}
        </NuxtLink>
        <span
          v-if="props.demo"
          class="pk-badge pk-badge--accent"
        >
          {{ $t('dashboards.demoBadge') }}
        </span>
        <span
          v-else
          class="pk-badge"
          :class="published ? 'pk-badge--success' : 'pk-badge--neutral'"
        >
          {{ published ? $t('dashboards.published') : $t('dashboards.draft') }}
        </span>
      </div>

      <div class="dash-card__row">
        <span class="dash-card__meta">
          {{ $t('dashboards.widgetsLabel') }}: {{ tiles.length }}
        </span>
        <div v-if="!props.demo" class="dash-card__actions">
          <AppButton
            v-if="props.canExport"
            variant="ghost"
            size="sm"
            icon="download"
            icon-only
            :aria-label="$t('dashboards.export')"
            :title="$t('dashboards.export')"
            @click="emit('export', dashboard.id)"
          />
          <AppButton
            variant="ghost"
            size="sm"
            icon="link"
            icon-only
            :aria-label="$t('embed.title')"
            :title="$t('embed.title')"
            @click="emit('embed', dashboard.id)"
          />
          <AppButton
            variant="ghost"
            size="sm"
            icon="trash"
            icon-only
            :aria-label="$t('dashboards.delete')"
            :title="$t('dashboards.delete')"
            @click="emit('delete', dashboard.id)"
          />
        </div>
      </div>
    </div>
  </article>
</template>
