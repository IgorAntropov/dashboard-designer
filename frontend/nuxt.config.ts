import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  srcDir: 'src/',
  modules: ['@pinia/nuxt', '@nuxt/eslint'],
  css: ['bootstrap/dist/css/bootstrap.min.css'],
  runtimeConfig: {
    public: {
      apiBaseUrl: 'http://localhost:8000/api/v1',
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
