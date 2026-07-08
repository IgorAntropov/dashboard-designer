<script setup lang="ts">
import { useSessionStore } from '@entities/session'
import { AppButton } from '@shared/ui'

import { useReveal } from '../lib/useReveal'

const session = useSessionStore()
const { el, shown } = useReveal(0.3)
</script>

<template>
  <section ref="el" class="cta" :class="{ 'is-in': shown }">
    <div class="cta__inner">
      <h2 class="cta__title">{{ $t('landing.cta.title') }}</h2>
      <p class="cta__sub">{{ $t('landing.cta.subtitle') }}</p>
      <AppButton :to="session.isAuthenticated ? '/dashboards' : '/register'">
        {{ session.isAuthenticated ? $t('landing.nav.app') : $t('landing.cta.button') }}
      </AppButton>
    </div>
  </section>
</template>

<style scoped>
.cta {
  padding: clamp(2.5rem, 6vw, 4.5rem) 1.25rem;
}

.cta__inner {
  max-width: 720px;
  margin-inline: auto;
  text-align: center;
  padding: clamp(2rem, 5vw, 3.2rem);
  border-radius: 1.4rem;
  background:
    radial-gradient(80% 120% at 50% 0%, color-mix(in srgb, var(--pk-accent) 22%, transparent), transparent 70%),
    var(--pk-surface);
  border: 1px solid color-mix(in srgb, var(--pk-accent) 35%, var(--pk-border));
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s ease,
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.is-in .cta__inner {
  opacity: 1;
  transform: translateY(0);
}

.cta__title {
  font-size: clamp(1.6rem, 4vw, 2.3rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
}

.cta__sub {
  margin: 0.7rem 0 1.5rem;
  color: var(--pk-muted);
  font-size: 1.05rem;
}

@media (prefers-reduced-motion: reduce) {
  .cta__inner {
    opacity: 1;
    transform: none;
  }
}
</style>
