<script setup lang="ts">
import { computed } from 'vue'

import { useSessionStore } from '@entities/session'
import { AppButton } from '@shared/ui'

import { useScrollY } from '../lib/useScrollY'
import HeroChart from './HeroChart.vue'

const session = useSessionStore()
const { y } = useScrollY()

const chartStyle = computed(() => ({
  transform: `translate3d(0, ${Math.min(y.value * 0.12, 60)}px, 0)`,
}))
const textStyle = computed(() => ({
  transform: `translate3d(0, ${Math.min(y.value * -0.05, 0)}px, 0)`,
  opacity: String(Math.max(1 - y.value / 600, 0.15)),
}))
</script>

<template>
  <section class="hero">
    <div class="hero__bg" />
    <div class="hero__inner">
      <div class="hero__text" :style="textStyle">
        <span class="hero__badge">
          <span class="hero__badgeDot" />{{ $t('landing.hero.badge') }}
        </span>
        <h1 class="hero__title">{{ $t('landing.hero.title') }}</h1>
        <p class="hero__sub">{{ $t('landing.hero.subtitle') }}</p>

        <div class="hero__actions">
          <template v-if="session.isAuthenticated">
            <AppButton to="/dashboards">{{ $t('landing.nav.app') }}</AppButton>
          </template>
          <template v-else>
            <AppButton to="/register">{{ $t('landing.hero.primary') }}</AppButton>
            <AppButton to="/login" variant="secondary">
              {{ $t('landing.hero.secondary') }}
            </AppButton>
          </template>
        </div>

        <p class="hero__note">{{ $t('landing.hero.note') }}</p>
      </div>

      <div class="hero__visual" :style="chartStyle">
        <HeroChart />
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
}

.hero__bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(50% 40% at 15% 0%, color-mix(in srgb, var(--pk-accent) 16%, transparent), transparent 70%),
    radial-gradient(45% 45% at 95% 20%, color-mix(in srgb, var(--pk-accent) 12%, transparent), transparent 70%);
  pointer-events: none;
}

.hero__inner {
  position: relative;
  max-width: 1120px;
  margin-inline: auto;
  padding: clamp(2.5rem, 6vw, 5.5rem) 1.25rem clamp(2.5rem, 5vw, 4rem);
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  align-items: center;
  gap: clamp(1.5rem, 4vw, 3rem);
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--pk-text);
  background-color: color-mix(in srgb, var(--pk-accent) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--pk-accent) 40%, transparent);
}

.hero__badgeDot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--pk-accent);
}

.hero__title {
  margin: 1rem 0 0;
  font-size: clamp(2.1rem, 5vw, 3.4rem);
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.hero__sub {
  margin: 1rem 0 0;
  max-width: 32rem;
  font-size: 1.08rem;
  color: var(--pk-muted);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1.5rem;
}

.hero__note {
  margin: 0.9rem 0 0;
  font-size: 0.82rem;
  color: var(--pk-muted);
}

.hero__visual {
  will-change: transform;
}

@media (max-width: 860px) {
  .hero__inner {
    grid-template-columns: 1fr;
  }

  .hero__visual {
    order: -1;
  }
}
</style>
