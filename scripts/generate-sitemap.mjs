import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const SITEMAP_PATH = path.join(ROOT_DIR, 'public', 'sitemap.xml')
const SITE_ORIGIN = 'https://camino-plan.com'

/**
 * 全站公開路由單一真實來源（SSOT）。
 * 執行本腳本將自動展開為中英雙語（/ 與 /en）並附帶成對互指的 hreflang alternate 標籤。
 */
const PUBLIC_ROUTES = [
  // 網站核心首頁
  { path: '/', lastmod: '2026-11-23' },
  // 行程規劃三大路線專屬著陸頁
  { path: '/schedule/frances', lastmod: '2026-11-23' },
  { path: '/schedule/portugues', lastmod: '2026-11-23' },
  { path: '/schedule/portugues/costa', lastmod: '2026-11-23' },
  { path: '/schedule/norte', lastmod: '2026-11-23' },
  // 起點交通三大路線專屬著陸頁
  { path: '/transport/frances', lastmod: '2026-11-23' },
  { path: '/transport/portugues', lastmod: '2026-11-23' },
  { path: '/transport/portugues/costa', lastmod: '2026-11-23' },
  { path: '/transport/norte', lastmod: '2026-11-23' },
  // 核心工具與知識庫
  { path: '/packing', lastmod: '2026-11-23' },
  { path: '/budget', lastmod: '2026-11-23' },
  { path: '/faq', lastmod: '2026-11-23' },
  { path: '/history', lastmod: '2026-11-23' },
  { path: '/routes', lastmod: '2026-11-23' },
  { path: '/routes/frances', lastmod: '2026-11-23' },
  { path: '/routes/portugues', lastmod: '2026-11-23' },
  { path: '/routes/norte', lastmod: '2026-11-23' },
  // 實戰攻略文章專區
  { path: '/guides', lastmod: '2026-11-23' },
  { path: '/guides/best-seasons', lastmod: '2026-11-23' },
  { path: '/guides/pyrenees-crossing', lastmod: '2026-11-23' },
  { path: '/guides/last-100km-guide', lastmod: '2026-11-23' },
  { path: '/guides/albergue-guide', lastmod: '2026-11-23' },
  { path: '/guides/footwear-and-luggage', lastmod: '2026-11-23' },
  { path: '/guides/budget-breakdown', lastmod: '2026-11-23' },
  // 關於、聯絡與隱私權
  { path: '/about', lastmod: '2026-11-23' },
  { path: '/contact', lastmod: '2026-11-23' },
  { path: '/privacy', lastmod: '2026-11-23' },
]

function toEnglishPath(zhPath) {
  return zhPath === '/' ? '/en' : `/en${zhPath}`
}

function renderUrlEntry(locUrl, zhUrl, enUrl, lastmod) {
  return [
    '  <url>',
    `    <loc>${locUrl}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <xhtml:link rel="alternate" hreflang="zh-Hant-TW" href="${zhUrl}" />`,
    `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />`,
    '  </url>',
  ].join('\n')
}

function generateSitemap() {
  const entries = []

  for (const route of PUBLIC_ROUTES) {
    const zhUrl = `${SITE_ORIGIN}${route.path}`
    const enUrl = `${SITE_ORIGIN}${toEnglishPath(route.path)}`

    entries.push(renderUrlEntry(zhUrl, zhUrl, enUrl, route.lastmod))
    entries.push(renderUrlEntry(enUrl, zhUrl, enUrl, route.lastmod))
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n')

  fs.writeFileSync(SITEMAP_PATH, xml, 'utf-8')
  console.log(
    `[sitemap] 已自動產生雙語 sitemap.xml，共 ${PUBLIC_ROUTES.length} 組路由（${entries.length} 條雙語網址）。`,
  )
}

generateSitemap()
