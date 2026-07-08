<script setup lang="ts">
import { computed, ref } from 'vue'

import { useSessionStore } from '@entities/session'
import { AppBadge, AppButton, AppModal, PasswordField } from '@shared/ui'

const { t } = useI18n()
const session = useSessionStore()

type Tier = 'free' | 'pro' | 'unlimited'

const plans: { tier: Tier; price: string; dashboards: string }[] = [
  { tier: 'free', price: '0 ₽', dashboards: '1' },
  { tier: 'pro', price: '490 ₽', dashboards: '3' },
  { tier: 'unlimited', price: '990 ₽', dashboards: '∞' },
]

const displayName = ref(session.user?.display_name ?? '')
const savingName = ref(false)

const canSaveName = computed(
  () =>
    displayName.value.trim().length > 0 &&
    displayName.value.trim() !== session.user?.display_name,
)

async function onSaveName(): Promise<void> {
  savingName.value = true
  await session.updateName(displayName.value.trim())
  savingName.value = false
}

async function onChooseTier(tier: Tier): Promise<void> {
  if (session.user?.subscription_tier === tier) {
    return
  }
  await session.setTier(tier)
}

const pwModal = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const pwPending = ref(false)
const pwError = ref(false)

const canChangePassword = computed(
  () => currentPassword.value.length >= 8 && newPassword.value.length >= 8,
)

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
  <div class="container-xxl" style="max-width: 760px">
    <h1 class="h3 mb-4">{{ $t('profile.title') }}</h1>

    <section class="mb-4">
      <h2 class="h6 text-muted">{{ $t('profile.plans') }}</h2>
      <div class="plan-grid">
        <div
          v-for="plan in plans"
          :key="plan.tier"
          class="plan-card"
          :class="{ 'plan-card--active': session.user?.subscription_tier === plan.tier }"
        >
          <div class="plan-card__name text-uppercase">{{ plan.tier }}</div>
          <div class="plan-card__price">{{ plan.price }}</div>
          <div class="plan-card__meta text-muted small">
            {{ $t('dashboards.title') }}: {{ plan.dashboards }}
          </div>
          <AppBadge
            v-if="session.user?.subscription_tier === plan.tier"
            class="align-self-start"
          >
            {{ $t('profile.current') }}
          </AppBadge>
          <AppButton v-else size="sm" @click="onChooseTier(plan.tier)">
            {{ $t('profile.choose') }}
          </AppButton>
        </div>
      </div>
    </section>

    <section class="mb-4" style="max-width: 420px">
      <div class="form-floating mb-2">
        <input
          id="profile-name"
          v-model="displayName"
          class="form-control"
          :placeholder="$t('profile.displayName')"
        >
        <label for="profile-name">{{ $t('profile.displayName') }}</label>
      </div>
      <AppButton :disabled="savingName || !canSaveName" @click="onSaveName">
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

    <div class="d-flex justify-content-end">
      <AppButton variant="secondary" icon="logout" @click="onLogout">
        {{ $t('nav.logout') }}
      </AppButton>
    </div>

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
          :disabled="pwPending || !canChangePassword"
        >
          {{ $t('profile.changePassword') }}
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>
