<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Dialog,
  DialogPanel,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'
import { Printer, Copy, Check, X, AlertCircle } from 'lucide-vue-next'
import type { BudgetExportMeta } from '@/types/budget'
import { generateBudgetTextChecklist } from '@/utils/budgetExport'
import { usePrint } from '@/composables/usePrint'

interface Props {
  isOpen: boolean
  meta: BudgetExportMeta
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t, locale } = useI18n()

// 剪貼簿狀態
const isCopied = ref(false)
const isCopyFailed = ref(false)
let copyResetTimer: ReturnType<typeof setTimeout> | null = null

onUnmounted(() => {
  if (copyResetTimer) {
    clearTimeout(copyResetTimer)
    copyResetTimer = null
  }
})

// 一鍵複製純文字到剪貼簿（具備成功 / 失敗三態反饋）
async function handleCopyText() {
  if (isCopied.value || isCopyFailed.value) return

  const text = generateBudgetTextChecklist(props.meta, locale.value)

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
      ? `Camino Budget Sheet ${todayStr}`
      : `${new Date().getFullYear()} 朝聖之路預算開銷規劃表 ${todayStr}`
  },
  orientation: 'portrait',
  pageMargin: '8mm 10mm 12mm 10mm',
  onAfterPrint: () => emit('close'),
})
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
                class="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0 gap-1.5 print:hidden"
              >
                <div class="flex items-center gap-1.5 min-w-0">
                  <Printer class="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
                  <h3 class="text-xs sm:text-base font-bold text-slate-900 truncate">
                    <span>{{ t('budget.printModal.title') }}</span>
                  </h3>
                </div>

                <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <!-- 一鍵複製純文字按鈕 -->
                  <button
                    type="button"
                    @click="handleCopyText"
                    class="text-xs px-2 sm:px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap shrink-0"
                    :class="[
                      isCopied
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : isCopyFailed
                          ? 'border-rose-500 bg-rose-50 text-rose-700'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
                    ]"
                  >
                    <Check v-if="isCopied" class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <AlertCircle v-else-if="isCopyFailed" class="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <Copy v-else class="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>
                      {{
                        isCopied
                          ? t('schedule.printModal.copied')
                          : isCopyFailed
                            ? t('schedule.printModal.copyFailed')
                            : t('schedule.printModal.copyText')
                      }}
                    </span>
                  </button>

                  <!-- 喚起列印按鈕 -->
                  <button
                    type="button"
                    @click="handlePrint"
                    :disabled="isPrinting"
                    class="text-xs px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium transition cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-50 whitespace-nowrap shrink-0"
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

              <!-- A4 模擬畫布滾動容器（手機版精簡內距） -->
              <div class="overflow-y-auto p-1.5 sm:p-6 bg-slate-100/70">
                <div
                  id="print-budget-area"
                  class="bg-white rounded-xl shadow-xs border border-slate-200 p-3.5 sm:p-8 max-w-[210mm] mx-auto text-slate-900 flex flex-col min-h-[calc(100vh-140px)] sm:min-h-[280mm] print:block print:min-h-0 print:p-0"
                >
                  <!-- 1. 文件頁首 -->
                  <div class="pb-2.5 sm:pb-3 mb-3 sm:mb-4 shrink-0 border-b border-slate-200">
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0 flex-1">
                        <h1 class="text-base sm:text-2xl font-bold tracking-tight text-slate-900">
                          {{ t('budget.printModal.mainTitle') }}
                        </h1>
                        <p class="text-[11px] sm:text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                          <template v-if="locale === 'en'">
                            Route: {{ props.meta.routeName }} ｜ Days: {{ props.meta.totalDays }} ｜ Style: {{ props.meta.personaName }}
                          </template>
                          <template v-else>
                            路線：{{ props.meta.routeName }} ｜ 天數：{{ props.meta.totalDays }} 天 ｜ 風格：{{ props.meta.personaName }}
                          </template>
                        </p>
                        <div class="flex items-center justify-between mt-1 text-[10px] sm:text-xs text-slate-400 font-mono">
                          <span v-if="locale !== 'en'">參考匯率：1 EUR ≈ {{ props.meta.eurToTwdRate.toFixed(1) }} TWD</span>
                          <span v-else>{{ t('budget.printModal.generatedDate') }}: {{ props.meta.createdAt }}</span>
                          <span v-if="locale !== 'en'">製表：{{ props.meta.createdAt }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- 2. 三大核心指標看板（防折字排版） -->
                    <div class="mt-2.5 sm:mt-4 grid grid-cols-3 gap-1.5 sm:gap-3">
                      <div class="p-1.5 sm:p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-center">
                        <span class="block text-[10px] sm:text-[11px] text-slate-500 mb-0.5 whitespace-nowrap">{{ t('budget.printModal.summaryGrandTotal') }}</span>
                        <div class="text-xs sm:text-base text-slate-900 font-mono font-bold whitespace-nowrap">
                          {{
                            locale === 'en'
                              ? `€ ${(props.meta.totalEur + props.meta.totalFixedTwd / props.meta.eurToTwdRate).toFixed(2)}`
                              : `NT$ ${props.meta.grandTotalTwd.toLocaleString()}`
                          }}
                        </div>
                      </div>

                      <div class="p-1.5 sm:p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-center">
                        <span class="block text-[10px] sm:text-[11px] text-slate-500 mb-0.5 whitespace-nowrap">{{ t('budget.printModal.summaryLocalTotal') }}</span>
                        <div class="text-xs sm:text-base text-slate-900 font-mono font-bold whitespace-nowrap">
                          €{{ props.meta.totalEur.toFixed(2) }}
                        </div>
                      </div>

                      <div class="p-1.5 sm:p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-center">
                        <span class="block text-[10px] sm:text-[11px] text-slate-500 mb-0.5 whitespace-nowrap">{{ t('budget.printModal.summaryDailyAvg') }}</span>
                        <div class="text-xs sm:text-base text-slate-900 font-mono font-bold whitespace-nowrap">
                          €{{ props.meta.dailyAvgEur.toFixed(2) }}
                          <span class="text-[10px] sm:text-xs font-normal text-slate-500">{{ t('budget.perDay') }}</span>
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
                          {{ t('budget.categories.fixed') }}
                        </h4>
                        <span class="text-xs font-mono font-bold text-slate-800">
                          {{
                            locale === 'en'
                              ? `Subtotal: €${(props.meta.totalFixedTwd / props.meta.eurToTwdRate).toFixed(2)}`
                              : `小計：NT$ ${props.meta.totalFixedTwd.toLocaleString()}`
                          }}
                        </span>
                      </div>
                      <table class="w-full border-collapse text-left text-xs mt-1">
                        <tbody class="divide-y divide-slate-100">
                          <tr>
                            <td class="py-1.5 px-2 text-slate-700">
                              {{ locale === 'en' ? 'Round-trip Flights' : '台灣來回機票 (巴黎/馬德里/巴塞隆納)' }}
                            </td>
                            <td class="py-1.5 px-2 text-right font-mono text-slate-900">
                              {{
                                locale === 'en'
                                  ? `€${(props.meta.flightTwd / props.meta.eurToTwdRate).toFixed(2)}`
                                  : `NT$ ${props.meta.flightTwd.toLocaleString()}`
                              }}
                            </td>
                          </tr>
                          <tr>
                            <td class="py-1.5 px-2 text-slate-700">
                              {{ locale === 'en' ? 'Gear & Clothing' : '裝備增補採購 (背包、鞋襪、防雨裝備)' }}
                            </td>
                            <td class="py-1.5 px-2 text-right font-mono text-slate-900">
                              {{
                                locale === 'en'
                                  ? `€${(props.meta.gearTwd / props.meta.eurToTwdRate).toFixed(2)}`
                                  : `NT$ ${props.meta.gearTwd.toLocaleString()}`
                              }}
                            </td>
                          </tr>
                          <tr>
                            <td class="py-1.5 px-2 text-slate-700">
                              {{ locale === 'en' ? 'Travel Insurance & eSIM' : '申根旅遊不便險與歐盟 eSIM 網卡' }}
                            </td>
                            <td class="py-1.5 px-2 text-right font-mono text-slate-900">
                              {{
                                locale === 'en'
                                  ? `€${(props.meta.insuranceAndSimTwd / props.meta.eurToTwdRate).toFixed(2)}`
                                  : `NT$ ${props.meta.insuranceAndSimTwd.toLocaleString()}`
                              }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- 象限二：徒步路上每日開銷 -->
                    <div>
                      <div class="flex items-center justify-between pb-1.5 border-b border-slate-200">
                        <h4 class="text-xs font-bold text-slate-900">
                          {{ t('budget.categories.daily', { days: props.meta.totalDays }) }}
                        </h4>
                        <span class="text-xs font-mono font-bold text-slate-800">
                          {{
                            locale === 'en'
                              ? `Subtotal: €${props.meta.totalDailyWalkingEur.toFixed(2)}`
                              : `小計：€${props.meta.totalDailyWalkingEur.toFixed(2)} (約 NT$ ${props.meta.totalDailyWalkingTwd.toLocaleString()})`
                          }}
                        </span>
                      </div>
                      <table class="w-full border-collapse text-left text-xs mt-1">
                        <tbody class="divide-y divide-slate-100">
                          <tr>
                            <td class="py-1.5 px-2 text-slate-700">{{ locale === 'en' ? 'Lodging / Bed' : '庇護所與住宿費用' }}</td>
                            <td class="py-1.5 px-2 text-right font-mono text-slate-900">
                              €{{ props.meta.lodgingTotalEur.toFixed(2) }}
                            </td>
                          </tr>
                          <tr>
                            <td class="py-1.5 px-2 text-slate-700">{{ locale === 'en' ? 'Meals & Food' : '三餐飲食與沿途吧台補給' }}</td>
                            <td class="py-1.5 px-2 text-right font-mono text-slate-900">
                              €{{ props.meta.foodTotalEur.toFixed(2) }}
                            </td>
                          </tr>
                          <tr>
                            <td class="py-1.5 px-2 text-slate-700">{{ locale === 'en' ? 'Laundry & Sundries' : '投幣洗衣與日常雜支' }}</td>
                            <td class="py-1.5 px-2 text-right font-mono text-slate-900">
                              €{{ props.meta.laundryTotalEur.toFixed(2) }}
                            </td>
                          </tr>
                          <tr v-if="props.meta.luggageTotalEur > 0">
                            <td class="py-1.5 px-2 text-slate-700">{{ locale === 'en' ? 'Luggage Transfer' : '行李托運服務 (Correos / Jacotrans)' }}</td>
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
                          {{ t('budget.categories.transit') }}
                        </h4>
                        <span class="text-xs font-mono font-bold text-slate-800">
                          {{
                            locale === 'en'
                              ? `Subtotal: €${props.meta.transitTotalEur.toFixed(2)}`
                              : `小計：€${props.meta.transitTotalEur.toFixed(2)} (約 NT$ ${props.meta.transitTotalTwd.toLocaleString()})`
                          }}
                        </span>
                      </div>
                      <table class="w-full border-collapse text-left text-xs mt-1">
                        <tbody class="divide-y divide-slate-100">
                          <tr>
                            <td class="py-1.5 px-2 text-slate-700">{{ locale === 'en' ? 'Transit to Trailhead (Bus/Train)' : '門戶機場前往徒步起點 (TGV / Renfe / 巴士)' }}</td>
                            <td class="py-1.5 px-2 text-right font-mono text-slate-900">
                              €{{ (props.meta.transitTotalEur / 2).toFixed(2) }}
                            </td>
                          </tr>
                          <tr>
                            <td class="py-1.5 px-2 text-slate-700">{{ locale === 'en' ? 'Return from Santiago (Flight/Train)' : '聖地牙哥終點返回出境機場 (高鐵或境內廉航)' }}</td>
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
                          {{ t('budget.categories.emergency') }}
                        </h4>
                        <span class="text-xs font-mono font-bold text-slate-800">
                          {{
                            locale === 'en'
                              ? `Subtotal: €${props.meta.emergencyFundEur.toFixed(2)}`
                              : `小計：€${props.meta.emergencyFundEur.toFixed(2)} (約 NT$ ${props.meta.emergencyFundTwd.toLocaleString()})`
                          }}
                        </span>
                      </div>
                      <p class="text-[11px] text-slate-500 py-1.5 px-2">
                        {{
                          locale === 'en'
                            ? 'Recommended contingency reserve for unexpected medical visits, pharmacy, taxi rides, or emergency ticket changes.'
                            : '建議保留現金或信用卡額度，用於路上臨時醫療看診、買藥、搭乘計程車或因罷工緊急改票之預備金。'
                        }}
                      </p>
                    </div>
                  </div>

                  <!-- 4. 頁尾祝福語 -->
                  <footer
                    class="print-footer mt-auto pt-3 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between shrink-0"
                  >
                    <span>{{ t('budget.printModal.footerGuide') }}</span>
                    <span>{{ t('budget.printModal.footerWish') }}</span>
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
  div:has(> #print-budget-area) {
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

  #print-budget-area {
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
  #print-budget-area > div:first-child {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  #print-budget-area table {
    width: 100% !important;
    border-collapse: collapse !important;
  }

  #print-budget-area tr {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  #print-budget-area th,
  #print-budget-area td {
    border-bottom: 1px solid #e2e8f0 !important;
  }

  /* 6. 頁尾祝福語固定壓在每頁最底端 */
  #print-budget-area .print-footer {
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
