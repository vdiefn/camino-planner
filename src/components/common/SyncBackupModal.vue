<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Share2,
  ShieldAlert,
  Upload,
  X,
} from 'lucide-vue-next'
import { renderSVG } from 'uqr'
import { useSyncBackup } from '@/composables/useSyncBackup'
import { usePackingStore } from '@/stores/packing'
import { useScheduleStore } from '@/stores/schedule'
import { createFullBackupJson, encodeCompactUrlPayload } from '@/utils/syncCodec'

const {
  isSyncModalOpen,
  pendingImport,
  importError,
  importSuccessMessage,
  closeSyncModal,
  cancelPendingImport,
  stageJsonFileImport,
  confirmApplyImport,
} = useSyncBackup()

const scheduleStore = useScheduleStore()
const packingStore = usePackingStore()

// 匯出範圍勾選開關（預設兩項全勾）
const includeSchedule = ref(true)
const includePacking = ref(true)

// 匯入確認勾選開關（依匯入資料動態初始化）
const applySchedule = ref(true)
const applyPacking = ref(true)

// 複製狀態與檔案上傳參照
const isCopied = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

watch(
  pendingImport,
  (incoming) => {
    if (incoming) {
      applySchedule.value = Boolean(incoming.schedule)
      applyPacking.value = Boolean(incoming.packing)
    }
  },
  { immediate: true },
)

const hasExportSelection = computed(() => includeSchedule.value || includePacking.value)

const hasImportSelection = computed(() => {
  if (!pendingImport.value) return false
  return (
    (Boolean(pendingImport.value.schedule) && applySchedule.value) ||
    (Boolean(pendingImport.value.packing) && applyPacking.value)
  )
})

// 當前路線之主線與延伸段分段
const currentMainStages = computed(() => {
  const rId = scheduleStore.currentRouteId
  const list = scheduleStore.mainStages[rId]
  return Array.isArray(list) && list.length > 0
    ? list
    : scheduleStore.stages.filter((s) => !s.isExtensionStage)
})

const currentExtStages = computed(() => {
  const rId = scheduleStore.currentRouteId
  const list = scheduleStore.extensionStages[rId]
  return Array.isArray(list) && list.length > 0
    ? list
    : scheduleStore.stages.filter((s) => s.isExtensionStage)
})

// 純同步計算壓縮 Token 與完整分享網址（零非同步競態）
const compactToken = computed(() => {
  if (!hasExportSelection.value) return ''
  return encodeCompactUrlPayload({
    includeSchedule: includeSchedule.value,
    includePacking: includePacking.value,
    scheduleSource: {
      routeId: scheduleStore.currentRouteId,
      draft: scheduleStore.currentDraft,
      mainStages: currentMainStages.value,
      extensionStages: currentExtStages.value,
    },
    packingSource: {
      bodyWeightKg: packingStore.bodyWeightKg,
      userItemStates: packingStore.userItemStates,
      customItems: packingStore.customItems,
      activeCategories: packingStore.activeCategories,
      categoryOrder: packingStore.categoryOrder,
    },
  })
})

const shareUrl = computed(() => {
  if (!compactToken.value || typeof window === 'undefined') return ''
  const baseUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`
  return `${baseUrl}#sync=${compactToken.value}`
})

// 純同步產生向量 QR Code SVG
const qrCodeSvg = computed(() => {
  if (!shareUrl.value) return ''
  try {
    return renderSVG(shareUrl.value, {
      ecc: 'L',
      border: 1,
    })
  } catch {
    return ''
  }
})

// 複製分享連結（含無剪貼簿權限之 Fallback 防禦）
async function handleCopyShareUrl() {
  if (!shareUrl.value) return
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareUrl.value)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl.value
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2200)
  } catch {
    importError.value = '瀏覽器阻擋自動複製，請直接長按選取網址列複製'
  }
}

// 下載完整 JSON 備份檔
function handleDownloadBackupJson() {
  if (!hasExportSelection.value) return
  const jsonContent = createFullBackupJson({
    includeSchedule: includeSchedule.value,
    includePacking: includePacking.value,
    scheduleSource: {
      currentRouteId: scheduleStore.currentRouteId,
      drafts: scheduleStore.drafts,
      mainStages: scheduleStore.mainStages,
      extensionStages: scheduleStore.extensionStages,
    },
    packingSource: {
      version: packingStore.version,
      bodyWeightKg: packingStore.bodyWeightKg,
      userItemStates: packingStore.userItemStates,
      customItems: packingStore.customItems,
      activeCategories: packingStore.activeCategories,
      categoryOrder: packingStore.categoryOrder,
    },
  })

  const today = new Date().toISOString().split('T')[0]
  const fileName = `camino-backup-${today}.json`
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  closeSyncModal()
}

