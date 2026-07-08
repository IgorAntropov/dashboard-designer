import cs from './locales/cs.json'
import de from './locales/de.json'
import en from './locales/en.json'
import fr from './locales/fr.json'
import it from './locales/it.json'
import pl from './locales/pl.json'
import ru from './locales/ru.json'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'ru',
  fallbackLocale: 'en',
  messages: { ru, en, de, pl, cs, fr, it },
}))
