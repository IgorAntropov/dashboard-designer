<script setup lang="ts">
import { onMounted, ref } from 'vue'

import type { Dashboard } from '@entities/dashboard'
import {
  createDashboard,
  deleteDashboard,
  listDashboards,
} from '@entities/dashboard'

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

onMounted(refresh)
useHead({ title: 'Panelka — Dashboards' })
</script>

<template>
  <div class="container-xxl">
    <h1 class="h3 mb-4">{{ $t('dashboards.title') }}</h1>

    <form class="d-flex gap-2 mb-4" @submit.prevent="onCreate">
      <input
        v-model="newTitle"
        class="form-control"
        :placeholder="$t('dashboards.placeholder')"
      >
      <button class="btn btn-primary" type="submit">
        {{ $t('dashboards.create') }}
      </button>
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
          <NuxtLink
            class="btn btn-sm btn-outline-primary"
            :to="`/editor/${dashboard.id}`"
          >
            {{ $t('dashboards.open') }}
          </NuxtLink>
          <button
            class="btn btn-sm btn-outline-danger"
            type="button"
            @click="onDelete(dashboard.id)"
          >
            {{ $t('dashboards.delete') }}
          </button>
        </span>
      </li>
    </ul>
  </div>
</template>
