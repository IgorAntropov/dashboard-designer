import { ELEMENT_NAME } from './constants'
import { PanelkaDashboard } from './web-component'

export function definePanelka(): void {
  if (
    typeof customElements !== 'undefined' &&
    !customElements.get(ELEMENT_NAME)
  ) {
    customElements.define(ELEMENT_NAME, PanelkaDashboard)
  }
}
