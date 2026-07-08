import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useReveal(threshold = 0.15) {
  const el = ref<HTMLElement | null>(null)
  const shown = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!el.value || typeof IntersectionObserver === 'undefined') {
      shown.value = true
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            shown.value = true
            observer?.disconnect()
          }
        }
      },
      { threshold },
    )
    observer.observe(el.value)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { el, shown }
}
