import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PackingItem, PackingCategory } from '@/types/camino'
import { packingItems as defaultPackingItems } from '@/data/packingItems'

export interface UserItemOverride {
  isChecked?: boolean
  isWornOnBody?: boolean
  unitWeightGrams?: number
  quantity?: number
}

// 自我修復防禦層：逐欄型別檢查與預設值補齊，徹底杜絕執行時期例外與白畫面
export function sanitizePackingState(raw: any) {
  // 1. 體重校驗 (確保為正數，否則安全回退 60)
  const bodyWeightKg =
    typeof raw?.bodyWeightKg === 'number' && !isNaN(raw.bodyWeightKg) && raw.bodyWeightKg > 0
      ? raw.bodyWeightKg
      : 60

  // 2. 官方裝備狀態字典校驗 (逐欄容錯修復)
  const userItemStates: Record<string, UserItemOverride> = {}
  if (raw?.userItemStates && typeof raw.userItemStates === 'object' && !Array.isArray(raw.userItemStates)) {
    for (const [id, state] of Object.entries(raw.userItemStates)) {
      if (state && typeof state === 'object') {
        const s = state as Record<string, unknown>
        userItemStates[id] = {
          isChecked: typeof s.isChecked === 'boolean' ? s.isChecked : undefined,
          isWornOnBody: typeof s.isWornOnBody === 'boolean' ? s.isWornOnBody : undefined,
          unitWeightGrams:
            typeof s.unitWeightGrams === 'number' && !isNaN(s.unitWeightGrams)
              ? Math.max(0, s.unitWeightGrams)
              : undefined,
          quantity:
            typeof s.quantity === 'number' && !isNaN(s.quantity)
              ? Math.max(1, Math.round(s.quantity))
              : undefined,
        }
      }
    }
  }

  // 3. 自訂裝備校驗與欄位自動補齊 (Defensive Auto-fill)
  const customItems: PackingItem[] = []
  if (Array.isArray(raw?.customItems)) {
    for (const item of raw.customItems) {
      if (item && typeof item === 'object' && item.id && item.chineseName) {
        customItems.push({
          id: String(item.id),
          chineseName: String(item.chineseName),
          englishName: typeof item.englishName === 'string' ? item.englishName : '',
          spanishName: typeof item.spanishName === 'string' ? item.spanishName : '',
          category: typeof item.category === 'string' ? (item.category as PackingCategory) : 'OTHER',
          priority: typeof item.priority === 'string' ? (item.priority as any) : 'OPTIONAL',
          referenceRangeText: typeof item.referenceRangeText === 'string' ? item.referenceRangeText : '',
          proTips: typeof item.proTips === 'string' ? item.proTips : undefined,
          isChecked: typeof item.isChecked === 'boolean' ? item.isChecked : true,
          unitWeightGrams:
            typeof item.unitWeightGrams === 'number' && !isNaN(item.unitWeightGrams)
              ? Math.max(0, item.unitWeightGrams)
              : 0,
          quantity:
            typeof item.quantity === 'number' && !isNaN(item.quantity)
              ? Math.max(1, Math.round(item.quantity))
              : 1,
          isWornOnBody: typeof item.isWornOnBody === 'boolean' ? item.isWornOnBody : false,
          isCustom: true,
        })
      }
    }
  }

  return {
    version: typeof raw?.version === 'number' ? raw.version : 1,
    bodyWeightKg,
    userItemStates,
    customItems,
  }
}

