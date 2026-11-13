<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Dialog,
  DialogPanel,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'
import { Printer, Copy, Check, X, AlertCircle } from 'lucide-vue-next'
import { usePackingStore } from '@/stores/packing'
import type { PackingCategory, PackingItem } from '@/types/camino'
import { generatePackingTextChecklist } from '@/utils/packingExport'
import { usePrint } from '@/composables/usePrint'

interface CategoryInfo {
  id: PackingCategory | string
  label: string
}

interface Props {
  isOpen: boolean
  categories: CategoryInfo[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t, locale } = useI18n()
const packingStore = usePackingStore()
const isCopied = ref(false)
const isCopyFailed = ref(false)
let copyResetTimer: ReturnType<typeof setTimeout> | null = null

onUnmounted(() => {
  if (copyResetTimer) {
    clearTimeout(copyResetTimer)
    copyResetTimer = null
  }
})

// 僅保留「已啟用顯示之分類」且「有勾選要攜帶」的裝備項目
const activeCategorySet = computed(() => new Set(props.categories.map((c) => c.id)))

const checkedItems = computed(() => {
  return packingStore.packingItems.filter(
    (item) => activeCategorySet.value.has(item.category) && item.isChecked
  )
})

function getCategoryLabel(group: { id: string; label: string }) {
  if (locale.value === 'en') {
    const key = `packing.categories.${group.id}`
    const translated = t(key)
    if (translated && translated !== key) {
      return translated
    }
  }
  return group.label
}

// 依已啟用分類分組已勾選項目，並排除無任何勾選項目的分類
const groupedCategories = computed(() => {
  const map = new Map<string, PackingItem[]>()
  for (const item of checkedItems.value) {
    const list = map.get(item.category) || []
    list.push(item)
    map.set(item.category, list)
  }

  return props.categories
    .map((cat) => ({
      ...cat,
      label: getCategoryLabel(cat),
      items: map.get(cat.id) || [],
    }))
    .filter((group) => group.items.length > 0)
})

// 貪婪平衡雙欄分流：確保左右兩欄高度平衡，且各欄內部卡片上下間距永遠固定，消除不自然大空格
const columnGroups = computed(() => {
  const left: typeof groupedCategories.value = []
  const right: typeof groupedCategories.value = []
  let leftCount = 0
  let rightCount = 0

  for (const group of groupedCategories.value) {
    // 依據左右累計項數分配（包含標題與邊界權重），使兩欄長度最平衡
    if (leftCount <= rightCount) {
      left.push(group)
      leftCount += group.items.length + 2
    } else {
      right.push(group)
      rightCount += group.items.length + 2
    }
  }

  return { left, right }
})

// 已勾選之總品項件數
const totalCheckedCount = computed(() => {
  return checkedItems.value.length
})

// 當前匯出統計摘要
const exportMeta = computed(() => ({
  backpackWeightKg: packingStore.backpackWeightKg,
  wornWeightKg: packingStore.wornWeightKg,
  totalItemCount: totalCheckedCount.value,
  bodyWeightKg: packingStore.bodyWeightKg,
}))

// 一鍵複製純文字到剪貼簿（供備忘錄、LINE 或 Google Keep 使用）
async function handleCopyText() {
  if (isCopied.value || isCopyFailed.value) return

  const text = generatePackingTextChecklist(
    checkedItems.value,
    props.categories,
    exportMeta.value,
    locale.value
  )

  if (copyResetTimer) {
    clearTimeout(copyResetTimer)
    copyResetTimer = null
  }

  try {
    if (!navigator?.clipboard?.writeText) {
      throw new Error('Clipboard API not supported')
    }
    await navigator.clipboard.writeText(text)
    isCopied.value = true
    isCopyFailed.value = false
    copyResetTimer = setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    isCopyFailed.value = true
    isCopied.value = false
    copyResetTimer = setTimeout(() => {
      isCopyFailed.value = false
    }, 2500)
  }
}

/**
 * 原生標準列印實作：
 * 採用 usePrint 動態注入直向 @page 樣式，零動態 HTML 注入、零 Iframe，符合最嚴格 CSP 安全標準。
 */
const { isPrinting, handlePrint } = usePrint({
  getFileName: () => {
    const todayStr = new Date().toISOString().split('T')[0]
    return locale.value === 'en'
      ? `Camino Packing Checklist ${todayStr}`
      : `2026 朝聖之路裝備清單 ${todayStr}`
  },
  orientation: 'portrait',
  pageMargin: '8mm 10mm 12mm 10mm',
  onAfterPrint: () => emit('close'),
})
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="emit('close')" class="relative z-50">
      <!-- 背景遮罩 -->
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-150 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-200 flex flex-col max-h-[92vh]"
            >
              <!-- 頂部操作列 -->
              <div
                class="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-200 bg-slate-50 shrink-0 gap-1.5 print:hidden"
              >
                <div class="flex items-center gap-1.5 min-w-0">
                  <Printer class="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 shrink-0" />
                  <h3 class="text-xs sm:text-base font-bold text-slate-900 truncate">
                    <span>{{ t('packing.printModal.title') }}</span>
                  </h3>
                </div>

