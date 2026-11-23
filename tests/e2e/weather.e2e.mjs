import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..', '..')
const DIST_DIR = path.join(ROOT_DIR, 'dist')

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

function startDistServer() {
  const indexHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'))
  const server = http.createServer((req, res) => {
    const reqUrl = new URL(req.url || '/', 'http://127.0.0.1')
    const safePath = decodeURIComponent(reqUrl.pathname).replace(/^\/+/, '')
    const candidatePath = path.resolve(DIST_DIR, safePath)

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
    res.end(indexHtml)
  })

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, port: server.address().port })
    })
  })
}

async function runWeatherE2E() {
  if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    throw new Error('請先執行 pnpm build 再執行 E2E 測試')
  }

  const { server, port } = await startDistServer()
  const origin = `http://127.0.0.1:${port}`
  const browser = await chromium.launch({ headless: true })

  try {
    const pageErrors = []
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await context.newPage()
    page.on('pageerror', (err) => pageErrors.push(err.message))

    // 1. 桌機版載入 /weather
    await page.goto(`${origin}/weather`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="climate-chart-canvas"]')

    const canvasBox = await page.locator('[data-testid="climate-chart-canvas"]').boundingBox()
    assert.ok(canvasBox && canvasBox.width > 100 && canvasBox.height > 100, '圖表 Canvas 應有有效寬高')

    // 2. 切換至葡萄牙之路與 8 月，確認區段卡更新
    await page.click('[data-testid="weather-route-portugues"]')
    await page.click('[data-testid="weather-month-8"]')
    await page.waitForSelector('[data-testid="weather-zone-card-portugues-porto"]')

    // 3. 驗證英文版路徑 /en/weather
    await page.goto(`${origin}/en/weather`, { waitUntil: 'networkidle' })
    const h1Text = await page.locator('h1').textContent()
    assert.ok(h1Text && h1Text.includes('Historical Weather'), '英文版標題應正確渲染')

    // 4. 模擬手機 375px 窄螢幕，檢查無橫向溢出
    await page.setViewportSize({ width: 375, height: 812 })
    await page.waitForTimeout(150)
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    })
    assert.equal(hasHorizontalOverflow, false, '375px 手機版不應出現水平捲軸溢出')
    assert.equal(pageErrors.length, 0, `不應出現頁面執行期錯誤: ${pageErrors.join('; ')}`)

    console.log('[e2e] weather.spec.mjs 全數通過（桌機圖表、雙語切換、375px RWD 無溢出）')
  } finally {
    await browser.close()
    await new Promise((resolve) => server.close(resolve))
  }
}

runWeatherE2E().catch((err) => {
  console.error('[e2e] 測試失敗:', err)
  process.exit(1)
})
