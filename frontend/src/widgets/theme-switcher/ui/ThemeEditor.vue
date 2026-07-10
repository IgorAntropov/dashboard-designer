<script setup lang="ts">
import type { RenderTheme } from '@panelka/renderer'
import { ref, watch } from 'vue'

import { AppModal } from '@shared/ui'
import { useCanvasStore } from '@widgets/canvas'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

const store = useCanvasStore()

const COLOR_FIELDS = [
  { key: 'colorBg', label: 'background' },
  { key: 'colorSurface', label: 'surface' },
  { key: 'colorText', label: 'text' },
  { key: 'colorMuted', label: 'muted' },
  { key: 'colorAccent', label: 'accent' },
] as const

type ColorKey = (typeof COLOR_FIELDS)[number]['key']

function clone(theme: RenderTheme): RenderTheme {
  return { ...theme, colorSeries: [...theme.colorSeries] }
}

const draft = ref<RenderTheme>(clone(store.customTheme ?? store.effectiveTheme))

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      draft.value = clone(store.customTheme ?? store.effectiveTheme)
    }
  },
)

function apply(): void {
  store.setCustomTheme(clone(draft.value))
}

function onColor(key: ColorKey, event: Event): void {
  draft.value[key] = (event.target as HTMLInputElement).value
  apply()
}

function onSeries(index: number, event: Event): void {
  draft.value.colorSeries[index] = (event.target as HTMLInputElement).value
  apply()
}

function onFont(event: Event): void {
  draft.value.fontFamily = (event.target as HTMLInputElement).value
  apply()
}

function close(): void {
  emit('update:modelValue', false)
}
</script>

<template>
  <AppModal
    :model-value="modelValue"
    :title="$t('themeEditor.title')"
    @update:model-value="close"
  >
    <div class="theme-editor">
      <div v-for="field in COLOR_FIELDS" :key="field.key" class="theme-editor__row">
        <span class="theme-editor__label">{{ $t(`themeEditor.${field.label}`) }}</span>
        <input
          type="color"
          class="theme-editor__color"
          :value="draft[field.key]"
          @input="(event) => onColor(field.key, event)"
        >
      </div>

      <div class="theme-editor__row">
        <span class="theme-editor__label">{{ $t('themeEditor.series') }}</span>
        <span class="theme-editor__series">
          <input
            v-for="(color, index) in draft.colorSeries"
            :key="index"
            type="color"
            class="theme-editor__color"
            :value="color"
            @input="(event) => onSeries(index, event)"
          >
        </span>
      </div>

      <div class="theme-editor__row">
        <span class="theme-editor__label">{{ $t('themeEditor.font') }}</span>
        <input
          class="form-control form-control-sm theme-editor__font"
          :value="draft.fontFamily"
          @input="onFont"
        >
      </div>
    </div>
  </AppModal>
</template>

<style scoped>
.theme-editor {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.theme-editor__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.theme-editor__label {
  font-size: 0.9rem;
  color: var(--pk-muted);
}

.theme-editor__color {
  width: 2.4rem;
  height: 1.8rem;
  padding: 0;
  border: 1px solid var(--pk-border);
  border-radius: 0.4rem;
  background: transparent;
  cursor: pointer;
}

.theme-editor__series {
  display: inline-flex;
  gap: 0.35rem;
}

.theme-editor__font {
  max-width: 16rem;
}
</style>
