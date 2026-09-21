<script setup lang="ts">
import { ref } from 'vue'
import {
  Scale,
  AlertOctagon,
  ShieldCheck,
  PlusCircle,
  RotateCcw,
  Sparkles,
  X,
  Plus,
  Check,
} from 'lucide-vue-next'
import { usePackingStore } from '@/stores/packing'
import type { PackingCategory, PackingItem } from '@/types/camino'
import PackingItemRow from '@/components/packing/PackingItemRow.vue'
import ProTipsModal from '@/components/packing/ProTipsModal.vue'
import AddCustomItemModal from '@/components/packing/AddCustomItemModal.vue'
import GoogleAd from '@/components/common/GoogleAd.vue'

const packingStore = usePackingStore()

// 9 大分類定義與圖示/中文對照
const allCategories: { id: PackingCategory; label: string; icon: string }[] = [
  { id: 'PACK', label: '背包系統', icon: '🎒' },
  { id: 'CLOTHING', label: '服飾穿搭', icon: '👕' },
  { id: 'FOOTWEAR', label: '鞋襪足部', icon: '👟' },
  { id: 'SLEEP', label: '睡眠防護', icon: '🛏️' },
  { id: 'MEDICAL', label: '醫藥防蟲', icon: '💊' },
  { id: 'HYGIENE', label: '衛浴清潔', icon: '🧼' },
  { id: 'ELECTRONICS', label: '電子電力', icon: '🔌' },
  { id: 'DOCS', label: '證件工具', icon: '📄' },
  { id: 'OTHER', label: '其他輔助', icon: '📦' },
]

// 預設顯示最核心的 5 大分類（使用者可點選上方標籤動態增減）
const activeCategories = ref<Set<PackingCategory>>(
  new Set(['PACK', 'CLOTHING', 'FOOTWEAR', 'SLEEP', 'MEDICAL']),
)

function toggleCategory(catId: PackingCategory) {
  if (activeCategories.value.has(catId)) {
    activeCategories.value.delete(catId)
  } else {
    activeCategories.value.add(catId)
  }
}

function showAllCategories() {
  allCategories.forEach((cat) => activeCategories.value.add(cat.id))
}

// 彈窗狀態
const isCustomModalOpen = ref(false)
const isTipsModalOpen = ref(false)
const currentTipsItem = ref<PackingItem | null>(null)