export const usePackingStore = defineStore(
  'packing',
  () => {
    // 0. 資料綱要版本號（為未來架構防護預留）
    const version = ref<number>(1)

    // 1. 使用者體重 (kg)
    const bodyWeightKg = ref<number>(60)

    // 2. 使用者對官方裝備之狀態差集（Key 為裝備 ID，只記錄改動，不存品名文字！）
    const userItemStates = ref<Record<string, UserItemOverride>>({})

    // 3. 使用者自訂裝備（非官方預設，需完整保存）
    const customItems = ref<PackingItem[]>([])

    // 4. 動態組合完整裝備清單：永遠以代碼中最新官方資料為基底 + 套用使用者差集 + 串接自訂項目
    const packingItems = computed<PackingItem[]>(() => {
      const officialItems = defaultPackingItems.map((defaultItem) => {
        const override = userItemStates.value[defaultItem.id]
        if (!override) {
          return { ...defaultItem }
        }
        return {
          ...defaultItem, // 永遠即時繼承最新代碼中的中英西文、說明與分類！
          isChecked: override.isChecked ?? defaultItem.isChecked,
          isWornOnBody: override.isWornOnBody ?? defaultItem.isWornOnBody,
          unitWeightGrams: override.unitWeightGrams ?? defaultItem.unitWeightGrams,
          quantity: override.quantity ?? defaultItem.quantity,
        }
      })

      return [...officialItems, ...customItems.value]
    })

    // 輔助函式：取得或初始化官方項目的差集物件
    function ensureOverride(id: string): UserItemOverride {
      if (!userItemStates.value[id]) {
        const defaultItem = defaultPackingItems.find((i) => i.id === id)
        userItemStates.value[id] = {
          isChecked: defaultItem?.isChecked ?? true,
          isWornOnBody: defaultItem?.isWornOnBody ?? false,
          unitWeightGrams: defaultItem?.unitWeightGrams ?? 0,
          quantity: defaultItem?.quantity ?? 1,
        }
      }
      return userItemStates.value[id]
    }

    // 5. 動作 Actions
    function toggleItemCheck(id: string) {
      const customItem = customItems.value.find((i) => i.id === id)
      if (customItem) {
        customItem.isChecked = !customItem.isChecked
        return
      }
      const override = ensureOverride(id)
      override.isChecked = !override.isChecked
    }

    function toggleWornOnBody(id: string) {
      const customItem = customItems.value.find((i) => i.id === id)
      if (customItem) {
        customItem.isWornOnBody = !customItem.isWornOnBody
        return
      }
      const override = ensureOverride(id)
      override.isWornOnBody = !override.isWornOnBody
    }

    function updateItemWeight(id: string, weightGrams: number) {
      const validWeight = Math.max(0, weightGrams)
      const customItem = customItems.value.find((i) => i.id === id)
      if (customItem) {
        customItem.unitWeightGrams = validWeight
        return
      }
      const override = ensureOverride(id)
      override.unitWeightGrams = validWeight
    }

    function updateItemQuantity(id: string, quantity: number) {
      const validQty = Math.max(1, quantity)
      const customItem = customItems.value.find((i) => i.id === id)
      if (customItem) {
        customItem.quantity = validQty
        return
      }
      const override = ensureOverride(id)
      override.quantity = validQty
    }

    function addCustomItem(customItem: Omit<PackingItem, 'id' | 'isCustom'>) {
      const id = `CUSTOM_${Date.now()}`
      customItems.value.push({
        ...customItem,
        id,
        isCustom: true,
      })
    }

    function removeCustomItem(id: string) {
      customItems.value = customItems.value.filter((i) => i.id !== id)
    }

    function resetToDefaults() {
      bodyWeightKg.value = 60
      userItemStates.value = {}
      customItems.value = []
    }

    // 相容保留（供 App.vue 或外部呼叫），差集架構下無需再執行手動覆寫
    function syncWithLatestDefaults() {
      // 差集模式下，官方文字已由 computed 即時讀取最新代碼，無需額外遍歷
    }

    // 6. Computed 試算統計數據
    const backpackWeightGrams = computed(() => {
      return packingItems.value
        .filter((i) => i.isChecked && !i.isWornOnBody)
        .reduce((sum, i) => sum + i.unitWeightGrams * i.quantity, 0)
    })

    const backpackWeightKg = computed(() => {
      return Number((backpackWeightGrams.value / 1000).toFixed(2))
    })

    const wornWeightGrams = computed(() => {
      return packingItems.value
        .filter((i) => i.isChecked && i.isWornOnBody)
        .reduce((sum, i) => sum + i.unitWeightGrams * i.quantity, 0)
    })

    const wornWeightKg = computed(() => {
      return Number((wornWeightGrams.value / 1000).toFixed(2))
    })

    const maxRecommendedWeightKg = computed(() => {
      return Number((bodyWeightKg.value * 0.1).toFixed(2))
    })

    const isOverweight = computed(() => {
      return backpackWeightKg.value > maxRecommendedWeightKg.value
    })

    const weightPercentage = computed(() => {
      if (!bodyWeightKg.value || bodyWeightKg.value <= 0) return 0
      return Number(((backpackWeightKg.value / bodyWeightKg.value) * 100).toFixed(1))
    })

    function getItemsByCategory(category: PackingCategory) {
      return packingItems.value.filter((i) => i.category === category)
    }

    return {
      version,
      bodyWeightKg,
      userItemStates,
      customItems,
      packingItems,
      syncWithLatestDefaults,
      toggleItemCheck,
      toggleWornOnBody,
      updateItemWeight,
      updateItemQuantity,
      addCustomItem,
      removeCustomItem,
      resetToDefaults,
      backpackWeightGrams,
      backpackWeightKg,
      wornWeightGrams,
      wornWeightKg,
      maxRecommendedWeightKg,
      isOverweight,
      weightPercentage,
      getItemsByCategory,
    }
  },
  {
    persist: {
      pick: ['version', 'bodyWeightKg', 'userItemStates', 'customItems'],
      serializer: {
        serialize: JSON.stringify,
        deserialize: (rawString: string) => {
          try {
            return sanitizePackingState(JSON.parse(rawString))
          } catch {
            return sanitizePackingState({})
          }
        },
      },
    },
  },
)
