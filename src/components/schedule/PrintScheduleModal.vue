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
import type { UserStage, Waypoint } from '@/types/camino'
import type { RouteMetadata } from '@/types/route'
import { buildGlobalWaypointMap } from '@/data/routes'
import {
  generateScheduleTextChecklist,
  type ScheduleExportMeta,
} from '@/utils/scheduleExport'
import { usePrint } from '@/composables/usePrint'

interface Props {
  isOpen: boolean
  stages: UserStage[]
  routeMeta?: RouteMetadata
  branchName?: string
  startDate: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

// 全域航點快查字典 (O(1))
const waypointMap = computed(() => buildGlobalWaypointMap())

// 剪貼簿狀態
const isCopied = ref(false)
const isCopyFailed = ref(false)
let copyResetTimer: ReturnType<typeof setTimeout> | null = null

// 輔助函式：取得航點物件
function getWaypoint(id: string): Waypoint | undefined {
  return waypointMap.value.get(id)
}

// 輔助函式：取得航點外文/當地名稱
function getWaypointLocalName(wp?: Waypoint): string {
  if (!wp) return ''
  return wp.localName || wp.spanishName || ''
}

const { locale } = useI18n()
const isEnglish = computed(() => locale.value === 'en')

// 輔助函式：取得乾淨地名（移除任何括號內容，防止表格與純文字換行）
function getCleanWaypointName(name?: string): string {
  if (!name) return ''
  return name.replace(/\s*[（(][^）)]*[）)]/g, '').trim()
}

// 統計摘要
const exportMeta = computed<ScheduleExportMeta>(() => {
  const totalKm = props.stages.reduce((sum, s) => sum + s.distanceKm, 0)
  const totalElev = props.stages.reduce((sum, s) => sum + s.elevationGainM, 0)
  const lastStage = props.stages[props.stages.length - 1]

  const baseName = isEnglish.value
    ? (props.routeMeta?.name || 'Camino de Santiago')
    : (props.routeMeta?.chineseName || '朝聖之路')
  const branchPart = props.branchName ? ` · ${props.branchName}` : ''

  return {
    routeName: `${baseName}${branchPart}`,
    startDate: props.startDate,
    totalDays: props.stages.length,
    totalDistanceKm: totalKm,
    totalElevationGainM: totalElev,
    arrivalDate: lastStage?.date,
  }
})

// 日均步程（排除休息日）
const avgKmPerWalkingDay = computed(() => {
  const walkingDays = props.stages.filter((s) => !s.isRestDay).length
  if (walkingDays === 0) return '0.0'
  return (exportMeta.value.totalDistanceKm / walkingDays).toFixed(1)
})

// 日期格式化：2026-05-01 ➔ 05-01 (五)（具備 Invalid Date 邊界防禦）
function formatDateWithWeekday(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d.getTime())) {
    return dateStr.length >= 5 ? dateStr.slice(5) : dateStr
  }
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  if (isEnglish.value) {
    const enWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return `${month}-${day} (${enWeekdays[d.getDay()]})`
  }
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const weekday = weekdays[d.getDay()]
  return `${month}-${day} (${weekday})`
}

