<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  AlertOctagon,
  ShieldCheck,
  PlusCircle,
  RotateCcw,
  Sparkles,
  X,
  ChevronDown,
  Trash2,
  GripVertical,
} from 'lucide-vue-next'
import { usePackingStore } from '@/stores/packing'
import type { PackingCategory, PackingItem } from '@/types/camino'
import PackingItemRow from '@/components/packing/PackingItemRow.vue'
import ProTipsModal from '@/components/packing/ProTipsModal.vue'
import AddCustomItemModal from '@/components/packing/AddCustomItemModal.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import GoogleAd from '@/components/common/GoogleAd.vue'

const packingStore = usePackingStore()

// 官方 9 大分類定義與圖示/中文對照
const defaultCategories: { id: PackingCategory; label: string; icon: string }[] = [
  { id: 'PACK', label: '背包系統', icon: '🎒' },
  { id: 'CLOTHING', label: '服飾穿搭', icon: '👕' },
  { id: 'FOOTWEAR', label: '鞋襪足部', icon: '👟' },
  { id: 'SLEEP', label: '睡眠防護', icon: '🛏️' },
  { id: 'MEDICAL', label: '個人藥物', icon: '💊' },
  { id: 'HYGIENE', label: '衛生用品', icon: '🧼' },
  { id: 'ELECTRONICS', label: '電子設備', icon: '🔌' },
  { id: 'DOCS', label: '證件工具', icon: '📄' },
  { id: 'OTHER', label: '其他', icon: '📦' },
]

const officialCategoryIds = new Set(defaultCategories.map((c) => c.id))

// 動態聚合官方分類與使用者自訂之新分類（防重複集合）
const allCategories = computed(() => {
  const list = [...defaultCategories]
  const knownIds = new Set(list.map((c) => c.id))

  for (const item of packingStore.packingItems) {
    if (!knownIds.has(item.category)) {
      knownIds.add(item.category)
      list.push({
        id: item.category,
        label: item.category,
        icon: '📦',
      })
    }
  }
  return list
})

// 提取目前已自訂過的獨立分類清單（供新增彈窗快速選取）
const existingCustomCategories = computed(() => {
  const officialIds = officialCategoryIds
  const customSet = new Set<string>()
  for (const item of packingStore.customItems) {
    if (!officialIds.has(item.category)) {
      customSet.add(item.category)
    }
  }
  return Array.from(customSet)
})

// 刪除自訂分類二次確認控制
const isDeleteCategoryModalOpen = ref(false)
const categoryToDelete = ref('')

const categoryToDeleteItemCount = computed(() => {
  if (!categoryToDelete.value) return 0
  return packingStore.getItemsByCategory(categoryToDelete.value).length
})

function promptDeleteCategory(catId: string) {
  categoryToDelete.value = catId
  isDeleteCategoryModalOpen.value = true
}

function handleConfirmDeleteCategory() {
  if (categoryToDelete.value) {
    packingStore.removeCustomCategory(categoryToDelete.value)
  }
  isDeleteCategoryModalOpen.value = false
  categoryToDelete.value = ''
}

// 排除分類二次確認控制
const isRemoveCategoryModalOpen = ref(false)
const categoryToRemove = ref<{ id: PackingCategory; label: string } | null>(null)

function promptRemoveCategory(cat: { id: PackingCategory; label: string }) {
  categoryToRemove.value = cat
  isRemoveCategoryModalOpen.value = true
}

function handleConfirmRemoveCategory() {
  if (categoryToRemove.value) {
    packingStore.removeActiveCategory(categoryToRemove.value.id)
  }
  isRemoveCategoryModalOpen.value = false
  categoryToRemove.value = null
}

// 畫面目前啟用顯示的分類集合（直接連動 store 以確保負重計算與畫面完全同步）
const activeCategorySet = computed(() => new Set(packingStore.activeCategories))

function toggleCategory(catId: PackingCategory) {
  packingStore.toggleCategory(catId)
}

function showAllCategories() {
  packingStore.setAllCategories(allCategories.value.map((cat) => cat.id))
}

