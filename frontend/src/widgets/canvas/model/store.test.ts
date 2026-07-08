import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useCanvasStore } from './store'

describe('canvas store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds a widget with the requested size', () => {
    const store = useCanvasStore()

    const widget = store.add('bar-chart', { w: 6, h: 4 })

    expect(store.widgets).toHaveLength(1)
    expect(widget.type).toBe('bar-chart')
    expect(widget.w).toBe(6)
  })

  it('updates position and size', () => {
    const store = useCanvasStore()
    const widget = store.add('stat-tile', { w: 3, h: 2 })

    store.updatePosition(widget.id, { x: 2, y: 1, w: 4, h: 3 })

    expect(store.widgets[0]).toMatchObject({ x: 2, y: 1, w: 4, h: 3 })
  })

  it('removes a widget by id', () => {
    const store = useCanvasStore()
    const widget = store.add('text-block', { w: 4, h: 2 })

    store.remove(widget.id)

    expect(store.widgets).toHaveLength(0)
  })
})
