<script setup lang="ts">
import type { RenderInput, RenderTheme, WidgetHandle } from '@panelka/renderer'
import { renderWidget } from '@panelka/renderer'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { WidgetInstance } from '@entities/widget'

import { sampleDataFor } from '../model/sample'

const props = defineProps<{ widget: WidgetInstance; theme: RenderTheme }>()

const host = ref<HTMLElement | null>(null)
let handle: WidgetHandle | null = null
let observer: ResizeObserver | null = null

function buildInput(): RenderInput {
  return {
    type: props.widget.type,
    config: props.widget.config,
    binding: props.widget.binding,
    data: sampleDataFor(props.widget.type),
    theme: props.theme,
  }
}

onMounted(() => {
  if (!host.value) {
    return
  }
  handle = renderWidget(host.value, buildInput())
  observer = new ResizeObserver(() => handle?.resize())
  observer.observe(host.value)
})

watch(
  [() => props.widget, () => props.theme],
  () => handle?.update(buildInput()),
  { deep: true },
)

onBeforeUnmount(() => {
  observer?.disconnect()
  handle?.dispose()
})
</script>

<template>
  <div ref="host" class="pk-widget-view" />
</template>
