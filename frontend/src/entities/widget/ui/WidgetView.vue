<script setup lang="ts">
import type { RenderInput, RenderTheme, WidgetHandle } from '@panelka/renderer'
import { renderWidget } from '@panelka/renderer'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { WidgetInstance } from '@entities/widget'

import { sampleDataFor } from '../model/sample'

const props = defineProps<{ widget: WidgetInstance; theme: RenderTheme }>()

const infoText = computed(() => {
  if (props.widget.type === 'stat-tile') {
    return ''
  }
  const value = props.widget.config.info
  return typeof value === 'string' ? value : ''
})

const { t } = useI18n()
const host = ref<HTMLElement | null>(null)
let handle: WidgetHandle | null = null
let observer: ResizeObserver | null = null
let renderedType: string | null = null

function buildInput(): RenderInput {
  const embedded = props.widget.config.sampleData
  return {
    type: props.widget.type,
    config: props.widget.config,
    binding: props.widget.binding,
    data: Array.isArray(embedded)
      ? (embedded as Array<Record<string, unknown>>)
      : sampleDataFor(props.widget.type, t),
    theme: props.theme,
  }
}

onMounted(() => {
  if (!host.value) {
    return
  }
  handle = renderWidget(host.value, buildInput())
  renderedType = props.widget.type
  observer = new ResizeObserver(() => handle?.resize())
  observer.observe(host.value)
})

watch(
  [() => props.widget, () => props.theme],
  () => {
    if (!host.value) {
      return
    }
    if (props.widget.type !== renderedType) {
      handle?.dispose()
      handle = renderWidget(host.value, buildInput())
      renderedType = props.widget.type
      handle.resize()
      return
    }
    handle?.update(buildInput())
  },
  { deep: true },
)

onBeforeUnmount(() => {
  observer?.disconnect()
  handle?.dispose()
})
</script>

<template>
  <div class="pk-widget-view">
    <span
      v-if="infoText"
      class="pk-widget-view__info pk-info pk-info--end"
      :data-pk-tip="infoText"
      tabindex="0"
      role="img"
      :aria-label="infoText"
    >i</span>
    <div ref="host" class="pk-widget-view__host" />
  </div>
</template>

<style scoped>
.pk-widget-view {
  position: relative;
  width: 100%;
  height: 100%;
}

.pk-widget-view__host {
  width: 100%;
  height: 100%;
}

.pk-widget-view__info {
  position: absolute;
  top: 6px;
  right: 34px;
  z-index: 3;
  width: 16px;
  height: 16px;
  display: grid;
  place-items: center;
  border: 1px solid var(--pk-muted, #9aa0aa);
  border-radius: 50%;
  color: var(--pk-muted, #9aa0aa);
  font-size: 0.62rem;
  font-style: italic;
  font-weight: 700;
  line-height: 1;
  cursor: help;
  background-color: transparent;
}
</style>
