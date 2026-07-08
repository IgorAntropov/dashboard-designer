<script setup lang="ts">
import { LanguageSwitcher, ThemeToggle } from '@shared/ui'
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
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </aside>
  </div>
</template>
