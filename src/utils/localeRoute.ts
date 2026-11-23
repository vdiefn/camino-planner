export type SupportedLocale = 'zh-TW' | 'en'

const EN_PREFIX_REGEX = /^\/en(?=\/|$)/

/**
 * 將路徑正規化：折疊連續斜線（防範 Protocol-Relative URL `//evil.com`）、
 * 確保以單一 `/` 開頭，並移除非根路徑的尾斜線。
 */
export function normalizePathname(pathname: string): string {
  if (!pathname) return '/'
  const collapsed = pathname.replace(/\/{2,}/g, '/')
  const withLeadingSlash = collapsed.startsWith('/') ? collapsed : `/${collapsed}`
  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith('/')) {
    return withLeadingSlash.replace(/\/+$/, '') || '/'
  }
  return withLeadingSlash
}

/**
 * 依據 URL pathname 判定語系：僅在獨立段落 `/en` 或 `/en/...` 時回傳 `'en'`。
 */
export function extractLocaleFromPath(pathname: string): SupportedLocale {
  const normalized = normalizePathname(pathname)
  return EN_PREFIX_REGEX.test(normalized) ? 'en' : 'zh-TW'
}

/**
 * 剝離 `/en` 語系前綴並正規化，還原為無語系前綴之標準路徑。
 */
export function stripLocalePrefix(pathname: string): string {
  const normalized = normalizePathname(pathname)
  if (!EN_PREFIX_REGEX.test(normalized)) {
    return normalized
  }
  const stripped = normalized.replace(EN_PREFIX_REGEX, '')
  return stripped ? normalizePathname(stripped) : '/'
}

/**
 * 依據目標語系產生對應站內路徑（支援保留 query 與 hash，並具冪等性）。
 * 外部 URL（http/https/mailto/tel）與純 hash 錨點將原樣回傳。
 */
export function localizePath(rawPath: string, locale: SupportedLocale): string {
  if (
    !rawPath ||
    rawPath.startsWith('#') ||
    /^(https?:|mailto:|tel:)/i.test(rawPath)
  ) {
    return rawPath
  }

  const hashIndex = rawPath.indexOf('#')
  const beforeHash = hashIndex >= 0 ? rawPath.slice(0, hashIndex) : rawPath
  const hashPart = hashIndex >= 0 ? rawPath.slice(hashIndex) : ''

  const queryIndex = beforeHash.indexOf('?')
  const pathnamePart = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash
  const queryPart = queryIndex >= 0 ? beforeHash.slice(queryIndex) : ''

  const basePath = stripLocalePrefix(pathnamePart)
  const localizedPathname =
    locale === 'en' ? (basePath === '/' ? '/en' : `/en${basePath}`) : basePath

  return `${localizedPathname}${queryPart}${hashPart}`
}

export interface BilingualSeoUrls {
  locale: SupportedLocale
  canonicalPath: string
  canonicalUrl: string
  zhUrl: string
  enUrl: string
  xDefaultUrl: string
}

/**
 * 產生雙語頁面之 canonical 與 hreflang（zh-Hant-TW / en / x-default）完整絕對網址。
 * 依專案架構決議，x-default 指向英文國際版（/en/...）。
 */
export function buildBilingualSeoUrls(
  siteOrigin: string,
  pathname: string,
): BilingualSeoUrls {
  const cleanOrigin = siteOrigin.replace(/\/+$/, '')
  const locale = extractLocaleFromPath(pathname)
  const zhPath = stripLocalePrefix(pathname)
  const enPath = localizePath(zhPath, 'en')
  const canonicalPath = locale === 'en' ? enPath : zhPath

  const zhUrl = `${cleanOrigin}${zhPath}`
  const enUrl = `${cleanOrigin}${enPath}`

  return {
    locale,
    canonicalPath,
    canonicalUrl: `${cleanOrigin}${canonicalPath}`,
    zhUrl,
    enUrl,
    xDefaultUrl: enUrl,
  }
}