                <!-- 右側動作按鈕群 -->
                <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <!-- 一鍵複製純文字（具備成功 / 失敗三態反饋） -->
                  <button
                    type="button"
                    @click="handleCopyText"
                    :disabled="isCopied || isCopyFailed"
                    class="px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium border shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                    :class="[
                      isCopyFailed
                        ? 'border-rose-300 bg-rose-50 text-rose-700'
                        : isCopied
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
                    ]"
                    :title="locale === 'en' ? 'Copy text checklist' : '複製純文字至備忘錄'"
                  >
                    <AlertCircle v-if="isCopyFailed" class="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <Check v-else-if="isCopied" class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <Copy v-else class="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>
                      {{
                        isCopyFailed
                          ? t('schedule.printModal.copyFailed')
                          : isCopied
                            ? t('schedule.printModal.copied')
                            : t('schedule.printModal.copyText')
                      }}
                    </span>
                  </button>

                  <!-- 喚起原生列印 / 存為 PDF -->
                  <button
                    type="button"
                    :disabled="isPrinting"
                    @click="handlePrint"
                    class="px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap shrink-0 bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
                  >
                    <Printer class="w-3.5 h-3.5 shrink-0" />
                    <span>{{ isPrinting ? t('schedule.printModal.preparing') : t('schedule.printModal.print') }}</span>
                  </button>

