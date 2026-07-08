<script setup lang="ts">
import { ref } from 'vue'

import { useSessionStore } from '@entities/session'
import { LanguageSwitcher, ThemeToggle } from '@shared/ui'

definePageMeta({ layout: 'blank' })

const session = useSessionStore()
const email = ref('')
const password = ref('')
const displayName = ref('')
const failed = ref(false)
const pending = ref(false)

async function onSubmit(): Promise<void> {
  failed.value = false
  pending.value = true
  const ok = await session.register(email.value, password.value, displayName.value)
  pending.value = false
  if (ok) {
    await navigateTo('/dashboards')
  } else {
    failed.value = true
  }
}

useHead({ title: 'Panelka — Register' })
</script>

<template>
  <main class="container py-5" style="max-width: 420px">
    <div class="d-flex justify-content-end gap-2 mb-4">
      <LanguageSwitcher />
      <ThemeToggle />
    </div>

    <h1 class="h3 mb-4">{{ $t('auth.registerTitle') }}</h1>

    <form @submit.prevent="onSubmit">
      <div class="mb-3">
        <label class="form-label">{{ $t('auth.displayName') }}</label>
        <input v-model="displayName" type="text" class="form-control" required>
      </div>
      <div class="mb-3">
        <label class="form-label">{{ $t('auth.email') }}</label>
        <input v-model="email" type="email" class="form-control" required>
      </div>
      <div class="mb-3">
        <label class="form-label">{{ $t('auth.password') }}</label>
        <input
          v-model="password"
          type="password"
          class="form-control"
          minlength="8"
          required
        >
      </div>

      <p v-if="failed" class="text-danger small">{{ $t('auth.failed') }}</p>

      <button class="btn btn-primary w-100" type="submit" :disabled="pending">
        {{ $t('auth.register') }}
      </button>
    </form>

    <p class="mt-3 mb-0 small">
      {{ $t('auth.haveAccount') }}
      <NuxtLink to="/login">{{ $t('auth.login') }}</NuxtLink>
    </p>
  </main>
</template>
