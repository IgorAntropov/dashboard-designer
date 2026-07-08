<script setup lang="ts">
import {
  LandingCta,
  LandingFeatures,
  LandingFooter,
  LandingHeader,
  LandingHero,
  LandingHow,
  LandingPricing,
} from '@widgets/landing'

definePageMeta({ layout: false })
</script>

<template>
  <div class="landing">
    <LandingHeader />
    <main>
      <LandingHero />
      <LandingFeatures />
      <LandingHow />
      <LandingPricing />
      <LandingCta />
    </main>
    <LandingFooter />
  </div>
</template>

<style scoped>
.landing {
  min-height: 100dvh;
  background-color: var(--pk-bg);
  color: var(--pk-text);
}
</style>
