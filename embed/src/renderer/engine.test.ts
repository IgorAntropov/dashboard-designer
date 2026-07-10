import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { EmbedConfig } from '@panelka/renderer'
import { DashboardEngine } from '@panelka/renderer'

class StubStyle {
  [key: string]: unknown
  setProperty(key: string, value: string): void {
    this[key] = value
  }
}

class StubClassList {
  private readonly items = new Set<string>()
  add(...names: string[]): void {
    names.forEach((name) => this.items.add(name))
  }
  contains(name: string): boolean {
    return this.items.has(name)
  }
}

class StubElement {
  className = ''
  textContent = ''
  title = ''
  childNodes: StubElement[] = []
  style = new StubStyle()
  classList = new StubClassList()

  constructor(public readonly tagName: string) {}

  append(...nodes: StubElement[]): void {
    this.childNodes.push(...nodes)
  }

  appendChild(node: StubElement): StubElement {
    this.childNodes.push(node)
    return node
  }

  replaceChildren(...nodes: StubElement[]): void {
    this.childNodes = nodes
  }

  addEventListener(): void {}
}

function findText(node: StubElement, text: string): boolean {
  if (node.textContent === text) {
    return true
  }
  return node.childNodes.some((child) => findText(child, text))
}

function findClass(node: StubElement, cls: string): boolean {
  if (node.className === cls) {
    return true
  }
  return node.childNodes.some((child) => findClass(child, cls))
}

const config: EmbedConfig = {
  dashboard_id: 'd1',
  theme_key: 'light-minimal',
  theme_tokens: null,
  attribution: true,
  layout: {
    widgets: [
      {
        id: 's1',
        type: 'section',
        x: 0,
        y: 0,
        w: 12,
        h: 1,
        config: { title: 'Section' },
        binding: {},
      },
      {
        id: 'k1',
        type: 'stat-tile',
        x: 0,
        y: 1,
        w: 4,
        h: 2,
        config: { title: 'Revenue' },
        binding: { value: 'value' },
      },
    ],
  },
}

beforeEach(() => {
  vi.stubGlobal('document', {
    createElement: (tag: string) => new StubElement(tag),
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('DashboardEngine', () => {
  it('mounts a grid cell per widget with attribution', () => {
    const container = new StubElement('div')
    const engine = new DashboardEngine(container as unknown as HTMLElement)
    engine.mount(config)

    const grid = container.childNodes.find(
      (node) => node.className === 'pk-embed-grid',
    )
    expect(grid?.childNodes).toHaveLength(2)
    expect(findClass(container, 'pk-embed-body')).toBe(true)
    expect(findText(container, 'Made with Panelka')).toBe(true)
    expect(findText(container, 'Section')).toBe(true)
  })

  it('renders pushed data through setData', () => {
    const container = new StubElement('div')
    const engine = new DashboardEngine(container as unknown as HTMLElement)
    engine.mount(config)

    expect(findText(container, (5).toLocaleString())).toBe(false)
    engine.setData({ k1: [{ value: 5 }] })
    expect(findText(container, (5).toLocaleString())).toBe(true)
  })

  it('destroys without throwing', () => {
    const container = new StubElement('div')
    const engine = new DashboardEngine(container as unknown as HTMLElement)
    engine.mount(config)
    expect(() => engine.destroy()).not.toThrow()
  })

  it('dispatches every dom widget type without throwing', () => {
    const types = ['stat-tile', 'section', 'ranking', 'table', 'text-block', 'progress']
    const domConfig: EmbedConfig = {
      dashboard_id: 'd2',
      theme_key: 'dark-pro',
      theme_tokens: null,
      attribution: false,
      layout: {
        widgets: types.map((type, index) => ({
          id: `w${index}`,
          type,
          x: 0,
          y: index,
          w: 12,
          h: 1,
          config: { title: type },
          binding: { value: 'value', name: 'name' },
        })),
      },
    }
    const container = new StubElement('div')
    const engine = new DashboardEngine(container as unknown as HTMLElement)

    expect(() => {
      engine.mount(domConfig)
      engine.setData({
        w2: [{ name: 'A', value: 3 }],
        w3: [{ name: 'A', value: 3 }],
      })
    }).not.toThrow()

    const grid = container.childNodes.find(
      (node) => node.className === 'pk-embed-grid',
    )
    expect(grid?.childNodes).toHaveLength(types.length)
  })
})
