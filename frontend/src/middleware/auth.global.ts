import { useSessionStore } from '@entities/session'

const PUBLIC_ROUTES = ['/', '/login', '/register']

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return
  }

  const session = useSessionStore()
  await session.ensureInit()
  const isPublic =
    PUBLIC_ROUTES.includes(to.path) || to.path.startsWith('/embed/')

  if (!session.isAuthenticated && !isPublic) {
    return navigateTo('/login')
  }

  if (session.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/dashboards')
  }
})