// 分類卡片收合狀態控制（預設全展開）
const collapsedCategories = ref<Record<string, boolean>>({})

function toggleCategoryCollapse(catId: string) {
  collapsedCategories.value[catId] = !collapsedCategories.value[catId]
}

// 依據使用者自訂排序的已啟用分類列表
const sortedActiveCategories = computed(() => {
  const activeSet = activeCategorySet.value
  const activeCats = allCategories.value.filter((c) => activeSet.has(c.id))
  const orderList = packingStore.categoryOrder || []
  const orderMap = new Map(orderList.map((id, idx) => [id, idx]))
  return [...activeCats].sort((a, b) => {
    const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999
    const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999
    return orderA - orderB
  })
})

// 分類卡片拖曳排序狀態（同時支援桌面與手機觸控）
const draggedCatId = ref<string | null>(null)
const dropTargetCatId = ref<string | null>(null)
const draggedCardHeight = ref<number>(0)

// 桌面 HTML5 Drag & Drop（拖曳懸停時動態展開推擠插槽）
function handleDragStart(catId: string, event: DragEvent) {
  draggedCatId.value = catId
  const target = event.currentTarget as HTMLElement | null
  if (target) {
    draggedCardHeight.value = target.getBoundingClientRect().height
  }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', catId)
  }
}

function handleDragOver(catId: string, event: DragEvent) {
  event.preventDefault()
  if (!draggedCatId.value) return
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  // 游標若移回原本拖曳的卡片則清除插槽，移至其他卡片則啟動該卡片之推擠插槽
  dropTargetCatId.value = draggedCatId.value === catId ? null : catId
}

function handleDrop() {
  if (draggedCatId.value && dropTargetCatId.value && draggedCatId.value !== dropTargetCatId.value) {
    packingStore.reorderCategories(draggedCatId.value, dropTargetCatId.value)
  }
  draggedCatId.value = null
  dropTargetCatId.value = null
  draggedCardHeight.value = 0
}

function handleDragEnd() {
  if (draggedCatId.value && dropTargetCatId.value && draggedCatId.value !== dropTargetCatId.value) {
    packingStore.reorderCategories(draggedCatId.value, dropTargetCatId.value)
  }
  draggedCatId.value = null
  dropTargetCatId.value = null
  draggedCardHeight.value = 0
}

// 行動裝置 Touch 觸控拖曳支援（滑動過程中即時推擠）
function handleTouchStart(catId: string, event: TouchEvent) {
  draggedCatId.value = catId
  const target = (event.target as HTMLElement)?.closest('[data-category-id]') as HTMLElement | null
  if (target) {
    draggedCardHeight.value = target.getBoundingClientRect().height
  }
}

function handleTouchMove(event: TouchEvent) {
  if (!draggedCatId.value) return
  const touch = event.touches[0]
  if (!touch) return
  const element = document.elementFromPoint(touch.clientX, touch.clientY)
  const cardElement = element?.closest('[data-category-id]') as HTMLElement | null
  if (cardElement) {
    const targetId = cardElement.dataset.categoryId
    if (targetId) {
      dropTargetCatId.value = targetId === draggedCatId.value ? null : targetId
    }
  } else {
    // 滑出卡片區域時清除目標
    dropTargetCatId.value = null
  }
}

function handleTouchEnd() {
  if (draggedCatId.value && dropTargetCatId.value && draggedCatId.value !== dropTargetCatId.value) {
    packingStore.reorderCategories(draggedCatId.value, dropTargetCatId.value)
  }
  draggedCatId.value = null
  dropTargetCatId.value = null
  draggedCardHeight.value = 0
}

// 手機版折疊狀態（預設收合以釋放手機垂直空間，與行程規劃一致）
const isMobileSettingsOpen = ref(false)

// 彈窗狀態
const isCustomModalOpen = ref(false)
const isTipsModalOpen = ref(false)
const currentTipsItem = ref<PackingItem | null>(null)

function handleShowTips(item: PackingItem) {
  currentTipsItem.value = item
  isTipsModalOpen.value = true
}

