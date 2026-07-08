<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'accent' | 'neutral' }>(), {
  variant: 'accent',
})
</script>

<template>
  <span class="pk-badge" :class="`pk-badge--${$props.variant}`">
    <slot />
  </span>
</template>
