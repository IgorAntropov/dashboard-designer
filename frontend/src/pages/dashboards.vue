<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import type { Dashboard } from '@entities/dashboard'
import {
  createDashboard,
  DashboardCard,
  deleteDashboard,
  listDashboards,
} from '@entities/dashboard'
import { AppButton, AppModal } from '@shared/ui'

const { t } = useI18n()

const dashboards = ref<Dashboard[]>([])
const loading = ref(true)
const creating = ref(false)
const modalOpen = ref(false)
const newTitle = ref('')

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

async function onDelete(id: string): Promise<void> {
  await deleteDashboard(id)
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
        @delete="onDelete"
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
  </div>
</template>
