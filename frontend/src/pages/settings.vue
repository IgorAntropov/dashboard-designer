<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { api } from '@shared/api'

const runtimeConfig = useRuntimeConfig()
const buildVersion = runtimeConfig.public.appVersion as string
const apiVersion = ref('…')

onMounted(async () => {
  const { data, error } = await api.GET('/api/v1/version')
  apiVersion.value = error || !data ? 'unavailable' : (data.version ?? 'unavailable')
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