function handleShowTips(item: PackingItem) {
  currentTipsItem.value = item
  isTipsModalOpen.value = true
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
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
    <!-- 頁面標題 -->
    <div class="mb-4 sm:mb-6">
      <div class="flex items-center gap-2 text-amber-600">
        <Scale class="h-4 w-4 sm:h-5 sm:w-5" />
        <span class="text-xs font-bold uppercase tracking-wider">科學化裝備負重與實戰避坑</span>
      </div>
      <h2 class="mt-1 text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900">
        朝聖之路行李打包清單
      </h2>
      <p class="mt-1.5 text-xs sm:text-sm text-slate-500">
        嚴格把關體重 10% 負重警戒線，區分背包負重與身上穿戴，內建台灣朝聖者實戰避坑建議。
      </p>
    </div>

    <!-- 電腦版三欄式佈局 (左:負重儀表板 / 中:瀑布流分類卡片 / 右:廣告與減重法則) -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <!-- 1. 左欄：負重儀表板與警戒設定 (Sticky) -->
      <div class="lg:col-span-4">
        <div class="sticky top-20 space-y-4">
          <!-- 體重輸入與 10% 警戒進度條卡片 -->
          <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Scale class="h-4 w-4 text-amber-600" />
                <span>體重與 10% 負重警戒線</span>
              </h3>
              <button
                type="button"
                class="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700"
                title="重設為官方預設清單"
                @click="packingStore.resetToDefaults"
              >
                <RotateCcw class="h-3.5 w-3.5" />
                <span>重設</span>
              </button>
            </div>

            <!-- 體重輸入框 -->
            <div class="rounded-xl bg-slate-50 p-3 flex items-center justify-between">
              <label class="text-xs font-medium text-slate-600">你的體重 (kg)</label>
              <div class="flex items-center gap-1.5">
                <input
                  v-model.number="packingStore.bodyWeightKg"
                  type="number"
                  min="30"
                  max="150"
                  step="0.5"
                  class="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-right font-mono text-base font-bold text-slate-900 focus:border-amber-500 focus:outline-hidden"
                />
                <span class="text-xs font-bold text-slate-500">kg</span>
              </div>
            </div>

            <!-- 負重進度條儀表 -->
            <div class="space-y-2">
              <div class="flex items-baseline justify-between text-xs">
                <span class="text-slate-500">背包淨負重 (不含身上穿戴):</span>
                <span class="font-mono text-lg font-bold" :class="packingStore.isOverweight ? 'text-rose-600' : 'text-slate-900'">
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
                        : 'bg-emerald-300',
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
              <ShieldCheck v-else class="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <div class="font-medium">
                  {{ packingStore.isOverweight ? '⚠️ 負重已超標！' : '🟢 負重合格安全！' }}
                </div>
                <div class="mt-0.5 text-[11px] leading-relaxed opacity-90 font-normal">
                  {{
                    packingStore.isOverweight
                      ? `已超過體重 10% 警戒線 (+${(packingStore.backpackWeightKg - packingStore.maxRecommendedWeightKg).toFixed(2)}kg)，強烈建議精簡非必備品！`
                      : '背包重量控制在安全區間內，能有效保護膝蓋與足底筋膜。'
                  }}
                </div>
              </div>
            </div>

            <!-- 身上穿戴總重統計 -->
            <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs flex items-center justify-between">
              <div>
                <div class="font-normal text-slate-700">當天穿在身上 (鞋、杖、帽)</div>
                <div class="text-[10px] text-slate-400">穿戴開關開啟者不計入背包</div>
              </div>
              <div class="font-mono font-medium text-slate-800">
                {{ packingStore.wornWeightKg }} kg
              </div>
            </div>

            <!-- 新增自訂裝備按鈕 -->
            <button
              type="button"
              class="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-300 hover:bg-orange-200 py-2.5 text-xs font-normal text-slate-800 shadow-xs transition-colors cursor-pointer"
              @click="isCustomModalOpen = true"
            >
              <PlusCircle class="h-4 w-4" />
              <span>新增自訂裝備</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. 中欄：頂部分類標籤開關 + 1~3 欄瀑布流分類卡片 (主內容區) -->
      <div class="lg:col-span-5 space-y-4">
        <!-- 頂部分類 Chips 快速開關列 -->
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-800">裝備分類篩選 (點擊切換看板顯示)</span>
            <button
              type="button"
              class="text-[11px] font-normal text-amber-800 hover:underline cursor-pointer"
              @click="showAllCategories"
            >
              顯示全部 9 大分類
            </button>
          </div>

          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="cat in allCategories"
              :key="cat.id"
              type="button"
              :class="[
                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-normal transition-all cursor-pointer',
                activeCategories.has(cat.id)
                  ? 'bg-orange-300 text-slate-800 shadow-xs'
                  : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100',
              ]"
              @click="toggleCategory(cat.id)"
            >
              <span>{{ cat.icon }}</span>
              <span>{{ cat.label }}</span>
              <Check v-if="activeCategories.has(cat.id)" class="h-3 w-3 text-slate-800" />
              <Plus v-else class="h-3 w-3 text-slate-400" />
            </button>
          </div>
        </div>

        <!-- 瀑布流多欄排版區 (1~3 欄自適應) -->
        <div class="columns-1 md:columns-2 gap-4 space-y-4">
          <div
            v-for="cat in allCategories.filter((c) => activeCategories.has(c.id))"
            :key="cat.id"
            class="break-inside-avoid rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
          >
            <!-- 分類標頭 -->
            <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div class="flex items-center gap-2">
                <span class="text-lg">{{ cat.icon }}</span>
                <div>
                  <h4 class="text-sm font-bold text-slate-900">{{ cat.label }}</h4>
                  <span class="text-[11px] text-slate-400 font-mono">
                    {{ getCategoryStats(cat.id).checkedCount }}/{{ getCategoryStats(cat.id).itemCount }} 項 · {{ getCategoryStats(cat.id).totalGrams }}g
                  </span>
                </div>
              </div>

              <button
                type="button"
                class="rounded-md p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-600"
                title="從看板收合此分類"
                @click="toggleCategory(cat.id)"
              >
                <X class="h-4 w-4" />
              </button>
            </div>

            <!-- 該分類之裝備列表 -->
            <div class="space-y-2.5">
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
        </div>

        <!-- 手機版底部廣告插槽 -->
        <div class="lg:hidden">
          <GoogleAd />
        </div>
      </div>

      <!-- 3. 右欄：電腦版側邊吸頂廣告與實戰減重法則 (Sticky) -->
      <div class="hidden lg:col-span-3 lg:block">
        <div class="sticky top-20 space-y-4">
          <!-- 側邊吸頂廣告 -->
          <GoogleAd is-sidebar />

          <!-- 實戰減重法則 -->
          <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 class="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Sparkles class="h-4 w-4 text-amber-500" />
              <span>朝聖裝備減重黃金法則</span>
            </h3>
            <ul class="mt-3 space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <li class="flex items-start gap-2">
                <span class="text-amber-500 font-bold">•</span>
                <span><strong>嚴格把關 10% 體重上限</strong>：60kg 體重背 6kg，70kg 背 7kg，超重是膝蓋與足底發炎的第一元兇。</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-amber-500 font-bold">•</span>
                <span><strong>善用「穿在身上」開關</strong>：登山鞋 (850g)、登山杖 (440g) 手持穿戴不計入背包負重。</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-amber-500 font-bold">•</span>
                <span><strong>水與食物不要背過多</strong>：朝聖路上村莊密集且有公共飲水泉（Fuente），帶 1L 水瓶隨走隨補即可。</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-amber-500 font-bold">•</span>
                <span><strong>三套衣物輪替原則</strong>：一套穿身上、一套備用換洗、一套晾乾中，羊毛材質抗臭效果最佳。</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 彈窗群 -->
    <AddCustomItemModal
      :is-open="isCustomModalOpen"
      @close="isCustomModalOpen = false"
      @add="packingStore.addCustomItem"
    />

    <ProTipsModal
      :is-open="isTipsModalOpen"
      :item="currentTipsItem"
      @close="isTipsModalOpen = false"
    />
  </div>
</template>
