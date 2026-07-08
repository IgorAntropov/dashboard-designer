import { ELEMENT_NAME } from './constants'
import { definePanelka } from './define'
import type { EmbedData } from './renderer/engine'
import type { PanelkaDashboard } from './web-component'

export interface RenderOptions {
  token: string
  origin?: string
  data?: EmbedData
}

export function render(
  target: string | HTMLElement,
  options: RenderOptions,
): PanelkaDashboard {
  definePanelka()

  const host =
    typeof target === 'string' ? document.querySelector(target) : target
  if (!host) {
    throw new Error(`Panelka: target not found: ${String(target)}`)
  }

  const element = document.createElement(ELEMENT_NAME) as PanelkaDashboard
  element.setAttribute('token', options.token)
  if (options.origin) {
    element.setAttribute('origin', options.origin)
  }
  host.append(element)

  if (options.data) {
    element.data = options.data
  }

  return element
}
