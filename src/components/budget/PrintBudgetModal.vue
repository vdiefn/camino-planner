<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import {
  Dialog,
  DialogPanel,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'
import { Printer, Copy, Check, X, AlertCircle } from 'lucide-vue-next'
import type { BudgetExportMeta } from '@/types/budget'
import { generateBudgetTextChecklist } from '@/utils/budgetExport'
import { useAsyncLock } from '@/composables/useAsyncLock'

interface Props {
  isOpen: boolean
  meta: BudgetExportMeta
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

// 剪貼簿狀態
const isCopied = ref(false)
const isCopyFailed = ref(false)
let copyResetTimer: ReturnType<typeof setTimeout> | null = null

// 追蹤當前作用中的沙盒 iframe 與定時器，確保生命週期安全
let activePrintIframe: HTMLIFrameElement | null = null
let printFallbackTimer: ReturnType<typeof setTimeout> | null = null

function cleanupIframe(originalTitle?: string) {
  if (originalTitle) {
    document.title = originalTitle
  }
  if (printFallbackTimer) {
    clearTimeout(printFallbackTimer)
    printFallbackTimer = null
  }
  if (activePrintIframe) {
    if (document.body.contains(activePrintIframe)) {
      document.body.removeChild(activePrintIframe)
    }
    activePrintIframe = null
  }
}

onUnmounted(() => {
  if (copyResetTimer) {
    clearTimeout(copyResetTimer)
    copyResetTimer = null
  }
  cleanupIframe()
})

// 一鍵複製純文字到剪貼簿（具備成功 / 失敗三態反饋）
async function handleCopyText() {
  if (isCopied.value || isCopyFailed.value) return

  const text = generateBudgetTextChecklist(props.meta)

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
 * 真正「所見即所得（WYSIWYG）」的 A4 沙盒列印：
 * 透過隱藏的沙盒 Iframe 進行獨立渲染列印，徹底杜絕主頁面 DOM、導覽列與捲軸穿透，
 * 並透過 useAsyncLock 互斥鎖杜絕連點競態與 Iframe 堆疊。
 */
const { isBusy: isPrinting, execute: handlePrint } = useAsyncLock(
  async () => {
    const printArea = document.getElementById('print-budget-area')
    if (!printArea) {
      window.print()
      emit('close')
      return
    }

    const todayYear = new Date().getFullYear()
    const todayStr = new Date().toISOString().split('T')[0]
    const printFileName = `${todayYear} 朝聖之路預算開銷規劃表 ${todayStr}`

    const originalTitle = document.title
    document.title = printFileName

    // 若先前有未銷毀之沙盒 iframe 先行徹底清理
    cleanupIframe()

    // 1. 建立隱藏式列印 iframe
    const iframe = document.createElement('iframe')
    iframe.setAttribute(
      'style',
      'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;'
    )
    document.body.appendChild(iframe)
    activePrintIframe = iframe

    const iframeDoc = iframe.contentWindow?.document
    if (!iframeDoc) {
      cleanupIframe(originalTitle)
      window.print()
      emit('close')
      return
    }

    // 2. 萃取全站已編譯之樣式
    const styleNodes = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
    const stylesHtml = styleNodes.map((node) => node.outerHTML).join('\n')

    // 3. 組裝純淨的 A4 直式 HTML 文件
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
          #print-budget-area {
            width: 100% !important;
            max-width: none !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: calc(297mm - 24mm) !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          th, td {
            border-bottom: 1px solid #e2e8f0 !important;
          }
          .print-footer {
            margin-top: auto !important;
            padding-top: 12px !important;
          }
        </style>
      </head>
      <body>
        ${printArea.outerHTML}
      </body>
    </html>
  `)
    iframeDoc.close()

    // 4. 等候渲染就緒後喚起列印，精確監聽 onafterprint 事件或逾時安全兜底
    iframe.contentWindow?.focus()
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const printWindow = iframe.contentWindow
        let hasResolved = false

        const finalizePrint = () => {
          if (hasResolved) return
          hasResolved = true
          cleanupIframe(originalTitle)
          resolve()
        }

        if (printWindow) {
          printWindow.onafterprint = finalizePrint
        }

        printWindow?.print()
        emit('close')

        // 逾時安全兜底（若瀏覽器不觸發 afterprint 或使用者未關閉）
        printFallbackTimer = setTimeout(finalizePrint, 8000)
      }, 300)
    })
  },
  { cooldownMs: 1000 }
)
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="emit('close')" class="relative z-50">
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
              class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all flex flex-col max-h-[92vh]"
            >
              <!-- 頂部操作工具列 -->
              <div
                class="px-4 py-3 sm:px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0"
              >
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Printer class="w-4 h-4 text-amber-500" />
                    <span>A4 紙本花費預算表預覽</span>
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    支援所見即所得（WYSIWYG）獨立沙盒列印與極簡純文字複製
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <!-- 一鍵複製純文字按鈕 -->
                  <button
                    type="button"
                    @click="handleCopyText"
                    class="text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    :class="[
                      isCopied
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : isCopyFailed
                          ? 'border-rose-500 bg-rose-50 text-rose-700'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
                    ]"
                  >
                    <Check v-if="isCopied" class="w-3.5 h-3.5 text-emerald-600" />
                    <AlertCircle v-else-if="isCopyFailed" class="w-3.5 h-3.5 text-rose-600" />
                    <Copy v-else class="w-3.5 h-3.5 text-slate-500" />
                    <span>{{ isCopied ? '已複製到剪貼簿' : isCopyFailed ? '複製失敗' : '複製純文字' }}</span>
                  </button>

                  <!-- 喚起列印按鈕 -->
                  <button
                    type="button"
                    @click="handlePrint"
                    :disabled="isPrinting"
                    class="text-xs px-3 sm:px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Printer class="w-3.5 h-3.5" />
                    <span>{{ isPrinting ? '準備列印中...' : '列印預算表' }}</span>
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
              <div class="overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
                <!-- 真正的 A4 紙本內容區塊（直式 Portrait，最大寬度約 210mm） -->
                <div
                  id="print-budget-area"
                  class="bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-8 max-w-[210mm] mx-auto text-slate-900 flex flex-col min-h-[280mm]"
                >
                  <!-- 1. 文件頁首 -->
                  <div class="pb-3 mb-4 shrink-0 border-b border-slate-200">
                    <div class="flex items-start justify-between">
                      <div>
                        <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                          聖雅各朝聖之路 · 行程花費預算表
                        </h1>
                        <p class="text-xs text-slate-500 mt-1 font-medium">
                          路線：{{ props.meta.routeName }} ｜ 規劃天數：{{ props.meta.totalDays }} 天 ｜ 預算風格：{{ props.meta.personaName }}
                        </p>
                      </div>

                      <div class="text-right shrink-0">
                        <div class="text-xs font-mono text-slate-600">
                          參考匯率：1 EUR ≈ {{ props.meta.eurToTwdRate.toFixed(1) }} TWD
                        </div>
                        <p class="text-[10px] text-slate-400 mt-1">
                          製表日期：{{ props.meta.createdAt }}
                        </p>
                      </div>
                    </div>

                    <!-- 2. 三大核心指標看板 -->
                    <div class="mt-4 grid grid-cols-3 gap-3">
                      <div class="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-center">
                        <span class="block text-[11px] text-slate-500 mb-0.5">預估總預算 (含機票)</span>
                        <div class="text-base sm:text-lg font-bold text-slate-900 font-mono">
                          NT$ {{ props.meta.grandTotalTwd.toLocaleString() }}
                        </div>
                      </div>

                      <div class="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-center">
                        <span class="block text-[11px] text-slate-500 mb-0.5">歐洲當地總開銷</span>
                        <div class="text-base sm:text-lg font-bold text-slate-900 font-mono">
                          €{{ props.meta.totalEur.toFixed(2) }}
                        </div>
                        <span class="text-[10px] text-slate-400 font-mono">
                          (約 NT$ {{ props.meta.totalEurToTwd.toLocaleString() }})
                        </span>
                      </div>

                      <div class="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-center">
                        <span class="block text-[11px] text-slate-500 mb-0.5">路上日均開銷 (步行日)</span>
                        <div class="text-base sm:text-lg font-bold text-slate-900 font-mono">
                          €{{ props.meta.dailyAvgEur.toFixed(2) }}
                          <span class="text-xs font-normal text-slate-500">/天</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 3. 四大象限詳細花費表格 -->
                  <div class="flex-grow space-y-4">
                    <!-- 象限一：行前固定支出 -->
                    <div>
                      <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
                        <h4 class="text-xs font-bold text-slate-900">
                          一、行前固定支出 (台灣出發前)
                        </h4>
                        <span class="text-xs font-mono font-bold text-slate-800">
                          小計：NT$ {{ props.meta.totalFixedTwd.toLocaleString() }}
                        </span>
                      </div>
                      <table class="w-full border-collapse text-left text-xs mt-1">
                        <tbody class="divide-y divide-slate-100">
                          <tr>
                            <td class="py-1.5 px-2 text-slate-700">台灣來回機票 (巴黎/馬德里/巴塞隆納)</td>
                            <td class="py-1.5 px-2 text-right font-mono text-slate-900">
                              NT$ {{ props.meta.flightTwd.toLocaleString() }}
                            </td>
                          </tr>
                          <tr>
                            <td class="py-1.5 px-2 text-slate-700">裝備增補採購 (背包、鞋襪、防雨裝備)</td>
                            <td class="py-1.5 px-2 text-right font-mono text-slate-900">
                              NT$ {{ props.meta.gearTwd.toLocaleString() }}
                            </td>
                          </tr>
                          <tr>
                            <td class="py-1.5 px-2 text-slate-700">申根旅遊不便險與歐盟 eSIM 網卡</td>
                            <td class="py-1.5 px-2 text-right font-mono text-slate-900">
                              NT$ {{ props.meta.insuranceAndSimTwd.toLocaleString() }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- 象限二：徒步路上每日開銷 -->
                    <div>
                      <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
                        <h4 class="text-xs font-bold text-slate-900">
                          二、徒步路上每日開銷 (共 {{ props.meta.totalDays }} 天)
                        </h4>
                        <span class="text-xs font-mono font-bold text-slate-800">
                          小計：€{{ props.meta.totalDailyWalkingEur.toFixed(2) }} (約 NT$ {{ props.meta.totalDailyWalkingTwd.toLocaleString() }})
                        </span>
                      </div>
                      <table class="w-full border-collapse text-left text-xs mt-1">
                        <tbody class="divide-y divide-slate-100">
                          <tr>
                            <td class="py-1.5 px-2 text-slate-700">庇護所與住宿費用</td>
                            <td class="py-1.5 px-2 text-right font-mono text-slate-900">
                              €{{ props.meta.lodgingTotalEur.toFixed(2) }}
                            </td>
                          </tr>
                          <tr>
                            <td class="py-1.5 px-2 text-slate-700">三餐飲食與沿途吧台補給</td>
                            <td class="py-1.5 px-2 text-right font-mono text-slate-900">
                              €{{ props.meta.foodTotalEur.toFixed(2) }}
                            </td>
                          </tr>
                          <tr>
                            <td class="py-1.5 px-2 text-slate-700">投幣洗衣與日常雜支</td>
                            <td class="py-1.5 px-2 text-right font-mono text-slate-900">
                              €{{ props.meta.laundryTotalEur.toFixed(2) }}
                            </td>
                          </tr>
                          <tr v-if="props.meta.luggageTotalEur > 0">
                            <td class="py-1.5 px-2 text-slate-700">行李托運服務 (Correos / Jacotrans)</td>
                            <td class="py-1.5 px-2 text-right font-mono text-slate-900">
                              €{{ props.meta.luggageTotalEur.toFixed(2) }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- 象限三：前後跨國接駁交通 -->
                    <div>
                      <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
                        <h4 class="text-xs font-bold text-slate-900">
                          三、前後跨國接駁交通 (歐洲內陸鐵公路)
                        </h4>
                        <span class="text-xs font-mono font-bold text-slate-800">
                          小計：€{{ props.meta.transitTotalEur.toFixed(2) }} (約 NT$ {{ props.meta.transitTotalTwd.toLocaleString() }})
                        </span>
                      </div>
                      <table class="w-full border-collapse text-left text-xs mt-1">
                        <tbody class="divide-y divide-slate-100">
                          <tr>
                            <td class="py-1.5 px-2 text-slate-700">門戶機場前往徒步起點 (TGV / Renfe / 巴士)</td>
                            <td class="py-1.5 px-2 text-right font-mono text-slate-900">
                              €{{ (props.meta.transitTotalEur / 2).toFixed(2) }}
                            </td>
                          </tr>
                          <tr>
                            <td class="py-1.5 px-2 text-slate-700">聖地牙哥終點返回出境機場 (高鐵或境內廉航)</td>
                            <td class="py-1.5 px-2 text-right font-mono text-slate-900">
                              €{{ (props.meta.transitTotalEur / 2).toFixed(2) }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- 象限四：突發應急金 -->
                    <div>
                      <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
                        <h4 class="text-xs font-bold text-slate-900">
                          四、突發應急預備金 (非必要不花費)
                        </h4>
                        <span class="text-xs font-mono font-bold text-slate-800">
                          小計：€{{ props.meta.emergencyFundEur.toFixed(2) }} (約 NT$ {{ props.meta.emergencyFundTwd.toLocaleString() }})
                        </span>
                      </div>
                      <p class="text-[11px] text-slate-500 py-1.5 px-2">
                        建議保留現金或信用卡額度，用於路上臨時醫療看診、買藥、搭乘計程車或因罷工緊急改票之預備金。
                      </p>
                    </div>
                  </div>

                  <!-- 4. 頁尾祝福語 -->
                  <footer
                    class="mt-auto pt-3 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between shrink-0"
                  >
                    <span>聖雅各朝聖之路 · 行前花費預算指南</span>
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
