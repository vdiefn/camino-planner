<script setup lang="ts">
import { ref, computed } from 'vue'
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
import { useAsyncLock } from '@/composables/useAsyncLock'

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

const packingStore = usePackingStore()
const isCopied = ref(false)
const isCopyFailed = ref(false)
let copyResetTimer: ReturnType<typeof setTimeout> | null = null

// 僅保留「已啟用顯示之分類」且「有勾選要攜帶」的裝備項目
const activeCategorySet = computed(() => new Set(props.categories.map((c) => c.id)))

const checkedItems = computed(() => {
  return packingStore.packingItems.filter(
    (item) => activeCategorySet.value.has(item.category) && item.isChecked
  )
})

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
      items: map.get(cat.id) || [],
    }))
    .filter((group) => group.items.length > 0)
})

// 智慧貪婪平衡雙欄分流：確保左右兩欄高度平衡，且各欄內部卡片上下間距永遠固定，消除不自然大空格
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
    exportMeta.value
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
 * 真正「所見即所得（WYSIWYG）」的乾淨列印實作：
 * 透過隱藏的沙盒 Iframe 進行獨立渲染列印，徹底杜絕主頁面 (#app)、底部導覽列與外圍捲軸穿透，
 * 並透過 useAsyncLock 互斥鎖杜絕連點競態與 Iframe 堆疊。
 */
const { isBusy: isPrinting, execute: handlePrint } = useAsyncLock(
  async () => {
    const printArea = document.getElementById('print-checklist-area')
    if (!printArea) {
      window.print()
      emit('close')
      return
    }

    // 取得當前日期並設定自訂檔名：2026 朝聖之路裝備清單 YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0]
    const printFileName = `2026 朝聖之路裝備清單 ${todayStr}`

    // 同步暫時切換全域 document.title（供部分直接取用主視窗標題之瀏覽器作為另存 PDF 預設檔名）
    const originalTitle = document.title
    document.title = printFileName

    // 1. 建立隱藏式列印 iframe
    const iframe = document.createElement('iframe')
    iframe.setAttribute(
      'style',
      'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;'
    )
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentWindow?.document
    if (!iframeDoc) {
      window.print()
      emit('close')
      return
    }

    // 2. 萃取全站已編譯之 Tailwind 樣式與所有 link/style 標籤
    const styleNodes = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
    const stylesHtml = styleNodes.map((node) => node.outerHTML).join('\n')

    // 3. 組裝獨立純淨的 HTML 文件
    iframeDoc.open()
    iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="zh-TW">
      <head>
        <meta charset="UTF-8">
        <title>${printFileName}</title>
        ${stylesHtml}
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 10mm 12mm;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            height: auto !important;
          }
          #print-checklist-area {
            width: 100% !important;
            max-width: none !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: calc(297mm - 20mm) !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .print-grid {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 14px !important;
            align-items: start !important;
            flex-grow: 1 !important;
          }
          .checklist-category {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 8px !important;
            padding: 10px 12px !important;
            background: white !important;
          }
          .print-footer {
            margin-top: auto !important;
            padding-top: 12px !important;
            border-top: 1px solid #e2e8f0 !important;
          }
        </style>
      </head>
      <body>
        ${printArea.outerHTML}
      </body>
    </html>
  `)
    iframeDoc.close()

    // 4. 等候渲染就緒後喚起列印，自動關閉 Dialog，並清除 DOM 與還原標題
    iframe.contentWindow?.focus()
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        iframe.contentWindow?.print()
        emit('close') // 喚起列印後立即自動關閉 Dialog
        setTimeout(() => {
          document.title = originalTitle
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe)
          }
          resolve()
        }, 1500)
      }, 300)
    })
  },
  { cooldownMs: 1000 }
)
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
                class="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0"
              >
                <div class="flex items-center gap-2">
                  <Printer class="w-5 h-5 text-slate-700" />
                  <h3 class="text-sm sm:text-base font-bold text-slate-900">
                    紙本清單預覽與列印
                  </h3>
                </div>

                <!-- 右側動作按鈕群 -->
                <div class="flex items-center gap-2">
                  <!-- 一鍵複製純文字（具備成功 / 失敗三態反饋） -->
                  <button
                    type="button"
                    @click="handleCopyText"
                    :disabled="isCopied || isCopyFailed"
                    class="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    :class="[
                      isCopyFailed
                        ? 'border-rose-300 bg-rose-50 text-rose-700'
                        : isCopied
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
                    ]"
                    title="複製純文字至備忘錄"
                  >
                    <AlertCircle v-if="isCopyFailed" class="w-3.5 h-3.5 text-rose-600" />
                    <Check v-else-if="isCopied" class="w-3.5 h-3.5 text-emerald-600" />
                    <Copy v-else class="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {{
                        isCopyFailed
                          ? '複製失敗（權限受阻）'
                          : isCopied
                            ? '已複製到剪貼簿！'
                            : '複製純文字'
                      }}
                    </span>
                  </button>

                  <!-- 喚起原生列印 / 存為 PDF（使用 useAsyncLock 互斥防連點） -->
                  <button
                    type="button"
                    :disabled="isPrinting"
                    @click="handlePrint"
                    class="px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    :class="[
                      isPrinting
                        ? 'bg-emerald-400 cursor-not-allowed text-white/90'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white',
                    ]"
                  >
                    <Printer class="w-3.5 h-3.5" />
                    <span>{{ isPrinting ? '準備列印中...' : '列印 / 另存 PDF' }}</span>
                  </button>

                  <!-- 關閉按鈕 -->
                  <button
                    type="button"
                    @click="emit('close')"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer ml-1"
                    aria-label="關閉預覽"
                  >
                    <X class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <!-- A4 模擬畫布滾動容器 -->
              <div class="overflow-y-auto p-4 sm:p-8 bg-slate-100/70">
                <!-- 真正的 A4 紙本內容區塊（所見即所得的核心畫布） -->
                <div
                  id="print-checklist-area"
                  class="bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-8 max-w-[210mm] mx-auto text-slate-900 flex flex-col min-h-[250mm]"
                >
                  <!-- 文件頁首（已移除突兀黑色粗橫線） -->
                  <div class="pb-3 mb-3.5 shrink-0">
                    <div class="flex items-start justify-between">
                      <div>
                        <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                          聖雅各朝聖之路 · 裝備打包檢查清單
                        </h1>
                        <p class="text-xs text-slate-500 mt-1">
                          請於裝入背包時逐項於方框內打勾核對
                        </p>
                      </div>

                      <div class="text-right text-xs text-slate-400 font-mono shrink-0">
                        {{ new Date().toISOString().split('T')[0] }}
                      </div>
                    </div>

                    <!-- 統計摘要表格：標準 4 欄工整均分，純白無背景色，細緻淺灰邊框 -->
                    <div class="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
                      <table class="w-full text-center border-collapse text-xs">
                        <thead>
                          <tr class="border-b border-slate-200 text-slate-500 font-medium">
                            <th class="py-1.5 px-2 font-normal border-r border-slate-200 w-1/4">背包淨重</th>
                            <th class="py-1.5 px-2 font-normal border-r border-slate-200 w-1/4">身上穿戴</th>
                            <th class="py-1.5 px-2 font-normal border-r border-slate-200 w-1/4">攜帶品項</th>
                            <th class="py-1.5 px-2 font-normal w-1/4">10% 警戒線</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr class="font-bold text-slate-900 font-mono">
                            <td class="py-1.5 px-2 border-r border-slate-200 text-sm">
                              {{ exportMeta.backpackWeightKg.toFixed(2) }} kg
                            </td>
                            <td class="py-1.5 px-2 border-r border-slate-200 text-sm">
                              {{ exportMeta.wornWeightKg.toFixed(2) }} kg
                            </td>
                            <td class="py-1.5 px-2 border-r border-slate-200 text-sm">
                              {{ exportMeta.totalItemCount }} 件
                            </td>
                            <td class="py-1.5 px-2 text-sm text-slate-700">
                              {{ exportMeta.bodyWeightKg ? (exportMeta.bodyWeightKg * 0.1).toFixed(1) + ' kg' : '-' }}
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
                            {{ group.items.length }} 項
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
                                {{ item.chineseName }}
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
                                穿在身上
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
                            {{ group.items.length }} 項
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
                                {{ item.chineseName }}
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
                                穿在身上
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
                    <span>聖雅各朝聖之路 · 行前規劃指南</span>
                    <span>Buen Camino! 祝朝聖之路平安順心</span>
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
