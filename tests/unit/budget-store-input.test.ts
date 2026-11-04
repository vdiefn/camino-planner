import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBudgetStore } from '@/stores/budget'
import type { BudgetDetails } from '@/types/budget'

describe('Budget Store 完整輸入流與零值隔離測試', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('1. 在 CUSTOM 模式初始狀態下，所有欄位皆為 null，運算總額歸零', () => {
    const store = useBudgetStore()
    store.setPersona('CUSTOM')
    expect(store.persona).toBe('CUSTOM')
    expect(store.hasCustomized).toBe(false)

    // 所有自訂欄位均為 null（呈現完全空白狀態）
    const keys: (keyof BudgetDetails)[] = [
      'flightTwd',
      'gearTwd',
      'insuranceAndSimTwd',
      'lodgingEurPerDay',
      'foodEurPerDay',
      'laundryEurPerDay',
      'luggageTransferEurPerDay',
      'transitToStartEur',
      'transitFromEndEur',
      'emergencyFundEur',
    ]

    for (const key of keys) {
      expect(store.details[key]).toBeNull()
    }

    // 總額與各象限開銷皆安全防禦歸零
    expect(store.summary.grandTotalTwd).toBe(0)
    expect(store.summary.totalEur).toBe(0)
    expect(store.summary.dailyAvgEur).toBe(0)
  })

  it('2. 在洗衣雜支輸入 0 時，只有洗衣雜支為 0，其餘欄位維持 null，絕不連動跳出 0', () => {
    const store = useBudgetStore()
    store.setPersona('CUSTOM')

    // 使用者在洗衣雜支輸入 0
    store.updateDetail('laundryEurPerDay', 0)

    expect(store.hasCustomized).toBe(true)
    expect(store.details.laundryEurPerDay).toBe(0)

    // 驗證核心隔離：其他未填寫欄位必須維持 null，不可被污染為 0
    expect(store.details.flightTwd).toBeNull()
    expect(store.details.gearTwd).toBeNull()
    expect(store.details.insuranceAndSimTwd).toBeNull()
    expect(store.details.lodgingEurPerDay).toBeNull()
    expect(store.details.foodEurPerDay).toBeNull()
    expect(store.details.luggageTransferEurPerDay).toBeNull()
    expect(store.details.transitToStartEur).toBeNull()
    expect(store.details.transitFromEndEur).toBeNull()
    expect(store.details.emergencyFundEur).toBeNull()
  })

  it('3. 在住宿輸入 20 後，住宿為 20、洗衣維持 0、其餘維持 null', () => {
    const store = useBudgetStore()
    store.setPersona('CUSTOM')

    store.updateDetail('laundryEurPerDay', 0)
    store.updateDetail('lodgingEurPerDay', 20)

    expect(store.details.lodgingEurPerDay).toBe(20)
    expect(store.details.laundryEurPerDay).toBe(0)
    expect(store.details.foodEurPerDay).toBeNull()

    // 日均開銷應正確計算為 20 (20 + 0 + 0)
    expect(store.summary.dailyAvgEur).toBe(20)
    expect(store.customDailyAvgEur).toBe(20)
  })

  it('4. 刪空輸入框時傳入 null，該欄位重設回 null 維持空白', () => {
    const store = useBudgetStore()
    store.setPersona('CUSTOM')

    store.updateDetail('lodgingEurPerDay', 25)
    expect(store.details.lodgingEurPerDay).toBe(25)

    // 使用者按 Backspace 刪空
    store.updateDetail('lodgingEurPerDay', null)
    expect(store.details.lodgingEurPerDay).toBeNull()
    expect(store.summary.dailyAvgEur).toBe(0)
  })

  it('5. 從經典平衡型微調任一數值時，以該風格現有細項為基底並切換至 CUSTOM', () => {
    const store = useBudgetStore()
    expect(store.persona).toBe('STANDARD')
    expect(store.details.flightTwd).toBe(35000)
    expect(store.details.lodgingEurPerDay).toBe(20)

    // 在經典型下將住宿改為 25
    store.updateDetail('lodgingEurPerDay', 25)

    expect(store.persona).toBe('CUSTOM')
    expect(store.hasCustomized).toBe(true)
    expect(store.details.lodgingEurPerDay).toBe(25)
    // 其餘原本經典型的值完整保留
    expect(store.details.flightTwd).toBe(35000)
    expect(store.details.foodEurPerDay).toBe(25)
    expect(store.details.laundryEurPerDay).toBe(5)
    // 日均應更新為 25 + 25 + 5 = 55
    expect(store.customDailyAvgEur).toBe(55)
  })

  it('6. 點選重設時，自訂快照與數值徹底清空為 null', () => {
    const store = useBudgetStore()
    store.setPersona('CUSTOM')
    store.updateDetail('lodgingEurPerDay', 30)
    expect(store.hasCustomized).toBe(true)

    store.resetToDefaults()

    expect(store.hasCustomized).toBe(false)
    expect(store.details.lodgingEurPerDay).toBeNull()
    expect(store.customDailyAvgEur).toBe(0)
    expect(store.summary.grandTotalTwd).toBe(0)
  })
})
