<script setup lang="ts">
import { LanguageSwitcher, ThemeToggle } from '@shared/ui'
</script>

<template>
  <div>
    <div class="glass-controls">
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
    <slot />
  </div>
</template>
