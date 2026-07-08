<script setup lang="ts">
import { useSessionStore } from '@entities/session'
import { AppButton, LanguageSwitcher, Logo, ThemeToggle } from '@shared/ui'

const session = useSessionStore()
</script>

<template>
  <header class="lh">
    <div class="lh__inner">
      <NuxtLink to="/" class="lh__brand">
        <Logo />
      </NuxtLink>

      <nav class="lh__nav">
        <a href="#features" class="lh__link">{{ $t('landing.nav.features') }}</a>
        <a href="#how" class="lh__link">{{ $t('landing.nav.how') }}</a>
        <a href="#pricing" class="lh__link">{{ $t('landing.nav.pricing') }}</a>
      </nav>

      <div class="lh__tools">
        <LanguageSwitcher />
        <ThemeToggle />
        <template v-if="session.isAuthenticated">
          <AppButton to="/dashboards" size="sm">
            {{ $t('landing.nav.app') }}
          </AppButton>
        </template>
        <template v-else>
          <AppButton to="/login" variant="ghost" size="sm" class="lh__login">
            {{ $t('landing.nav.login') }}
          </AppButton>
          <AppButton to="/register" size="sm">
            {{ $t('landing.nav.start') }}
          </AppButton>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.lh {
  position: sticky;
  top: 0;
  z-index: 1040;
  background-color: color-mix(in srgb, var(--pk-bg) 78%, transparent);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  border-bottom: 1px solid color-mix(in srgb, var(--pk-border) 70%, transparent);
}

.lh__inner {
  max-width: 1120px;
  margin-inline: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem 1.25rem;
}

.lh__brand {
  text-decoration: none;
}

.lh__nav {
  display: flex;
  gap: 0.4rem;
  margin-inline: auto;
}

.lh__link {
  padding: 0.4rem 0.75rem;
  border-radius: 0.5rem;
  color: var(--pk-muted);
  text-decoration: none;
  font-size: 0.92rem;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;
}

.lh__link:hover {
  color: var(--pk-text);
  background-color: color-mix(in srgb, var(--pk-accent) 14%, transparent);
}

.lh__tools {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 780px) {
  .lh__nav {
    display: none;
  }

  .lh__login {
    display: none;
  }
}
</style>
