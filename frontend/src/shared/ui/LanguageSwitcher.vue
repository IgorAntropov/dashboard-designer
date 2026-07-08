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
const currentName = computed(
  () => localeList.value.find((item) => item.code === locale.value)?.name ?? '',
)

const open = ref(false)
const trigger = ref<HTMLElement | null>(null)
const menu = ref<HTMLElement | null>(null)
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

async function select(code: string): Promise<void> {
  await setLocale(code)
  open.value = false
}

function onDocumentClick(event: MouseEvent): void {
  const target = event.target as Node
  if (
    open.value &&
    !trigger.value?.contains(target) &&
    !menu.value?.contains(target)
  ) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div class="lang-switch">
    <button
      ref="trigger"
      type="button"
      class="lang-switch__btn"
      :aria-label="$t('language.label')"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <span class="lang-switch__flag">{{ flags[locale] }}</span>
      <span class="lang-switch__name">{{ currentName }}</span>
      <span class="lang-switch__caret" aria-hidden="true">▾</span>
    </button>

    <Teleport to="body">
      <ul v-if="open" ref="menu" class="lang-switch__menu" :style="menuStyle">
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
    </Teleport>
  </div>
</template>
