<script setup lang="ts">
import type { LocaleObject } from '@nuxtjs/i18n'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

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
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLElement | null>(null)
const menuStyle = ref<Record<string, string>>({})

function place(): void {
  const rect = trigger.value?.getBoundingClientRect()
  if (!rect) {
    return
  }
  const style: Record<string, string> = { position: 'fixed' }
  if (rect.top > window.innerHeight / 2) {
    style.bottom = `${window.innerHeight - rect.top + 6}px`
  } else {
    style.top = `${rect.bottom + 6}px`
  }
  if (rect.left > window.innerWidth / 2) {
    style.right = `${window.innerWidth - rect.right}px`
  } else {
    style.left = `${rect.left}px`
  }
  menuStyle.value = style
}

function toggle(): void {
  if (!open.value) {
    place()
  }
  open.value = !open.value
}

function select(code: string): void {
  setLocale(code)
  open.value = false
}

function onDocumentClick(event: MouseEvent): void {
  if (open.value && root.value && !root.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div ref="root" class="lang-switch">
    <button
      ref="trigger"
      type="button"
      class="lang-switch__btn"
      :aria-label="$t('language.label')"
      :aria-expanded="open"
      @click="toggle"
    >
      <span class="lang-switch__flag">{{ flags[locale] }}</span>
      <span class="lang-switch__caret" aria-hidden="true">▾</span>
    </button>

    <ul v-if="open" class="lang-switch__menu" :style="menuStyle">
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
