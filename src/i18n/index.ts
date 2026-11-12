import { createI18n } from 'vue-i18n'
import zhTW from './locales/zh-TW'
import en from './locales/en'

export type SupportedLocale = 'zh-TW' | 'en'

const STORAGE_KEY = 'camino_locale'

export function getInitialLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'zh-TW'

  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'zh-TW' || saved === 'en') {
    return saved
  }

  // 根據瀏覽器偏好語系智慧偵測
  const navLang = navigator.language.toLowerCase()
  if (navLang.startsWith('zh')) {
    return 'zh-TW'
  }
  return 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'zh-TW',
  messages: {
    'zh-TW': zhTW,
    en,
  },
})

export function setAppLocale(locale: SupportedLocale) {
  i18n.global.locale.value = locale
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale === 'zh-TW' ? 'zh-Hant-TW' : 'en'
  }
}

// 初始化網頁根標籤語言
if (typeof document !== 'undefined') {
  const current = getInitialLocale()
  document.documentElement.lang = current === 'zh-TW' ? 'zh-Hant-TW' : 'en'
}

export default i18n
