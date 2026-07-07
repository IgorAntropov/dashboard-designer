<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { apiClient } from '@shared/api'

const runtimeConfig = useRuntimeConfig()
const buildVersion = runtimeConfig.public.appVersion as string
const apiVersion = ref('…')

onMounted(async () => {
  try {
    const data = await apiClient.get<{ version: string }>('/version')
    apiVersion.value = data.version
  } catch {
    apiVersion.value = 'unavailable'
  }
})

useHead({ title: 'Panelka — Settings' })
</script>

<template>
  <main class="container py-5">
    <h1 class="h3 mb-4">Settings</h1>

    <section>
      <h2 class="h5">About</h2>
      <ul class="list-unstyled">
        <li>App build: <code>v{{ buildVersion }}</code></li>
        <li>API: <code>v{{ apiVersion }}</code></li>
      </ul>
    </section>
  </main>
</template>
