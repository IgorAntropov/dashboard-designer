<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { api } from '@shared/api'

const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const buildVersion = runtimeConfig.public.appVersion as string
const apiVersion = ref('…')

onMounted(async () => {
  const { data, error } = await api.GET('/api/v1/version')
  apiVersion.value = error || !data ? 'unavailable' : (data.version ?? 'unavailable')
})

useHead({ title: computed(() => t('settings.title')) })
</script>

<template>
  <div class="container-xxl">
    <h1 class="h3 mb-4">{{ $t('settings.title') }}</h1>

    <section>
      <h2 class="h5">{{ $t('settings.about') }}</h2>
      <ul class="list-unstyled">
        <li>{{ $t('settings.appBuild') }}: <code>v{{ buildVersion }}</code></li>
        <li>{{ $t('settings.api') }}: <code>v{{ apiVersion }}</code></li>
      </ul>
    </section>
  </div>
</template>
