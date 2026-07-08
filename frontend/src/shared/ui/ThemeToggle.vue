<script setup lang="ts">
const colorMode = useColorMode()

const options = [
  { value: 'light', icon: '☀' },
  { value: 'system', icon: '◐' },
  { value: 'dark', icon: '☾' },
] as const
</script>

<template>
  <div class="theme-switch" role="group" :aria-label="$t('theme.system')">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="theme-switch__opt"
      :class="{ 'is-active': colorMode.preference === option.value }"
      :title="$t(`theme.${option.value}`)"
      :aria-pressed="colorMode.preference === option.value"
      @click="colorMode.preference = option.value"
    >
      <span aria-hidden="true">{{ option.icon }}</span>
    </button>
  </div>
</template>
