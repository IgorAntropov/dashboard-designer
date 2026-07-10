<script setup lang="ts">
import type { EmbedConfig, EmbedData } from '@panelka/renderer'
import { DashboardEngine } from '@panelka/renderer'
import { onBeforeUnmount, onMounted, ref } from 'vue'

import type { WidgetInstance } from '@entities/widget'
import { sampleDataFor } from '@entities/widget'
import { config as appConfig } from '@shared/config'

definePageMeta({ layout: false })

interface PublishedConfig extends EmbedConfig {
  allowed_domains?: string[]
  data_source: Record<string, unknown>
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
const rootEl = ref<HTMLElement | null>(null)

let engine: DashboardEngine | null = null
let allowedDomains: string[] = []
let observer: ResizeObserver | null = null

function hostOf(value: string): string {
  const raw = value.includes('://') ? value : `https://${value}`
  try {
    return new URL(raw).host.toLowerCase()
  } catch {
    return value.toLowerCase()
  }
}

function originAllowed(origin: string): boolean {
  if (allowedDomains.length === 0) {
    return true
  }
  const host = hostOf(origin)
  return allowedDomains.some((domain) => hostOf(domain) === host)
}

function seedSampleData(widgets: WidgetInstance[]): EmbedData {
  const seed: EmbedData = {}
  for (const widget of widgets) {
    seed[widget.id] = sampleDataFor(widget.type)
  }
  return seed
}

function parentOrigin(): string {
  if (!document.referrer) {
    return '*'
  }
  try {
    return new URL(document.referrer).origin
  } catch {
    return '*'
  }
}

function reportHeight(): void {
  const height = rootEl.value?.scrollHeight ?? 0
  window.parent.postMessage({ type: 'panelka:height', height }, parentOrigin())
}

function onMessage(event: MessageEvent): void {
  if (event.source !== window.parent || !originAllowed(event.origin)) {
    return
  }
  const message = event.data as { type?: string; payload?: EmbedData }
  if (message?.type === 'panelka:data' && message.payload) {
    engine?.setData(message.payload)
    reportHeight()
  }
}

onMounted(async () => {
  const response = await fetch(
    `${appConfig.apiOrigin}/api/v1/public/embed/${token}`,
  )
  if (!response.ok || !rootEl.value) {
    notFound.value = true
    loaded.value = true
    return
  }
  const cfg = (await response.json()) as PublishedConfig
  allowedDomains = cfg.allowed_domains ?? []
  const widgets = Array.isArray(cfg.layout?.widgets) ? cfg.layout.widgets : []
  loaded.value = true

  engine = new DashboardEngine(rootEl.value)
  engine.setData(seedSampleData(widgets as WidgetInstance[]))
  engine.mount(cfg)
  reportHeight()

  window.addEventListener('message', onMessage)
  observer = new ResizeObserver(reportHeight)
  observer.observe(rootEl.value)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage)
  observer?.disconnect()
  engine?.destroy()
})

useHead({ title: 'Panelka' })
</script>

<template>
  <div ref="rootEl" class="embed-root">
    <p v-if="notFound" class="embed-empty">Not found</p>
  </div>
</template>
