import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PackingItem, PackingCategory } from '@/types/camino'
import { packingItems as defaultPackingItems } from '@/data/packingItems'

export const usePackingStore = defineStore(
  'packing',
  () => {
    // 1. 使用者體重 (kg)
    const bodyWeightKg = ref<number>(65)

    // 2. 裝備清單
    const packingItems = ref<PackingItem[]>(JSON.parse(JSON.stringify(defaultPackingItems)))

    // 3. 動作 Actions
    function toggleItemCheck(id: string) {
      const item = packingItems.value.find((i) => i.id === id)
      if (item) {
        item.isChecked = !item.isChecked
      }
    }

    function toggleWornOnBody(id: string) {
      const item = packingItems.value.find((i) => i.id === id)
      if (item) {
        item.isWornOnBody = !item.isWornOnBody
      }
    }

    function updateItemWeight(id: string, weightGrams: number) {
      const item = packingItems.value.find((i) => i.id === id)
      if (item) {
        item.unitWeightGrams = Math.max(0, weightGrams)
      }
    }

    function updateItemQuantity(id: string, quantity: number) {
      const item = packingItems.value.find((i) => i.id === id)
      if (item) {
        item.quantity = Math.max(1, quantity)
      }
    }

    function addCustomItem(customItem: Omit<PackingItem, 'id' | 'isCustom'>) {
      const id = `CUSTOM_${Date.now()}`
      packingItems.value.push({
        ...customItem,
        id,
        isCustom: true,
      })
    }

    function removeCustomItem(id: string) {
      packingItems.value = packingItems.value.filter((i) => i.id !== id)
    }

    function resetToDefaults() {
      packingItems.value = JSON.parse(JSON.stringify(defaultPackingItems))
    }

    // 4. 與官方最新裝備資料庫非破壞性自動同步
    function syncWithLatestDefaults() {
      const currentItemIds = new Set(packingItems.value.map((i) => i.id))
      const missingItems = defaultPackingItems.filter((item) => !currentItemIds.has(item.id))
      if (missingItems.length > 0) {
        packingItems.value.push(...JSON.parse(JSON.stringify(missingItems)))
      }
    }

    // 初始化時執行一次非破壞性同步
    syncWithLatestDefaults()

    // 5. Computed 試算統計數據
    // 背包淨負重 (克)：已勾選 且 非穿在身上
    const backpackWeightGrams = computed(() => {
      return packingItems.value
        .filter((i) => i.isChecked && !i.isWornOnBody)
        .reduce((sum, i) => sum + i.unitWeightGrams * i.quantity, 0)
    })

    const backpackWeightKg = computed(() => {
      return Number((backpackWeightGrams.value / 1000).toFixed(2))
    })

    // 身上穿戴總重 (克)：已勾選 且 穿在身上
    const wornWeightGrams = computed(() => {
      return packingItems.value
        .filter((i) => i.isChecked && i.isWornOnBody)
        .reduce((sum, i) => sum + i.unitWeightGrams * i.quantity, 0)
    })

    const wornWeightKg = computed(() => {
      return Number((wornWeightGrams.value / 1000).toFixed(2))
    })

    // 體重 10% 負重警戒上限 (kg)
    const maxRecommendedWeightKg = computed(() => {
      return Number((bodyWeightKg.value * 0.1).toFixed(2))
    })

    // 是否超標 (> 10%)
    const isOverweight = computed(() => {
      return backpackWeightKg.value > maxRecommendedWeightKg.value
    })

    // 負重百分比 (背包重 / 體重)
    const weightPercentage = computed(() => {
      if (!bodyWeightKg.value || bodyWeightKg.value <= 0) return 0
      return Number(((backpackWeightKg.value / bodyWeightKg.value) * 100).toFixed(1))
    })

    // 依分類過濾
    function getItemsByCategory(category: PackingCategory) {
      return packingItems.value.filter((i) => i.category === category)
    }

    return {
      bodyWeightKg,
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
    persist: true,
  },
)
