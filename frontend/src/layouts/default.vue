<script setup lang="ts">
import { useSessionStore } from '@entities/session'
import { LanguageSwitcher, ThemeToggle } from '@shared/ui'

const session = useSessionStore()

async function onLogout(): Promise<void> {
  session.logout()
  await navigateTo('/')
}
</script>

<template>
  <div class="app-shell">
    <main class="app-content">
      <slot />
    </main>

    <aside class="app-nav">
      <NuxtLink to="/" class="app-nav__brand text-decoration-none text-reset">
        Panelka
      </NuxtLink>

      <nav class="app-nav__links">
        <NuxtLink to="/dashboards" class="app-nav__link">
          {{ $t('nav.dashboards') }}
        </NuxtLink>
        <NuxtLink to="/settings" class="app-nav__link">
          {{ $t('nav.settings') }}
        </NuxtLink>
      </nav>

      <div class="app-nav__tools">
        <p v-if="session.user" class="small text-muted mb-1 text-truncate">
          {{ session.user.email }}
        </p>
        <LanguageSwitcher />
        <ThemeToggle />
        <button
          class="btn btn-sm btn-outline-secondary"
          type="button"
          @click="onLogout"
        >
          {{ $t('nav.logout') }}
        </button>
      </div>
    </aside>
  </div>
</template>
