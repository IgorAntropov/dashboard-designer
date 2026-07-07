<script setup lang="ts">
useHead({ title: 'Panelka' })
</script>

<template>
  <main class="container py-5">
    <h1 class="display-4 fw-bold">Panelka</h1>
    <p class="lead">Build dashboards, theme them, and embed them anywhere.</p>
    <div class="d-flex gap-2">
      <NuxtLink class="btn btn-primary" to="/dashboards">Get started</NuxtLink>
      <NuxtLink class="btn btn-outline-secondary" to="/settings">Settings</NuxtLink>
    </div>
  </main>
</template>
