<script setup lang="ts">
import { computed, ref } from 'vue'

import { useSessionStore } from '@entities/session'
import { AppButton, PasswordField } from '@shared/ui'

definePageMeta({ layout: 'blank' })

const { t } = useI18n()
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

useHead({ title: computed(() => t('auth.loginTitle')) })
</script>

<template>
  <section class="auth-center">
    <div class="auth-card">
      <h1 class="h3 mb-4 text-center">{{ $t('auth.loginTitle') }}</h1>

      <form @submit.prevent="onSubmit">
        <div class="form-floating mb-3">
          <input
            id="login-email"
            v-model="email"
            type="email"
            class="form-control"
            :placeholder="$t('auth.email')"
            required
          >
          <label for="login-email">{{ $t('auth.email') }}</label>
        </div>

        <PasswordField
          id="login-password"
          v-model="password"
          :label="$t('auth.password')"
        />

        <p v-if="failed" class="text-danger small">{{ $t('auth.failed') }}</p>

        <AppButton
          type="submit"
          block
          :disabled="pending || !email.trim() || !password"
        >
          {{ $t('auth.login') }}
        </AppButton>
      </form>

      <p class="mt-3 mb-0 small text-center">
        {{ $t('auth.noAccount') }}
        <NuxtLink to="/register">{{ $t('auth.register') }}</NuxtLink>
      </p>
    </div>
  </section>
</template>
