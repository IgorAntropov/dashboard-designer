<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import type { Dashboard } from '@entities/dashboard'
import {
  createDashboard,
  deleteDashboard,
  listDashboards,
} from '@entities/dashboard'
import { AppButton } from '@shared/ui'

const dashboards = ref<Dashboard[]>([])
const newTitle = ref('')
const loading = ref(true)

async function refresh(): Promise<void> {
  loading.value = true
  dashboards.value = await listDashboards()
  loading.value = false
}

async function onCreate(): Promise<void> {
  const title = newTitle.value.trim()
  if (!title) {
    return
  }
  await createDashboard({ title })
  newTitle.value = ''
  await refresh()
}

async function onDelete(id: string): Promise<void> {
  await deleteDashboard(id)
  await refresh()
}

const { t } = useI18n()

onMounted(refresh)
useHead({ title: computed(() => t('dashboards.title')) })
</script>

<template>
  <div class="container-xxl">
    <h1 class="h3 mb-4">{{ $t('dashboards.title') }}</h1>

    <form class="d-flex gap-2 mb-4" @submit.prevent="onCreate">
      <div class="form-floating flex-grow-1">
        <input
          id="dashboard-title"
          v-model="newTitle"
          class="form-control"
          :placeholder="$t('dashboards.placeholder')"
        >
        <label for="dashboard-title">{{ $t('dashboards.placeholder') }}</label>
      </div>
      <AppButton type="submit" icon="plus">
        {{ $t('dashboards.create') }}
      </AppButton>
    </form>

    <p v-if="loading">{{ $t('dashboards.loading') }}</p>
    <p v-else-if="dashboards.length === 0" class="text-muted">
      {{ $t('dashboards.empty') }}
    </p>
    <ul v-else class="list-group">
      <li
        v-for="dashboard in dashboards"
        :key="dashboard.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <span>{{ dashboard.title }}</span>
        <span class="d-flex gap-2">
          <AppButton
            :to="`/editor/${dashboard.id}`"
            variant="secondary"
            size="sm"
            icon="open"
          >
            {{ $t('dashboards.open') }}
          </AppButton>
          <AppButton
            variant="danger"
            size="sm"
            icon="trash"
            icon-only
            :aria-label="$t('dashboards.delete')"
            :title="$t('dashboards.delete')"
            @click="onDelete(dashboard.id)"
          />
        </span>
      </li>
    </ul>
  </div>
</template>
