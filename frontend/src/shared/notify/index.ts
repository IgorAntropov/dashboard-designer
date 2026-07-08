import { reactive, readonly } from 'vue'

export type ToastType = 'error' | 'success' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

const TOAST_TTL_MS = 5000

const state = reactive<{ items: Toast[] }>({ items: [] })
let seq = 0

export function dismissToast(id: number): void {
  const index = state.items.findIndex((item) => item.id === id)
  if (index !== -1) {
    state.items.splice(index, 1)
  }
}

export function pushToast(message: string, type: ToastType = 'error'): number {
  const id = (seq += 1)
  state.items.push({ id, type, message })
  if (import.meta.client) {
    setTimeout(() => dismissToast(id), TOAST_TTL_MS)
  }
  return id
}

export function useToasts() {
  return readonly(state)
}
