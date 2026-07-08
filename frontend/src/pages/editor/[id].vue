<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import type { Dashboard } from '@entities/dashboard'
import { getDashboard } from '@entities/dashboard'
import { AppButton } from '@shared/ui'
import { DashboardCanvas, useCanvasStore } from '@widgets/canvas'
import { ConfigPanel } from '@widgets/config-panel'
import { WidgetPalette } from '@widgets/palette'
import { ThemeSelector } from '@widgets/theme-switcher'

const { t } = useI18n()
const route = useRoute()
const canvasStore = useCanvasStore()
const dashboardId = route.params.id as string

const dashboard = ref<Dashboard | null>(null)
const title = computed(() => dashboard.value?.title ?? t('editor.title'))

onMounted(async () => {
  const loaded = await getDashboard(dashboardId)
  dashboard.value = loaded
  if (loaded) {
    canvasStore.setTheme(loaded.theme_key)
  }
})

useHead({ title })
</script>

<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h4 mb-0">{{ title }}</h1>
      <div class="d-flex align-items-center gap-2">
        <ClientOnly>
          <span class="small text-muted">{{ $t('editor.theme') }}</span>
          <ThemeSelector />
        </ClientOnly>
        <AppButton to="/dashboards" variant="secondary" size="sm" icon="back">
          {{ $t('editor.back') }}
        </AppButton>
      </div>
    </div>

    <ClientOnly>
      <WidgetPalette class="mb-3" />
      <div class="editor-workspace">
        <DashboardCanvas class="editor-workspace__canvas" />
        <ConfigPanel class="editor-workspace__panel" />
      </div>
    </ClientOnly>
  </div>
</template>
