import { createI18n } from 'vue-i18n'
import zhTW from './locales/zh-TW'
import en from './locales/en'
import { extractLocaleFromPath, type SupportedLocale } from '@/utils/localeRoute'

export type { SupportedLocale }

const STORAGE_KEY = 'camino_locale'

export function getInitialLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'zh-TW'

  const pathLocale = extractLocaleFromPath(window.location.pathname)
  if (pathLocale === 'en') {
    return 'en'
  }

  // 向下相容舊版 ?lang=en 連結，實際網址重導向交由 router.beforeEach 處理
  const langParam = new URLSearchParams(window.location.search).get('lang')
  if (langParam === 'en' || langParam === 'zh-TW') {
    return langParam
  }

  // URL 為語系唯一真實來源，無 /en 前綴時預設繁體中文，不因 localStorage 覆寫網址語系
  return 'zh-TW'
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
  if (i18n.global.locale.value !== locale) {
    i18n.global.locale.value = locale
  }
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
