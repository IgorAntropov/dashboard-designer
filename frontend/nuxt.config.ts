import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const appVersion = readFileSync(
  fileURLToPath(new URL('../VERSION', import.meta.url)),
  'utf8',
).trim()

const apiOrigin = process.env.NUXT_PUBLIC_API_ORIGIN ?? 'http://localhost:8000'

export default defineNuxtConfig({
  srcDir: 'src/',
  modules: [
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
  ],
  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    'gridstack/dist/gridstack.min.css',
    '@/assets/css/theme.css',
  ],
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
  },
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'ru',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'panelka_locale',
      fallbackLocale: 'ru',
      redirectOn: 'root',
    },
    locales: [
      { code: 'ru', language: 'ru-RU', name: 'Русский' },
      { code: 'en', language: 'en-US', name: 'English' },
      { code: 'de', language: 'de-DE', name: 'Deutsch' },
      { code: 'pl', language: 'pl-PL', name: 'Polski' },
      { code: 'cs', language: 'cs-CZ', name: 'Čeština' },
      { code: 'fr', language: 'fr-FR', name: 'Français' },
      { code: 'it', language: 'it-IT', name: 'Italiano' },
    ],
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      apiOrigin,
      appVersion,
    },
  },
  alias: {
    '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
    '@processes': fileURLToPath(new URL('./src/processes', import.meta.url)),
    '@widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
    '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
    '@entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
    '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
  },
  typescript: {
    strict: true,
  },
})
