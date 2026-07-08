<script setup lang="ts">
import { Logo } from '@shared/ui'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="lf">
    <div class="lf__inner">
      <div class="lf__brand">
        <Logo />
        <p class="lf__tagline">{{ $t('landing.footer.tagline') }}</p>
      </div>

      <nav class="lf__nav">
        <a href="#features" class="lf__link">{{ $t('landing.nav.features') }}</a>
        <a href="#how" class="lf__link">{{ $t('landing.nav.how') }}</a>
        <a href="#pricing" class="lf__link">{{ $t('landing.nav.pricing') }}</a>
      </nav>

      <p class="lf__copy">© {{ year }} Panelka. {{ $t('landing.footer.rights') }}</p>
    </div>
  </footer>
</template>

<style scoped>
.lf {
  padding: clamp(2rem, 4vw, 3rem) 1.25rem;
  border-top: 1px solid var(--pk-border);
  background-color: color-mix(in srgb, var(--pk-surface) 55%, var(--pk-bg));
}

.lf__inner {
  max-width: 1120px;
  margin-inline: auto;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.lf__brand {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lf__tagline {
  margin: 0;
  color: var(--pk-muted);
  font-size: 0.9rem;
  max-width: 22rem;
}

.lf__nav {
  display: flex;
  gap: 0.4rem;
  margin-inline: auto;
}

.lf__link {
  padding: 0.35rem 0.6rem;
  border-radius: 0.5rem;
  color: var(--pk-muted);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.15s ease;
}

.lf__link:hover {
  color: var(--pk-text);
}

.lf__copy {
  margin: 0;
  color: var(--pk-muted);
  font-size: 0.85rem;
}

@media (max-width: 640px) {
  .lf__nav {
    margin-inline: 0;
  }
}
</style>
