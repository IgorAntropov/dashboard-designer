import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useScrollY() {
  const y = ref(0)
  let ticking = false

  function onScroll(): void {
    if (ticking) {
      return
    }
    ticking = true
    requestAnimationFrame(() => {
      y.value = window.scrollY
      ticking = false
    })
  }

  onMounted(() => {
    if (!import.meta.client) {
      return
    }
    y.value = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    if (import.meta.client) {
      window.removeEventListener('scroll', onScroll)
    }
  })

  return { y }
}
