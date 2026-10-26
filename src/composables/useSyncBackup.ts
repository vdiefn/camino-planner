import { ref } from 'vue'
import { usePackingStore } from '@/stores/packing'
import { useScheduleStore } from '@/stores/schedule'
import {
  decodeCompactUrlPayload,
  parseBackupJson,
  type NormalizedImportPayload,
} from '@/utils/syncCodec'

const isSyncModalOpen = ref(false)
const pendingImport = ref<NormalizedImportPayload | null>(null)
const importError = ref('')
const importSuccessMessage = ref('')

export function useSyncBackup() {
  const clearUrlSyncHash = () => {
    if (typeof window === 'undefined') return
    if (window.location.hash.startsWith('#sync=')) {
      const cleanUrl = window.location.pathname + window.location.search
      window.history.replaceState(null, '', cleanUrl)
    }
  }

  const openSyncModal = () => {
    importError.value = ''
    importSuccessMessage.value = ''
    isSyncModalOpen.value = true
  }

  const closeSyncModal = () => {
    isSyncModalOpen.value = false
    pendingImport.value = null
    importError.value = ''
    importSuccessMessage.value = ''
    clearUrlSyncHash()
  }

  const cancelPendingImport = () => {
    pendingImport.value = null
    importError.value = ''
    clearUrlSyncHash()
  }

  /**
   * 啟動時檢查網址 Hash 是否帶有 #sync=... 一次性同步參數
   */
  const checkUrlHashOnMount = () => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash
    if (!hash || !hash.startsWith('#sync=')) return

    let token = ''
    try {
      token = decodeURIComponent(hash.slice('#sync='.length).trim())
    } catch (err) {
      console.warn('[useSyncBackup] Failed to decode URL hash token:', err)
      pendingImport.value = null
      importError.value = '分享連結格式不完整或遭通訊軟體截斷，請重新複製完整連結'
      isSyncModalOpen.value = true
      clearUrlSyncHash()
      return
    }
    clearUrlSyncHash()

    if (!token) return
    const decodeResult = decodeCompactUrlPayload(token)
    if (decodeResult.ok) {
      pendingImport.value = decodeResult.data
      importError.value = ''
    } else {
      pendingImport.value = null
      importError.value = decodeResult.error
    }
    isSyncModalOpen.value = true
  }

  /**
   * 讀取使用者選取之 .json 備份檔文字並進入預覽確認階段
   */
  const stageJsonFileImport = (rawJsonText: string) => {
    importError.value = ''
    importSuccessMessage.value = ''
    const decodeResult = parseBackupJson(rawJsonText)
    if (decodeResult.ok) {
      pendingImport.value = decodeResult.data
    } else {
      pendingImport.value = null
      importError.value = decodeResult.error
    }
  }

  /**
   * 使用者於預覽視窗勾選確認後，正式寫入對應 Store
   */
  const confirmApplyImport = (options: { applySchedule: boolean; applyPacking: boolean }) => {
    if (!pendingImport.value) return false

    const scheduleStore = useScheduleStore()
    const packingStore = usePackingStore()
    const appliedParts: string[] = []

    if (options.applySchedule && pendingImport.value.schedule) {
      scheduleStore.applyImportedSchedule(pendingImport.value.schedule)
      appliedParts.push('行程規劃')
    }

    if (options.applyPacking && pendingImport.value.packing) {
      packingStore.applyImportedPacking(pendingImport.value.packing)
      appliedParts.push('裝備清單')
    }

    pendingImport.value = null
    clearUrlSyncHash()
    importSuccessMessage.value =
      appliedParts.length > 0 ? `已成功套用：${appliedParts.join('、')}！` : ''
    return true
  }

  return {
    isSyncModalOpen,
    pendingImport,
    importError,
    importSuccessMessage,
    openSyncModal,
    closeSyncModal,
    cancelPendingImport,
    checkUrlHashOnMount,
    stageJsonFileImport,
    confirmApplyImport,
  }
}
