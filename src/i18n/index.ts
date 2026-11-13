import { createI18n } from 'vue-i18n'
import zhTW from './locales/zh-TW'
import en from './locales/en'

export type SupportedLocale = 'zh-TW' | 'en'

const STORAGE_KEY = 'camino_locale'

export function getInitialLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'zh-TW'

  const langParam = new URLSearchParams(window.location.search).get('lang')
  if (langParam === 'zh-TW' || langParam === 'en') {
    localStorage.setItem(STORAGE_KEY, langParam)
    return langParam
  }

  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'zh-TW' || saved === 'en') {
    return saved
  }

  // 未手動切換時預設以繁體中文為主，確保搜尋引擎與中文使用者優先取得完整中文內容
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
  i18n.global.locale.value = locale
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale === 'zh-TW' ? 'zh-Hant-TW' : 'en'
    // 即時動態連動更新瀏覽器分頁標題與 Meta 標籤
    import('@/router')
      .then(({ updateDocumentSeo }) => {
        updateDocumentSeo()
      })
      .catch(() => {})
  }
}

// 初始化網頁根標籤語言
if (typeof document !== 'undefined') {
  const current = getInitialLocale()
  document.documentElement.lang = current === 'zh-TW' ? 'zh-Hant-TW' : 'en'
}

export default i18n
