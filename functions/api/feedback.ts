interface Env {
  EMAIL_WORKER?: {
    fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  }
}

interface FeedbackPayload {
  category: 'feature_request' | 'data_correction' | 'bug_report' | 'general'
  target?: string
  content: string
  contact?: string
  botField?: string // 蜜罐欄位 (Honeypot)
}

const CATEGORY_LABELS: Record<string, string> = {
  feature_request: '💡 功能許願與建議',
  data_correction: '🏠 資料勘誤與補充',
  bug_report: '🐞 功能異常回報 (Bug)',
  general: '💬 其他回饋 / 朝聖心得'
}

const PROD_ORIGIN_REGEX = /^https:\/\/([a-z0-9-]+\.)?camino-plan\.com$/
const LOCAL_ORIGIN_REGEX = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/
const MAX_BODY_CHARS = 8192
const MAX_CONTENT_LENGTH = 2000
const MAX_FIELD_LENGTH = 120
const UPSTREAM_TIMEOUT_MS = 5000

/** 移除換行與不可見控制字元，防止郵件主旨斷行與日誌注入 */
function stripControlChars(value: string): string {
  return value.replace(/[\r\n\x00-\x1f\x7f]/g, ' ').trim()
}

function jsonResponse(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store'
    }
  })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context

    // 0. 強制來源標頭 (Origin) 白名單校驗與 Content-Length 前置攔截（防範跨站濫用與超大請求 DoS）
    const reqHost = new URL(request.url).hostname
    const isLocalReq = reqHost === 'localhost' || reqHost === '127.0.0.1'
    const origin = request.headers.get('Origin')
    const isAllowedOrigin =
      Boolean(origin) &&
      (PROD_ORIGIN_REGEX.test(origin!) || (isLocalReq && LOCAL_ORIGIN_REGEX.test(origin!)))
    if (!isAllowedOrigin) {
      return jsonResponse({ success: false, error: '非法請求來源' }, 403)
    }

    const contentLength = Number(request.headers.get('Content-Length') || 0)
    if (contentLength > MAX_BODY_CHARS) {
      return jsonResponse({ success: false, error: '回饋內容超過長度上限' }, 413)
    }

    const rawText = await request.text()
    if (rawText.length > MAX_BODY_CHARS) {
      return jsonResponse({ success: false, error: '回饋內容超過長度上限' }, 413)
    }

    let body: FeedbackPayload
    try {
      body = JSON.parse(rawText) as FeedbackPayload
    } catch {
      return jsonResponse({ success: false, error: '無效的 JSON 格式' }, 400)
    }

    // 1. 防機器人蜜罐檢查 (若機器人填寫了隱藏欄位直接靜默忽略，避免垃圾信)
    if (body.botField) {
      return jsonResponse({ success: true, message: 'Received' }, 200)
    }

    // 2. 嚴格型別與長度清洗
    const formattedContent =
      typeof body.content === 'string'
        ? body.content.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '').trim().slice(0, MAX_CONTENT_LENGTH)
        : ''
    const safeTarget =
      typeof body.target === 'string'
        ? stripControlChars(body.target).slice(0, MAX_FIELD_LENGTH)
        : ''
    const safeContact =
      typeof body.contact === 'string'
        ? stripControlChars(body.contact).slice(0, MAX_FIELD_LENGTH)
        : ''

    if (!formattedContent) {
      return jsonResponse({ success: false, error: '請輸入回饋內容' }, 400)
    }

    const categoryText = Object.hasOwn(CATEGORY_LABELS, body.category)
      ? CATEGORY_LABELS[body.category]
      : '💬 意見回饋'
    const targetText = safeTarget ? `\n📌 相關對象：${safeTarget}` : ''
    const contactText = safeContact ? `\n👤 聯絡方式：${safeContact}` : '\n👤 聯絡方式：未填寫（匿名）'

    const emailSubject = `[Camino Plan 回饋] ${categoryText}${safeTarget ? ' - ' + safeTarget : ''}`
    const fullMessage = `【Camino Plan 收到新回饋】${categoryText}${targetText}${contactText}\n\n📝 內容：\n${formattedContent}`

    // 3. 本機測試模式（若未綁定 EMAIL_WORKER，印至主控台以利本地開發）
    if (!env.EMAIL_WORKER) {
      console.log('[Feedback Received - Local/Dev Mode]:', emailSubject, formattedContent)
      return jsonResponse({ success: true, message: '本機測試模式：已接收回饋' }, 200)
    }

    // 4. 生產環境：透過 Cloudflare Email Worker (Service Binding) 轉發信件
    try {
      const workerRes = await env.EMAIL_WORKER.fetch('https://internal/send', {
        method: 'POST',
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          body: fullMessage
        })
      })
      if (!workerRes.ok) {
        console.error('Cloudflare Email Worker 回應錯誤:', workerRes.status)
        return jsonResponse(
          {
            success: false,
            error: '回饋發送服務暫時無法連線，請稍後再試或直接發送至聯絡信箱'
          },
          502
        )
      }
    } catch (err) {
      console.error('Cloudflare Email Worker 呼叫失敗:', err)
      return jsonResponse(
        {
          success: false,
          error: '回饋發送服務暫時無法連線，請稍後再試或直接發送至聯絡信箱'
        },
        502
      )
    }

    return jsonResponse({ success: true, message: '感謝您的回饋！' }, 200)
  } catch (error) {
    console.error('處理回饋時發生例外:', error)
    return jsonResponse({ success: false, error: '伺服器處理回饋時發生錯誤，請稍後再試' }, 500)
  }
}
