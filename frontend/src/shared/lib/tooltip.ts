import type { Directive } from 'vue'

type Placement = 'top' | 'bottom' | 'left' | 'right'

interface TooltipState {
  text: string
  placement: Placement
  node: HTMLElement | null
  onEnter: () => void
  onLeave: () => void
}

const registry = new WeakMap<HTMLElement, TooltipState>()
const GAP = 8

function place(el: HTMLElement, node: HTMLElement, placement: Placement): void {
  const rect = el.getBoundingClientRect()
  const width = node.offsetWidth
  const height = node.offsetHeight
  let top = 0
  let left = 0

  if (placement === 'right') {
    left = rect.right + GAP
    top = rect.top + rect.height / 2 - height / 2
  } else if (placement === 'left') {
    left = rect.left - width - GAP
    top = rect.top + rect.height / 2 - height / 2
  } else if (placement === 'bottom') {
    left = rect.left + rect.width / 2 - width / 2
    top = rect.bottom + GAP
  } else {
    left = rect.left + rect.width / 2 - width / 2
    top = rect.top - height - GAP
  }

  const margin = 4
  left = Math.min(Math.max(margin, left), window.innerWidth - width - margin)
  top = Math.min(Math.max(margin, top), window.innerHeight - height - margin)

  node.style.left = `${Math.round(left)}px`
  node.style.top = `${Math.round(top)}px`
}

function show(state: TooltipState, el: HTMLElement): void {
  if (!state.text || state.node) {
    return
  }
  const node = document.createElement('div')
  node.className = 'pk-tip'
  node.textContent = state.text
  document.body.append(node)
  state.node = node
  place(el, node, state.placement)
  requestAnimationFrame(() => node.classList.add('pk-tip--in'))
}

function hide(state: TooltipState): void {
  state.node?.remove()
  state.node = null
}

export const tooltip: Directive<HTMLElement, string | undefined> = {
  mounted(el, binding) {
    const state: TooltipState = {
      text: binding.value ?? '',
      placement: (binding.arg as Placement) ?? 'top',
      node: null,
      onEnter: () => show(state, el),
      onLeave: () => hide(state),
    }
    el.addEventListener('mouseenter', state.onEnter)
    el.addEventListener('mouseleave', state.onLeave)
    el.addEventListener('focus', state.onEnter)
    el.addEventListener('blur', state.onLeave)
    registry.set(el, state)
  },
  updated(el, binding) {
    const state = registry.get(el)
    if (!state) {
      return
    }
    state.text = binding.value ?? ''
    state.placement = (binding.arg as Placement) ?? 'top'
    if (state.node) {
      if (!state.text) {
        hide(state)
      } else {
        state.node.textContent = state.text
        place(el, state.node, state.placement)
      }
    }
  },
  beforeUnmount(el) {
    const state = registry.get(el)
    if (!state) {
      return
    }
    el.removeEventListener('mouseenter', state.onEnter)
    el.removeEventListener('mouseleave', state.onLeave)
    el.removeEventListener('focus', state.onEnter)
    el.removeEventListener('blur', state.onLeave)
    hide(state)
    registry.delete(el)
  },
}
