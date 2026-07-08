<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'
import { computed, ref } from 'vue'

const { locale, locales, setLocale } = useI18n()

const flags: Record<string, string> = {
  ru: '🇷🇺',
  en: '🇬🇧',
  de: '🇩🇪',
  pl: '🇵🇱',
  cs: '🇨🇿',
  fr: '🇫🇷',
  it: '🇮🇹',
}

const localeList = computed(() => locales.value as LocaleObject[])
const open = ref(false)

function select(code: string): void {
  setLocale(code)
  open.value = false
}
</script>

<template>
  <div class="lang-switch">
    <button
      type="button"
      class="lang-switch__btn"
      :aria-label="$t('language.label')"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="lang-switch__flag">{{ flags[locale] }}</span>
      <span class="lang-switch__caret" aria-hidden="true">▾</span>
    </button>

    <div v-if="open" class="lang-switch__backdrop" @click="open = false" />

    <ul v-if="open" class="lang-switch__menu">
      <li v-for="item in localeList" :key="item.code">
        <button
          type="button"
          class="lang-switch__item"
          :class="{ 'is-active': item.code === locale }"
          @click="select(item.code)"
        >
          <span class="lang-switch__flag">{{ flags[item.code] }}</span>
          <span>{{ item.name }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
