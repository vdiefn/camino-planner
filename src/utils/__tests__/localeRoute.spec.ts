import { describe, expect, it } from 'vitest'
import {
  buildBilingualSeoUrls,
  extractLocaleFromPath,
  localizePath,
  normalizePathname,
  stripLocalePrefix,
} from '@/utils/localeRoute'

describe('localeRoute 雙語路徑與 SEO 網址工具測試', () => {
  it('normalizePathname 應正確補齊開頭斜線、折疊連續斜線並移除多餘尾斜線', () => {
    expect(normalizePathname('')).toBe('/')
    expect(normalizePathname('/')).toBe('/')
    expect(normalizePathname('/packing/')).toBe('/packing')
    expect(normalizePathname('/en/')).toBe('/en')
    expect(normalizePathname('en/schedule/frances///')).toBe('/en/schedule/frances')
    // 防範 Protocol-Relative URL (//evil.com) 繞過站內路徑檢查
    expect(normalizePathname('//evil.com')).toBe('/evil.com')
    expect(normalizePathname('///evil.com//path')).toBe('/evil.com/path')
  })

  it('extractLocaleFromPath 應僅在獨立 /en 段落時判定為英文語系', () => {
    expect(extractLocaleFromPath('/')).toBe('zh-TW')
    expect(extractLocaleFromPath('/packing')).toBe('zh-TW')
    expect(extractLocaleFromPath('/english-guide')).toBe('zh-TW')
    expect(extractLocaleFromPath('/en')).toBe('en')
    expect(extractLocaleFromPath('/en/')).toBe('en')
    expect(extractLocaleFromPath('/en/schedule/frances')).toBe('en')
  })

  it('stripLocalePrefix 應準確移除 /en 前綴並還原標準中文路徑', () => {
    expect(stripLocalePrefix('/')).toBe('/')
    expect(stripLocalePrefix('/en')).toBe('/')
    expect(stripLocalePrefix('/en/')).toBe('/')
    expect(stripLocalePrefix('/en/packing')).toBe('/packing')
    expect(stripLocalePrefix('/en/schedule/portugues/costa/')).toBe(
      '/schedule/portugues/costa',
    )
    expect(stripLocalePrefix('/packing')).toBe('/packing')
  })

  it('localizePath 應具備冪等性並完整保留 Query 與 Hash 參數', () => {
    expect(localizePath('/', 'en')).toBe('/en')
    expect(localizePath('/en', 'en')).toBe('/en')
    expect(localizePath('/packing', 'en')).toBe('/en/packing')
    expect(localizePath('/en/packing', 'en')).toBe('/en/packing')
    expect(localizePath('/schedule/frances?s=abc123#day-5', 'en')).toBe(
      '/en/schedule/frances?s=abc123#day-5',
    )

    expect(localizePath('/en', 'zh-TW')).toBe('/')
    expect(localizePath('/en/packing?s=abc123#top', 'zh-TW')).toBe('/packing?s=abc123#top')
    expect(localizePath('/packing', 'zh-TW')).toBe('/packing')

    // 外部連結與純錨點不應被改寫；雙斜線開頭路徑應被收斂為安全單斜線
    expect(localizePath('https://example.com/test', 'en')).toBe('https://example.com/test')
    expect(localizePath('mailto:test@camino-plan.com', 'en')).toBe('mailto:test@camino-plan.com')
    expect(localizePath('#section-1', 'en')).toBe('#section-1')
    expect(localizePath('//evil.com', 'zh-TW')).toBe('/evil.com')
    expect(localizePath('//evil.com', 'en')).toBe('/en/evil.com')
  })

  it('buildBilingualSeoUrls 應產生正確 canonical 與指向 /en/... 的 x-default', () => {
    const origin = 'https://camino-plan.com'

    expect(buildBilingualSeoUrls(origin, '/')).toEqual({
      locale: 'zh-TW',
      canonicalPath: '/',
      canonicalUrl: 'https://camino-plan.com/',
      zhUrl: 'https://camino-plan.com/',
      enUrl: 'https://camino-plan.com/en',
      xDefaultUrl: 'https://camino-plan.com/en',
    })

    expect(buildBilingualSeoUrls(origin, '/en/')).toEqual({
      locale: 'en',
      canonicalPath: '/en',
      canonicalUrl: 'https://camino-plan.com/en',
      zhUrl: 'https://camino-plan.com/',
      enUrl: 'https://camino-plan.com/en',
      xDefaultUrl: 'https://camino-plan.com/en',
    })

    expect(buildBilingualSeoUrls(origin, '/en/schedule/frances')).toEqual({
      locale: 'en',
      canonicalPath: '/en/schedule/frances',
      canonicalUrl: 'https://camino-plan.com/en/schedule/frances',
      zhUrl: 'https://camino-plan.com/schedule/frances',
      enUrl: 'https://camino-plan.com/en/schedule/frances',
      xDefaultUrl: 'https://camino-plan.com/en/schedule/frances',
    })
  })
})
