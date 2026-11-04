<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
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
import { useAsyncLock } from '@/composables/useAsyncLock'

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

  const branchPart = props.branchName ? `（${props.branchName}）` : ''
  const baseName = props.routeMeta?.chineseName || '朝聖之路'

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
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const weekday = weekdays[d.getDay()]
  return `${month}-${day} (${weekday})`
}

// 一鍵複製純文字到剪貼簿（具備成功 / 失敗三態反饋）
async function handleCopyText() {
  if (isCopied.value || isCopyFailed.value) return

  const text = generateScheduleTextChecklist(
    props.stages,
    waypointMap.value,
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

let pendingPrintCleanup: (() => void) | null = null

onUnmounted(() => {
  if (copyResetTimer) {
    clearTimeout(copyResetTimer)
    copyResetTimer = null
  }
  if (pendingPrintCleanup) {
    pendingPrintCleanup()
    pendingPrintCleanup = null
  }
})

/**
 * 原生標準列印實作：
 * 採用 CSS @media print 樣式隔離，零動態 HTML 注入、零 Iframe，符合最嚴格 CSP 安全標準。
 */
const { isBusy: isPrinting, execute: handlePrint } = useAsyncLock(
  async () => {
    const todayYear = new Date().getFullYear()
    const todayStr = new Date().toISOString().split('T')[0]
    const printFileName = `${todayYear} 朝聖之路每日行程表 ${todayStr}`

    const originalTitle = document.title
    document.title = printFileName

    const finalizePrint = () => {
      document.title = originalTitle
      window.removeEventListener('afterprint', finalizePrint)
      pendingPrintCleanup = null
      emit('close')
    }

    pendingPrintCleanup = () => {
      document.title = originalTitle
      window.removeEventListener('afterprint', finalizePrint)
    }

    window.addEventListener('afterprint', finalizePrint, { once: true })

    // 給予瀏覽器微小時間窗更新標題（供另存 PDF 自動帶入檔名）
    await new Promise((resolve) => setTimeout(resolve, 50))
    window.print()

    // 逾時安全兜底：若瀏覽器未觸發 afterprint 則復原標題
    setTimeout(() => {
      if (document.title === printFileName) {
        document.title = originalTitle
      }
    }, 5000)
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
              class="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-200 flex flex-col max-h-[92vh]"
            >
              <!-- 頂部操作列 -->
              <div
                class="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50 shrink-0"
              >
                <div class="flex items-center gap-2.5">
                  <Printer class="w-5 h-5 text-slate-700" />
                  <div>
                    <h3 class="text-sm sm:text-base font-bold text-slate-900">
                      紙本行程預覽與列印
                    </h3>
                  </div>
                </div>

                <!-- 右側動作按鈕群 -->
                <div class="flex items-center gap-2">
                  <!-- 一鍵複製純文字（三態反饋） -->
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
                    title="複製純文字行程至 LINE 或備忘錄"
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

                  <!-- 喚起原生列印 / 存為 PDF -->
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

              <!-- A4 橫向模擬畫布滾動容器 -->
              <div class="overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
                <!-- 真正的 A4 橫向紙本內容區塊（所見即所得的核心畫布，最大寬度約 280mm） -->
                <div
                  id="print-schedule-area"
                  class="bg-white rounded-xl shadow-xs border border-slate-200 p-6 sm:p-8 max-w-[285mm] mx-auto text-slate-900 flex flex-col min-h-[190mm]"
                >
                  <!-- 1. 文件頁首 -->
                  <div class="pb-3 mb-3 shrink-0">
                    <div class="flex items-start justify-between">
                      <div>
                        <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                          聖雅各朝聖之路 · 每日徒步行程
                        </h1>
                        <p class="text-xs text-slate-500 mt-1 font-medium">
                          出發日期：{{ exportMeta.startDate }} ｜ 預計 {{ exportMeta.arrivalDate }} 抵達
                        </p>
                      </div>

                      <div class="text-right shrink-0">
                        <div class="text-sm sm:text-base font-bold text-slate-900">
                          {{ exportMeta.routeName }}
                        </div>
                        <p class="text-[10px] text-slate-400 mt-1">
                          製表日期：{{ new Date().toISOString().split('T')[0] }}
                        </p>
                      </div>
                    </div>

                    <!-- 2. 四大核心指標摘要卡（無綠色、純白底、字型適中精緻） -->
                    <div class="mt-2.5 border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <table class="w-full text-center border-collapse">
                        <tbody>
                          <tr class="divide-x divide-slate-200">
                            <td class="py-1.5 sm:py-2 px-2 w-1/4">
                              <span class="block text-[11px] text-slate-500 font-medium mb-0.5">總規劃天數</span>
                              <span class="text-sm sm:text-base font-bold text-slate-900 font-mono">
                                {{ exportMeta.totalDays }} <span class="text-xs font-normal text-slate-500">天</span>
                              </span>
                            </td>
                            <td class="py-1.5 sm:py-2 px-2 w-1/4">
                              <span class="block text-[11px] text-slate-500 font-medium mb-0.5">總徒步里程</span>
                              <span class="text-sm sm:text-base font-bold text-slate-900 font-mono">
                                {{ exportMeta.totalDistanceKm.toFixed(1) }} <span class="text-xs font-normal text-slate-500">km</span>
                              </span>
                            </td>
                            <td class="py-1.5 sm:py-2 px-2 w-1/4">
                              <span class="block text-[11px] text-slate-500 font-medium mb-0.5">累積總爬升</span>
                              <span class="text-sm sm:text-base font-bold text-slate-900 font-mono">
                                +{{ Math.round(exportMeta.totalElevationGainM).toLocaleString() }} <span class="text-xs font-normal text-slate-500">m</span>
                              </span>
                            </td>
                            <td class="py-1.5 sm:py-2 px-2 w-1/4">
                              <span class="block text-[11px] text-slate-500 font-medium mb-0.5">日均步程 (步行日)</span>
                              <span class="text-sm sm:text-base font-bold text-slate-900 font-mono">
                                {{ avgKmPerWalkingDay }} <span class="text-xs font-normal text-slate-500">km/天</span>
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
                          <th class="py-2 px-2 w-[5%] whitespace-nowrap">天數</th>
                          <th class="py-2 px-2 w-[10%] whitespace-nowrap">日期</th>
                          <th class="py-2 px-2.5 w-[18%]">出發地 (From)</th>
                          <th class="py-2 px-2.5 w-[18%]">抵達城鎮 (To)</th>
                          <th class="py-2 px-2 w-[8.5%] text-right whitespace-nowrap">單日步程</th>
                          <th class="py-2 px-2 w-[8.5%] text-right whitespace-nowrap">單日爬升</th>
                          <th class="py-2 px-3 w-[32%]">備註</th>
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

                          <!-- 出發地（乾淨中文名稱 + 西文副標，嚴禁換行） -->
                          <td class="py-2 px-2.5">
                            <div class="text-slate-900 font-normal whitespace-nowrap">
                              {{ getCleanWaypointName(getWaypoint(stage.startWaypointId)?.chineseName || stage.startWaypointId) }}
                            </div>
                            <div class="text-[10px] text-slate-400 font-mono whitespace-nowrap truncate">
                              {{ getWaypointLocalName(getWaypoint(stage.startWaypointId)) }}
                            </div>
                          </td>

                          <!-- 抵達城鎮（乾淨中文名稱 + 西文副標，嚴禁換行） -->
                          <td class="py-2 px-2.5">
                            <div class="text-slate-900 font-normal whitespace-nowrap">
                              {{ getCleanWaypointName(getWaypoint(stage.endWaypointId)?.chineseName || stage.endWaypointId) }}
                            </div>
                            <div class="text-[10px] text-slate-400 font-mono whitespace-nowrap truncate">
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

                          <!-- 備註欄（無粗體，休息日僅顯示「休息日」，無內容則留空） -->
                          <td class="py-2 px-3 text-[11px] text-slate-600 font-normal">
                            <span v-if="stage.isRestDay">
                              休息日
                            </span>
                            <span v-else-if="stage.isExtensionStage">
                              世界盡頭延伸
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

<style>
@media print {
  /* 1. 隱藏主視窗與其他非列印目標節點 */
  body * {
    visibility: hidden;
  }

  /* 2. 破除 Headless UI Portal 與滾動容器之視窗裁剪 */
  [data-headlessui-portal],
  [data-headlessui-portal] * {
    transform: none !important;
    overflow: visible !important;
    max-height: none !important;
  }

  /* 3. 僅讓列印目標區域完全可見並強制滿版置頂 */
  #print-schedule-area,
  #print-schedule-area * {
    visibility: visible !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  #print-schedule-area {
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    max-width: none !important;
    min-height: auto !important;
    margin: 0 !important;
    padding: 8mm 10mm !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: white !important;
    z-index: 999999 !important;
  }

  @page {
    size: A4 landscape;
    margin: 0;
  }

  #print-schedule-area table {
    width: 100% !important;
    border-collapse: collapse !important;
  }

  #print-schedule-area tr {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  #print-schedule-area th,
  #print-schedule-area td {
    border-bottom: 1px solid #e2e8f0 !important;
  }

  #print-schedule-area .print-footer {
    margin-top: auto !important;
    padding-top: 12px !important;
    border-top: 1px solid #e2e8f0 !important;
  }
}
</style>
