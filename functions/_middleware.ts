const EN_OG_IMAGE = 'https://camino-plan.com/og-cover-en.png'
const EN_TITLE = 'Camino de Santiago Planner & Packing Tool | Camino Plan'
const EN_DESCRIPTION =
  'Free minimalist planner for Camino de Santiago pilgrims. Daily stage distance calculator, 10% body weight packing checklist, budget estimator, and trailhead transit guides.'

/**
 * Cloudflare Pages Middleware
 * 當分享連結帶有 ?lang=en 時，於邊緣端將原始 HTML 之 OG / Meta 改寫為英文版與 og-cover-en.png，
 * 確保 LINE / Facebook / Discord / X 等不執行 JavaScript 的社群爬蟲能正確呈現英文預覽卡片。
 */
export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context
  const url = new URL(request.url)

  if ((request.method !== 'GET' && request.method !== 'HEAD') || url.searchParams.get('lang') !== 'en') {
    return next()
  }

  const response = await next()
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/html')) {
    return response
  }

  const metaOverrides: Record<string, string> = {
    'meta[name="description"]': EN_DESCRIPTION,
    'meta[property="og:title"]': EN_TITLE,
    'meta[property="og:description"]': EN_DESCRIPTION,
    'meta[property="og:locale"]': 'en_US',
    'meta[property="og:image"]': EN_OG_IMAGE,
    'meta[name="twitter:title"]': EN_TITLE,
    'meta[name="twitter:description"]': EN_DESCRIPTION,
    'meta[name="twitter:image"]': EN_OG_IMAGE,
  }

  let rewriter = new HTMLRewriter()
    .on('html', {
      element(el) {
        el.setAttribute('lang', 'en')
      },
    })
    .on('title', {
      element(el) {
        el.setInnerContent(EN_TITLE)
      },
    })

  for (const [selector, content] of Object.entries(metaOverrides)) {
    rewriter = rewriter.on(selector, {
      element(el) {
        el.setAttribute('content', content)
      },
    })
  }

  return rewriter.transform(response)
}