                  <!-- 關閉按鈕 -->
                  <button
                    type="button"
                    @click="emit('close')"
                    class="p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
                    :aria-label="t('common.cancel')"
                  >
                    <X class="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              <!-- A4 模擬畫布滾動容器（手機版精簡邊界內距，釋放版面空間） -->
              <div class="overflow-y-auto p-1.5 sm:p-6 bg-slate-100/70">
                <!-- 真正的 A4 紙本內容區塊（所見即所得的核心畫布） -->
                <div
                  id="print-checklist-area"
                  class="bg-white rounded-xl shadow-xs border border-slate-200 p-3.5 sm:p-8 max-w-[210mm] mx-auto text-slate-900 flex flex-col min-h-[calc(100vh-140px)] sm:min-h-[250mm] print:block print:min-h-0 print:p-0"
                >
                  <!-- 文件頁首 -->
                  <div class="pb-2.5 sm:pb-3 mb-2.5 sm:mb-3.5 shrink-0">
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0 flex-1">
                        <h1 class="text-base sm:text-2xl font-bold tracking-tight text-slate-900">
                          {{ t('packing.printModal.mainTitle') }}
                        </h1>
                        <div class="flex items-center justify-between mt-1 text-[11px] sm:text-xs text-slate-500">
                          <span>{{ locale === 'en' ? 'Check off items in the boxes as you pack your backpack' : '請於裝入背包時逐項於方框內打勾核對' }}</span>
                          <span class="font-mono text-slate-400 shrink-0 ml-2">
                            {{ new Date().toISOString().split('T')[0] }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- 統計摘要表格：防拆行排版 -->
                    <div class="mt-2.5 overflow-hidden rounded-lg border border-slate-200 bg-white">
                      <table class="w-full text-center border-collapse">
                        <thead>
                          <tr class="border-b border-slate-200 text-slate-500 text-[11px] sm:text-xs font-normal">
                            <th class="py-1.5 px-1 sm:px-2 border-r border-slate-200 w-1/4 whitespace-nowrap">{{ t('packing.printModal.packNetWeight') }}</th>
                            <th class="py-1.5 px-1 sm:px-2 border-r border-slate-200 w-1/4 whitespace-nowrap">{{ t('packing.printModal.wornWeight') }}</th>
                            <th class="py-1.5 px-1 sm:px-2 border-r border-slate-200 w-1/4 whitespace-nowrap">{{ locale === 'en' ? 'Items' : '攜帶品項' }}</th>
                            <th class="py-1.5 px-1 sm:px-2 w-1/4 whitespace-nowrap">{{ locale === 'en' ? '10% Limit' : '10% 警戒線' }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr class="font-bold text-slate-900 font-mono text-xs sm:text-sm">
                            <td class="py-1.5 px-1 sm:px-2 border-r border-slate-200 whitespace-nowrap">
                              {{ exportMeta.backpackWeightKg.toFixed(2) }} <span class="text-[10px] sm:text-xs font-normal text-slate-500">kg</span>
                            </td>
                            <td class="py-1.5 px-1 sm:px-2 border-r border-slate-200 whitespace-nowrap">
                              {{ exportMeta.wornWeightKg.toFixed(2) }} <span class="text-[10px] sm:text-xs font-normal text-slate-500">kg</span>
                            </td>
                            <td class="py-1.5 px-1 sm:px-2 border-r border-slate-200 whitespace-nowrap">
                              {{ exportMeta.totalItemCount }} <span class="text-[10px] sm:text-xs font-normal text-slate-500">{{ locale === 'en' ? 'pcs' : '件' }}</span>
                            </td>
                            <td class="py-1.5 px-1 sm:px-2 text-slate-700 whitespace-nowrap">
                              <template v-if="exportMeta.bodyWeightKg">
                                {{ (exportMeta.bodyWeightKg * 0.1).toFixed(1) }} <span class="text-[10px] sm:text-xs font-normal text-slate-500">kg</span>
                              </template>
                              <span v-else class="font-normal">-</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- 雙欄獨立分流排列：左欄與右欄各自垂直緊密排列，卡片間距永遠固定，消除不自然大空格 -->
                  <div class="print-grid grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start grow">
                    <!-- 左欄卡片群 -->
                    <div class="flex flex-col gap-3.5">
                      <div
                        v-for="group in columnGroups.left"
                        :key="group.id"
                        class="checklist-category border border-slate-200 rounded-lg p-3 bg-white"
                      >
                        <!-- 分類標題：純文字無 icon -->
                        <div class="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
                          <div class="text-xs font-bold text-slate-800">
                            {{ group.label }}
                          </div>
                          <span class="text-[10px] text-slate-400 font-mono">
                            {{ group.items.length }} {{ locale === 'en' ? 'items' : '項' }}
                          </span>
                        </div>

                        <!-- 裝備品項列：僅中文、數量、重量，無省略符號 -->
                        <ul class="space-y-1.5">
                          <li
                            v-for="item in group.items"
                            :key="item.id"
                            class="text-xs flex items-center justify-between gap-2"
                          >
                            <div class="flex items-center gap-1.5 min-w-0">
                              <span class="inline-block w-3.5 h-3.5 border border-slate-400 rounded-xs shrink-0" />
                              <span class="text-slate-800 font-medium">
                                {{ locale === 'en' ? (item.englishName || item.chineseName) : item.chineseName }}
                              </span>
                              <span
                                v-if="(item.quantity ?? 1) > 1"
                                class="text-[11px] font-mono text-slate-600 font-bold"
                              >
                                ×{{ item.quantity }}
                              </span>
                              <span
                                v-if="item.isWornOnBody"
                                class="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-normal shrink-0"
                              >
                                {{ locale === 'en' ? 'Worn' : '穿在身上' }}
                              </span>
                            </div>

                            <span class="text-[11px] font-mono text-slate-500 shrink-0">
                              {{ item.unitWeightGrams * (item.quantity ?? 1) }}g
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <!-- 右欄卡片群 -->
                    <div class="flex flex-col gap-3.5">
                      <div
                        v-for="group in columnGroups.right"
                        :key="group.id"
                        class="checklist-category border border-slate-200 rounded-lg p-3 bg-white"
                      >
                        <!-- 分類標題：純文字無 icon -->
                        <div class="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
                          <div class="text-xs font-bold text-slate-800">
                            {{ group.label }}
                          </div>
                          <span class="text-[10px] text-slate-400 font-mono">
                            {{ group.items.length }} {{ locale === 'en' ? 'items' : '項' }}
                          </span>
                        </div>

                        <!-- 裝備品項列：僅中文、數量、重量，無省略符號 -->
                        <ul class="space-y-1.5">
                          <li
                            v-for="item in group.items"
                            :key="item.id"
                            class="text-xs flex items-center justify-between gap-2"
                          >
                            <div class="flex items-center gap-1.5 min-w-0">
                              <span class="inline-block w-3.5 h-3.5 border border-slate-400 rounded-xs shrink-0" />
                              <span class="text-slate-800 font-medium">
                                {{ locale === 'en' ? (item.englishName || item.chineseName) : item.chineseName }}
                              </span>
                              <span
                                v-if="(item.quantity ?? 1) > 1"
                                class="text-[11px] font-mono text-slate-600 font-bold"
                              >
                                ×{{ item.quantity }}
                              </span>
                              <span
                                v-if="item.isWornOnBody"
                                class="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-normal shrink-0"
                              >
                                {{ locale === 'en' ? 'Worn' : '穿在身上' }}
                              </span>
                            </div>

                            <span class="text-[11px] font-mono text-slate-500 shrink-0">
                              {{ item.unitWeightGrams * (item.quantity ?? 1) }}g
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <!-- 頁尾祝福語：以 mt-auto 始終沉底呈現於 A4 紙張最下方 -->
                  <footer
                    class="print-footer mt-auto pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 flex items-center justify-between shrink-0"
                  >
                    <span>{{ t('schedule.printModal.footerGuide') }}</span>
                    <span>{{ t('schedule.printModal.footerWish') }}</span>
                  </footer>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style>
@media print {
  /* 1. 隱藏主應用畫面，避免佔據版面空間 */
  #app {
    display: none !important;
  }

  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    overflow: visible !important;
    height: auto !important;
  }

  /* 2. 強制隱藏所有操作列、按鈕與非列印元素 */
  .print\:hidden,
  [data-headlessui-portal] .print\:hidden,
  [id^="headlessui-dialog"] .print\:hidden {
    display: none !important;
  }

  /* 3. 徹底解開 Headless UI Portal 與 Dialog 容器的所有視窗限制，回歸自然文檔流（排除隱藏元素） */
  [data-headlessui-portal]:not(.print\:hidden),
  [id^="headlessui-dialog"]:not(.print\:hidden),
  [id^="headlessui-dialog"] > div:not(.print\:hidden),
  [id^="headlessui-dialog"] [role="dialog"]:not(.print\:hidden),
  div:has(> #print-checklist-area) {
    position: static !important;
    inset: auto !important;
    display: block !important;
    transform: none !important;
    overflow: visible !important;
    max-height: none !important;
    height: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }

  #print-checklist-area {
    position: static !important;
    display: block !important;
    width: 100% !important;
    max-width: none !important;
    min-height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* 5. 文件頂部資訊卡防拆散 */
  #print-checklist-area > div:first-child {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  /* 6. 雙欄格線與卡片防拆散 */
  #print-checklist-area .print-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 14px !important;
    align-items: start !important;
  }

  #print-checklist-area .checklist-category {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 8px !important;
    padding: 10px 12px !important;
    background: white !important;
  }

  /* 7. 頁尾祝福語固定壓在每頁最底端 */
  #print-checklist-area .print-footer {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    background: white !important;
    padding-top: 8px !important;
    border-top: 1px solid #e2e8f0 !important;
    margin-top: 0 !important;
  }
}
</style>
