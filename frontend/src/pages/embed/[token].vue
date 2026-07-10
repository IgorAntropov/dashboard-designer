<script setup lang="ts">
import type { RenderInput, WidgetHandle } from '@panelka/renderer'
import { getTheme, renderWidget } from '@panelka/renderer'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import type { WidgetInstance } from '@entities/widget'
import { sampleDataFor } from '@entities/widget'
import { config as appConfig } from '@shared/config'

definePageMeta({ layout: false })

interface PublishedConfig {
  dashboard_id: string
  theme_key: string
  layout: { widgets?: WidgetInstance[] }
  data_source: Record<string, unknown>
  attribution: boolean
}

const route = useRoute()
const token = route.params.token as string

if (import.meta.server) {
  const event = useRequestEvent()
  const meta = await $fetch<{ allowed_domains?: string[] }>(
    `${appConfig.apiOrigin}/api/v1/public/embed/${token}`,
  ).catch(() => null)
  const domains = meta?.allowed_domains ?? []
  const ancestors = domains.length
    ? domains
        .map((domain) => (domain.includes('://') ? domain : `https://${domain}`))
        .join(' ')
    : '*'
  event?.node.res.setHeader(
    'content-security-policy',
    `frame-ancestors ${ancestors}`,
  )
}

const loaded = ref(false)
const notFound = ref(false)
const attribution = ref(true)
const themeKey = ref('light-minimal')
const rootEl = ref<HTMLElement | null>(null)

const widgets = ref<WidgetInstance[]>([])
const handles = new Map<string, WidgetHandle>()
let dataByWidget: Record<string, Array<Record<string, unknown>>> = {}
let observer: ResizeObserver | null = null

const themeVars = computed(() => {
  const theme = getTheme(themeKey.value)
  return {
    '--pk-bg': theme.colorBg,
    '--pk-surface': theme.colorSurface,
    '--pk-text': theme.colorText,
    '--pk-muted': theme.colorMuted,
  }
})

function cellStyle(widget: WidgetInstance): Record<string, string> {
  return {
    gridColumn: `${widget.x + 1} / span ${widget.w}`,
    gridRow: `${widget.y + 1} / span ${widget.h}`,
  }
}

function inputFor(widget: WidgetInstance): RenderInput {
  return {
    type: widget.type,
    config: widget.config,
    binding: widget.binding,
    data: dataByWidget[widget.id] ?? sampleDataFor(widget.type),
    theme: getTheme(themeKey.value),
  }
}

function renderAll(): void {
  for (const widget of widgets.value) {
    const host = rootEl.value?.querySelector<HTMLElement>(
      `[data-w="${widget.id}"] .embed-widget__body`,
    )
    if (!host) {
      continue
    }
    const existing = handles.get(widget.id)
    if (existing) {
      existing.update(inputFor(widget))
    } else {
      handles.set(widget.id, renderWidget(host, inputFor(widget)))
    }
  }
  handles.forEach((handle) => handle.resize())
}

function reportHeight(): void {
  const height = rootEl.value?.scrollHeight ?? 0
  window.parent.postMessage({ type: 'panelka:height', height }, '*')
}

function onMessage(event: MessageEvent): void {
  const message = event.data as {
    type?: string
    payload?: Record<string, Array<Record<string, unknown>>>
  }
  if (message?.type === 'panelka:data' && message.payload) {
    dataByWidget = { ...dataByWidget, ...message.payload }
    renderAll()
    reportHeight()
  }
}

onMounted(async () => {
  const response = await fetch(
    `${appConfig.apiOrigin}/api/v1/public/embed/${token}`,
  )
  if (!response.ok) {
    notFound.value = true
    loaded.value = true
    return
  }
  const cfg = (await response.json()) as PublishedConfig
  themeKey.value = cfg.theme_key
  attribution.value = cfg.attribution
  widgets.value = Array.isArray(cfg.layout?.widgets) ? cfg.layout.widgets : []
  loaded.value = true

  await nextTick()
  renderAll()
  reportHeight()

  window.addEventListener('message', onMessage)
  observer = new ResizeObserver(reportHeight)
  if (rootEl.value) {
    observer.observe(rootEl.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage)
  observer?.disconnect()
  handles.forEach((handle) => handle.dispose())
})

useHead({ title: 'Panelka' })
</script>

<template>
  <div ref="rootEl" class="embed-root" :style="themeVars">
    <p v-if="notFound" class="embed-empty">Not found</p>

    <div v-else class="embed-grid">
      <div
        v-for="widget in widgets"
        :key="widget.id"
        :data-w="widget.id"
        class="embed-widget"
        :style="cellStyle(widget)"
      >
        <div class="embed-widget__body" />
      </div>
    </div>

    <div v-if="attribution && !notFound" class="embed-attr">Made with Panelka</div>
  </div>
</template>
