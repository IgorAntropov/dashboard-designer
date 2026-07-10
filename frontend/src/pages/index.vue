<script setup lang="ts">
import { computed } from 'vue'

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

const { t } = useI18n()

useHead({
  title: computed(() => `Panelka — ${t('auth.tagline')}`),
  titleTemplate: null,
})
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
