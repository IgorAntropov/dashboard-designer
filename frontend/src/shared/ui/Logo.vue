<script setup lang="ts">
withDefaults(defineProps<{ showWord?: boolean }>(), { showWord: true })
</script>

<template>
  <span class="pk-logo">
    <svg
      class="pk-logo__mark"
      width="30"
      height="30"
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="12" height="12" rx="3.2" fill="var(--pk-accent)" />
      <rect
        x="17"
        y="3"
        width="12"
        height="12"
        rx="3.2"
        fill="currentColor"
        opacity="0.28"
      />
      <rect
        x="3"
        y="17"
        width="12"
        height="12"
        rx="3.2"
        fill="currentColor"
        opacity="0.28"
      />
      <rect
        x="17"
        y="17"
        width="12"
        height="12"
        rx="3.2"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
    <span v-if="showWord" class="pk-logo__word">Panelka</span>
  </span>
</template>
