import { messages } from '@shared/i18n/messages'

interface MessageSetter {
  setLocaleMessage: (locale: string, message: Record<string, unknown>) => void
}

export default defineNuxtPlugin((nuxtApp) => {
  const setter = nuxtApp.$i18n as unknown as MessageSetter
  for (const [locale, message] of Object.entries(messages)) {
    setter.setLocaleMessage(locale, message as Record<string, unknown>)
  }
})
