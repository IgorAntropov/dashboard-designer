<script setup lang="ts">
import { DashboardCanvas } from '@widgets/canvas'

const route = useRoute()
const dashboardId = route.params.id as string

useHead({ title: 'Panelka — Editor' })
</script>

<template>
  <main class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h1 class="h4 mb-0">Editor</h1>
      <NuxtLink class="btn btn-sm btn-outline-secondary" to="/dashboards">
        Back
      </NuxtLink>
    </div>
    <p class="text-muted small">Dashboard {{ dashboardId }}</p>

    <ClientOnly>
      <DashboardCanvas />
    </ClientOnly>
  </main>
</template>
