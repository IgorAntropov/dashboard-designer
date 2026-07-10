<script setup lang="ts">
defineProps<{ title?: string; flush?: boolean }>()
</script>

<template>
  <section class="pk-card" :class="{ 'pk-card--flush': flush }">
    <header v-if="title || $slots.actions" class="pk-card__head">
      <h2 v-if="title" class="pk-card__title">{{ title }}</h2>
      <slot name="actions" />
    </header>
    <div class="pk-card__body">
      <slot />
    </div>
  </section>
</template>
