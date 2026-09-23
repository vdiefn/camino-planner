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
    // 啟用全部分類以測試全線裝備之穿戴互斥邏輯
    store.setAllCategories([...new Set(store.packingItems.map((i) => i.category))])

    // 找到穿在身上的項目（登山鞋 850g、遮陽帽 70g、登山杖 440g、護照正本 50g、朝聖者護照 40g）
    const wornItems = store.packingItems.filter((i) => i.isWornOnBody)
    expect(wornItems.length).toBeGreaterThan(0)

    const expectedWornGrams = wornItems.reduce((sum, i) => sum + i.unitWeightGrams * i.quantity, 0)
    expect(store.wornWeightGrams).toBe(expectedWornGrams)

    // 背包淨重中絕對不包含穿在身上的重量
    const backpackItems = store.packingItems.filter((i) => i.isChecked && !i.isWornOnBody)
    const expectedBackpackGrams = backpackItems.reduce((sum, i) => sum + i.unitWeightGrams * i.quantity, 0)
    expect(store.backpackWeightGrams).toBe(expectedBackpackGrams)
  })

  it('未顯示之分類絕對不計入負重累計，切換顯示後即時動態納入計算', () => {
    const store = usePackingStore()

    // 預設核心 5 大分類不含 HYGIENE（衛生用品）
    expect(store.activeCategories.includes('HYGIENE')).toBe(false)
    const initialWeight = store.backpackWeightGrams

    // 計算官方 HYGIENE 分類已勾選之背包重量
    const hygieneGrams = store
      .getItemsByCategory('HYGIENE')
      .filter((i) => i.isChecked && !i.isWornOnBody)
      .reduce((sum, i) => sum + i.unitWeightGrams * i.quantity, 0)
    expect(hygieneGrams).toBeGreaterThan(0)

    // 啟用顯示 HYGIENE 分類
    store.toggleCategory('HYGIENE')
    expect(store.activeCategories.includes('HYGIENE')).toBe(true)
    expect(store.backpackWeightGrams).toBe(initialWeight + hygieneGrams)

    // 再次收合 HYGIENE 分類
    store.toggleCategory('HYGIENE')
    expect(store.activeCategories.includes('HYGIENE')).toBe(false)
    expect(store.backpackWeightGrams).toBe(initialWeight)
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
    // 啟用全部分類以測試單一裝備累加
    store.setAllCategories([...new Set(store.packingItems.map((i) => i.category))])
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

  it('自訂全新分類裝備：應正確累計負重且能透過 getItemsByCategory 依自訂分類精準取得', () => {
    const store = usePackingStore()
    const initialGrams = store.backpackWeightGrams

    // 新增屬於全新自訂分類「攝影器材」的裝備
    store.addCustomItem({
      chineseName: '單眼相機腳架',
      englishName: 'Camera Tripod',
      category: '攝影器材',
      priority: 'OPTIONAL',
      referenceRangeText: '850g',
      isChecked: true,
      unitWeightGrams: 850,
      quantity: 1,
      isWornOnBody: false,
    })

    // 驗證背包負重正確累加 850g
    expect(store.backpackWeightGrams).toBe(initialGrams + 850)

    // 驗證能透過該自訂分類取得該項目
    const photoItems = store.getItemsByCategory('攝影器材')
    expect(photoItems.length).toBe(1)
    expect(photoItems[0].chineseName).toBe('單眼相機腳架')
    expect(photoItems[0].category).toBe('攝影器材')
  })

  it('防重複分類防禦：相同或包含空白的自訂分類應自動歸併至同一分類，不產生分裂', () => {
    const store = usePackingStore()

    // 1. 連續新增兩個帶有相同分類「攝影器材」的裝備（其中一個帶有前後空白模擬輸入防呆修剪）
    store.addCustomItem({
      chineseName: '單眼腳架',
      englishName: 'Tripod',
      category: '攝影器材',
      priority: 'OPTIONAL',
      referenceRangeText: '850g',
      isChecked: true,
      unitWeightGrams: 850,
      quantity: 1,
      isWornOnBody: false,
    })

    store.addCustomItem({
      chineseName: '長焦鏡頭',
      englishName: 'Lens',
      category: '  攝影器材  '.trim(),
      priority: 'OPTIONAL',
      referenceRangeText: '600g',
      isChecked: true,
      unitWeightGrams: 600,
      quantity: 1,
      isWornOnBody: false,
    })

    // 驗證兩件裝備均正確歸併於同一個「攝影器材」分類下
    const photoItems = store.getItemsByCategory('攝影器材')
    expect(photoItems.length).toBe(2)
    expect(photoItems.map((i) => i.chineseName)).toEqual(['單眼腳架', '長焦鏡頭'])
  })

  it('自我修復防衛層：應完整保留使用者輸入的全新自訂分類字串，不被強制降級或覆蓋', () => {
    const customItemWithNewCategory = {
      id: 'CUSTOM_CAMPING_01',
      chineseName: '鈦金屬高山爐頭',
      category: '炊事露營',
    }

    const sanitized = sanitizePackingState({
      customItems: [customItemWithNewCategory],
    })

    expect(sanitized.customItems.length).toBe(1)
    expect(sanitized.customItems[0].category).toBe('炊事露營')
  })

  it('刪除自訂分類功能：應一併移除該分類下所有裝備，並自動自負重中扣除', () => {
    const store = usePackingStore()

    // 新增自訂分類「攝影器材」之裝備
    store.addCustomItem({
      chineseName: '廣角鏡頭',
      englishName: 'Lens',
      category: '攝影器材',
      priority: 'OPTIONAL',
      referenceRangeText: '500g',
      isChecked: true,
      unitWeightGrams: 500,
      quantity: 1,
      isWornOnBody: false,
    })

    const weightWithItem = store.backpackWeightGrams
    expect(store.getItemsByCategory('攝影器材').length).toBeGreaterThan(0)

    // 執行刪除自訂分類
    store.removeCustomCategory('攝影器材')

    // 驗證該分類裝備已全數清空，且負重正確即時扣除
    expect(store.getItemsByCategory('攝影器材').length).toBe(0)
    expect(store.backpackWeightGrams).toBe(weightWithItem - 500)
  })

  it('排除官方分類後負重應精準扣除，且重設清單後官方核心分類保證100%全數復原', () => {
    const store = usePackingStore()

    // 初始狀態包含 SLEEP（睡眠防護）與 MEDICAL（個人藥物）
    expect(store.activeCategories.includes('SLEEP')).toBe(true)
    expect(store.activeCategories.includes('MEDICAL')).toBe(true)
    const initialGrams = store.backpackWeightGrams

    // 計算這兩大分類在背包中的重量
    const sleepGrams = store
      .getItemsByCategory('SLEEP')
      .filter((i) => i.isChecked && !i.isWornOnBody)
      .reduce((sum, i) => sum + i.unitWeightGrams * i.quantity, 0)
    const medicalGrams = store
      .getItemsByCategory('MEDICAL')
      .filter((i) => i.isChecked && !i.isWornOnBody)
      .reduce((sum, i) => sum + i.unitWeightGrams * i.quantity, 0)

    expect(sleepGrams).toBeGreaterThan(0)
    expect(medicalGrams).toBeGreaterThan(0)

    // 1. 排除「睡眠防護」與「個人藥物」
    store.removeActiveCategory('SLEEP')
    store.removeActiveCategory('MEDICAL')

    expect(store.activeCategories.includes('SLEEP')).toBe(false)
    expect(store.activeCategories.includes('MEDICAL')).toBe(false)
    // 驗證重量確實精準扣除
    expect(store.backpackWeightGrams).toBe(initialGrams - sleepGrams - medicalGrams)

    // 2. 執行重設清單
    store.resetToDefaults()

    // 驗證兩大核心分類保證 100% 完整回歸且重量重新計入
    expect(store.activeCategories.includes('SLEEP')).toBe(true)
    expect(store.activeCategories.includes('MEDICAL')).toBe(true)
    expect(store.backpackWeightGrams).toBe(initialGrams)
  })
})
