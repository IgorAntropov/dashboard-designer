import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const appVersion = readFileSync(
  fileURLToPath(new URL('../VERSION', import.meta.url)),
  'utf8',
).trim()

const apiOrigin = process.env.NUXT_PUBLIC_API_ORIGIN ?? 'http://localhost:8000'

export default defineNuxtConfig({
  srcDir: 'src/',
  modules: ['@pinia/nuxt', '@nuxt/eslint'],
  css: ['bootstrap/dist/css/bootstrap.min.css'],
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
