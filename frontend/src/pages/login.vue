<script setup lang="ts">
import { ref } from 'vue'

import { useSessionStore } from '@entities/session'
import { LanguageSwitcher, ThemeToggle } from '@shared/ui'

definePageMeta({ layout: 'blank' })

const session = useSessionStore()
const email = ref('')
const password = ref('')
const failed = ref(false)
const pending = ref(false)

async function onSubmit(): Promise<void> {
  failed.value = false
  pending.value = true
  const ok = await session.login(email.value, password.value)
  pending.value = false
  if (ok) {
    await navigateTo('/dashboards')
  } else {
    failed.value = true
  }
}

useHead({ title: 'Panelka — Login' })
</script>

<template>
  <main class="container py-5" style="max-width: 420px">
    <div class="d-flex justify-content-end gap-2 mb-4">
      <LanguageSwitcher />
      <ThemeToggle />
    </div>

    <h1 class="h3 mb-4">{{ $t('auth.loginTitle') }}</h1>

    <form @submit.prevent="onSubmit">
      <div class="mb-3">
        <label class="form-label">{{ $t('auth.email') }}</label>
        <input v-model="email" type="email" class="form-control" required>
      </div>
      <div class="mb-3">
        <label class="form-label">{{ $t('auth.password') }}</label>
        <input v-model="password" type="password" class="form-control" required>
      </div>

      <p v-if="failed" class="text-danger small">{{ $t('auth.failed') }}</p>

      <button class="btn btn-primary w-100" type="submit" :disabled="pending">
        {{ $t('auth.login') }}
      </button>
    </form>

    <p class="mt-3 mb-0 small">
      {{ $t('auth.noAccount') }}
      <NuxtLink to="/register">{{ $t('auth.register') }}</NuxtLink>
    </p>
  </main>
</template>
