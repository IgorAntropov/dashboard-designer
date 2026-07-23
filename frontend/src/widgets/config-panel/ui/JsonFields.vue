<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

import { useCanvasStore } from '@widgets/canvas'

import { useWidgetConfig } from '../model/useWidgetConfig'
import { parseWidgetJson, widgetToJson } from '../model/widgetJson'

const store = useCanvasStore()
const { widget } = useWidgetConfig()

const text = ref('')
const errorKey = ref<string | null>(null)
let internalEdit = false

function resetFromWidget(): void {
  if (widget.value) {
    text.value = widgetToJson(widget.value)
    errorKey.value = null
  }
}

watch(
  () => widget.value?.id,
  () => resetFromWidget(),
  { immediate: true },
)

watch(
  () => (widget.value ? widgetToJson(widget.value) : ''),
  (next) => {
    if (internalEdit || !widget.value) {
      return
    }
    text.value = next
    errorKey.value = null
  },
)

function onInput(event: Event): void {
  const raw = (event.target as HTMLTextAreaElement).value
  text.value = raw
  if (!widget.value) {
    return
  }
  const result = parseWidgetJson(raw)
  if (!result.ok) {
    errorKey.value = result.error
    return
  }
  errorKey.value = null
  internalEdit = true
  store.setWidgetData(widget.value.id, result.data)
  void nextTick(() => {
    internalEdit = false
  })
}
</script>

<template>
  <div class="json-fields">
    <p class="text-muted small json-fields__hint">{{ $t('config.jsonHint') }}</p>
    <textarea
      class="json-fields__area"
      :class="{ 'json-fields__area--error': errorKey }"
      spellcheck="false"
      autocapitalize="off"
      autocomplete="off"
      :value="text"
      @input="onInput"
    />
    <p v-if="errorKey" class="json-fields__error">
      {{ $t(`config.jsonError.${errorKey}`) }}
    </p>
  </div>
</template>

<style scoped>
.json-fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.json-fields__hint {
  margin: 0;
}

.json-fields__area {
  width: 100%;
  min-height: 20rem;
  resize: vertical;
  padding: 0.75rem;
  border: 1px solid var(--pk-border);
  border-radius: var(--pk-radius);
  background-color: var(--pk-bg);
  color: var(--pk-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  tab-size: 2;
}

.json-fields__area:focus {
  outline: none;
  border-color: var(--pk-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--pk-accent) 25%, transparent);
}

.json-fields__area--error {
  border-color: var(--pk-danger);
}

.json-fields__area--error:focus {
  border-color: var(--pk-danger);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--pk-danger) 25%, transparent);
}

.json-fields__error {
  margin: 0;
  font-size: 0.8rem;
  color: var(--pk-danger);
}
</style>
