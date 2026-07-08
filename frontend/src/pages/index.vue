<script setup lang="ts">
import { LanguageSwitcher, ThemeToggle } from '@shared/ui'

definePageMeta({ layout: 'blank' })

useHead({ title: 'Panelka' })
</script>

<template>
  <main class="container py-5">
    <div class="d-flex justify-content-end gap-2 mb-5">
      <LanguageSwitcher />
      <ThemeToggle />
    </div>

    <h1 class="display-4 fw-bold">Panelka</h1>
    <p class="lead">{{ $t('landing.subtitle') }}</p>

    <div class="d-flex gap-2 mt-4">
      <NuxtLink class="btn btn-primary" to="/dashboards">
        {{ $t('landing.getStarted') }}
      </NuxtLink>
      <NuxtLink class="btn btn-outline-secondary" to="/settings">
        {{ $t('landing.settings') }}
      </NuxtLink>
    </div>
  </main>
</template>