// 一鍵複製純文字到剪貼簿（具備成功 / 失敗三態反饋）
async function handleCopyText() {
  if (isCopied.value || isCopyFailed.value) return

  const text = generateScheduleTextChecklist(
    props.stages,
    waypointMap.value,
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

onUnmounted(() => {
  if (copyResetTimer) {
    clearTimeout(copyResetTimer)
    copyResetTimer = null
  }
})

/**
 * 原生標準列印實作：
 * 採用 usePrint 動態注入橫向 @page 樣式，零動態 HTML 注入、零 Iframe，符合最嚴格 CSP 安全標準。
 */
const { isPrinting, handlePrint } = usePrint({
  getFileName: () => {
    const todayYear = new Date().getFullYear()
    const todayStr = new Date().toISOString().split('T')[0]
    return `${todayYear} 朝聖之路每日行程表 ${todayStr}`
  },
  orientation: 'landscape',
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
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs print:hidden" />
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
              class="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-200 flex flex-col max-h-[92vh]"
            >
              <!-- 頂部操作列 -->
              <div
                class="flex items-center justify-between px-3 sm:px-6 py-3 border-b border-slate-200 bg-slate-50 shrink-0 gap-2 print:hidden"
              >
                <div class="flex items-center gap-2">
                  <Printer class="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 shrink-0" />
                  <div>
                    <h3 class="text-xs sm:text-base font-bold text-slate-900 whitespace-nowrap">
                      {{ $t('schedule.printModal.title') }}
                    </h3>
                  </div>
                </div>

                <!-- 右側動作按鈕群 -->
                <div class="flex items-center gap-1.5 sm:gap-2">
                  <!-- 一鍵複製純文字（三態反饋） -->
                  <button
                    type="button"
                    @click="handleCopyText"
                    :disabled="isCopied || isCopyFailed"
                    class="px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium border shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
                    :class="[
                      isCopyFailed
                        ? 'border-rose-300 bg-rose-50 text-rose-700'
                        : isCopied
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
                    ]"
                    :title="$t('schedule.printModal.copyText')"
                  >
                    <AlertCircle v-if="isCopyFailed" class="w-3.5 h-3.5 text-rose-600" />
                    <Check v-else-if="isCopied" class="w-3.5 h-3.5 text-emerald-600" />
                    <Copy v-else class="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {{
                        isCopyFailed
                          ? $t('schedule.printModal.copyFailed')
                          : isCopied
                            ? $t('schedule.printModal.copied')
                            : $t('schedule.printModal.copyText')
                      }}
                    </span>
                  </button>

                  <!-- 喚起原生列印 / 存為 PDF -->
                  <button
                    type="button"
                    :disabled="isPrinting"
                    @click="handlePrint"
                    class="px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
                  >
                    <Printer class="w-3.5 h-3.5" />
                    <span>{{ isPrinting ? $t('schedule.printModal.preparing') : $t('schedule.printModal.print') }}</span>
                  </button>

                  <!-- 關閉按鈕 -->
                  <button
                    type="button"
                    @click="emit('close')"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer ml-0.5 sm:ml-1"
                    :aria-label="$t('nav.closeMenu')"
                  >
                    <X class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <!-- A4 橫向模擬畫布滾動容器 -->
              <div class="overflow-y-auto overflow-x-auto p-2 sm:p-6 bg-slate-100/70">
                <!-- 手機端橫向滑動貼心提示 -->
                <div class="sm:hidden text-center text-[11px] text-slate-400 mb-1.5 print:hidden">
                  {{ $t('schedule.printModal.landscapeHint') }}
                </div>
                <!-- 真正的 A4 橫向紙本內容區塊（所見即所得的核心畫布，最大寬度約 280mm） -->
                <div
                  id="print-schedule-area"
                  class="bg-white rounded-xl shadow-xs border border-slate-200 p-5 sm:p-8 min-w-[720px] max-w-[285mm] mx-auto text-slate-900 flex flex-col min-h-[calc(100vh-140px)] sm:min-h-[190mm] print:block print:min-h-0 print:p-0"
                >
                  <!-- 1. 文件頁首 -->
                  <div class="pb-3 mb-3 shrink-0">
                    <div class="flex items-start justify-between gap-4">
                      <div class="min-w-0 flex-1">
                        <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                          {{ $t('schedule.printModal.mainTitle') }}
                        </h1>
                        <p class="text-xs text-slate-500 mt-1 font-medium">
                          {{ $t('schedule.printModal.departure') }}: {{ exportMeta.startDate }} ｜ {{ $t('schedule.printModal.estimatedArrival') }}: {{ exportMeta.arrivalDate }}
                        </p>
                      </div>

                      <div class="text-right shrink-0">
                        <div class="text-sm sm:text-base font-bold text-slate-900">
                          {{ exportMeta.routeName }}
                        </div>
                        <p class="text-[10px] text-slate-400 mt-1">
                          {{ $t('schedule.printModal.generatedDate') }}: {{ new Date().toISOString().split('T')[0] }}
                        </p>
                      </div>
                    </div>

                    <!-- 2. 四大核心指標摘要卡（無綠色、純白底、字型適中精緻） -->
                    <div class="mt-2.5 border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <table class="w-full text-center border-collapse">
                        <tbody>
                          <tr class="divide-x divide-slate-200">
                            <td class="py-1.5 sm:py-2 px-2 w-1/4">
                              <span class="block text-[11px] text-slate-500 font-medium mb-0.5">{{ $t('schedule.printModal.totalDays') }}</span>
                              <span class="text-sm sm:text-base font-bold text-slate-900 font-mono">
                                {{ exportMeta.totalDays }} <span class="text-xs font-normal text-slate-500">{{ $t('schedule.stats.dayUnit') }}</span>
                              </span>
                            </td>
                            <td class="py-1.5 sm:py-2 px-2 w-1/4">
                              <span class="block text-[11px] text-slate-500 font-medium mb-0.5">{{ $t('schedule.printModal.totalDistance') }}</span>
                              <span class="text-sm sm:text-base font-bold text-slate-900 font-mono">
                                {{ exportMeta.totalDistanceKm.toFixed(1) }} <span class="text-xs font-normal text-slate-500">km</span>
                              </span>
                            </td>
                            <td class="py-1.5 sm:py-2 px-2 w-1/4">
                              <span class="block text-[11px] text-slate-500 font-medium mb-0.5">{{ $t('schedule.printModal.totalElevation') }}</span>
                              <span class="text-sm sm:text-base font-bold text-slate-900 font-mono">
                                +{{ Math.round(exportMeta.totalElevationGainM).toLocaleString() }} <span class="text-xs font-normal text-slate-500">m</span>
                              </span>
                            </td>
                            <td class="py-1.5 sm:py-2 px-2 w-1/4">
                              <span class="block text-[11px] text-slate-500 font-medium mb-0.5">{{ $t('schedule.printModal.dailyAvg') }}</span>
                              <span class="text-sm sm:text-base font-bold text-slate-900 font-mono">
                                {{ avgKmPerWalkingDay }} <span class="text-xs font-normal text-slate-500">{{ $t('schedule.printModal.kmPerDay') }}</span>
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- 3. 7 欄高密度行程明細表格（無底色、細下框線、無粗體、多留空間給備註） -->
                  <div class="flex-grow">
                    <table class="w-full border-collapse text-left">
                      <thead>
                        <tr class="border-b border-slate-200 text-xs font-normal text-slate-500 bg-white">
                          <th class="py-2 px-2 w-[5%] whitespace-nowrap">{{ $t('schedule.printModal.table.day') }}</th>
                          <th class="py-2 px-2 w-[10%] whitespace-nowrap">{{ $t('schedule.printModal.table.date') }}</th>
                          <th class="py-2 px-2.5 w-[18%]">{{ $t('schedule.printModal.table.from') }}</th>
                          <th class="py-2 px-2.5 w-[18%]">{{ $t('schedule.printModal.table.to') }}</th>
                          <th class="py-2 px-2 w-[8.5%] text-right whitespace-nowrap">{{ $t('schedule.printModal.table.distance') }}</th>
                          <th class="py-2 px-2 w-[8.5%] text-right whitespace-nowrap">{{ $t('schedule.printModal.table.elevation') }}</th>
                          <th class="py-2 px-3 w-[32%]">{{ $t('schedule.printModal.table.notes') }}</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-200 text-xs">
                        <tr
                          v-for="stage in props.stages"
                          :key="stage.dayIndex"
                          :class="[
                            stage.isRestDay
                              ? 'bg-slate-50/60'
                              : stage.dayIndex % 2 === 0
                                ? 'bg-slate-50/30'
                                : 'bg-white',
                          ]"
                        >
                          <!-- 天數（01 格式，無粗體） -->
                          <td class="py-2 px-2 font-mono text-slate-600 whitespace-nowrap font-normal">
                            {{ String(stage.dayIndex).padStart(2, '0') }}
                          </td>

                          <!-- 日期 -->
                          <td class="py-2 px-2 font-mono text-slate-600 whitespace-nowrap font-normal">
                            {{ formatDateWithWeekday(stage.date) }}
                          </td>

                          <!-- 出發地（乾淨中文名稱 + 西文副標，英文模式僅外文） -->
                          <td class="py-2 px-2.5">
                            <div class="text-slate-900 font-normal whitespace-nowrap">
                              {{ isEnglish
                                ? (getWaypointLocalName(getWaypoint(stage.startWaypointId)) || stage.startWaypointId)
                                : getCleanWaypointName(getWaypoint(stage.startWaypointId)?.chineseName || stage.startWaypointId)
                              }}
                            </div>
                            <div v-if="!isEnglish" class="text-[10px] text-slate-400 font-mono whitespace-nowrap truncate">
                              {{ getWaypointLocalName(getWaypoint(stage.startWaypointId)) }}
                            </div>
                          </td>

                          <!-- 抵達城鎮（乾淨中文名稱 + 西文副標，英文模式僅外文） -->
                          <td class="py-2 px-2.5">
                            <div class="text-slate-900 font-normal whitespace-nowrap">
                              {{ isEnglish
                                ? (getWaypointLocalName(getWaypoint(stage.endWaypointId)) || stage.endWaypointId)
                                : getCleanWaypointName(getWaypoint(stage.endWaypointId)?.chineseName || stage.endWaypointId)
                              }}
                            </div>
                            <div v-if="!isEnglish" class="text-[10px] text-slate-400 font-mono whitespace-nowrap truncate">
                              {{ getWaypointLocalName(getWaypoint(stage.endWaypointId)) }}
                            </div>
                          </td>

                          <!-- 單日里程（無粗體，無彩色） -->
                          <td class="py-2 px-2 text-right font-mono text-slate-700 whitespace-nowrap font-normal">
                            {{ stage.isRestDay ? '0.0 km' : `${stage.distanceKm.toFixed(1)} km` }}
                          </td>

                          <!-- 單日爬升（無粗體） -->
                          <td class="py-2 px-2 text-right font-mono text-slate-600 whitespace-nowrap font-normal">
                            {{ stage.isRestDay ? '-' : `+${Math.round(stage.elevationGainM)}m` }}
                          </td>

                          <!-- 備註欄（無粗體，休息日顯示對應語系備註） -->
                          <td class="py-2 px-3 text-[11px] text-slate-600 font-normal">
                            <span v-if="stage.isRestDay">
                              {{ $t('schedule.badges.restDay') }}
                            </span>
                            <span v-else-if="stage.isExtensionStage">
                              {{ $t('schedule.badges.extension') }}
                            </span>
                            <span v-else-if="stage.albergueName" class="truncate block">
                              {{ stage.albergueName }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- 4. 頁尾祝福語 -->
                  <footer
                    class="mt-auto pt-3 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between shrink-0"
                  >
                    <span>{{ $t('schedule.printModal.footerGuide') }}</span>
                    <span>{{ $t('schedule.printModal.footerWish') }}</span>
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
  div:has(> #print-schedule-area) {
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

  #print-schedule-area {
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
  #print-schedule-area > div:first-child {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  /* 6. 表格跨頁自動重複表頭與防橫列腰斬 */
  #print-schedule-area table {
    width: 100% !important;
    border-collapse: collapse !important;
  }

  #print-schedule-area thead {
    display: table-header-group !important;
  }

  #print-schedule-area tr {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  #print-schedule-area th,
  #print-schedule-area td {
    border-bottom: 1px solid #e2e8f0 !important;
  }

  /* 7. 頁尾祝福語固定壓在每頁最底端 */
  #print-schedule-area footer {
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
