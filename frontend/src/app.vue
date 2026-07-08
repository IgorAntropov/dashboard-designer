<script setup lang="ts">
import { computed, onMounted } from 'vue'

const colorMode = useColorMode()
const { setLocale } = useI18n()
const localeCookie = useCookie<string>('panelka_locale')

useHead({
  htmlAttrs: {
    'data-bs-theme': computed(() => colorMode.value),
  },
})

onMounted(() => {
  if (localeCookie.value) {
    setLocale(localeCookie.value)
  }
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
