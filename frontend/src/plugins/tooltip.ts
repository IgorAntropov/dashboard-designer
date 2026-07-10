import { tooltip } from '@shared/lib/tooltip'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('tooltip', tooltip)
})
