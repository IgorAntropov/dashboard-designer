<script setup lang="ts">
import { ref } from 'vue'

import { useSessionStore } from '@entities/session'
import { AppButton, AppModal, LanguageSwitcher, Logo, ThemeToggle } from '@shared/ui'

const session = useSessionStore()
const logoutOpen = ref(false)

async function confirmLogout(): Promise<void> {
  logoutOpen.value = false
  session.logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="app-shell">
    <main class="app-content">
      <slot />
    </main>

    <aside class="app-nav">
      <div class="app-nav__head">
        <NuxtLink
          to="/dashboards"
          class="text-reset text-decoration-none"
          v-tooltip:right="'Panelka'"
        >
          <Logo :show-word="false" />
        </NuxtLink>
      </div>

      <nav class="app-nav__links">
        <NuxtLink
          to="/dashboards"
          class="app-nav__link"
          v-tooltip:right="$t('nav.dashboards')"
          :aria-label="$t('nav.dashboards')"
        >
          <svg
            class="app-nav__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
        </NuxtLink>

        <NuxtLink
          to="/profile"
          class="app-nav__link"
          v-tooltip:right="$t('nav.profile')"
          :aria-label="$t('nav.profile')"
        >
          <svg
            class="app-nav__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </NuxtLink>

        <NuxtLink
          to="/settings"
          class="app-nav__link"
          v-tooltip:right="$t('nav.settings')"
          :aria-label="$t('nav.settings')"
        >
          <svg
            class="app-nav__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
        </NuxtLink>
      </nav>

      <div class="app-nav__tools">
        <LanguageSwitcher />
        <ThemeToggle />
        <button
          class="app-nav__logout"
          type="button"
          v-tooltip:right="$t('nav.logout')"
          :aria-label="$t('nav.logout')"
          @click="logoutOpen = true"
        >
          <svg
            class="app-nav__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>

    <AppModal v-model="logoutOpen" :title="$t('nav.logout')">
      <p class="mb-0">{{ $t('nav.logoutConfirm') }}</p>
      <template #footer>
        <AppButton variant="secondary" @click="logoutOpen = false">
          {{ $t('dashboards.cancel') }}
        </AppButton>
        <AppButton variant="danger" icon="logout" @click="confirmLogout">
          {{ $t('nav.logout') }}
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>
