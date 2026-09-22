import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePackingStore, sanitizePackingState } from '../src/stores/packing'

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

  it('差集架構下，官方裝備永遠即時繼承最新文字，同時完美保留使用者之重量與勾選微調', () => {
    const store = usePackingStore()

    // 模擬使用者自訂修改了雨衣的重量與勾選狀態
    store.updateItemWeight('RAIN_JACKET', 888)
    store.toggleItemCheck('RAIN_JACKET')

    const targetItem = store.packingItems.find((i) => i.id === 'RAIN_JACKET')!

    // 驗證使用者的個人自訂狀態被存放在差集中並正確反映在清單上
    expect(targetItem.unitWeightGrams).toBe(888)
    expect(targetItem.isChecked).toBe(false)

    // 驗證官方文字永遠動態繼承自最新程式碼資料庫
    expect(targetItem.chineseName).toBe('雨衣')
    expect(targetItem.englishName).toBe('Rain Jacket / Poncho')
    expect(targetItem.spanishName).toBe('Chubasquero / Chaqueta impermeable')
  })

  it('執行 resetToDefaults 時應清空所有使用者差集與自訂裝備，還原為純淨官方預設清單', () => {
    const store = usePackingStore()

    // 進行微調並加入自訂裝備
    store.updateItemWeight('RAIN_JACKET', 9999)
    store.addCustomItem({
      chineseName: '自訂物品',
      englishName: 'Custom Item',
      category: 'OTHER',
      priority: 'OPTIONAL',
      referenceRangeText: '100g',
      isChecked: true,
      unitWeightGrams: 100,
      quantity: 1,
      isWornOnBody: false,
    })

    expect(store.customItems.length).toBe(1)
    expect(Object.keys(store.userItemStates).length).toBeGreaterThan(0)

    // 執行重設
    store.resetToDefaults()

    // 驗證差集與自訂項目清空
    expect(store.customItems.length).toBe(0)
    expect(Object.keys(store.userItemStates).length).toBe(0)
    expect(store.bodyWeightKg).toBe(60)

    // 清單應完全還原為官方預設值
    const rainJacket = store.packingItems.find((i) => i.id === 'RAIN_JACKET')!
    expect(rainJacket.unitWeightGrams).not.toBe(9999)
  })

  it('自我修復防衛層：應校正負數或非法體重，並安全回退至預設值 60', () => {
    // 模擬受污染的非數字或負數體重
    const corruptedState1 = sanitizePackingState({ bodyWeightKg: -10 })
    expect(corruptedState1.bodyWeightKg).toBe(60)

    const corruptedState2 = sanitizePackingState({ bodyWeightKg: NaN })
    expect(corruptedState2.bodyWeightKg).toBe(60)

    const corruptedState3 = sanitizePackingState({ bodyWeightKg: '75' })
    expect(corruptedState3.bodyWeightKg).toBe(60)

    const validState = sanitizePackingState({ bodyWeightKg: 72 })
    expect(validState.bodyWeightKg).toBe(72)
  })

  it('自我修復防衛層：應逐欄修復官方狀態字典之異常數值（負重轉為0、數量最少為1），其餘欄位完好保留', () => {
    const raw = {
      userItemStates: {
        RAIN_JACKET: {
          isChecked: true,
          unitWeightGrams: -50, // 異常負重量
          quantity: -2, // 異常負數量
        },
        SLEEP_BAG: {
          isChecked: false,
          unitWeightGrams: 750,
          quantity: 2,
        },
      },
    }

    const sanitized = sanitizePackingState(raw)

    // 驗證 RAIN_JACKET 異常欄位已自動修復
    expect(sanitized.userItemStates.RAIN_JACKET.isChecked).toBe(true)
    expect(sanitized.userItemStates.RAIN_JACKET.unitWeightGrams).toBe(0)
    expect(sanitized.userItemStates.RAIN_JACKET.quantity).toBe(1)

    // 驗證 SLEEP_BAG 正常欄位 100% 完整保留
    expect(sanitized.userItemStates.SLEEP_BAG.isChecked).toBe(false)
    expect(sanitized.userItemStates.SLEEP_BAG.unitWeightGrams).toBe(750)
    expect(sanitized.userItemStates.SLEEP_BAG.quantity).toBe(2)
  })

  it('自我修復防衛層：自訂裝備缺少新欄位時應自動補齊預設值，杜絕執行時期例外', () => {
    // 模擬歷史舊資料中的自訂裝備（缺少 spanishName、缺少 quantity、重量為 undefined）
    const legacyCustomItem = {
      id: 'CUSTOM_LEGACY_01',
      chineseName: '老式手電筒',
      category: 'ELECTRONICS',
    }

    const sanitized = sanitizePackingState({
      customItems: [legacyCustomItem],
    })

    expect(sanitized.customItems.length).toBe(1)
    const item = sanitized.customItems[0]

    // 驗證缺漏欄位已被安全賦予預設值，避免程式調用 string 或 number 方法時當機
    expect(item.id).toBe('CUSTOM_LEGACY_01')
    expect(item.chineseName).toBe('老式手電筒')
    expect(item.spanishName).toBe('')
    expect(item.englishName).toBe('')
    expect(item.quantity).toBe(1)
    expect(item.unitWeightGrams).toBe(0)
    expect(item.isChecked).toBe(true)
    expect(item.isWornOnBody).toBe(false)
  })
})
