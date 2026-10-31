import { describe, it, expect, vi } from 'vitest'
import { useAsyncLock } from '@/composables/useAsyncLock'

describe('useAsyncLock 非同步動作互斥鎖單元測試', () => {
  it('TC-01: 正常執行並透傳回傳值，結束後自動解鎖', async () => {
    const mockAction = vi.fn(async (num: number) => {
      await new Promise((resolve) => setTimeout(resolve, 50))
      return num * 2
    })

    const { isBusy, execute } = useAsyncLock(mockAction)

    expect(isBusy.value).toBe(false)
    const promise = execute(5)
    expect(isBusy.value).toBe(true)

    const result = await promise
    expect(result).toBe(10)
    expect(isBusy.value).toBe(false)
    expect(mockAction).toHaveBeenCalledTimes(1)
  })

  it('TC-02: 快速連點時自動忽略重疊呼叫，僅執行首個請求（防連點）', async () => {
    const mockAction = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 80))
      return 'done'
    })

    const { isBusy, execute } = useAsyncLock(mockAction)

    const call1 = execute()
    const call2 = execute()
    const call3 = execute()

    expect(isBusy.value).toBe(true)

    const [res1, res2, res3] = await Promise.all([call1, call2, call3])

    expect(res1).toBe('done')
    expect(res2).toBeUndefined()
    expect(res3).toBeUndefined()
    expect(mockAction).toHaveBeenCalledTimes(1)
    expect(isBusy.value).toBe(false)
  })

  it('TC-03: 當函式拋出例外時，保證透過 finally 釋放鎖，杜絕永久死鎖', async () => {
    const mockAction = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30))
      throw new Error('Action failed')
    })

    const { isBusy, execute } = useAsyncLock(mockAction)

    expect(isBusy.value).toBe(false)
    await expect(execute()).rejects.toThrow('Action failed')
    expect(isBusy.value).toBe(false)

    // 驗證解鎖後仍可再次呼叫
    const normalAction = vi.fn(async () => 'recovered')
    const lock2 = useAsyncLock(normalAction)
    const res = await lock2.execute()
    expect(res).toBe('recovered')
  })

  it('TC-04: 支援 cooldownMs 冷卻時間，延長按鈕防連點保護期', async () => {
    vi.useFakeTimers()

    const mockAction = vi.fn(async () => 'ok')
    const { isBusy, execute } = useAsyncLock(mockAction, { cooldownMs: 300 })

    const p = execute()
    await p

    // 雖然 Promise 已解析，但冷卻期內 isBusy 仍為 true
    expect(isBusy.value).toBe(true)

    vi.advanceTimersByTime(299)
    expect(isBusy.value).toBe(true)

    vi.advanceTimersByTime(1)
    expect(isBusy.value).toBe(false)

    vi.useRealTimers()
  })
})