function triggerFileSelect() {
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const content = typeof reader.result === 'string' ? reader.result : ''
    stageJsonFileImport(content)
    input.value = ''
  }
  reader.onerror = () => {
    importError.value = '讀取檔案失敗，請重試'
    input.value = ''
  }
  reader.readAsText(file, 'utf-8')
}

function handleConfirmImport() {
  if (!hasImportSelection.value) return
  confirmApplyImport({
    applySchedule: applySchedule.value,
    applyPacking: applyPacking.value,
  })
  closeSyncModal()
}
</script>

<template>
  <TransitionRoot appear :show="isSyncModalOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="closeSyncModal">
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
        <div class="flex min-h-full items-center justify-center p-4">
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
              class="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-5 sm:p-6 shadow-2xl transition-all border border-slate-200"
            >
              <!-- 頂部標題列 -->
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <DialogTitle
                  as="h3"
                  class="text-base font-bold text-slate-900 flex items-center gap-2"
                >
                  <Share2 class="w-5 h-5 text-amber-500" />
                  <span>{{ pendingImport ? '確認匯入外部行程與裝備' : '跨裝置同步與備份' }}</span>
                </DialogTitle>
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                  @click="closeSyncModal"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <!-- 錯誤提示橫幅 -->
              <div
                v-if="importError"
                class="mt-3 flex items-start gap-2 text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200"
              >
                <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
                <span>{{ importError }}</span>
              </div>

              <!-- 套用成功提示橫幅 -->
              <div
                v-if="importSuccessMessage"
                class="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200"
              >
                <CheckCircle2 class="w-4 h-4 shrink-0" />
                <span class="font-medium">{{ importSuccessMessage }}</span>
              </div>

              <!-- ==================== 模式 A：外部匯入預覽與覆寫確認 ==================== -->
              <div v-if="pendingImport" class="mt-4 space-y-4">
                <div class="flex items-start gap-2 text-xs text-amber-800 py-0.5">
                  <ShieldAlert class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div class="leading-relaxed">
                    偵測到來自{{
                      pendingImport.source === 'url' ? '分享連結 / QR Code' : '備份檔案'
                    }}的規劃資料。為保護您現有的心血，請勾選您想要套用並覆蓋的項目：
                  </div>
                </div>

                <div class="space-y-2.5">
                  <!-- 行程預覽勾選卡片 -->
                  <label
                    v-if="pendingImport.schedule"
                    class="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 transition cursor-pointer select-none"
                  >
                    <input
                      v-model="applySchedule"
                      type="checkbox"
                      class="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    <div class="flex-1 text-xs">
                      <div class="font-bold text-slate-900">
                        套用行程規劃：{{ pendingImport.schedule.summary.primaryRouteName }}
                      </div>
                      <div class="text-slate-600 mt-1">
                        共 {{ pendingImport.schedule.summary.totalDays }} 天 · 出發日
                        {{ pendingImport.schedule.summary.startDate }}
                      </div>
                      <div class="text-[11px] text-slate-400 mt-1">
                        ※ 僅更新此次包含的路線，您其他路線的草稿將完整保留。
                      </div>
                    </div>
                  </label>

                  <!-- 裝備預覽勾選卡片 -->
                  <label
                    v-if="pendingImport.packing"
                    class="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 transition cursor-pointer select-none"
                  >
                    <input
                      v-model="applyPacking"
                      type="checkbox"
                      class="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    <div class="flex-1 text-xs">
                      <div class="font-bold text-slate-900">套用裝備負重清單</div>
                      <div class="text-slate-600 mt-1">
                        設定體重 {{ pendingImport.packing.summary.bodyWeightKg }} kg · 包含
                        {{ pendingImport.packing.summary.activeCategoryCount }} 個分類
                        · 自訂裝備 {{ pendingImport.packing.summary.customCount }} 項
                      </div>
                      <div class="text-[11px] text-slate-400 mt-1">
                        ※ 勾選套用後，將完整取代您目前的裝備清單與自訂裝備。
                      </div>
                    </div>
                  </label>
                </div>

                <div
                  v-if="!hasImportSelection"
                  class="text-xs text-amber-600 font-medium text-center"
                >
                  請至少勾選一項要套用的內容，或點擊「取消」保留原資料
                </div>

                <div class="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    @click="cancelPendingImport"
                  >
                    取消（保留原資料）
                  </button>
                  <button
                    type="button"
                    :disabled="!hasImportSelection"
                    class="px-4 py-2 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition cursor-pointer"
                    @click="handleConfirmImport"
                  >
                    確認套用
                  </button>
                </div>
              </div>

              <!-- ==================== 模式 B：日常匯出分享與備份主面板 ==================== -->
              <div v-else class="mt-4 space-y-4">
                <!-- 1. 勾選要打包的範圍 -->
                <div>
                  <div class="text-xs font-semibold text-slate-700 mb-2">
                    1. 選擇要打包同步的內容（QR Code 與備份檔共用）
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
                    <label class="flex items-start gap-2.5 text-xs cursor-pointer select-none">
                      <input
                        v-model="includeSchedule"
                        type="checkbox"
                        class="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                      />
                      <div>
                        <div class="font-bold text-slate-900">行程規劃</div>
                        <div class="text-[11px] text-slate-500 mt-0.5">
                          {{ scheduleStore.currentRouteMetadata?.chineseName }} ·
                          {{ scheduleStore.stages.length }} 天
                        </div>
                      </div>
                    </label>

                    <label class="flex items-start gap-2.5 text-xs cursor-pointer select-none">
                      <input
                        v-model="includePacking"
                        type="checkbox"
                        class="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                      />
                      <div>
                        <div class="font-bold text-slate-900">裝備負重清單</div>
                        <div class="text-[11px] text-slate-500 mt-0.5">
                          含體重 {{ packingStore.bodyWeightKg }}kg 與自訂裝備（分享他人可取消勾選）
                        </div>
                      </div>
                    </label>
                  </div>

                  <p
                    v-if="!hasExportSelection"
                    class="mt-2 text-xs text-rose-600 font-medium flex items-center gap-1"
                  >
                    <AlertCircle class="w-3.5 h-3.5" />
                    <span>請至少勾選「行程規劃」或「裝備負重清單」其中一項以產生資料</span>
                  </p>
                </div>

                <!-- 2. QR Code 傳手機 & 複製分享連結 -->
                <div class="space-y-2">
                  <div class="text-xs font-semibold text-slate-700 mb-2">
                    2. 手機掃碼同步 / 分享給旅伴（當前路線）
                  </div>

                  <div
                    v-if="hasExportSelection && qrCodeSvg"
                    class="flex flex-col sm:flex-row items-center gap-4"
                  >
                    <div
                      class="w-36 h-36 bg-white p-2 rounded-xl border border-slate-200 shadow-xs shrink-0 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                      v-html="qrCodeSvg"
                    />
                    <div class="flex-1 w-full space-y-2 text-xs text-slate-600">
                      <p class="leading-relaxed">
                        拿出手機相機掃描左側 QR Code，即可免登入將目前規劃直接傳送到手機瀏覽器。
                      </p>
                      <div class="flex items-center gap-1.5">
                        <input
                          :value="shareUrl"
                          type="text"
                          readonly
                          class="w-full px-2.5 py-1.5 text-[11px] font-mono bg-slate-50 rounded-lg border border-slate-200 text-slate-500 focus:outline-none"
                          @focus="($event.target as HTMLInputElement)?.select()"
                        />
                        <button
                          type="button"
                          class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
                          @click="handleCopyShareUrl"
                        >
                          <Check v-if="isCopied" class="w-3.5 h-3.5 text-emerald-400" />
                          <Copy v-else class="w-3.5 h-3.5" />
                          <span>{{ isCopied ? '已複製' : '複製連結' }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 3. JSON 完整檔案備份與還原 -->
                <div class="space-y-2">
                  <div class="text-xs font-semibold text-slate-700 mb-2">
                    3. 完整備份檔匯出 / 匯入（含所有路線草稿）
                  </div>
                  <p class="text-[11px] text-slate-500 leading-relaxed">
                    可將所有路線草稿與自訂裝備存成
                    <code class="px-1 py-0.5 bg-slate-100 rounded text-slate-700">.json</code>
                    備份檔永久保存，防止清理瀏覽器快取後遺失。
                  </p>
                  <div class="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      :disabled="!hasExportSelection"
                      class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                      @click="handleDownloadBackupJson"
                    >
                      <Download class="w-3.5 h-3.5" />
                      <span>下載備份檔 (.json)</span>
                    </button>

                    <button
                      type="button"
                      class="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
                      @click="triggerFileSelect"
                    >
                      <Upload class="w-3.5 h-3.5" />
                      <span>讀取備份檔還原</span>
                    </button>
                    <input
                      ref="fileInputRef"
                      type="file"
                      accept=".json,application/json"
                      class="hidden"
                      @change="handleFileChange"
                    />
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
