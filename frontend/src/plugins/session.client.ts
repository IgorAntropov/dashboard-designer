import { useSessionStore } from '@entities/session'
import { setAuthFailedHandler, setUnauthorizedHandler } from '@shared/api'

export default defineNuxtPlugin(async () => {
  const session = useSessionStore()

  setUnauthorizedHandler(() => session.refresh())
  setAuthFailedHandler(() => {
    session.expireSession()
  })

  await session.ensureInit()
})
