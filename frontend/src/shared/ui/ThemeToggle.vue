<script setup lang="ts">
const colorMode = useColorMode()
</script>

<template>
  <select
    v-model="colorMode.preference"
    class="form-select form-select-sm"
    :aria-label="$t('theme.system')"
    style="width: auto"
  >
    <option value="system">{{ $t('theme.system') }}</option>
    <option value="light">{{ $t('theme.light') }}</option>
    <option value="dark">{{ $t('theme.dark') }}</option>
  </select>
</template>
