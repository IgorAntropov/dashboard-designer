<script setup lang="ts">
import type { RenderInput, WidgetHandle } from '@panelka/renderer'
import { renderWidget } from '@panelka/renderer'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { WidgetInstance } from '@entities/widget'

import { sampleDataFor } from '../model/sample'
import { getRenderTheme } from '../model/theme'

const props = defineProps<{ widget: WidgetInstance }>()

const host = ref<HTMLElement | null>(null)
let handle: WidgetHandle | null = null
let observer: ResizeObserver | null = null

function buildInput(): RenderInput {
  return {
    type: props.widget.type,
    config: props.widget.config,
    binding: props.widget.binding,
    data: sampleDataFor(props.widget.type),
    theme: getRenderTheme(),
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
  () => props.widget,
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
