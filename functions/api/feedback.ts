interface Env {
  WEB3FORMS_ACCESS_KEY?: string
  DISCORD_WEBHOOK_URL?: string
  TELEGRAM_BOT_TOKEN?: string
  TELEGRAM_CHAT_ID?: string
  RESEND_API_KEY?: string
  FEEDBACK_TO_EMAIL?: string
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context
    const body: FeedbackPayload = await request.json()

    // 1. 防機器人蜜罐檢查 (若機器人填寫了隱藏欄位直接靜默忽略，避免垃圾信)
    if (body.botField) {
      return new Response(JSON.stringify({ success: true, message: 'Received' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 2. 基本內容校驗
    if (!body.content || body.content.trim().length === 0) {
      return new Response(JSON.stringify({ success: false, error: '請輸入回饋內容' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const categoryText = CATEGORY_LABELS[body.category] || '💬 意見回饋'
    const targetText = body.target?.trim() ? `\n📌 相關對象：${body.target.trim()}` : ''
    const contactText = body.contact?.trim() ? `\n👤 聯絡方式：${body.contact.trim()}` : '\n👤 聯絡方式：未填寫（匿名）'
    const formattedContent = body.content.trim()

    const emailSubject = `[Camino Plan 回饋] ${categoryText}${body.target?.trim() ? ' - ' + body.target.trim() : ''}`

    // 追蹤各通道的發送結果
    let isAnyChannelSuccess = false
    const configuredChannels: string[] = []
    const failedChannels: string[] = []

    // 3. 通道 A：Web3Forms (優先轉發至設定好的 Email 信箱)
    if (env.WEB3FORMS_ACCESS_KEY) {
      configuredChannels.push('Web3Forms')
      try {
        const web3Res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            access_key: env.WEB3FORMS_ACCESS_KEY,
            subject: emailSubject,
            from_name: 'Camino Plan 網站回饋通知',
            回饋類別: categoryText,
            關聯目標: body.target?.trim() || '全站 / 無特定',
            聯絡資訊: body.contact?.trim() || '匿名',
            回饋內容: formattedContent
          })
        })

        const web3Data = (await web3Res.json().catch(() => ({}))) as {
          success?: boolean
          message?: string
        }

        if (web3Res.ok && web3Data.success) {
          isAnyChannelSuccess = true
        } else {
          console.error('Web3Forms API 拒絕或失敗:', web3Data.message || web3Res.statusText)
          failedChannels.push('Web3Forms')
        }
      } catch (err) {
        console.error('Web3Forms 網路請求失敗:', err)
        failedChannels.push('Web3Forms')
      }
    }

    // 4. 通道 B：Discord Webhook (若有配置)
    if (env.DISCORD_WEBHOOK_URL) {
      configuredChannels.push('Discord')
      const fullMessage = `【Camino Plan 收到新回饋】${categoryText}${targetText}${contactText}\n\n📝 內容：\n${formattedContent}`
      try {
        const discordRes = await fetch(env.DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: fullMessage,
            embeds: [
              {
                title: categoryText,
                color: body.category === 'feature_request' ? 0xf59e0b : body.category === 'data_correction' ? 0x10b981 : body.category === 'bug_report' ? 0xef4444 : 0x6366f1,
                fields: [
                  ...(body.target?.trim() ? [{ name: '相關對象', value: body.target.trim(), inline: true }] : []),
                  { name: '聯絡方式', value: body.contact?.trim() || '匿名', inline: true },
                  { name: '詳細內容', value: formattedContent }
                ],
                timestamp: new Date().toISOString()
              }
            ]
          })
        })
        if (discordRes.ok) {
          isAnyChannelSuccess = true
        } else {
          failedChannels.push('Discord')
        }
      } catch (err) {
        console.error('Discord Webhook 發送失敗:', err)
        failedChannels.push('Discord')
      }
    }

    // 5. 通道 C：Telegram Bot (若有配置)
    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      configuredChannels.push('Telegram')
      const telegramUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`
      const fullMessage = `【Camino Plan 收到新回饋】${categoryText}${targetText}${contactText}\n\n📝 內容：\n${formattedContent}`
      try {
        const tgRes = await fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: fullMessage,
            parse_mode: 'Markdown'
          })
        })
        if (tgRes.ok) {
          isAnyChannelSuccess = true
        } else {
          failedChannels.push('Telegram')
        }
      } catch (err) {
        console.error('Telegram 發送失敗:', err)
        failedChannels.push('Telegram')
      }
    }

    // 6. 通道 D：Resend 寄信 (若有配置)
    if (env.RESEND_API_KEY && env.FEEDBACK_TO_EMAIL) {
      configuredChannels.push('Resend')
      const fullMessage = `【Camino Plan 收到新回饋】${categoryText}${targetText}${contactText}\n\n📝 內容：\n${formattedContent}`
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'Camino Plan <onboarding@resend.dev>',
            to: [env.FEEDBACK_TO_EMAIL],
            subject: emailSubject,
            text: fullMessage
          })
        })
        if (resendRes.ok) {
          isAnyChannelSuccess = true
        } else {
          failedChannels.push('Resend')
        }
      } catch (err) {
        console.error('Resend 發送失敗:', err)
        failedChannels.push('Resend')
      }
    }

    // 7. 本機測試模式（若完全未配置任何通道環境變數，印至主控台以利本地開發）
    if (configuredChannels.length === 0) {
      console.log('[Feedback Received - Local/Dev Mode]:', emailSubject, formattedContent)
      return new Response(JSON.stringify({ success: true, message: '本機測試模式：已接收回饋' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 8. 生產環境結果判定（獵殺靜默吞錯）：若配置了發送管道但全數發送失敗，主動回傳錯誤
    if (!isAnyChannelSuccess) {
      console.error('所有回饋轉發通道皆失敗:', failedChannels.join(', '))
      return new Response(
        JSON.stringify({
          success: false,
          error: '回饋發送服務暫時無法連線，請稍後再試或直接發送至聯絡信箱'
        }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(JSON.stringify({ success: true, message: '感謝您的回饋！' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('處理回饋時發生例外:', error)
    return new Response(JSON.stringify({ success: false, error: '伺服器處理回饋時發生錯誤，請稍後再試' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
