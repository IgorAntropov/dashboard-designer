<script setup lang="ts">
import { computed, ref } from 'vue'

import { createCheckout, openCheckout } from '@entities/billing'
import { useSessionStore } from '@entities/session'
import { pushToast } from '@shared/notify'
import { AppBadge, AppButton, AppCard, AppModal, PasswordField } from '@shared/ui'

const { t } = useI18n()
const session = useSessionStore()

const initials = computed(() =>
  (session.user?.display_name || session.user?.email || '?')
    .trim()
    .charAt(0)
    .toUpperCase(),
)

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

async function pollActivation(tier: Tier): Promise<void> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    await session.fetchMe()
    if (session.user?.subscription_tier === tier) {
      return
    }
  }
}

async function onChooseTier(tier: Tier): Promise<void> {
  if (session.user?.subscription_tier === tier) {
    return
  }
  if (tier === 'free') {
    await session.setTier('free')
    return
  }

  const checkout = await createCheckout(tier)
  if (!checkout) {
    return
  }
  if (!checkout.public_id) {
    pushToast(t('profile.billingUnavailable'), 'error')
    return
  }

  try {
    await openCheckout(checkout, {
      onSuccess: () => {
        pushToast(t('profile.paymentProcessing'), 'success')
        void pollActivation(tier)
      },
      onFail: () => pushToast(t('profile.paymentFailed'), 'error'),
    })
  } catch {
    pushToast(t('errors.generic'), 'error')
  }
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
  <div class="container-xxl">
    <header class="page-head">
      <h1 class="page-head__title">{{ $t('profile.title') }}</h1>
    </header>

    <div class="page-stack">
      <AppCard :title="$t('profile.account')">
        <div class="profile-account">
          <span class="pk-avatar">{{ initials }}</span>
          <div class="profile-account__fields">
            <input
              id="profile-name"
              v-model="displayName"
              class="form-control form-control-sm"
              :placeholder="$t('profile.displayName')"
            >
            <span class="profile-account__email">{{ session.user?.email }}</span>
          </div>
          <AppButton
            size="sm"
            variant="secondary"
            :disabled="savingName || !canSaveName"
            @click="onSaveName"
          >
            {{ $t('profile.save') }}
          </AppButton>
        </div>
      </AppCard>

      <AppCard :title="$t('profile.plans')">
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
      </AppCard>

      <AppCard :title="$t('profile.security')">
        <div class="d-flex justify-content-between align-items-center gap-3">
          <span class="text-muted small">{{ $t('profile.changePassword') }}</span>
          <AppButton variant="secondary" size="sm" @click="openPasswordModal">
            {{ $t('profile.changePassword') }}
          </AppButton>
        </div>
      </AppCard>

      <div class="d-flex justify-content-end">
        <AppButton variant="secondary" icon="logout" @click="onLogout">
          {{ $t('nav.logout') }}
        </AppButton>
      </div>
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
