<script setup lang="ts">
import type { RenderTheme } from '@panelka/renderer'

const props = defineProps<{ modelValue: RenderTheme }>()
const emit = defineEmits<{ 'update:modelValue': [RenderTheme] }>()

const COLOR_FIELDS = [
  { key: 'colorBg', label: 'background' },
  { key: 'colorSurface', label: 'surface' },
  { key: 'colorText', label: 'text' },
  { key: 'colorMuted', label: 'muted' },
  { key: 'colorAccent', label: 'accent' },
] as const

type ColorKey = (typeof COLOR_FIELDS)[number]['key']

function update(patch: Partial<RenderTheme>): void {
  emit('update:modelValue', {
    ...props.modelValue,
    colorSeries: [...props.modelValue.colorSeries],
    ...patch,
  })
}

function onColor(key: ColorKey, event: Event): void {
  update({ [key]: (event.target as HTMLInputElement).value } as Partial<RenderTheme>)
}

function onSeries(index: number, event: Event): void {
  const series = [...props.modelValue.colorSeries]
  series[index] = (event.target as HTMLInputElement).value
  update({ colorSeries: series })
}

function onFont(event: Event): void {
  update({ fontFamily: (event.target as HTMLInputElement).value })
}
</script>

<template>
  <div class="theme-editor">
    <div v-for="field in COLOR_FIELDS" :key="field.key" class="theme-editor__row">
      <span class="theme-editor__label">{{ $t(`themeEditor.${field.label}`) }}</span>
      <input
        type="color"
        class="theme-editor__color"
        :value="modelValue[field.key]"
        @input="(event) => onColor(field.key, event)"
      >
    </div>

    <div class="theme-editor__row">
      <span class="theme-editor__label">{{ $t('themeEditor.series') }}</span>
      <span class="theme-editor__series">
        <input
          v-for="(color, index) in modelValue.colorSeries"
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
        :value="modelValue.fontFamily"
        @input="onFont"
      >
    </div>
  </div>
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
