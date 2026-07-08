<script setup lang="ts">
import { computed } from 'vue'

import { useSessionStore } from '@entities/session'
import { AppButton, AppModal, ToastHost } from '@shared/ui'

const colorMode = useColorMode()
const session = useSessionStore()

useHead({
  htmlAttrs: {
    'data-bs-theme': computed(() => colorMode.value),
  },
})

async function acknowledgeKick(): Promise<void> {
  session.resetKicked()
  await navigateTo('/login')
}
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <AppModal
    :model-value="session.kicked"
    :title="$t('session.kickedTitle')"
    @update:model-value="acknowledgeKick"
  >
    <p class="mb-0">{{ $t('session.kickedMessage') }}</p>

    <template #footer>
      <AppButton @click="acknowledgeKick">OK</AppButton>
    </template>
  </AppModal>

  <ToastHost />
</template>
