import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface AuthUser {
  id: string
  email: string
  displayName: string
}

export const useUserStore = defineStore('user', () => {
  const current = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => current.value !== null)

  const setUser = (user: AuthUser | null): void => {
    current.value = user
  }

  return { current, isAuthenticated, setUser }
})
