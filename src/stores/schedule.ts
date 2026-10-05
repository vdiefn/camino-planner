import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserPlanConfig, UserStage, Waypoint } from '@/types/camino'
import type { RouteId, RouteScheduleDraft, FinisterreOption } from '@/types/route'
import {
  AVAILABLE_ROUTES,
  getRouteMetadata,
  getRouteWaypoints,
  getCombinedRouteWaypoints,
  buildGlobalWaypointMap,
  getEffectiveRouteMetadata,
  getRouteTotalDistance,
} from '@/data/routes'
import {
  generateInitialStages,
  generateFinisterreStages,
  insertRestDay as insertRestDayIntoStages,
  removeRestDay as removeRestDayFromStages,
  updateStageEndWaypoint as updateStageEndWaypointInStages,
  isWinterClosure,
} from '@/utils/scheduleCalculator'
import { finisterreOptionLabels } from '@/data/routes/finisterre'

/**
 * 預設各路線之獨立初始草稿
 */
function createDefaultDrafts(todayStr: string): Record<RouteId, RouteScheduleDraft> {
  return {
    frances: {
      routeId: 'frances',
      branchId: 'napoleon',
      startWaypointId: 'SJPP',
      endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
      startDate: todayStr,
      targetDays: 33,
      dailyKmQuota: 23.5,
      restDays: [],
      finisterreOption: 'NONE',
      finisterreDays: 3,
      santiagoLayoverDays: 0,
      updatedAt: new Date().toISOString(),
    },
    portugues: {
      routeId: 'portugues',
      branchId: 'central',
      startWaypointId: 'portugues:porto',
      endWaypointId: 'portugues:santiago',
      startDate: todayStr,
      targetDays: 11,
      dailyKmQuota: 21.8,
      restDays: [],
      finisterreOption: 'NONE',
      finisterreDays: 3,
      santiagoLayoverDays: 0,
      updatedAt: new Date().toISOString(),
    },
    norte: {
      routeId: 'norte',
      startWaypointId: 'norte:irun',
      endWaypointId: 'norte:santiago',
      startDate: todayStr,
      targetDays: 35,
      dailyKmQuota: 23.6,
      restDays: [],
      finisterreOption: 'NONE',
      finisterreDays: 3,
      santiagoLayoverDays: 0,
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * 純驗證與安全清洗函式：驗證草稿起訖點是否合法且依序，若不合法則修復為官方預設值
 */
function sanitizeDraft(draft: RouteScheduleDraft, routeId: RouteId): RouteScheduleDraft {
  const meta = getRouteMetadata(routeId)
  const defaultStart = meta?.defaultStartWaypointId || 'SJPP'
  const defaultEnd = meta?.defaultEndWaypointId || 'SANTIAGO_DE_COMPOSTELA'
  const wps = getRouteWaypoints(routeId, draft.branchId)

  const startWp = wps.find((w) => w.id === draft.startWaypointId)
  const endWp = wps.find((w) => w.id === draft.endWaypointId)

  // 驗證起訖點是否存在，且起點里程必須嚴格小於終點里程
  const isStartValid = Boolean(startWp)
  const isEndValid = Boolean(endWp)
  const isOrderValid = isStartValid && isEndValid && startWp!.cumulativeKm < endWp!.cumulativeKm

  if (!isStartValid || !isEndValid || !isOrderValid) {
    draft.startWaypointId = defaultStart
    draft.endWaypointId = defaultEnd
  }

  // 冬季封山強制防禦：11/1 ~ 3/31 期間法國之路自 SJPP 出發，唯一合法走法為瓦卡洛斯 (Valcarlos)
  if (routeId === 'frances' && draft.startWaypointId === 'SJPP' && isWinterClosure(draft.startDate)) {
    draft.branchId = 'valcarlos'
    ;(draft as any).day1RouteVariant = 'VALCARLOS'
  }

  return draft
}

export const useScheduleStore = defineStore(
  'schedule',
  () => {
    const todayStr = new Date().toISOString().split('T')[0]

    // 1. 版本控制與當前啟用路線
    const version = ref<number>(2)
    const currentRouteId = ref<RouteId>('frances')

    // 2. 多路線獨立草稿字典 (Multi-Drafts)
    const drafts = ref<Record<RouteId, RouteScheduleDraft>>(createDefaultDrafts(todayStr))

    // 3. 各路線目前計算出之主線分段快取
    const mainStages = ref<Record<RouteId, UserStage[]>>({
      frances: [],
      portugues: [],
      norte: [],
    })

    // 全域航點快取字典 (O(1) 效能)
    const globalWaypointMap = buildGlobalWaypointMap()

    function getWaypoint(id: string): Waypoint | undefined {
      return globalWaypointMap.get(id)
    }

    // 當前路線草稿
    const currentDraft = computed<RouteScheduleDraft>(() => {
      const active = drafts.value[currentRouteId.value]
      if (!active) {
        drafts.value[currentRouteId.value] = createDefaultDrafts(todayStr)[currentRouteId.value]
      }
      return drafts.value[currentRouteId.value]
    })

    // 向下相容 config 代理物件（使既有 View 與測試無痛存取）
    const config = computed<UserPlanConfig>({
      get: () => ({
        startDate: currentDraft.value.startDate,
        startWaypointId: currentDraft.value.startWaypointId,
        endWaypointId: currentDraft.value.endWaypointId,
        targetDays: currentDraft.value.targetDays,
        restDays: currentDraft.value.restDays?.length || 0,
        dailyTargetKm: currentDraft.value.dailyKmQuota,
        bodyWeightKg: 60,
        day1RouteVariant: (currentDraft.value as any).day1RouteVariant || 'NAPOLEON',
      }),
      set: (val: UserPlanConfig) => {
        currentDraft.value.startDate = val.startDate
        currentDraft.value.startWaypointId = val.startWaypointId
        currentDraft.value.endWaypointId = val.endWaypointId
        currentDraft.value.targetDays = val.targetDays
        currentDraft.value.dailyKmQuota = val.dailyTargetKm
        if (val.day1RouteVariant) {
          ;(currentDraft.value as any).day1RouteVariant = val.day1RouteVariant
        }
      },
    })

    // 當前主線航點陣列
    const currentMainWaypoints = computed<Waypoint[]>(() => {
      return getRouteWaypoints(currentRouteId.value, currentDraft.value.branchId)
    })

    // 當前有效完整航點集合（含世界盡頭）
    const currentWaypoints = computed<Waypoint[]>(() => {
      return getCombinedRouteWaypoints(
        currentRouteId.value,
        currentDraft.value.branchId,
        currentDraft.value.finisterreOption,
      )
    })

    // 當前有效路線中繼資料（動態由航點計算長度，並適配分支建議天數）
    const currentRouteMetadata = computed(() => {
      return getEffectiveRouteMetadata(currentRouteId.value, currentDraft.value.branchId)
    })

    // 依據各路線草稿之分支動態取得顯示長度
    function getRouteDisplayDistance(routeId: RouteId): number {
      const draft = drafts.value[routeId]
      return getRouteTotalDistance(routeId, draft?.branchId)
    }

    // 重新計算當前路線之主線行程
    function calculateCurrentMainStages() {
      sanitizeDraft(currentDraft.value, currentRouteId.value)
      const draft = currentDraft.value
      const wps = currentMainWaypoints.value
      const cfg: UserPlanConfig = {
        startDate: draft.startDate,
        startWaypointId: draft.startWaypointId,
        endWaypointId: draft.endWaypointId,
        targetDays: draft.targetDays,
        dailyTargetKm: draft.dailyKmQuota || 23.5,
        restDays: draft.restDays?.length || 0,
        bodyWeightKg: 60,
        day1RouteVariant:
          (draft as any).day1RouteVariant ||
          (draft.branchId === 'valcarlos' ? 'VALCARLOS' : 'NAPOLEON'),
      }
      mainStages.value[currentRouteId.value] = generateInitialStages(cfg, wps)
    }

    // 初始化排程
    function initSchedule() {
      calculateCurrentMainStages()
    }

    // 整合完整天數分段（主線分段 ＋ 世界盡頭分段，具備空資料自癒機制）
    const stages = computed<UserStage[]>({
      get: () => {
        let curMain = mainStages.value[currentRouteId.value]
        if (!curMain || curMain.length === 0) {
          calculateCurrentMainStages()
          curMain = mainStages.value[currentRouteId.value] || []
        }
        const option = currentDraft.value.finisterreOption || 'NONE'
        if (option === 'NONE' || curMain.length === 0) {
          return curMain
        }
        const lastMain = curMain[curMain.length - 1]
        const layoverDays = currentDraft.value.santiagoLayoverDays || 0
        const finDays = currentDraft.value.finisterreDays || finisterreOptionLabels[option]?.days || 3
        const finStages = generateFinisterreStages(lastMain, option, layoverDays, finDays)
        return [...curMain, ...finStages]
      },
      set: (newStages: UserStage[]) => {
        // 分離主線段與延伸段
        mainStages.value[currentRouteId.value] = newStages.filter((s) => !s.isExtensionStage)
      },
    })

    // 切換主路線
    function switchRoute(newRouteId: RouteId) {
      if (currentRouteId.value === newRouteId) return
      currentRouteId.value = newRouteId

      // 切換路線時明確清洗草稿資料並重新演算
      sanitizeDraft(currentDraft.value, newRouteId)
      calculateCurrentMainStages()
    }

    // 切換路線分支 (例如法國之路的拿破崙 vs 瓦卡洛斯；葡萄牙之路的中央線 vs 海岸線)
    function switchBranch(newBranchId: string) {
      // 若為冬季封山期，嚴格禁止切換至拿破崙之路
      if (
        currentRouteId.value === 'frances' &&
        currentDraft.value.startWaypointId === 'SJPP' &&
        isWinterClosure(currentDraft.value.startDate) &&
        newBranchId === 'napoleon'
      ) {
        return
      }

      currentDraft.value.branchId = newBranchId

      if (currentRouteId.value === 'frances') {
        const variant = newBranchId === 'valcarlos' ? 'VALCARLOS' : 'NAPOLEON'
        ;(currentDraft.value as any).day1RouteVariant = variant
      }

      sanitizeDraft(currentDraft.value, currentRouteId.value)

      // 智慧天數聯動：取得新分支之建議天數與航點推導長度
      const newMeta = getEffectiveRouteMetadata(currentRouteId.value, newBranchId)
      if (newMeta?.recommendedDays) {
        currentDraft.value.targetDays = newMeta.recommendedDays
        currentDraft.value.dailyKmQuota = Number(
          (newMeta.totalDistanceKm / newMeta.recommendedDays).toFixed(1),
        )
      }

      calculateCurrentMainStages()
    }

    // 切換世界盡頭延伸走向
    function setFinisterreOption(option: FinisterreOption) {
      currentDraft.value.finisterreOption = option
      if (option !== 'NONE') {
        currentDraft.value.finisterreDays = finisterreOptionLabels[option]?.days || 3
      }
    }

    // 設定延伸段徒步天數
    function setFinisterreDays(days: number) {
      const opt = currentDraft.value.finisterreOption
      if (opt === 'NONE') return
      const isBoth = opt === 'BOTH_FINISTERRE_FIRST' || opt === 'BOTH_MUXIA_FIRST'
      const minDays = isBoth ? 3 : 2
      const maxDays = isBoth ? 8 : 6
      currentDraft.value.finisterreDays = Math.max(minDays, Math.min(maxDays, days))
    }

    // 設定聖地牙哥停留天數
    function setSantiagoLayoverDays(days: number) {
      currentDraft.value.santiagoLayoverDays = Math.max(0, Math.min(days, 5))
    }

    // 重新計算排程
    function recalculateSchedule() {
      calculateCurrentMainStages()
    }

    // 明確套用並更新當前路線之排程設定（直接寫入底層草稿並重新演算）
    function updateDraftConfig(
      newConfig: Partial<UserPlanConfig> & {
        finisterreOption?: FinisterreOption
        finisterreDays?: number
        santiagoLayoverDays?: number
      },
    ) {
      if (newConfig.startDate !== undefined) currentDraft.value.startDate = newConfig.startDate
      if (newConfig.startWaypointId !== undefined)
        currentDraft.value.startWaypointId = newConfig.startWaypointId
      if (newConfig.endWaypointId !== undefined)
        currentDraft.value.endWaypointId = newConfig.endWaypointId
      if (newConfig.targetDays !== undefined) currentDraft.value.targetDays = newConfig.targetDays
      if (newConfig.dailyTargetKm !== undefined)
        currentDraft.value.dailyKmQuota = newConfig.dailyTargetKm
      if (newConfig.day1RouteVariant !== undefined) {
        ;(currentDraft.value as any).day1RouteVariant = newConfig.day1RouteVariant
      }
      if (newConfig.finisterreOption !== undefined) {
        currentDraft.value.finisterreOption = newConfig.finisterreOption
      }
      if (newConfig.finisterreDays !== undefined) {
        currentDraft.value.finisterreDays = newConfig.finisterreDays
      }
      if (newConfig.santiagoLayoverDays !== undefined) {
        currentDraft.value.santiagoLayoverDays = newConfig.santiagoLayoverDays
      }
      calculateCurrentMainStages()
    }

    // 重設回當前路線之官方預設設定
    function resetToDefaults() {
      const defaultState = createDefaultDrafts(todayStr)[currentRouteId.value]
      drafts.value[currentRouteId.value] = { ...defaultState }
      calculateCurrentMainStages()
    }

    function resetSchedule() {
      resetToDefaults()
    }

    // 插入休息日
    function insertRestDay(dayIndex: number) {
      const curMain = mainStages.value[currentRouteId.value]
      if (!curMain || curMain.length === 0) return

      // 若為世界盡頭分段，暫不支援動態均分
      if (dayIndex > curMain.length) return

      mainStages.value[currentRouteId.value] = insertRestDayIntoStages(
        curMain,
        dayIndex,
        currentMainWaypoints.value,
      )
    }

    // 移除休息日
    function removeRestDay(dayIndex: number) {
      const curMain = mainStages.value[currentRouteId.value]
      if (!curMain || curMain.length === 0) return

      if (dayIndex > curMain.length) return

      mainStages.value[currentRouteId.value] = removeRestDayFromStages(
        curMain,
        dayIndex,
        currentMainWaypoints.value,
      )
    }

    // 現場修改某天結束城鎮
    function updateEndWaypoint(dayIndex: number, newEndWaypointId: string) {
      const curMain = mainStages.value[currentRouteId.value]
      if (!curMain || curMain.length === 0) return

      if (dayIndex <= curMain.length) {
        mainStages.value[currentRouteId.value] = updateStageEndWaypointInStages(
          curMain,
          dayIndex,
          newEndWaypointId,
          currentMainWaypoints.value,
        )
      }
    }

    // 切換 Day 1 路線分支（法國之路專屬）
    function setDay1Variant(variant: 'NAPOLEON' | 'VALCARLOS') {
      if (
        currentRouteId.value === 'frances' &&
        currentDraft.value.startWaypointId === 'SJPP' &&
        isWinterClosure(currentDraft.value.startDate) &&
        variant === 'NAPOLEON'
      ) {
        return
      }

      ;(currentDraft.value as any).day1RouteVariant = variant
      currentDraft.value.branchId = variant === 'VALCARLOS' ? 'valcarlos' : 'napoleon'
      const curMain = mainStages.value[currentRouteId.value]
      if (curMain && curMain.length > 0 && curMain[0].startWaypointId === 'SJPP') {
        curMain[0].routeVariant = variant
        updateEndWaypoint(1, curMain[0].endWaypointId)
      }
    }

    // 統計數據
    const totalDistanceKm = computed(() => {
      return Number(stages.value.reduce((acc, s) => acc + s.distanceKm, 0).toFixed(1))
    })

    const totalElevationGainM = computed(() => {
      return stages.value.reduce((acc, s) => acc + s.elevationGainM, 0)
    })

    const totalWalkingDays = computed(() => {
      return stages.value.filter((s) => !s.isRestDay).length
    })

    const totalRestDays = computed(() => {
      return stages.value.filter((s) => s.isRestDay).length
    })

    const isWinterLocked = computed(() => {
      return (
        currentRouteId.value === 'frances' &&
        currentDraft.value.startWaypointId === 'SJPP' &&
        isWinterClosure(currentDraft.value.startDate)
      )
    })

    // 舊版 LocalStorage 快取無損平滑遷移管線 (Schema Migration)
    function migrateLegacyStorage(legacyData?: any) {
      // 偵測若為舊版無 drafts 結構或版本低於 2
      if (!drafts.value || !drafts.value.frances) {
        drafts.value = createDefaultDrafts(todayStr)
      }

      // 檢查是否有舊版平鋪的 config 遺留資料
      const legacyCfg = legacyData?.config || (legacyData as any)?.legacyConfig
      if (legacyCfg && typeof legacyCfg === 'object') {
        drafts.value.frances.startDate = legacyCfg.startDate || drafts.value.frances.startDate
        drafts.value.frances.startWaypointId =
          legacyCfg.startWaypointId || drafts.value.frances.startWaypointId
        drafts.value.frances.endWaypointId =
          legacyCfg.endWaypointId || drafts.value.frances.endWaypointId
        drafts.value.frances.targetDays = legacyCfg.targetDays || drafts.value.frances.targetDays
        drafts.value.frances.dailyKmQuota =
          legacyCfg.dailyTargetKm || drafts.value.frances.dailyKmQuota
        if (legacyCfg.day1RouteVariant) {
          ;(drafts.value.frances as any).day1RouteVariant = legacyCfg.day1RouteVariant
        }
      }

      // 檢查是否有舊版平鋪的 stages 遺留資料
      const legacyStages = legacyData?.stages || (legacyData as any)?.legacyStages
      if (Array.isArray(legacyStages) && legacyStages.length > 0) {
        mainStages.value.frances = legacyStages
      }

      version.value = 2
      if (!currentRouteId.value) {
        currentRouteId.value = 'frances'
      }

      // 快取載入完成後，對所有路線草稿進行安全清洗防禦
      for (const r of AVAILABLE_ROUTES) {
        if (drafts.value[r.id]) {
          sanitizeDraft(drafts.value[r.id], r.id)
        }
      }

      calculateCurrentMainStages()
    }

    // 首次載入若無分段則初始化
    if (!mainStages.value[currentRouteId.value] || mainStages.value[currentRouteId.value].length === 0) {
      calculateCurrentMainStages()
    }

    return {
      version,
      currentRouteId,
      drafts,
      currentDraft,
      config,
      stages,
      currentWaypoints,
      currentMainWaypoints,
      getWaypoint,
      initSchedule,
      switchRoute,
      switchBranch,
      setFinisterreOption,
      setFinisterreDays,
      setSantiagoLayoverDays,
      recalculateSchedule,
      updateDraftConfig,
      resetToDefaults,
      resetSchedule,
      insertRestDay,
      removeRestDay,
      updateEndWaypoint,
      setDay1Variant,
      availableRoutes: AVAILABLE_ROUTES,
      getRouteMetadata,
      currentRouteMetadata,
      getRouteDisplayDistance,
      totalDistanceKm,
      totalElevationGainM,
      totalWalkingDays,
      totalRestDays,
      isWinterLocked,
      migrateLegacyStorage,
    }
  },
  {
    persist: {
      key: 'schedule', // 嚴格保持與舊版相同 key，確保能攔截到舊版快取資料
      pick: ['version', 'currentRouteId', 'drafts', 'mainStages'],
      afterHydrate: (ctx: any) => {
        ctx.store.migrateLegacyStorage(ctx.store)
      },
    },
  },
)
