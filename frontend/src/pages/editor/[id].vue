<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import type { Dashboard } from '@entities/dashboard'
import { getDashboard } from '@entities/dashboard'
import { AppButton } from '@shared/ui'
import { DashboardCanvas } from '@widgets/canvas'
import { ConfigPanel } from '@widgets/config-panel'
import { WidgetPalette } from '@widgets/palette'

const { t } = useI18n()
const route = useRoute()
const dashboardId = route.params.id as string

const dashboard = ref<Dashboard | null>(null)
const title = computed(() => dashboard.value?.title ?? t('editor.title'))

onMounted(async () => {
  dashboard.value = await getDashboard(dashboardId)
})

useHead({ title })
</script>

<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h4 mb-0">{{ title }}</h1>
      <AppButton to="/dashboards" variant="secondary" size="sm" icon="back">
        {{ $t('editor.back') }}
      </AppButton>
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
