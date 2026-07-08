<script setup lang="ts">
definePageMeta({ layout: 'blank' })
</script>

<template>
  <main class="container py-5">
    <h1 class="display-4 fw-bold mt-5">Panelka</h1>
    <p class="lead">{{ $t('landing.subtitle') }}</p>

    <div class="d-flex gap-2 mt-4">
      <NuxtLink class="btn btn-primary" to="/register">
        {{ $t('landing.getStarted') }}
      </NuxtLink>
      <NuxtLink class="btn btn-outline-secondary" to="/login">
        {{ $t('auth.login') }}
      </NuxtLink>
    </div>
  </main>
</template>
