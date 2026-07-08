<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'

const { locale, locales, setLocale } = useI18n()
const localeCookie = useCookie<string>('panelka_locale', {
  maxAge: 60 * 60 * 24 * 365,
})

function onChange(event: Event): void {
  const code = (event.target as HTMLSelectElement).value
  setLocale(code)
  localeCookie.value = code
}
</script>

<template>
  <select
    :value="locale"
    class="form-select form-select-sm"
    :aria-label="$t('language.label')"
    style="width: auto"
    @change="onChange"
  >
    <option
      v-for="item in (locales as LocaleObject[])"
      :key="item.code"
      :value="item.code"
    >
      {{ item.name }}
    </option>
  </select>
</template>
