<script setup lang="ts">
import AppIcon from './AppIcon.vue'

defineProps<{ icon?: string; title?: string; text?: string }>()
</script>

<template>
  <div class="pk-empty">
    <span v-if="icon" class="pk-empty__icon">
      <AppIcon :name="icon" />
    </span>
    <p v-if="title" class="pk-empty__title">{{ title }}</p>
    <p v-if="text" class="pk-empty__text">{{ text }}</p>
    <div v-if="$slots.action" class="pk-empty__action">
      <slot name="action" />
    </div>
  </div>
</template>
