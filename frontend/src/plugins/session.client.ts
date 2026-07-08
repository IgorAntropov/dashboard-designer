import { useSessionStore } from '@entities/session'

export default defineNuxtPlugin(async () => {
  await useSessionStore().init()
})
