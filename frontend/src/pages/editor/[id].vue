<script setup lang="ts">
import { DashboardCanvas } from '@widgets/canvas'
import { WidgetPalette } from '@widgets/palette'
import { AppButton } from '@shared/ui'

const route = useRoute()
const dashboardId = route.params.id as string

useHead({ title: 'Panelka — Editor' })
</script>

<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h4 mb-0">{{ $t('editor.title') }}</h1>
      <AppButton to="/dashboards" variant="secondary" size="sm" icon="back">
        {{ $t('editor.back') }}
      </AppButton>
    </div>
    <p class="text-muted small">{{ dashboardId }}</p>

    <ClientOnly>
      <WidgetPalette class="mb-3" />
      <DashboardCanvas />
    </ClientOnly>
  </div>
</template>
