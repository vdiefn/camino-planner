import { ref } from 'vue'

export interface UseAsyncLockOptions {
  /** 完成後的額外冷卻時間（毫秒），適用於等待 DOM 銷毀或瀏覽器視窗彈出的場景 */
  cooldownMs?: number
}

/**
 * 輕量非同步動作互斥鎖（Async Action Mutex Lock）：
 * 用於按鈕防連點、表單防重複提交、列印與匯出等副程式動作。
 *
 * 特性：
 * 1. 執行中自動拒絕所有重疊呼叫。
 * 2. 透過 try...finally 保證解鎖，杜絕狀態死鎖。
 * 3. 支援可選的完成後冷卻保護時間。
 */
export function useAsyncLock<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options?: UseAsyncLockOptions
) {
  const isBusy = ref(false)

  const execute = async (
    ...args: Parameters<T>
  ): Promise<ReturnType<T> | undefined> => {
    if (isBusy.value) return undefined

    isBusy.value = true
    try {
      return await asyncFn(...args)
    } finally {
      if (options?.cooldownMs && options.cooldownMs > 0) {
        setTimeout(() => {
          isBusy.value = false
        }, options.cooldownMs)
      } else {
        isBusy.value = false
      }
    }
  }

  return {
    isBusy,
    execute,
  }
}
