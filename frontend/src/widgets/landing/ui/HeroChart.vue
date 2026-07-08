<script setup lang="ts">
import { onMounted, ref } from 'vue'

const bars = [
  { a: 42, b: 26 },
  { a: 60, b: 38 },
  { a: 48, b: 30 },
  { a: 82, b: 52 },
  { a: 66, b: 40 },
  { a: 94, b: 60 },
  { a: 74, b: 48 },
]

const areaPath = 'M0,70 L0,48 C24,44 40,20 64,26 C88,32 104,58 128,50 C152,42 168,14 192,20 L192,70 Z'
const linePath = 'M0,48 C24,44 40,20 64,26 C88,32 104,58 128,50 C152,42 168,14 192,20'

const donutTarget = 78
const ready = ref(false)
const revenue = ref(0)
const users = ref(0)
const growth = ref(0)

function animateValue(
  set: (v: number) => void,
  to: number,
  duration: number,
): void {
  const start = performance.now()
  function frame(now: number): void {
    const t = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    set(to * eased)
    if (t < 1) {
      requestAnimationFrame(frame)
    }
  }
  requestAnimationFrame(frame)
}

onMounted(() => {
  requestAnimationFrame(() => {
    ready.value = true
  })
  animateValue((v) => (revenue.value = v), 1.24, 1400)
  animateValue((v) => (users.value = v), 8420, 1400)
  animateValue((v) => (growth.value = v), 32, 1400)
})
</script>

<template>
  <div class="hero-chart" :class="{ 'is-ready': ready }" aria-hidden="true">
    <div class="hero-chart__glow" />

    <div class="hero-chart__card">
      <div class="hero-chart__head">
        <span class="hero-chart__dot" />
        <span class="hero-chart__title">{{ $t('landing.demo.title') }}</span>
        <span class="hero-chart__live">
          <i class="hero-chart__pulse" />{{ $t('landing.demo.live') }}
        </span>
      </div>

      <div class="hero-chart__grid">
        <div class="hero-chart__tile">
          <span class="hero-chart__tileLabel">{{ $t('landing.demo.revenue') }}</span>
          <span class="hero-chart__tileValue">₽{{ revenue.toFixed(2) }}M</span>
          <span class="hero-chart__delta">▲ 12.4%</span>
        </div>

        <div class="hero-chart__tile">
          <span class="hero-chart__tileLabel">{{ $t('landing.demo.users') }}</span>
          <span class="hero-chart__tileValue">{{ Math.round(users).toLocaleString() }}</span>
          <span class="hero-chart__delta">▲ 8.1%</span>
        </div>

        <div class="hero-chart__tile hero-chart__tile--donut">
          <svg viewBox="0 0 44 44" class="hero-chart__donut">
            <circle class="hero-chart__donutTrack" cx="22" cy="22" r="17" />
            <circle
              class="hero-chart__donutValue"
              cx="22"
              cy="22"
              r="17"
              :style="{ '--dash': donutTarget }"
            />
          </svg>
          <div class="hero-chart__donutText">
            <span class="hero-chart__tileValue">{{ Math.round(growth) }}%</span>
            <span class="hero-chart__tileLabel">{{ $t('landing.demo.growth') }}</span>
          </div>
        </div>

        <div class="hero-chart__bars">
          <div v-for="(bar, i) in bars" :key="i" class="hero-chart__barGroup">
            <span
              class="hero-chart__bar hero-chart__bar--b"
              :style="{ '--h': bar.b + '%', '--d': i * 70 + 'ms' }"
            />
            <span
              class="hero-chart__bar hero-chart__bar--a"
              :style="{ '--h': bar.a + '%', '--d': i * 70 + 120 + 'ms' }"
            />
          </div>
        </div>

        <div class="hero-chart__area">
          <svg viewBox="0 0 192 70" preserveAspectRatio="none">
            <defs>
              <linearGradient id="pkArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--pk-accent)" stop-opacity="0.45" />
                <stop offset="100%" stop-color="var(--pk-accent)" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path class="hero-chart__areaFill" :d="areaPath" fill="url(#pkArea)" />
            <path class="hero-chart__areaLine" :d="linePath" />
          </svg>
        </div>
      </div>
    </div>

    <div class="hero-chart__float hero-chart__float--1">
      <span class="hero-chart__floatDot" />+2.4k
    </div>
    <div class="hero-chart__float hero-chart__float--2">99.9% uptime</div>
  </div>
</template>

<style scoped>
.hero-chart {
  position: relative;
  width: 100%;
  max-width: 520px;
  margin-inline: auto;
}

