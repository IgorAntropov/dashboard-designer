import { setErrorHandler } from '@shared/api'
import { pushToast } from '@shared/notify'

const CODE_KEYS: Record<string, string> = {
  quota_widgets: 'errors.quotaWidgets',
  quota_dashboards: 'errors.quotaDashboards',
  export_paid: 'errors.exportPaid',
  custom_theme_paid: 'errors.customThemePaid',
  not_found: 'errors.notFound',
}

export default defineNuxtPlugin((nuxtApp) => {
  setErrorHandler((status, code) => {
    const i18n = nuxtApp.$i18n as unknown as { t: (key: string) => string }
    const key =
      (code ? CODE_KEYS[code] : undefined) ??
      (status >= 500 ? 'errors.server' : 'errors.generic')
    pushToast(i18n.t(key), 'error')
  })
})
