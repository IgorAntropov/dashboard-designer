import { WIDGET_CSS } from '@panelka/renderer'

export default defineNuxtPlugin(() => {
  const id = 'pk-widget-css'
  if (document.getElementById(id)) {
    return
  }
  const style = document.createElement('style')
  style.id = id
  style.textContent = WIDGET_CSS
  document.head.append(style)
})