.hero-chart__glow {
  position: absolute;
  inset: -12% -8% -18% -8%;
  background:
    radial-gradient(60% 60% at 70% 20%, color-mix(in srgb, var(--pk-accent) 42%, transparent), transparent 70%),
    radial-gradient(55% 55% at 20% 90%, color-mix(in srgb, var(--pk-accent) 22%, transparent), transparent 70%);
  filter: blur(28px);
  opacity: 0.85;
  z-index: 0;
}

.hero-chart__card {
  position: relative;
  z-index: 1;
  padding: 1.1rem;
  border-radius: 1.1rem;
  background-color: color-mix(in srgb, var(--pk-surface) 92%, var(--pk-bg));
  border: 1px solid var(--pk-border);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.22);
  animation: hero-float 7s ease-in-out infinite;
}

.hero-chart__head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.9rem;
}

.hero-chart__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--pk-accent);
}

.hero-chart__title {
  font-weight: 600;
  font-size: 0.95rem;
}

.hero-chart__live {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: var(--pk-muted);
}

.hero-chart__pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
  animation: hero-pulse 1.8s infinite;
}

.hero-chart__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.hero-chart__tile {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.6rem 0.7rem;
  border-radius: 0.7rem;
  background-color: var(--pk-bg);
  border: 1px solid var(--pk-border);
}

.hero-chart__tileLabel {
  font-size: 0.68rem;
  color: var(--pk-muted);
}

.hero-chart__tileValue {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}

.hero-chart__delta {
  font-size: 0.68rem;
  color: #22c55e;
  font-weight: 600;
}

.hero-chart__tile--donut {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.hero-chart__donut {
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  transform: rotate(-90deg);
}

.hero-chart__donutTrack {
  fill: none;
  stroke: color-mix(in srgb, var(--pk-border) 80%, transparent);
  stroke-width: 5;
}

.hero-chart__donutValue {
  fill: none;
  stroke: var(--pk-accent);
  stroke-width: 5;
  stroke-linecap: round;
  stroke-dasharray: 107;
  stroke-dashoffset: 107;
  transition: stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.is-ready .hero-chart__donutValue {
  stroke-dashoffset: calc(107 - (107 * var(--dash) / 100));
}

.hero-chart__donutText {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.hero-chart__bars {
  grid-column: span 2;
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  height: 120px;
  padding: 0.7rem;
  border-radius: 0.7rem;
  background-color: var(--pk-bg);
  border: 1px solid var(--pk-border);
}

.hero-chart__barGroup {
  flex: 1 1 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  height: 100%;
}

.hero-chart__bar {
  width: 34%;
  border-radius: 3px 3px 0 0;
  height: var(--h);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--d);
}

.hero-chart__bar--a {
  background: var(--pk-accent);
}

.hero-chart__bar--b {
  background: color-mix(in srgb, var(--pk-accent) 35%, var(--pk-muted));
  opacity: 0.55;
}

.is-ready .hero-chart__bar {
  transform: scaleY(1);
}

.hero-chart__area {
  grid-column: span 3;
  height: 74px;
  padding: 0.35rem 0.5rem;
  border-radius: 0.7rem;
  background-color: var(--pk-bg);
  border: 1px solid var(--pk-border);
}

.hero-chart__area svg {
  width: 100%;
  height: 100%;
}

.hero-chart__areaLine {
  fill: none;
  stroke: var(--pk-accent);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 420;
  stroke-dashoffset: 420;
  transition: stroke-dashoffset 1.8s ease;
  transition-delay: 0.2s;
}

.is-ready .hero-chart__areaLine {
  stroke-dashoffset: 0;
}

.hero-chart__areaFill {
  opacity: 0;
  transition: opacity 1s ease;
  transition-delay: 0.9s;
}

.is-ready .hero-chart__areaFill {
  opacity: 1;
}

.hero-chart__float {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  background-color: var(--pk-bg);
  border: 1px solid var(--pk-border);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
  opacity: 0;
}

.hero-chart__floatDot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
}

.hero-chart__float--1 {
  top: 8%;
  right: -4%;
  animation: hero-float 6s ease-in-out infinite;
}

.hero-chart__float--2 {
  bottom: 6%;
  left: -5%;
  animation: hero-float 8s ease-in-out infinite reverse;
}

.is-ready .hero-chart__float--1 {
  opacity: 1;
  transition: opacity 0.5s ease 0.6s;
}

.is-ready .hero-chart__float--2 {
  opacity: 1;
  transition: opacity 0.5s ease 0.9s;
}

@keyframes hero-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes hero-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.55);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-chart__card,
  .hero-chart__float {
    animation: none;
  }
}
</style>