function handleAddCustomItem(item: Parameters<typeof packingStore.addCustomItem>[0]) {
  packingStore.addCustomItem(item)
}

// 計算單一分類的已勾選總重 (克) 與項目數
function getCategoryStats(catId: PackingCategory) {
  const items = packingStore.getItemsByCategory(catId)
  const checkedItems = items.filter((i) => i.isChecked)
  const totalGrams = checkedItems.reduce((sum, i) => sum + i.unitWeightGrams * i.quantity, 0)
  return {
    itemCount: items.length,
    checkedCount: checkedItems.length,
    totalGrams,
  }
}

// 二次確認對話框狀態控制
const isResetModalOpen = ref(false)

function handleConfirmReset() {
  packingStore.resetToDefaults()
  isResetModalOpen.value = false
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 max-w-7xl mt-2">
    <!-- 頂部標題區 -->
    <div class="mb-4 sm:mb-6 flex items-center justify-between gap-3">
      <h2 class="text-base sm:text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
        朝聖之路行李打包清單
      </h2>

      <!-- 右側精巧功能按鈕群 -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          @click="isCustomModalOpen = true"
          class="text-xs border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 text-slate-500 px-3 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <PlusCircle class="w-3.5 h-3.5" />
          <span>新增自訂裝備</span>
        </button>

        <button
          type="button"
          @click="isResetModalOpen = true"
          class="text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>重設清單</span>
        </button>
      </div>
    </div>

    <!-- 二欄式響應式佈局 (左:負重儀表板與減重法則 / 右:裝備分類清單) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- 左欄：Sticky 負重儀表板、減重法則與廣告 (lg: 4 欄) -->
      <div class="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
        <!-- 負重儀表板卡片 -->
        <div class="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <!-- 標題列：手機版支援點擊整列切換折疊 -->
          <div
            @click="isMobileSettingsOpen = !isMobileSettingsOpen"
            class="flex items-center justify-between cursor-pointer lg:cursor-default select-none"
          >
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-1.5">
              體重與 10% 負重警戒線
            </h3>

            <div class="flex items-center gap-2">
              <!-- 手機版折疊按鈕 -->
              <button
                type="button"
                class="lg:hidden p-1 text-slate-500 hover:text-slate-700 transition"
                :aria-expanded="isMobileSettingsOpen"
                aria-label="切換負重設定展開收合"
              >
                <ChevronDown
                  class="w-4 h-4 transition-transform duration-200"
                  :class="{ 'rotate-180': isMobileSettingsOpen }"
                />
              </button>
            </div>
          </div>

          <!-- 手機版收合時呈現的精簡摘要列（桌機版隱藏） -->
          <div
            v-if="!isMobileSettingsOpen"
            @click="isMobileSettingsOpen = true"
            class="lg:hidden mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 cursor-pointer gap-2"
          >
            <div class="flex items-center gap-1.5">
              <span class="text-slate-400">體重</span>
              <span class="font-bold text-slate-800 font-mono">{{ packingStore.bodyWeightKg }}kg</span>
              <span class="text-slate-300">·</span>
              <span class="text-slate-400">淨負重</span>
              <span class="font-bold font-mono" :class="packingStore.isOverweight ? 'text-rose-600' : 'text-slate-800'">
                {{ packingStore.backpackWeightKg }}kg
              </span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <span
                class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
                :class="packingStore.isOverweight ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'"
              >
                {{ packingStore.isOverweight ? '超標' : '合格' }} ({{ packingStore.weightPercentage }}%)
              </span>
            </div>
          </div>

          <!-- 可折疊內容區塊：手機版依 isMobileSettingsOpen 顯示/隱藏，桌機版永遠顯示（lg:block） -->
          <div
            class="space-y-4 mt-4"
            :class="isMobileSettingsOpen ? 'block' : 'hidden lg:block'"
          >
            <!-- 體重輸入框 -->
            <div class="rounded-xl flex items-center justify-between">
              <label class="text-sm text-slate-500">你的體重 (kg)</label>
              <div class="flex items-center gap-1.5">
                <input
                  v-model.number="packingStore.bodyWeightKg"
                  type="number"
                  min="20"
                  max="150"
                  step="0.5"
                  class="w-20 rounded-lg border border-slate-200 bg-white px-0 py-1 text-center font-mono text-base text-slate-900 focus:border-amber-500 focus:outline-hidden [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span class="text-xs text-slate-500">kg</span>
              </div>
            </div>

            <!-- 負重進度條儀表 -->
            <div class="space-y-2">
              <div class="flex items-baseline justify-between text-xs">
                <span class="text-slate-500 text-sm">背包淨負重 (不含身上穿戴):</span>
                <span class="font-mono text-base" :class="packingStore.isOverweight ? 'text-rose-600' : 'text-slate-900'">
                  {{ packingStore.backpackWeightKg }} <span class="text-xs font-normal">kg</span>
                </span>
              </div>

              <!-- 進度條軌道 -->
              <div class="h-3 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="[
                    packingStore.isOverweight
                      ? 'bg-rose-300'
                      : packingStore.weightPercentage >= 9.0
                        ? 'bg-amber-300'
                        : 'bg-emerald-500',
                  ]"
                  :style="{ width: `${Math.min(100, (packingStore.weightPercentage / 10) * 100)}%` }"
                />
              </div>

              <div class="flex justify-between text-[11px] text-slate-500">
                <span>目前佔體重 {{ packingStore.weightPercentage }}%</span>
                <span>10% 警戒上限: {{ packingStore.maxRecommendedWeightKg }} kg</span>
              </div>
            </div>

            <!-- 狀態提示框 -->
            <div
              :class="[
                'flex items-start gap-2.5 rounded-xl p-3.5 text-xs',
                packingStore.isOverweight
                  ? 'bg-rose-50 text-rose-900 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200',
              ]"
            >
              <AlertOctagon v-if="packingStore.isOverweight" class="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <ShieldCheck v-else class="h-4 w-4 shrink-0 text-emerald-800 mt-0.5" />
              <div>
                <div class="font-medium text-sm">
                  {{ packingStore.isOverweight ? '⚠️ 負重已超標！' : '🟢 負重合格安全！' }}
                </div>
                <div class="mt-0.5 text-[11px] leading-relaxed opacity-90 font-normal" v-if="packingStore.isOverweight">
                  {{
                     `已超過體重 10% (+${(packingStore.backpackWeightKg - packingStore.maxRecommendedWeightKg).toFixed(2)}kg)，強烈建議精簡非必備品！`
                  }}
                </div>
              </div>
            </div>

            <!-- 身上穿戴總重統計 -->
            <div class="rounded-xlb text-xs flex items-center justify-between">
              <div class="font-normal text-sm text-slate-500">當天穿在身上衣物重量</div>
              <div class="font-mono font-medium text-slate-500 text-sm">
                {{ packingStore.wornWeightKg }} kg
              </div>
            </div>
          </div>
        </div>

        <!-- 實戰減重法則 -->
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 class="flex items-center gap-2 text-sm text-slate-900">
            <Sparkles class="h-4 w-4 text-amber-500" />
            <span class="text-base">朝聖裝備減重黃金法則</span>
          </h3>
          <ul class="mt-3 space-y-2.5 text-sm text-slate-600 leading-relaxed">
            <li class="flex items-start gap-2">
              <span class="text-amber-500 font-bold">•</span>
              <span>嚴格把關 10% 體重上限：60kg 體重背 6kg，70kg 背 7kg，超重是膝蓋與足底發炎的第一元兇。</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-amber-500 font-bold">•</span>
              <span>善用「穿在身上」開關：登山鞋 (850g)、登山杖 (440g) 手持穿戴不計入背包負重。</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-amber-500 font-bold">•</span>
              <span>水與食物不要背過多：朝聖路上村莊密集且有公共飲水泉（Fuente），帶 1L 水瓶隨走隨補即可。</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-amber-500 font-bold">•</span>
              <span>三套衣物輪替原則：一套穿身上、一套備用換洗、一套晾乾中，羊毛材質抗臭效果最佳。</span>
            </li>
          </ul>
        </div>

        <!-- 側邊商業廣告欄位 -->
        <GoogleAd slot-id="packing-sidebar-ad" format="rectangle" />
      </div>

      <!-- 右欄：頂部分類標籤開關 + 瀑布流分類卡片 (lg: 8 欄) -->
      <div class="lg:col-span-8 space-y-4">
        <!-- 頂部分類 Chips 快速開關列 -->
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-800">裝備分類篩選</span>
            <button
              type="button"
              class="text-[11px] font-normal text-slate-400 border px-1.5 py-1 rounded border-slate-200 hover:border-slate-300 hover:text-slate-500 cursor-pointer"
              @click="showAllCategories"
            >
              選擇全部
            </button>
          </div>

          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="cat in allCategories"
              :key="cat.id"
              type="button"
              :class="[
                'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-normal transition-all cursor-pointer',
                activeCategorySet.has(cat.id)
                  ? 'border border-amber-300 bg-amber-50 font-medium text-slate-800 shadow-xs'
                  : 'border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100',
              ]"
              @click="toggleCategory(cat.id)"
            >
              <span>{{ cat.label }}</span>
              <!-- 自訂分類專屬：直接在頂部標籤刪除 -->
              <span
                v-if="!officialCategoryIds.has(cat.id)"
                role="button"
                tabindex="0"
                class="ml-0.5 -mr-1 p-0.5 rounded text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                title="刪除此自訂分類"
                @click.stop="promptDeleteCategory(cat.id)"
              >
                <Trash2 class="h-3 w-3" />
              </span>
            </button>
          </div>
        </div>

        <!-- 緊湊多欄瀑布流排版區 -->
        <div
          class="columns-1 md:columns-2 gap-4 space-y-4"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <template v-for="cat in sortedActiveCategories" :key="cat.id">
            <!-- 懸停時動態展開的平滑插槽：1px 淡雅細虛線、無文字、1:1 動態等高 -->
            <div
              v-if="dropTargetCatId === cat.id && draggedCatId !== cat.id"
              :style="{ height: `${draggedCardHeight}px` }"
              @dragover.prevent="handleDragOver(cat.id, $event)"
              @drop.prevent="handleDrop"
              class="break-inside-avoid rounded-xl border border-dashed border-amber-200/90 bg-amber-50/25 transition-all duration-300 ease-out animate-slotExpand box-border"
            />

            <!-- 卡片本體 -->
            <div
              :data-category-id="cat.id"
              :draggable="true"
              @dragstart="handleDragStart(cat.id, $event)"
              @dragover.prevent="handleDragOver(cat.id, $event)"
              @drop="handleDrop"
              @dragend="handleDragEnd"
              class="break-inside-avoid rounded-xl border bg-white p-4 transition-all duration-200"
              :class="[
                collapsedCategories[cat.id] ? 'shadow-xs' : 'space-y-3 shadow-xs',
                draggedCatId === cat.id
                  ? 'opacity-40 scale-[0.98] border-dashed border-amber-300'
                  : 'opacity-100 scale-100 border-slate-200'
              ]"
            >
              <!-- 分類標頭（點擊切換展開/收合） -->
              <div
                class="flex items-center justify-between cursor-pointer select-none"
                :class="{ 'border-b border-slate-100 pb-2.5': !collapsedCategories[cat.id] }"
                @click="toggleCategoryCollapse(cat.id)"
              >
                <div class="flex items-center gap-1.5">
                  <!-- 拖曳手柄（桌面與手機均可按住拖動） -->
                  <div
                    class="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 p-0.5 rounded touch-none"
                    title="按住拖曳調整順序"
                    @click.stop
                    @touchstart.stop="handleTouchStart(cat.id, $event)"
                    @touchmove.prevent="handleTouchMove($event)"
                    @touchend.stop="handleTouchEnd"
                  >
                    <GripVertical class="h-4 w-4" />
                  </div>
                  <h4 class="text-md font-medium text-slate-900">{{ cat.label }}</h4>
                  <ChevronDown
                    class="h-4 w-4 text-slate-400 transition-transform duration-200"
                    :class="{ '-rotate-90': collapsedCategories[cat.id] }"
                  />
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-[11px] text-slate-400 font-mono">
                    {{ getCategoryStats(cat.id).checkedCount }}/{{ getCategoryStats(cat.id).itemCount }} 項 · {{ getCategoryStats(cat.id).totalGrams }}g
                  </span>
                  <button
                    type="button"
                    class="rounded-md p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                    :title="officialCategoryIds.has(cat.id) ? '從本次清單排除此分類' : '刪除此自訂分類與所屬裝備'"
                    @click.stop="officialCategoryIds.has(cat.id) ? promptRemoveCategory(cat) : promptDeleteCategory(cat.id)"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <!-- 該分類之裝備列表（收合時隱藏） -->
              <div v-show="!collapsedCategories[cat.id]" class="space-y-2.5">
                <PackingItemRow
                  v-for="item in packingStore.getItemsByCategory(cat.id)"
                  :key="item.id"
                  :item="item"
                  @toggle-check="packingStore.toggleItemCheck"
                  @toggle-worn="packingStore.toggleWornOnBody"
                  @update-weight="packingStore.updateItemWeight"
                  @update-quantity="packingStore.updateItemQuantity"
                  @remove-custom="packingStore.removeCustomItem"
                  @show-tips="handleShowTips"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 彈窗群 -->
    <AddCustomItemModal
      :is-open="isCustomModalOpen"
      :custom-categories="existingCustomCategories"
      @close="isCustomModalOpen = false"
      @add="handleAddCustomItem"
    />

    <ProTipsModal
      :is-open="isTipsModalOpen"
      :item="currentTipsItem"
      @close="isTipsModalOpen = false"
    />

    <!-- 二次確認排除分類對話框 -->
    <ConfirmModal
      :is-open="isRemoveCategoryModalOpen"
      :title="`排除「${categoryToRemove?.label}」分類`"
      confirm-text="確認排除"
      cancel-text="取消"
      @confirm="handleConfirmRemoveCategory"
      @close="isRemoveCategoryModalOpen = false"
    >
      <p>確定要將「{{ categoryToRemove?.label }}」從本次清單中排除嗎？</p>
      <p class="mt-1 text-slate-500">
        排除後該分類將在看板隱藏，其裝備亦不計入背包負重。（您隨時可由上方標籤點擊恢復）
      </p>
    </ConfirmModal>

    <!-- 二次確認刪除自訂分類對話框 -->
    <ConfirmModal
      :is-open="isDeleteCategoryModalOpen"
      :title="`刪除自訂分類「${categoryToDelete}」`"
      confirm-text="確認刪除"
      cancel-text="取消"
      @confirm="handleConfirmDeleteCategory"
      @close="isDeleteCategoryModalOpen = false"
    >
      <p>確定要刪除「{{ categoryToDelete }}」分類嗎？</p>
      <p class="mt-1 text-slate-500">
        該分類底下的所有自訂裝備（共 {{ categoryToDeleteItemCount }} 項）將一併移除且無法復原。
      </p>
    </ConfirmModal>

    <!-- 二次確認重設對話框 -->
    <ConfirmModal
      :is-open="isResetModalOpen"
      title="重設整份清單"
      confirm-text="確認重設"
      cancel-text="取消"
      @confirm="handleConfirmReset"
      @close="isResetModalOpen = false"
    >
      <p>確定要將所有裝備勾選、實測重量與自訂項目還原為官方預設清單嗎？</p>
      <p class="mt-1 text-slate-500">此動作將清空所有自訂設定且無法復原。</p>
    </ConfirmModal>
  </div>
</template>

<style scoped>
@keyframes slotExpand {
  0% {
    opacity: 0;
    transform: scale(0.98);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-slotExpand {
  animation: slotExpand 0.22s cubic-bezier(0.2, 0, 0, 1) forwards;
}
</style>
