<script setup lang="ts">
import { config } from '@shared/config'

function oauthUrl(provider: 'yandex' | 'vk'): string {
  return `${config.apiOrigin}/api/v1/auth/oauth/${provider}/start`
}
</script>

<template>
  <div class="oauth-buttons">
    <a class="oauth-btn oauth-btn--yandex" :href="oauthUrl('yandex')">
      <span class="oauth-btn__logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#FC3F1D" />
          <text
            x="12"
            y="17.5"
            text-anchor="middle"
            font-family="'Helvetica Neue', Arial, sans-serif"
            font-size="15"
            font-weight="700"
            fill="#ffffff"
          >Я</text>
        </svg>
      </span>
      <span class="oauth-btn__label">Yandex</span>
    </a>

    <a class="oauth-btn oauth-btn--vk" :href="oauthUrl('vk')">
      <span class="oauth-btn__logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#0077FF" />
          <text
            x="12"
            y="16.5"
            text-anchor="middle"
            font-family="'Helvetica Neue', Arial, sans-serif"
            font-size="10.5"
            font-weight="700"
            letter-spacing="0.3"
            fill="#ffffff"
          >VK</text>
        </svg>
      </span>
      <span class="oauth-btn__label">VK</span>
    </a>
  </div>
</template>
