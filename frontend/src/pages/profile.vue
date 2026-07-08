<script setup lang="ts">
import { computed, ref } from 'vue'

import { useSessionStore } from '@entities/session'
import { AppButton, AppModal, PasswordField } from '@shared/ui'

const { t } = useI18n()
const session = useSessionStore()

const displayName = ref(session.user?.display_name ?? '')
const savingName = ref(false)

const pwModal = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const pwPending = ref(false)
const pwError = ref(false)

async function onSaveName(): Promise<void> {
  const name = displayName.value.trim()
  if (!name) {
    return
  }
  savingName.value = true
  await session.updateName(name)
  savingName.value = false
}

function openPasswordModal(): void {
  currentPassword.value = ''
  newPassword.value = ''
  pwError.value = false
  pwModal.value = true
}

async function onChangePassword(): Promise<void> {
  pwError.value = false
  pwPending.value = true
  const ok = await session.changePassword(currentPassword.value, newPassword.value)
  pwPending.value = false
  if (ok) {
    pwModal.value = false
  } else {
    pwError.value = true
  }
}

async function onLogout(): Promise<void> {
  session.logout()
  await navigateTo('/')
}

useHead({ title: computed(() => t('profile.title')) })
</script>

<template>
  <div class="container-xxl" style="max-width: 640px">
    <h1 class="h3 mb-4">{{ $t('profile.title') }}</h1>

    <section class="mb-4">
      <p class="mb-1 text-muted small">{{ $t('profile.subscription') }}</p>
      <span class="badge text-bg-warning text-uppercase">
        {{ session.user?.subscription_tier }}
      </span>
    </section>

    <section class="mb-4">
      <div class="form-floating mb-2">
        <input
          id="profile-name"
          v-model="displayName"
          class="form-control"
          :placeholder="$t('profile.displayName')"
        >
        <label for="profile-name">{{ $t('profile.displayName') }}</label>
      </div>
      <AppButton :disabled="savingName" @click="onSaveName">
        {{ $t('profile.save') }}
      </AppButton>
    </section>

    <section class="mb-4">
      <h2 class="h6">{{ $t('profile.security') }}</h2>
      <AppButton variant="secondary" @click="openPasswordModal">
        {{ $t('profile.changePassword') }}
      </AppButton>
    </section>

    <hr class="my-4">

    <AppButton variant="danger" @click="onLogout">
      {{ $t('nav.logout') }}
    </AppButton>

    <AppModal v-model="pwModal" :title="$t('profile.changePassword')">
      <form id="change-password-form" @submit.prevent="onChangePassword">
        <PasswordField
          id="current-password"
          v-model="currentPassword"
          :label="$t('profile.currentPassword')"
        />
        <PasswordField
          id="new-password"
          v-model="newPassword"
          :label="$t('profile.newPassword')"
          :minlength="8"
        />
        <p v-if="pwError" class="text-danger small mb-0">{{ $t('auth.failed') }}</p>
      </form>

      <template #footer>
        <AppButton variant="secondary" @click="pwModal = false">
          {{ $t('dashboards.cancel') }}
        </AppButton>
        <AppButton
          type="submit"
          form="change-password-form"
          :disabled="pwPending"
        >
          {{ $t('profile.changePassword') }}
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>
