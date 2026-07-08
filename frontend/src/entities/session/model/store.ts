import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import type { components } from '@shared/api'
import { api, setAccessToken } from '@shared/api'

export type SessionUser = components['schemas']['UserOut']

export const useSessionStore = defineStore('session', () => {
  const accessCookie = useCookie<string | null>('panelka_access', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })
  const refreshCookie = useCookie<string | null>('panelka_refresh', {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })

  const user = ref<SessionUser | null>(null)
  const isAuthenticated = computed(() => user.value !== null)

  function applyAccess(token: string | null): void {
    setAccessToken(token)
    accessCookie.value = token
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

  async function refresh(): Promise<boolean> {
    if (!refreshCookie.value) {
      return false
    }
    const { data, error } = await api.POST('/api/v1/auth/refresh', {
      body: { refresh_token: refreshCookie.value },
    })
    if (error || !data) {
      return false
    }
    applyAccess(data.access_token)
    refreshCookie.value = data.refresh_token
    return true
  }

  async function init(): Promise<void> {
    if (accessCookie.value) {
      setAccessToken(accessCookie.value)
      if (await fetchMe()) {
        return
      }
    }
    if (await refresh()) {
      await fetchMe()
    }
  }

  async function login(email: string, password: string): Promise<boolean> {
    const { data, error } = await api.POST('/api/v1/auth/login', {
      body: { email, password },
    })
    if (error || !data) {
      return false
    }
    applyAccess(data.access_token)
    refreshCookie.value = data.refresh_token
    return fetchMe()
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
    user.value = null
    applyAccess(null)
    refreshCookie.value = null
  }

  return {
    user,
    isAuthenticated,
    init,
    login,
    register,
    refresh,
    updateName,
    changePassword,
    logout,
  }
})
