import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePackingStore } from '../src/stores/packing'

describe('裝備負重試算核心測試 (Packing Calculator Engine)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('體重 10% 負重警戒上限計算應精確 (65kg ➔ 6.50kg, 50kg ➔ 5.00kg)', () => {
    const store = usePackingStore()

    store.bodyWeightKg = 65
    expect(store.maxRecommendedWeightKg).toBe(6.5)

    store.bodyWeightKg = 50
    expect(store.maxRecommendedWeightKg).toBe(5.0)

    store.bodyWeightKg = 73.5
    expect(store.maxRecommendedWeightKg).toBe(7.35)
  })

  it('勾選穿在身上 (isWornOnBody: true) 的裝備絕對不計入背包淨負重', () => {
    const store = usePackingStore()

    // 找到穿在身上的項目（登山鞋 850g、遮陽帽 70g、登山杖 440g、護照 90g）
    const wornItems = store.packingItems.filter((i) => i.isWornOnBody)
    expect(wornItems.length).toBeGreaterThan(0)

    const expectedWornGrams = wornItems.reduce((sum, i) => sum + i.unitWeightGrams * i.quantity, 0)
    expect(store.wornWeightGrams).toBe(expectedWornGrams)

    // 背包淨重中絕對不包含穿在身上的重量
    const backpackItems = store.packingItems.filter((i) => i.isChecked && !i.isWornOnBody)
    const expectedBackpackGrams = backpackItems.reduce((sum, i) => sum + i.unitWeightGrams * i.quantity, 0)
    expect(store.backpackWeightGrams).toBe(expectedBackpackGrams)
  })

  it('單項裝備數量變更時，該品項總重應正確乘以倍率 (如羊毛襪 70g × 3 = 210g)', () => {
    const store = usePackingStore()
    const socks = store.packingItems.find((i) => i.id === 'MERINO_SOCKS')!

    expect(socks).toBeDefined()
    expect(socks.unitWeightGrams).toBe(70)
    expect(socks.quantity).toBe(3)

    const initialWeight = store.backpackWeightGrams

    // 將襪子數量增加至 5 雙
    store.updateItemQuantity('MERINO_SOCKS', 5)
    expect(store.backpackWeightGrams).toBe(initialWeight + 70 * 2)
  })

  it('背包淨負重超過體重 10% 時應精確切換為超標狀態 (isOverweight)', () => {
    const store = usePackingStore()
    store.bodyWeightKg = 40 // 40kg 體重，警戒線為 4.0kg

    // 預設裝備背包淨重約 4~5kg，對 40kg 體重應判定為超標
    if (store.backpackWeightKg > 4.0) {
      expect(store.isOverweight).toBe(true)
    }

    // 調整體重為 100kg，警戒線為 10.0kg，此時應為安全綠燈
    store.bodyWeightKg = 100
    expect(store.isOverweight).toBe(false)
  })

  it('新增自訂裝備後，背包淨負重與百分比應即時累加', () => {
    const store = usePackingStore()
    const initialGrams = store.backpackWeightGrams

    store.addCustomItem({
      chineseName: '吹風機',
      englishName: 'Hair Dryer',
      category: 'ELECTRONICS',
      priority: 'OPTIONAL',
      referenceRangeText: '300g~500g',
      isChecked: true,
      unitWeightGrams: 400,
      quantity: 1,
      isWornOnBody: false,
    })

    expect(store.backpackWeightGrams).toBe(initialGrams + 400)
    expect(store.packingItems.some((i) => i.chineseName === '吹風機' && i.isCustom)).toBe(true)
  })

  it('切換穿戴狀態時，背包負重與穿戴負重應精準互換', () => {
    const store = usePackingStore()
    const rainJacket = store.packingItems.find((i) => i.id === 'RAIN_JACKET')!
    expect(rainJacket.isWornOnBody).toBe(false)

    const jacketWeight = rainJacket.unitWeightGrams * rainJacket.quantity
    const initialBackpack = store.backpackWeightGrams
    const initialWorn = store.wornWeightGrams

    // 切換為穿在身上
    store.toggleWornOnBody('RAIN_JACKET')
    expect(store.backpackWeightGrams).toBe(initialBackpack - jacketWeight)
    expect(store.wornWeightGrams).toBe(initialWorn + jacketWeight)
  })

  it('執行 syncWithLatestDefaults 時應自動補齊官方新增的裝備，且保留使用者既有自訂設定', () => {
    const store = usePackingStore()

    // 模擬本機僅存有 1 筆舊裝備，且使用者手動修改了重量
    store.packingItems = [
      {
        ...store.packingItems[0],
        unitWeightGrams: 9999,
        isChecked: false,
      },
    ]

    expect(store.packingItems.length).toBe(1)

    // 執行同步
    store.syncWithLatestDefaults()

    // 驗證原本第一筆的自訂修改完全保留
    expect(store.packingItems[0].unitWeightGrams).toBe(9999)
    expect(store.packingItems[0].isChecked).toBe(false)

    // 驗證官方其餘 22 筆裝備成功被自動補齊
    expect(store.packingItems.length).toBeGreaterThan(20)
  })
})
