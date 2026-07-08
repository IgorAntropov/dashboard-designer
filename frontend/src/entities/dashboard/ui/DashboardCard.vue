<script setup lang="ts">
import { computed } from 'vue'

import { AppButton, Logo } from '@shared/ui'

import type { Dashboard } from '../api/repository'

const props = defineProps<{ dashboard: Dashboard }>()
const emit = defineEmits<{ delete: [id: string] }>()

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

function styleFor(tile: PreviewTile): Record<string, string> {
  return {
    left: `${(tile.x / 12) * 100}%`,
    width: `${(tile.w / 12) * 100}%`,
    top: `${tile.y * 14}px`,
    height: `${tile.h * 14}px`,
  }
}
</script>

<template>
  <div class="dash-card">
    <NuxtLink :to="`/editor/${dashboard.id}`" class="dash-card__link">
      <div class="dash-card__preview">
        <div
          v-for="(tile, index) in tiles"
          :key="index"
          class="dash-card__tile"
          :style="styleFor(tile)"
        />
        <div v-if="tiles.length === 0" class="dash-card__empty">
          <Logo :show-word="false" />
        </div>
      </div>
      <div class="dash-card__body">
        <span class="dash-card__title">{{ dashboard.title }}</span>
      </div>
    </NuxtLink>

    <AppButton
      variant="danger"
      size="sm"
      icon="trash"
      icon-only
      class="dash-card__delete"
      :aria-label="$t('dashboards.delete')"
      :title="$t('dashboards.delete')"
      @click="emit('delete', dashboard.id)"
    />
  </div>
</template>
