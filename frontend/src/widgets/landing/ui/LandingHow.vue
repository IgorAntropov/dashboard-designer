<script setup lang="ts">
import { useReveal } from '../lib/useReveal'

const { el, shown } = useReveal()

const steps = [
  { n: '01', title: 'step1Title', text: 'step1Text' },
  { n: '02', title: 'step2Title', text: 'step2Text' },
  { n: '03', title: 'step3Title', text: 'step3Text' },
] as const
</script>

<template>
  <section id="how" ref="el" class="how" :class="{ 'is-in': shown }">
    <div class="how__inner">
      <header class="how__head">
        <h2 class="how__title">{{ $t('landing.how.title') }}</h2>
        <p class="how__sub">{{ $t('landing.how.subtitle') }}</p>
      </header>

      <ol class="how__steps">
        <li
          v-for="(step, i) in steps"
          :key="step.n"
          class="how__step"
          :style="{ '--d': i * 120 + 'ms' }"
        >
          <div class="how__num">{{ step.n }}</div>
          <div class="how__preview">
            <div v-if="i === 0" class="how__mini how__mini--build">
              <span class="how__chip" />
              <span class="how__chip" />
              <span class="how__chip how__chip--drop" />
            </div>
            <div v-else-if="i === 1" class="how__mini how__mini--config">
              <span class="how__row"><i />=<b>category</b></span>
              <span class="how__row"><i />=<b>amount</b></span>
              <span class="how__swatches">
                <em /><em /><em /><em /><em />
              </span>
            </div>
            <div v-else class="how__mini how__mini--embed">
              <code>&lt;panelka-dashboard/&gt;</code>
              <span class="how__pill">{{ $t('landing.demo.live') }}</span>
            </div>
          </div>
          <h3 class="how__stepTitle">{{ $t(`landing.how.${step.title}`) }}</h3>
          <p class="how__stepText">{{ $t(`landing.how.${step.text}`) }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.how {
  padding: clamp(3rem, 7vw, 5.5rem) 1.25rem;
  background-color: color-mix(in srgb, var(--pk-surface) 60%, var(--pk-bg));
}

.how__inner {
  max-width: 1120px;
  margin-inline: auto;
}

.how__head {
  text-align: center;
  max-width: 40rem;
  margin: 0 auto clamp(1.8rem, 4vw, 3rem);
}

.how__title {
  font-size: clamp(1.7rem, 4vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.how__sub {
  margin-top: 0.7rem;
  color: var(--pk-muted);
  font-size: 1.05rem;
}

.how__steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.how__step {
  position: relative;
  padding: 1.4rem;
  border-radius: 1rem;
  background-color: var(--pk-bg);
  border: 1px solid var(--pk-border);
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s ease,
    transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--d);
}

.is-in .how__step {
  opacity: 1;
  transform: translateY(0);
}

.how__num {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--pk-accent-strong);
  letter-spacing: 0.1em;
}

.how__preview {
  height: 96px;
  margin: 0.8rem 0 1rem;
  border-radius: 0.7rem;
  background-color: var(--pk-surface);
  border: 1px solid var(--pk-border);
  overflow: hidden;
  display: grid;
  place-items: center;
  padding: 0.7rem;
}

.how__mini {
  width: 100%;
  height: 100%;
}

.how__mini--build {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.how__chip {
  height: 26px;
  flex: 1;
  border-radius: 0.4rem;
  background: color-mix(in srgb, var(--pk-accent) 25%, var(--pk-surface));
  border: 1px solid color-mix(in srgb, var(--pk-accent) 45%, transparent);
}

.how__chip--drop {
  border-style: dashed;
  background: transparent;
  animation: how-drop 2.2s ease-in-out infinite;
}

.how__mini--config {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-family: ui-monospace, monospace;
  color: var(--pk-muted);
  justify-content: center;
}

.how__row {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.how__row i {
  width: 34px;
  height: 8px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--pk-muted) 40%, transparent);
}

.how__row b {
  color: var(--pk-text);
}

.how__swatches {
  display: inline-flex;
  gap: 4px;
  margin-top: 0.15rem;
}

.how__swatches em {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: var(--pk-accent);
  opacity: 0.4;
}

.how__swatches em:nth-child(4) {
  opacity: 1;
}

.how__mini--embed {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
}

.how__mini--embed code {
  font-size: 0.74rem;
  padding: 0.3rem 0.5rem;
  border-radius: 0.4rem;
  background: color-mix(in srgb, var(--pk-accent) 16%, transparent);
  color: var(--pk-text);
}

.how__pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.66rem;
  color: #22c55e;
}

.how__pill::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
}

.how__stepTitle {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.35rem;
}

.how__stepText {
  margin: 0;
  color: var(--pk-muted);
  font-size: 0.95rem;
}

@keyframes how-drop {
  0%,
  100% {
    transform: translateY(-4px);
    opacity: 0.6;
  }
  50% {
    transform: translateY(2px);
    opacity: 1;
  }
}

@media (max-width: 780px) {
  .how__steps {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .how__step {
    opacity: 1;
    transform: none;
  }

  .how__chip--drop {
    animation: none;
  }
}
</style>
