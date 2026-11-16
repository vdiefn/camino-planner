import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const DIST_DIR = path.join(ROOT_DIR, 'dist')
const SITEMAP_PATH = path.join(ROOT_DIR, 'public', 'sitemap.xml')
const SPA_SHELL_PATH = path.join(DIST_DIR, '_spa.html')

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

/**
 * 從 public/sitemap.xml 解析所有公開路由路徑，確保預渲染清單與 Sitemap 單一來源同步。
 */
function parseSitemapRoutes() {
  const xml = fs.readFileSync(SITEMAP_PATH, 'utf-8')
  const matches = [...xml.matchAll(/<loc>\s*(https?:\/\/[^<\s]+)\s*<\/loc>/g)]
  const routes = matches.map((m) => {
    const url = new URL(m[1])
    return url.pathname || '/'
  })

  if (routes.length === 0) {
    throw new Error('找不到任何可預渲染的路由，請檢查 public/sitemap.xml')
  }
  return [...new Set(routes)]
}

/**
 * 保留原始空白 SPA 外殼為 _spa.html，並更新 _redirects 避免未預渲染路由誤用首頁快照。
 */
function prepareSpaShell() {
  const indexPath = path.join(DIST_DIR, 'index.html')
  if (!fs.existsSync(indexPath)) {
    throw new Error('找不到 dist/index.html，請先執行 vite build')
  }

  if (!fs.existsSync(SPA_SHELL_PATH)) {
    fs.copyFileSync(indexPath, SPA_SHELL_PATH)
  }

  const redirectsPath = path.join(DIST_DIR, '_redirects')
  if (fs.existsSync(redirectsPath)) {
    const redirects = fs.readFileSync(redirectsPath, 'utf-8')
    const updated = redirects.replace(/\/\*\s+\/index\.html\s+200/g, '/* /_spa.html 200')
    fs.writeFileSync(redirectsPath, updated, 'utf-8')
  }
}

/**
 * 啟動本機靜態伺服器伺服 dist/，找不到靜態資產時一律回傳乾淨的 _spa.html。
 */
function startStaticServer() {
  const spaHtml = fs.readFileSync(SPA_SHELL_PATH)

  const server = http.createServer((req, res) => {
    const reqUrl = new URL(req.url || '/', 'http://127.0.0.1')
    const safePath = decodeURIComponent(reqUrl.pathname).replace(/^\/+/, '')
    const candidatePath = path.resolve(DIST_DIR, safePath)

    // 防止路徑穿越並僅直接回應靜態資源檔（非路由）
    if (
      safePath &&
      candidatePath.startsWith(DIST_DIR) &&
      fs.existsSync(candidatePath) &&
      fs.statSync(candidatePath).isFile()
    ) {
      const ext = path.extname(candidatePath).toLowerCase()
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' })
      fs.createReadStream(candidatePath).pipe(res)
      return
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(spaHtml)
  })

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      resolve({ server, port: address.port })
    })
  })
}

function resolveOutputPath(routePath) {
  if (routePath === '/') {
    return path.join(DIST_DIR, 'index.html')
  }
  const clean = routePath.replace(/^\/+|\/+$/g, '')
  return path.join(DIST_DIR, `${clean}.html`)
}

async function prerender() {
  const routes = parseSitemapRoutes()
  prepareSpaShell()
  const { server, port } = await startStaticServer()
  const origin = `http://127.0.0.1:${port}`

  const browser = await chromium.launch({ headless: true })
  try {
    const context = await browser.newContext()
    const page = await context.newPage()

    // 封鎖所有外部網路請求（AdSense、字型、分析腳本等），確保離線純淨渲染
    await page.route('**/*', (route) => {
      const url = route.request().url()
      if (url.startsWith(origin) || url.startsWith('data:') || url.startsWith('blob:')) {
        return route.continue()
      }
      return route.abort()
    })

    console.log(`[prerender] 開始預渲染 ${routes.length} 個路由...`)

    for (const routePath of routes) {
      await page.goto(`${origin}${routePath}`, { waitUntil: 'domcontentloaded' })

      // 等待 Vue 接管 #app 並完成元件掛載
      await page.waitForFunction(
        () => {
          const app = document.querySelector('#app')
          return Boolean(app && app.children.length > 0 && !app.querySelector('noscript'))
        },
        { timeout: 15000 },
      )

      // 預留短暫時間讓 router.afterEach 與 watchEffect 完成 SEO Meta / JSON-LD 寫入
      await page.waitForTimeout(150)

      const html = await page.content()
      const title = await page.title()
      const outPath = resolveOutputPath(routePath)

      fs.mkdirSync(path.dirname(outPath), { recursive: true })
      fs.writeFileSync(outPath, html, 'utf-8')

      const relOut = path.relative(ROOT_DIR, outPath).replace(/\\/g, '/')
      console.log(`  ✓ ${routePath.padEnd(28)} -> ${relOut} (${title})`)
    }

    console.log('[prerender] 全部路由預渲染完成。')
  } finally {
    await browser.close()
    server.close()
  }
}

prerender().catch((err) => {
  console.error('[prerender] 執行失敗:', err)
  process.exit(1)
})
