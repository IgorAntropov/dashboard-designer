<script setup lang="ts">
import { LanguageSwitcher, Logo, ThemeToggle } from '@shared/ui'

const compact = useCookie<boolean>('panelka_nav_compact', {
  default: () => false,
  maxAge: 60 * 60 * 24 * 365,
})

function toggle(): void {
  compact.value = !compact.value
}
</script>

<template>
  <div class="app-shell" :class="{ 'app-shell--compact': compact }">
    <main class="app-content">
      <slot />
    </main>

    <aside class="app-nav" :class="{ 'app-nav--compact': compact }">
      <div class="app-nav__head">
        <NuxtLink to="/dashboards" class="text-reset text-decoration-none">
          <Logo :show-word="!compact" />
        </NuxtLink>
      </div>

      <nav class="app-nav__links">
        <NuxtLink
          to="/dashboards"
          class="app-nav__link"
          v-tooltip:right="compact ? $t('nav.dashboards') : ''"
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
          <span class="app-nav__label">{{ $t('nav.dashboards') }}</span>
        </NuxtLink>

        <NuxtLink
          to="/profile"
          class="app-nav__link"
          v-tooltip:right="compact ? $t('nav.profile') : ''"
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
          <span class="app-nav__label">{{ $t('nav.profile') }}</span>
        </NuxtLink>

        <NuxtLink
          to="/settings"
          class="app-nav__link"
          v-tooltip:right="compact ? $t('nav.settings') : ''"
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
          <span class="app-nav__label">{{ $t('nav.settings') }}</span>
        </NuxtLink>
      </nav>

      <div class="app-nav__tools">
        <div class="app-nav__switchers">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <button
          class="app-nav__collapse"
          type="button"
          :title="$t('nav.collapse')"
          :aria-label="$t('nav.collapse')"
          @click="toggle"
        >
          <svg
            class="app-nav__chevron"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>
    </aside>
  </div>
</template>
