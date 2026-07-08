<script setup lang="ts">
import { useReveal } from '../lib/useReveal'

const { el, shown } = useReveal()

const items = [
  { icon: 'grid', title: 'builderTitle', text: 'builderText' },
  { icon: 'data', title: 'dataTitle', text: 'dataText' },
  { icon: 'embed', title: 'embedTitle', text: 'embedText' },
  { icon: 'live', title: 'themesTitle', text: 'themesText' },
] as const
</script>

<template>
  <section id="features" ref="el" class="feat" :class="{ 'is-in': shown }">
    <div class="feat__inner">
      <header class="feat__head">
        <h2 class="feat__title">{{ $t('landing.features.title') }}</h2>
        <p class="feat__sub">{{ $t('landing.features.subtitle') }}</p>
      </header>

      <div class="feat__grid">
        <article
          v-for="(item, i) in items"
          :key="item.icon"
          class="feat__card"
          :style="{ '--d': i * 90 + 'ms' }"
        >
          <span class="feat__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <template v-if="item.icon === 'grid'">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </template>
              <template v-else-if="item.icon === 'data'">
                <ellipse cx="12" cy="5" rx="8" ry="3" />
                <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
                <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
              </template>
              <template v-else-if="item.icon === 'embed'">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </template>
              <template v-else>
                <path d="M3 12h4l3 8 4-16 3 8h4" />
              </template>
            </svg>
          </span>
          <h3 class="feat__cardTitle">{{ $t(`landing.features.${item.title}`) }}</h3>
          <p class="feat__cardText">{{ $t(`landing.features.${item.text}`) }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feat {
  padding: clamp(3rem, 7vw, 5.5rem) 1.25rem;
}

.feat__inner {
  max-width: 1120px;
  margin-inline: auto;
}

.feat__head {
  text-align: center;
  max-width: 40rem;
  margin: 0 auto clamp(1.8rem, 4vw, 3rem);
}

.feat__title {
  font-size: clamp(1.7rem, 4vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.feat__sub {
  margin-top: 0.7rem;
  color: var(--pk-muted);
  font-size: 1.05rem;
}

.feat__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
}

.feat__card {
  padding: 1.4rem;
  border-radius: 1rem;
  background-color: var(--pk-surface);
  border: 1px solid var(--pk-border);
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s ease,
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.2s ease;
  transition-delay: var(--d);
}

.feat__card:hover {
  border-color: var(--pk-accent);
}

.is-in .feat__card {
  opacity: 1;
  transform: translateY(0);
}

.feat__icon {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 0.8rem;
  color: var(--pk-accent-contrast);
  background: var(--pk-accent);
  margin-bottom: 0.9rem;
}

.feat__icon svg {
  width: 22px;
  height: 22px;
}

.feat__cardTitle {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.4rem;
}

.feat__cardText {
  margin: 0;
  color: var(--pk-muted);
  font-size: 0.95rem;
}

@media (prefers-reduced-motion: reduce) {
  .feat__card {
    opacity: 1;
    transform: none;
  }
}
</style>
