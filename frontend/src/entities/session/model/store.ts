import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { components } from '@shared/api'
import { api, getAccessToken, setAccessToken } from '@shared/api'
import { config } from '@shared/config'

export type SessionUser = components['schemas']['UserOut']

const WS_SUBPROTOCOL = 'panelka-ws'

export const useSessionStore = defineStore('session', () => {
  const user = ref<SessionUser | null>(null)
  const isAuthenticated = computed(() => user.value !== null)
  const kicked = ref(false)

  let socket: WebSocket | null = null

  function disconnectWs(): void {
    if (socket) {
      socket.onmessage = null
      socket.onclose = null
      socket.close()
      socket = null
    }
  }

  function connectWs(): void {
    const token = getAccessToken()
    if (!import.meta.client || !token) {
      return
    }
    disconnectWs()
    const wsOrigin = config.apiOrigin.replace(/^http/, 'ws')
    const ws = new WebSocket(`${wsOrigin}/api/v1/ws/session`, [
      WS_SUBPROTOCOL,
      token,
    ])
    ws.onmessage = (event) => {
      if (String(event.data).includes('"kicked"')) {
        kicked.value = true
        logout()
      }
    }
    socket = ws
  }

  function resetKicked(): void {
    kicked.value = false
  }

  const ACCESS_REFRESH_MS = 12 * 60 * 1000
  let refreshTimer: ReturnType<typeof setTimeout> | null = null

  function stopRefreshTimer(): void {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }
  }

  function scheduleRefresh(): void {
    if (!import.meta.client) {
      return
    }
    stopRefreshTimer()
    refreshTimer = setTimeout(() => {
      void tick()
    }, ACCESS_REFRESH_MS)
  }

  async function tick(): Promise<void> {
    if (await refresh()) {
      scheduleRefresh()
    } else {
      stopRefreshTimer()
    }
  }

  function applyAccess(token: string | null): void {
    setAccessToken(token)
  }

  async function fetchMe(): Promise<boolean> {
    const { data, error } = await api.GET('/api/v1/me')
    if (error || !data) {
      user.value = null
      return false
    }
    user.value = data
    return true
  }

  let refreshInFlight: Promise<boolean> | null = null

  async function runRefresh(): Promise<boolean> {
    const { data, error } = await api.POST('/api/v1/auth/refresh')
    if (error || !data) {
      return false
    }
    applyAccess(data.access_token)
    return true
  }

  async function refresh(): Promise<boolean> {
    if (!refreshInFlight) {
      refreshInFlight = runRefresh().finally(() => {
        refreshInFlight = null
      })
    }
    return refreshInFlight
  }

  async function init(): Promise<void> {
    if (await refresh()) {
      await fetchMe()
      scheduleRefresh()
      connectWs()
    }
  }

  let initPromise: Promise<void> | null = null

  function ensureInit(): Promise<void> {
    if (!initPromise) {
      initPromise = init()
    }
    return initPromise
  }

  async function login(email: string, password: string): Promise<boolean> {
    const { data, error } = await api.POST('/api/v1/auth/login', {
      body: { email, password },
    })
    if (error || !data) {
      return false
    }
    applyAccess(data.access_token)
    const ok = await fetchMe()
    if (ok) {
      scheduleRefresh()
      connectWs()
    }
    return ok
  }

  async function register(
    email: string,
    password: string,
    displayName: string,
  ): Promise<boolean> {
    const { error } = await api.POST('/api/v1/auth/register', {
      body: { email, password, display_name: displayName },
    })
    if (error) {
      return false
    }
    return login(email, password)
  }

  async function updateName(displayName: string): Promise<boolean> {
    const { data, error } = await api.PATCH('/api/v1/me', {
      body: { display_name: displayName },
    })
    if (error || !data) {
      return false
    }
    user.value = data
    return true
  }

  async function setTier(
    tier: 'free' | 'pro' | 'unlimited',
  ): Promise<boolean> {
    const { data, error } = await api.PATCH('/api/v1/me/subscription', {
      body: { tier },
    })
    if (error || !data) {
      return false
    }
    user.value = data
    return true
  }

  async function changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const { error } = await api.POST('/api/v1/auth/change-password', {
      body: { current_password: currentPassword, new_password: newPassword },
    })
    return !error
  }

  function logout(): void {
    stopRefreshTimer()
    disconnectWs()
    void api.POST('/api/v1/auth/logout')
    user.value = null
    applyAccess(null)
  }

  return {
    user,
    isAuthenticated,
    kicked,
    init,
    ensureInit,
    login,
    register,
    refresh,
    fetchMe,
    updateName,
    changePassword,
    setTier,
    resetKicked,
    logout,
  }
})
