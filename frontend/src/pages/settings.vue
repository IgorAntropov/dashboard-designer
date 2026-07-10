<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { api } from '@shared/api'
import { AppCard } from '@shared/ui'
import { ThemeManager } from '@widgets/theme-manager'

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
    <header class="page-head">
      <h1 class="page-head__title">{{ $t('settings.title') }}</h1>
    </header>

    <div class="page-stack">
      <ClientOnly><ThemeManager /></ClientOnly>

      <AppCard :title="$t('settings.about')">
        <ul class="list-unstyled mb-0 small">
          <li class="mb-1">
            {{ $t('settings.appBuild') }}: <code>v{{ buildVersion }}</code>
          </li>
          <li>{{ $t('settings.api') }}: <code>v{{ apiVersion }}</code></li>
        </ul>
      </AppCard>
    </div>
  </div>
</template>
