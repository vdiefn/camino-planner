import { onUnmounted } from 'vue'
import { useAsyncLock } from './useAsyncLock'

export interface UsePrintOptions {
  /** 另存為 PDF 時的預設檔名產生器 */
  getFileName: () => string
  /** 紙張方向，預設為直向 portrait */
  orientation?: 'portrait' | 'landscape'
  /** 邊界設定，預設為 8mm 10mm 12mm 10mm */
  pageMargin?: string
  /** 列印結束後的回呼函式（例如關閉對話框） */
  onAfterPrint?: () => void
}

/**
 * 朝聖者工具專屬列印 Composable：
 * 1. 動態注入 @page 規則，列印結束後即刻自 DOM 銷毀，杜絕 SPA 全域樣式與直橫向競態污染。
 * 2. 備份並置換 document.title，讓使用者「另存為 PDF」時自動帶入適當檔名。
 * 3. 結合 useAsyncLock 避免連點與重疊觸發。
 * 4. 內建 afterprint 監聽、逾時兜底與 onUnmounted 銷毀保護。
 */
export function usePrint(options: UsePrintOptions) {
  const {
    getFileName,
    orientation = 'portrait',
    pageMargin = '8mm 10mm 12mm 10mm',
    onAfterPrint,
  } = options

  let pendingCleanup: (() => void) | null = null

  const cleanup = () => {
    if (pendingCleanup) {
      pendingCleanup()
      pendingCleanup = null
    }
  }

  onUnmounted(() => {
    cleanup()
  })

  const { isBusy: isPrinting, execute: handlePrint } = useAsyncLock(
    async () => {
      cleanup()

      const targetFileName = getFileName()
      const originalTitle = document.title
      document.title = targetFileName

      // 1. 動態建立獨立 @page 樣式標籤，防止跨彈窗全域方向覆蓋
      const styleId = 'camino-dynamic-print-page'
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) {
        existingStyle.remove()
      }

      const styleEl = document.createElement('style')
      styleEl.id = styleId
      styleEl.textContent = `
        @media print {
          @page {
            size: A4 ${orientation};
            margin: ${pageMargin};
          }
        }
      `
      document.head.appendChild(styleEl)

      // 2. 定義清理邏輯
      let isFinalized = false
      const finalize = () => {
        if (isFinalized) return
        isFinalized = true
        document.title = originalTitle
        styleEl.remove()
        window.removeEventListener('afterprint', finalize)
        pendingCleanup = null
        onAfterPrint?.()
      }

      pendingCleanup = () => {
        if (isFinalized) return
        isFinalized = true
        document.title = originalTitle
        styleEl.remove()
        window.removeEventListener('afterprint', finalize)
      }

      window.addEventListener('afterprint', finalize, { once: true })

      // 給予瀏覽器微小時間窗更新標題（供另存 PDF 自動帶入檔名）
      await new Promise((resolve) => setTimeout(resolve, 50))
      window.print()

      // 逾時安全兜底：若瀏覽器未觸發 afterprint（例如特定行動端），於 5 秒後安全復原
      setTimeout(() => {
        if (document.title === targetFileName) {
          finalize()
        }
      }, 5000)
    },
    { cooldownMs: 1000 }
  )

  return {
    isPrinting,
    handlePrint,
  }
}
