import { describe, it, expect } from 'vitest'
import { generatePackingTextChecklist } from '@/utils/packingExport'
import type { PackingItem } from '@/types/camino'

describe('generatePackingTextChecklist 純文字清單產生器', () => {
  const mockCategories = [
    { id: 'PACK', label: '背包系統' },
    { id: 'CLOTHING', label: '服飾穿搭' },
    { id: 'FOOTWEAR', label: '鞋襪足部' },
    { id: 'SLEEP', label: '睡眠防護' },
  ]

  const mockItems: PackingItem[] = [
    {
      id: 'pack_1',
      category: 'PACK',
      chineseName: '登山背包 38L',
      englishName: 'Hiking Backpack 38L',
      spanishName: 'Mochila',
      referenceRangeText: '1000g~1400g',
      unitWeightGrams: 1100,
      isChecked: true,
      quantity: 1,
      isWornOnBody: false,
      priority: 'ESSENTIAL',
    },
    {
      id: 'pack_2',
      category: 'PACK',
      chineseName: '攻頂包',
      englishName: 'Summit Pack',
      referenceRangeText: '150g~300g',
      unitWeightGrams: 200,
      isChecked: false, // 未勾選，應被排除
      quantity: 1,
      isWornOnBody: false,
      priority: 'OPTIONAL',
    },
    {
      id: 'cloth_1',
      category: 'CLOTHING',
      chineseName: '羊毛排汗衣',
      englishName: 'Wool T-Shirt',
      spanishName: 'Camiseta',
      referenceRangeText: '120g~180g',
      unitWeightGrams: 150,
      isChecked: true,
      quantity: 2, // 數量 2
      isWornOnBody: false,
      priority: 'ESSENTIAL',
    },
    {
      id: 'foot_1',
      category: 'FOOTWEAR',
      chineseName: '中筒登山鞋',
      englishName: 'Hiking Boots',
      spanishName: 'Botas',
      referenceRangeText: '800g~1200g',
      unitWeightGrams: 900,
      isChecked: true,
      quantity: 1,
      isWornOnBody: true, // 穿在身上
      priority: 'ESSENTIAL',
    },
    {
      id: 'sleep_1',
      category: 'SLEEP',
      chineseName: '羽絨睡袋',
      englishName: 'Sleeping Bag',
      referenceRangeText: '500g~800g',
      unitWeightGrams: 600,
      isChecked: false, // 睡眠防護全未勾選，分類應自動隱藏
      quantity: 1,
      isWornOnBody: false,
      priority: 'OPTIONAL',
    },
  ]

  const mockMeta = {
    backpackWeightKg: 1.4,
    wornWeightKg: 0.9,
    totalItemCount: 3,
    bodyWeightKg: 60,
  }

  it('TC-01: 正確過濾未勾選項，呈現極簡俐落之方格 ☐ 與分類標題，排除空分類', () => {
    const text = generatePackingTextChecklist(mockItems, mockCategories, mockMeta)

    // 包含純中文名稱，無外文名稱
    expect(text).toContain('登山背包 38L')
    expect(text).not.toContain('Mochila')
    expect(text).toContain('羊毛排汗衣')
    expect(text).not.toContain('Camiseta')
    expect(text).toContain('中筒登山鞋')
    expect(text).not.toContain('Botas')

    // 排除未勾選項目
    expect(text).not.toContain('攻頂包')
    expect(text).not.toContain('羽絨睡袋')

    // 睡眠防護無任何已勾選項，不應出現該分類大標題
    expect(text).not.toContain('睡眠防護')

    // 有項目的分類大標題應呈現
    expect(text).toContain('【背包系統】')
    expect(text).toContain('【服飾穿搭】')
    expect(text).toContain('【鞋襪足部】')
  })

  it('TC-02: 正確標註穿在身上的裝備與數量乘號、中置點 · 重量', () => {
    const text = generatePackingTextChecklist(mockItems, mockCategories, mockMeta)

    // 驗證身上穿戴標記與中置點重量
    expect(text).toContain('☐ 中筒登山鞋 [穿在身上] · 900g')

    // 驗證數量倍數計算 (150g * 2 = 300g) 與數量標示 ×2
    expect(text).toContain('☐ 羊毛排汗衣 ×2 · 300g')
  })

  it('TC-03: 正確格式化統計摘要與新版頁尾', () => {
    const text = generatePackingTextChecklist(mockItems, mockCategories, mockMeta)

    expect(text).toContain('背包淨重 1.40 kg ｜ 身上穿戴 0.90 kg ｜ 共 3 件 ｜ 10% 警戒線 6.0 kg')
    expect(text).toContain('Buen Camino! 祝朝聖之路平安順心')
  })

  it('TC-04: 當所有項目皆未勾選時，安全降級回傳乾淨的空清單框架', () => {
    const emptyMeta = { backpackWeightKg: 0, wornWeightKg: 0, totalItemCount: 0 }
    const text = generatePackingTextChecklist([], mockCategories, emptyMeta)

    expect(text).toContain('背包淨重 0.00 kg ｜ 身上穿戴 0.00 kg ｜ 共 0 件')
    expect(text).not.toContain('【背包系統】')
  })
})
