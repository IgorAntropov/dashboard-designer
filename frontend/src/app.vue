<script setup lang="ts">
import { computed } from 'vue'

const colorMode = useColorMode()

useHead({
  htmlAttrs: {
    'data-bs-theme': computed(() => colorMode.value),
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
