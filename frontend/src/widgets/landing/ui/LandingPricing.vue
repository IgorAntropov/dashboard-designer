<script setup lang="ts">
import { computed } from 'vue'

import { useSessionStore } from '@entities/session'
import { AppBadge, AppButton } from '@shared/ui'

import { useReveal } from '../lib/useReveal'

const session = useSessionStore()
const { el, shown } = useReveal()

const target = computed(() => (session.isAuthenticated ? '/profile' : '/register'))

const plans = [
  {
    name: 'Free',
    price: '0 ₽',
    free: true,
    popular: false,
    features: ['freeF1', 'freeF2', 'freeF3', 'freeF4'],
  },
  {
    name: 'Pro',
    price: '490 ₽',
    free: false,
    popular: true,
    features: ['proF1', 'proF2', 'proF3', 'proF4'],
  },
  {
    name: 'Unlimited',
    price: '990 ₽',
    free: false,
    popular: false,
    features: ['unlimitedF1', 'unlimitedF2', 'unlimitedF3', 'unlimitedF4'],
  },
] as const
</script>

<template>
  <section id="pricing" ref="el" class="price" :class="{ 'is-in': shown }">
    <div class="price__inner">
      <header class="price__head">
        <h2 class="price__title">{{ $t('landing.pricing.title') }}</h2>
        <p class="price__sub">{{ $t('landing.pricing.subtitle') }}</p>
      </header>

      <div class="price__grid">
        <article
          v-for="(plan, i) in plans"
          :key="plan.name"
          class="price__card"
          :class="{ 'price__card--pop': plan.popular }"
          :style="{ '--d': i * 100 + 'ms' }"
        >
          <div class="price__cardHead">
            <span class="price__name">{{ plan.name }}</span>
            <AppBadge v-if="plan.popular" variant="accent">
              {{ $t('landing.pricing.popular') }}
            </AppBadge>
          </div>

          <div class="price__amount">
            <span class="price__value">{{ plan.free ? $t('landing.pricing.free') : plan.price }}</span>
            <span v-if="!plan.free" class="price__per">{{ $t('landing.pricing.month') }}</span>
          </div>

          <ul class="price__list">
            <li v-for="f in plan.features" :key="f">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {{ $t(`landing.pricing.${f}`) }}
            </li>
          </ul>

          <AppButton
            :to="target"
            :variant="plan.popular ? 'primary' : 'secondary'"
            block
          >
            {{ plan.free ? $t('landing.pricing.start') : $t('landing.pricing.choose') }}
          </AppButton>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.price {
  padding: clamp(3rem, 7vw, 5.5rem) 1.25rem;
}

.price__inner {
  max-width: 1040px;
  margin-inline: auto;
}

.price__head {
  text-align: center;
  max-width: 40rem;
  margin: 0 auto clamp(1.8rem, 4vw, 3rem);
}

.price__title {
  font-size: clamp(1.7rem, 4vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.price__sub {
  margin-top: 0.7rem;
  color: var(--pk-muted);
  font-size: 1.05rem;
}

.price__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  align-items: stretch;
}

.price__card {
  display: flex;
  flex-direction: column;
  padding: 1.6rem;
  border-radius: 1.1rem;
  background-color: var(--pk-surface);
  border: 1px solid var(--pk-border);
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s ease,
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.2s ease;
  transition-delay: var(--d);
}

.is-in .price__card {
  opacity: 1;
  transform: translateY(0);
}

.price__card--pop {
  border-color: var(--pk-accent);
  box-shadow: 0 0 0 1px var(--pk-accent), 0 20px 50px rgba(0, 0, 0, 0.14);
}

.price__cardHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.price__name {
  font-weight: 700;
  font-size: 1.05rem;
}

.price__amount {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  margin: 0.9rem 0 1.1rem;
}

.price__value {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.price__per {
  color: var(--pk-muted);
  font-size: 0.95rem;
}

.price__list {
  list-style: none;
  margin: 0 0 1.4rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1 1 auto;
}

.price__list li {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.94rem;
}

.price__list svg {
  width: 17px;
  height: 17px;
  flex: 0 0 auto;
  color: var(--pk-accent-strong);
}

@media (max-width: 780px) {
  .price__grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .price__card {
    opacity: 1;
    transform: none;
  }
}
</style>
