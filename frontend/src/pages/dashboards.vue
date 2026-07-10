<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import type { Dashboard, DashboardAnalytics } from '@entities/dashboard'
import {
  createDashboard,
  DashboardCard,
  deleteDashboard,
  exportDashboard,
  getAnalytics,
  listDashboards,
  publishDashboard,
} from '@entities/dashboard'
import { useSessionStore } from '@entities/session'
import { AppButton, AppModal } from '@shared/ui'

const { t } = useI18n()
const session = useSessionStore()
const canExport = computed(
  () => (session.user?.subscription_tier ?? 'free') !== 'free',
)

async function onExport(id: string): Promise<void> {
  const data = await exportDashboard(id)
  if (!data) {
    return
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${id}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

const dashboards = ref<Dashboard[]>([])
const loading = ref(true)
const creating = ref(false)
const modalOpen = ref(false)
const newTitle = ref('')
const confirmOpen = ref(false)
const pendingDeleteId = ref<string | null>(null)

const embedOpen = ref(false)
const embedDashboardId = ref<string | null>(null)
const allowedDomains = ref('')
const embedToken = ref<string | null>(null)
const embedIngestKey = ref<string | null>(null)
const publishing = ref(false)
const copied = ref('')
const analytics = ref<DashboardAnalytics | null>(null)
const analyticsMax = computed(() =>
  Math.max(1, ...(analytics.value?.days ?? []).map((day) => day.count)),
)

const embedUrl = computed(() =>
  embedToken.value && import.meta.client
    ? `${window.location.origin}/embed/${embedToken.value}`
    : '',
)
const iframeSnippet = computed(() =>
  embedUrl.value
    ? `<iframe src="${embedUrl.value}" width="100%" height="600" frameborder="0"></iframe>`
    : '',
)

function openEmbed(id: string): void {
  embedDashboardId.value = id
  allowedDomains.value = ''
  embedToken.value = null
  embedIngestKey.value = null
  copied.value = ''
  analytics.value = null
  embedOpen.value = true
  void getAnalytics(id).then((result) => {
    analytics.value = result
  })
}

async function doPublish(): Promise<void> {
  if (!embedDashboardId.value) {
    return
  }
  publishing.value = true
  const domains = allowedDomains.value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const result = await publishDashboard(embedDashboardId.value, domains)
  publishing.value = false
  if (result) {
    embedToken.value = result.token
    embedIngestKey.value = result.ingest_key
  }
}

const livePushSnippet = computed(() =>
  embedToken.value && embedIngestKey.value && import.meta.client
    ? `curl -X POST ${window.location.origin.replace(':3000', ':8000')}/api/v1/public/embed/${embedToken.value}/live \\
  -H "X-Ingest-Key: ${embedIngestKey.value}" \\
  -H "Content-Type: application/json" \\
  -d '{"series":[1,2,3]}'`
    : '',
)

async function copy(text: string, key: string): Promise<void> {
  await navigator.clipboard.writeText(text)
  copied.value = key
}

async function refresh(): Promise<void> {
  loading.value = true
  dashboards.value = await listDashboards()
  loading.value = false
}

function openModal(): void {
  newTitle.value = ''
  modalOpen.value = true
}

async function onCreate(): Promise<void> {
  const title = newTitle.value.trim()
  if (!title) {
    return
  }
  creating.value = true
  const created = await createDashboard({ title })
  creating.value = false
  modalOpen.value = false
  if (created) {
    await navigateTo(`/editor/${created.id}`)
  } else {
    await refresh()
  }
}

function askDelete(id: string): void {
  pendingDeleteId.value = id
  confirmOpen.value = true
}

async function confirmDelete(): Promise<void> {
  if (pendingDeleteId.value) {
    await deleteDashboard(pendingDeleteId.value)
  }
  confirmOpen.value = false
  pendingDeleteId.value = null
  await refresh()
}

onMounted(refresh)
useHead({ title: computed(() => t('dashboards.title')) })
</script>

<template>
  <div class="container-xxl">
    <div class="d-flex align-items-center gap-3 mb-4">
      <h1 class="h3 mb-0">{{ $t('dashboards.title') }}</h1>
      <AppButton
        icon="plus"
        icon-only
        :aria-label="$t('dashboards.new')"
        :title="$t('dashboards.new')"
        @click="openModal"
      />
    </div>

    <p v-if="loading">{{ $t('dashboards.loading') }}</p>
    <p v-else-if="dashboards.length === 0" class="text-muted">
      {{ $t('dashboards.empty') }}
    </p>
    <div v-else class="dash-grid">
      <DashboardCard
        v-for="dashboard in dashboards"
        :key="dashboard.id"
        :dashboard="dashboard"
        :can-export="canExport"
        @delete="askDelete"
        @embed="openEmbed"
        @export="onExport"
      />
    </div>

    <AppModal v-model="modalOpen" :title="$t('dashboards.create')">
      <form id="create-dashboard-form" @submit.prevent="onCreate">
        <div class="form-floating">
          <input
            id="new-dashboard-title"
            v-model="newTitle"
            class="form-control"
            :placeholder="$t('dashboards.placeholder')"
            required
          >
          <label for="new-dashboard-title">
            {{ $t('dashboards.placeholder') }}
          </label>
        </div>
      </form>

      <template #footer>
        <AppButton variant="secondary" @click="modalOpen = false">
          {{ $t('dashboards.cancel') }}
        </AppButton>
        <AppButton
          type="submit"
          icon="plus"
          form="create-dashboard-form"
          :disabled="creating || !newTitle.trim()"
        >
          {{ $t('dashboards.create') }}
        </AppButton>
      </template>
    </AppModal>

    <AppModal v-model="confirmOpen" :title="$t('dashboards.confirmDelete')">
      <p class="mb-0">{{ $t('dashboards.confirmDelete') }}</p>

      <template #footer>
        <AppButton variant="secondary" @click="confirmOpen = false">
          {{ $t('dashboards.cancel') }}
        </AppButton>
        <AppButton variant="danger" icon="trash" @click="confirmDelete">
          {{ $t('dashboards.delete') }}
        </AppButton>
      </template>
    </AppModal>

    <AppModal v-model="embedOpen" :title="$t('embed.title')">
      <div v-if="analytics" class="mb-3">
        <div class="d-flex justify-content-between align-items-baseline mb-1">
          <label class="form-label small mb-0">{{ $t('embed.analytics') }}</label>
          <span class="small text-muted">
            {{ $t('embed.loads') }}: {{ analytics.total }}
          </span>
        </div>
        <div v-if="analytics.days.length" class="embed-bars">
          <span
            v-for="day in analytics.days"
            :key="day.day"
            class="embed-bars__bar"
            :style="{ height: `${Math.round((day.count / analyticsMax) * 100)}%` }"
            :title="`${day.day}: ${day.count}`"
          />
        </div>
        <p v-else class="small text-muted mb-0">{{ $t('embed.noData') }}</p>
      </div>

      <div class="mb-3">
        <label class="form-label small">{{ $t('embed.domains') }}</label>
        <input
          v-model="allowedDomains"
          class="form-control form-control-sm"
          placeholder="example.com, app.example.com"
        >
      </div>

      <div v-if="embedToken">
        <label class="form-label small">{{ $t('embed.link') }}</label>
        <div class="input-group input-group-sm mb-3">
          <input class="form-control" :value="embedUrl" readonly>
          <AppButton
            variant="secondary"
            size="sm"
            @click="copy(embedUrl, 'link')"
          >
            {{ copied === 'link' ? $t('embed.copied') : $t('embed.copy') }}
          </AppButton>
        </div>

        <label class="form-label small">{{ $t('embed.snippet') }}</label>
        <textarea
          class="form-control form-control-sm mb-2"
          rows="3"
          readonly
          :value="iframeSnippet"
        />
        <AppButton
          variant="secondary"
          size="sm"
          @click="copy(iframeSnippet, 'snippet')"
        >
          {{ copied === 'snippet' ? $t('embed.copied') : $t('embed.copy') }}
        </AppButton>

        <label class="form-label small mt-3">{{ $t('embed.ingestKey') }}</label>
        <div class="input-group input-group-sm mb-2">
          <input class="form-control" :value="embedIngestKey" readonly>
          <AppButton
            variant="secondary"
            size="sm"
            @click="copy(embedIngestKey ?? '', 'ingest')"
          >
            {{ copied === 'ingest' ? $t('embed.copied') : $t('embed.copy') }}
          </AppButton>
        </div>
        <p class="small text-muted mb-1">{{ $t('embed.livePush') }}</p>
        <textarea
          class="form-control form-control-sm mb-2"
          rows="4"
          readonly
          :value="livePushSnippet"
        />
      </div>

      <template #footer>
        <AppButton variant="secondary" @click="embedOpen = false">
          {{ $t('dashboards.cancel') }}
        </AppButton>
        <AppButton icon="link" :disabled="publishing" @click="doPublish">
          {{ $t('embed.publish') }}
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>

