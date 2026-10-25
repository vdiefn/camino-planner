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
  calculateSegmentStats,
  isWinterClosure,
  addDaysToDate,
} from '@/utils/scheduleCalculator'
import { finisterreOptionLabels, getFinisterreWaypoints } from '@/data/routes/finisterre'

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

    // 4. 各路線目前計算出之世界盡頭延伸段快取
    const extensionStages = ref<Record<RouteId, UserStage[]>>({
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

    // 向下相容 config 代理物件（使既有 View 與測試無痛存取，day1RouteVariant 由 branchId 單一真相來源推導）
    const config = computed<UserPlanConfig>({
      get: () => ({
        startDate: currentDraft.value.startDate,
        startWaypointId: currentDraft.value.startWaypointId,
        endWaypointId: currentDraft.value.endWaypointId,
        targetDays: currentDraft.value.targetDays,
        restDays: currentDraft.value.restDays?.length || 0,
        dailyTargetKm: currentDraft.value.dailyKmQuota,
        bodyWeightKg: 60,
        day1RouteVariant: (currentDraft.value.branchId === 'valcarlos'
          ? 'VALCARLOS'
          : 'NAPOLEON') as 'NAPOLEON' | 'VALCARLOS',
      }),
      set: (val: UserPlanConfig) => {
        currentDraft.value.startDate = val.startDate
        currentDraft.value.startWaypointId = val.startWaypointId
        currentDraft.value.endWaypointId = val.endWaypointId
        currentDraft.value.targetDays = val.targetDays
        currentDraft.value.dailyKmQuota = val.dailyTargetKm
        if (val.day1RouteVariant) {
          currentDraft.value.branchId =
            val.day1RouteVariant === 'VALCARLOS' ? 'valcarlos' : 'napoleon'
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

    // 檢查指定路線是否已具備與當前草稿設定吻合之有效分段（保留休息日與自訂停靠點，嚴防跨路線髒資料）
    function hasValidPersistedStages(routeId: RouteId): boolean {
      const saved = mainStages.value[routeId]
      const draft = drafts.value[routeId]
      if (!Array.isArray(saved) || saved.length === 0 || !draft) return false

      const expectedVariant = draft.branchId === 'valcarlos' ? 'VALCARLOS' : 'NAPOLEON'
      const isVariantMatch =
        routeId !== 'frances' ||
        saved[0].startWaypointId !== 'SJPP' ||
        saved[0].routeVariant === expectedVariant

      // 嚴格檢驗：主線所有分段起訖點必須全數屬於該路線之合法航點清單，絕不能混雜外路線或世界盡頭航點
      const routeWaypoints = getRouteWaypoints(routeId, draft.branchId)
      const isWaypointsValid = saved.every(
        (s) =>
          routeWaypoints.some((w) => w.id === s.startWaypointId) &&
          routeWaypoints.some((w) => w.id === s.endWaypointId),
      )

      return (
        isWaypointsValid &&
        saved.length === draft.targetDays &&
        saved[0].date === draft.startDate &&
        saved[0].startWaypointId === draft.startWaypointId &&
        saved[saved.length - 1].endWaypointId === draft.endWaypointId &&
        isVariantMatch
      )
    }

    // 同步主線分段中之休息日索引回草稿狀態
    function syncRestDaysFromMainStages(routeId: RouteId) {
      const saved = mainStages.value[routeId]
      const draft = drafts.value[routeId]
      if (!Array.isArray(saved) || !draft) return
      draft.restDays = saved.filter((s) => s.isRestDay).map((s) => s.dayIndex)
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
        day1RouteVariant: draft.branchId === 'valcarlos' ? 'VALCARLOS' : 'NAPOLEON',
      }
      mainStages.value[currentRouteId.value] = generateInitialStages(cfg, wps)
      syncRestDaysFromMainStages(currentRouteId.value)
      calculateCurrentExtensionStages()
    }

    // 重新計算當前路線之世界盡頭延伸段行程
    function calculateCurrentExtensionStages() {
      const curMain = mainStages.value[currentRouteId.value]
      const option = currentDraft.value.finisterreOption || 'NONE'
      if (option === 'NONE' || !curMain || curMain.length === 0) {
        extensionStages.value[currentRouteId.value] = []
        return
      }
      const lastMain = curMain[curMain.length - 1]
      const finDays = currentDraft.value.finisterreDays || finisterreOptionLabels[option]?.days || 3
      extensionStages.value[currentRouteId.value] = generateFinisterreStages(
        lastMain,
        option,
        0,
        finDays,
      )
    }

    // 當主線分段日期或天數變動時，同步推移世界盡頭延伸段之日期與天數
    function syncExtensionDates() {
      const curMain = mainStages.value[currentRouteId.value]
      const curExt = extensionStages.value[currentRouteId.value]
      if (!curMain || curMain.length === 0 || !curExt || curExt.length === 0) return

      let curDate = curMain[curMain.length - 1].date
      let curDayIndex = curMain[curMain.length - 1].dayIndex

      for (const stg of curExt) {
        curDate = addDaysToDate(curDate, 1)
        curDayIndex++
        stg.date = curDate
        stg.dayIndex = curDayIndex
      }
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
        let curExt = extensionStages.value[currentRouteId.value]
        if (!curExt || curExt.length === 0) {
          calculateCurrentExtensionStages()
          curExt = extensionStages.value[currentRouteId.value] || []
        }
        return [...curMain, ...curExt]
      },
      set: (newStages: UserStage[]) => {
        // 分離主線段與延伸段
        mainStages.value[currentRouteId.value] = newStages.filter((s) => !s.isExtensionStage)
        extensionStages.value[currentRouteId.value] = newStages.filter((s) => s.isExtensionStage)
      },
    })

    // 切換主路線
    function switchRoute(newRouteId: RouteId) {
      if (currentRouteId.value === newRouteId) return
      currentRouteId.value = newRouteId

      // 切換路線時明確清洗草稿資料；若已有吻合之分段快取則保留使用者微調進度並對齊 restDays
      sanitizeDraft(currentDraft.value, newRouteId)
      if (!hasValidPersistedStages(newRouteId)) {
        calculateCurrentMainStages()
      } else {
        syncRestDaysFromMainStages(newRouteId)
        validateAndSyncExtensionStages()
      }
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
      calculateCurrentExtensionStages()
    }

    // 設定延伸段徒步天數（依使用者需求：單點最高 8 天，雙點最高 15 天）
    function setFinisterreDays(days: number) {
      const opt = currentDraft.value.finisterreOption
      if (opt === 'NONE') return
      const isBoth = opt === 'BOTH_FINISTERRE_FIRST' || opt === 'BOTH_MUXIA_FIRST'
      const minDays = isBoth ? 3 : 2
      const maxDays = isBoth ? 15 : 8
      currentDraft.value.finisterreDays = Math.max(minDays, Math.min(maxDays, days))
      calculateCurrentExtensionStages()
    }

    // 設定聖地牙哥停留天數（已棄用，保留介面相容）
    function setSantiagoLayoverDays(_days: number) {
      // 依使用者需求已移除自動修整日，改由 StageCard 自由設置休息日
    }

    // 重新計算排程
    function recalculateSchedule() {
      calculateCurrentMainStages()
      calculateCurrentExtensionStages()
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
        currentDraft.value.branchId =
          newConfig.day1RouteVariant === 'VALCARLOS' ? 'valcarlos' : 'napoleon'
      }
      if (newConfig.finisterreOption !== undefined) {
        currentDraft.value.finisterreOption = newConfig.finisterreOption
      }
      if (newConfig.finisterreDays !== undefined) {
        currentDraft.value.finisterreDays = newConfig.finisterreDays
      }
      if (newConfig.restDays === undefined) {
        currentDraft.value.restDays = []
      }
      calculateCurrentMainStages()
      calculateCurrentExtensionStages()
    }

    // 重設回當前路線之官方預設設定
    function resetToDefaults() {
      const defaultState = createDefaultDrafts(todayStr)[currentRouteId.value]
      drafts.value[currentRouteId.value] = { ...defaultState }
      extensionStages.value[currentRouteId.value] = []
      calculateCurrentMainStages()
      calculateCurrentExtensionStages()
    }

    function resetSchedule() {
      resetToDefaults()
    }

    // 當主線分段變更時，同步推移世界盡頭延伸段之日期與天數（延伸段永遠保留規劃，不因主線落腳點而消失）
    function validateAndSyncExtensionStages() {
      const curMain = mainStages.value[currentRouteId.value]
      const option = currentDraft.value.finisterreOption || 'NONE'
      if (option === 'NONE' || !curMain || curMain.length === 0) {
        extensionStages.value[currentRouteId.value] = []
        return
      }

      const curExt = extensionStages.value[currentRouteId.value]
      if (!curExt || curExt.length === 0) {
        calculateCurrentExtensionStages()
      } else {
        syncExtensionDates()
      }
    }

    // 插入休息日
    function insertRestDay(dayIndex: number) {
      const curMain = mainStages.value[currentRouteId.value]
      if (!curMain || curMain.length === 0) return

      if (dayIndex <= curMain.length) {
        mainStages.value[currentRouteId.value] = insertRestDayIntoStages(
          curMain,
          dayIndex,
          currentMainWaypoints.value,
        )
        syncRestDaysFromMainStages(currentRouteId.value)
        validateAndSyncExtensionStages()
      } else {
        const curExt = extensionStages.value[currentRouteId.value]
        if (!curExt || curExt.length === 0) return
        const finWaypoints = getFinisterreWaypoints(currentDraft.value.finisterreOption)
        extensionStages.value[currentRouteId.value] = insertRestDayIntoStages(
          curExt,
          dayIndex,
          finWaypoints,
        )
      }
    }

    // 移除休息日
    function removeRestDay(dayIndex: number) {
      const curMain = mainStages.value[currentRouteId.value]
      if (!curMain || curMain.length === 0) return

      if (dayIndex <= curMain.length) {
        mainStages.value[currentRouteId.value] = removeRestDayFromStages(
          curMain,
          dayIndex,
          currentMainWaypoints.value,
        )
        syncRestDaysFromMainStages(currentRouteId.value)
        validateAndSyncExtensionStages()
      } else {
        const curExt = extensionStages.value[currentRouteId.value]
        if (!curExt || curExt.length === 0) return
        const finWaypoints = getFinisterreWaypoints(currentDraft.value.finisterreOption)
        extensionStages.value[currentRouteId.value] = removeRestDayFromStages(
          curExt,
          dayIndex,
          finWaypoints,
        )
      }
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
        validateAndSyncExtensionStages()
      } else {
        const curExt = extensionStages.value[currentRouteId.value]
        if (!curExt || curExt.length === 0) return
        const finWaypoints = getFinisterreWaypoints(currentDraft.value.finisterreOption)
        extensionStages.value[currentRouteId.value] = updateStageEndWaypointInStages(
          curExt,
          dayIndex,
          newEndWaypointId,
          finWaypoints,
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

      currentDraft.value.branchId = variant === 'VALCARLOS' ? 'valcarlos' : 'napoleon'
      const curMain = mainStages.value[currentRouteId.value]
      if (curMain && curMain.length > 0 && curMain[0].startWaypointId === 'SJPP') {
        curMain[0].routeVariant = variant
        updateEndWaypoint(1, curMain[0].endWaypointId)
      }
    }

    // 一鍵追加一天主線行程抵達聖地牙哥大教堂（完全保留使用者先前調整好的所有城鎮與休息日）
    function appendMainDayToSantiago() {
      const curMain = mainStages.value[currentRouteId.value]
      if (!curMain || curMain.length === 0) return
      const lastMain = curMain[curMain.length - 1]
      const targetEndId = currentDraft.value.endWaypointId || 'SANTIAGO_DE_COMPOSTELA'

      // 若最後一天已經抵達聖地牙哥大教堂且非休息日，則無需追加
      if (
        (lastMain.endWaypointId === targetEndId || lastMain.endWaypointId === 'SANTIAGO_DE_COMPOSTELA') &&
        !lastMain.isRestDay
      ) {
        return
      }

      const nextDate = addDaysToDate(lastMain.date, 1)
      const nextDayIndex = lastMain.dayIndex + 1
      const segStats = calculateSegmentStats(
        lastMain.endWaypointId,
        targetEndId,
        lastMain.routeVariant,
        currentMainWaypoints.value,
      )

      const newStage: UserStage = {
        dayIndex: nextDayIndex,
        date: nextDate,
        startWaypointId: lastMain.endWaypointId,
        endWaypointId: targetEndId,
        passedWaypointIds: segStats.passedWaypointIds,
        distanceKm: segStats.distanceKm,
        elevationGainM: segStats.elevationGainM,
        elevationLossM: segStats.elevationLossM,
        isRestDay: false,
        isExtensionStage: false,
      }

      curMain.push(newStage)
      currentDraft.value.targetDays = curMain.length
      validateAndSyncExtensionStages()
    }

    // 一鍵追加一天世界盡頭天數抵達海角終點（Fisterra 或 Muxía）
    function appendFinisterreDayToDestination() {
      const opt = currentDraft.value.finisterreOption
      if (opt === 'NONE') return
      const curExt = extensionStages.value[currentRouteId.value]
      if (!curExt || curExt.length === 0) return
      const lastExt = curExt[curExt.length - 1]

      let targetEndId = 'finisterre:fisterra'
      if (opt === 'MUXIA_ONLY' || opt === 'BOTH_FINISTERRE_FIRST') {
        targetEndId = 'finisterre:muxia'
      }

      // 如果最後一天已經抵達目標海角且不是休息日，則無需追加
      if (lastExt.endWaypointId === targetEndId && !lastExt.isRestDay) {
        return
      }

      const isBoth = opt === 'BOTH_FINISTERRE_FIRST' || opt === 'BOTH_MUXIA_FIRST'
      const maxDays = isBoth ? 15 : 8
      if (curExt.length >= maxDays) return

      const finWaypoints = getFinisterreWaypoints(opt)
      const nextDate = addDaysToDate(lastExt.date, 1)
      const nextDayIndex = lastExt.dayIndex + 1
      const segStats = calculateSegmentStats(
        lastExt.endWaypointId,
        targetEndId,
        undefined,
        finWaypoints,
      )

      const newStage: UserStage = {
        dayIndex: nextDayIndex,
        date: nextDate,
        startWaypointId: lastExt.endWaypointId,
        endWaypointId: targetEndId,
        passedWaypointIds: segStats.passedWaypointIds,
        distanceKm: segStats.distanceKm,
        elevationGainM: segStats.elevationGainM,
        elevationLossM: segStats.elevationLossM,
        isRestDay: false,
        isExtensionStage: true,
        stageNotes: targetEndId.includes('fisterra')
          ? '大西洋地涯菲尼斯特雷 🌅'
          : '穆希亞聖船聖母聖殿 ⛵',
      }

      curExt.push(newStage)
      currentDraft.value.finisterreDays = curExt.length
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

      // 檢查是否有舊版平鋪的 config 遺留資料（排除 store 自身之 computed config 代理）
      const isRawLegacyPayload = Boolean(legacyData && !('currentDraft' in legacyData))
      const legacyCfg = isRawLegacyPayload
        ? legacyData?.config || (legacyData as any)?.legacyConfig
        : (legacyData as any)?.legacyConfig
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
          drafts.value.frances.branchId =
            legacyCfg.day1RouteVariant === 'VALCARLOS' ? 'valcarlos' : 'napoleon'
        }
      }

      // 檢查是否有舊版平鋪的 stages 遺留資料（排除 store 自身之 computed stages）
      const legacyStages = isRawLegacyPayload
        ? legacyData?.stages || (legacyData as any)?.legacyStages
        : (legacyData as any)?.legacyStages
      if (Array.isArray(legacyStages) && legacyStages.length > 0) {
        mainStages.value.frances = legacyStages
      }

      if (!extensionStages.value) {
        extensionStages.value = { frances: [], portugues: [], norte: [] }
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

      if (!hasValidPersistedStages(currentRouteId.value)) {
        calculateCurrentMainStages()
      } else {
        syncRestDaysFromMainStages(currentRouteId.value)
        validateAndSyncExtensionStages()
      }
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
      appendMainDayToSantiago,
      appendFinisterreDayToDestination,
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
      pick: ['version', 'currentRouteId', 'drafts', 'mainStages', 'extensionStages'],
      afterHydrate: (ctx: any) => {
        ctx.store.migrateLegacyStorage(ctx.store)
      },
    },
  },
)
