<script setup lang="ts">
import { DashboardCanvas } from '@widgets/canvas'

const route = useRoute()
const dashboardId = route.params.id as string

useHead({ title: 'Panelka — Editor' })
</script>

<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h4 mb-0">{{ $t('editor.title') }}</h1>
      <NuxtLink class="btn btn-sm btn-outline-secondary" to="/dashboards">
        {{ $t('editor.back') }}
      </NuxtLink>
    </div>
    <p class="text-muted small">{{ dashboardId }}</p>

    <ClientOnly>
      <DashboardCanvas />
    </ClientOnly>
  </div>
</template>
