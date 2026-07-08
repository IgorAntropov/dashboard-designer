<script setup lang="ts">
import { computed, ref } from 'vue'

import { useSessionStore } from '@entities/session'
import { AppButton, PasswordField } from '@shared/ui'

definePageMeta({ layout: 'blank' })

const { t } = useI18n()
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

useHead({ title: computed(() => t('auth.registerTitle')) })
</script>

<template>
  <section class="auth-center">
    <div class="auth-card">
      <h1 class="h3 mb-4 text-center">{{ $t('auth.registerTitle') }}</h1>

      <form @submit.prevent="onSubmit">
        <div class="form-floating mb-3">
          <input
            id="register-name"
            v-model="displayName"
            type="text"
            class="form-control"
            :placeholder="$t('auth.displayName')"
            required
          >
          <label for="register-name">{{ $t('auth.displayName') }}</label>
        </div>

        <div class="form-floating mb-3">
          <input
            id="register-email"
            v-model="email"
            type="email"
            class="form-control"
            :placeholder="$t('auth.email')"
            required
          >
          <label for="register-email">{{ $t('auth.email') }}</label>
        </div>

        <PasswordField
          id="register-password"
          v-model="password"
          :label="$t('auth.password')"
          :minlength="8"
        />

        <p v-if="failed" class="text-danger small">{{ $t('auth.failed') }}</p>

        <button class="btn btn-primary w-100" type="submit" :disabled="pending">
          {{ $t('auth.register') }}
        </button>
      </form>

      <p class="mt-3 mb-0 small text-center">
        {{ $t('auth.haveAccount') }}
        <NuxtLink to="/login">{{ $t('auth.login') }}</NuxtLink>
      </p>
    </div>
  </section>
</template>
