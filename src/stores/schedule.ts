import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserPlanConfig, UserStage } from '@/types/camino'
import { waypoints } from '@/data/waypoints'
import {
  generateInitialStages,
  insertRestDay as insertRestDayIntoStages,
  removeRestDay as removeRestDayFromStages,
  updateStageEndWaypoint as updateStageEndWaypointInStages,
  isWinterClosure,
} from '@/utils/scheduleCalculator'

export const useScheduleStore = defineStore(
  'schedule',
  () => {
    // 1. 使用者排程配置
    const config = ref<UserPlanConfig>({
      startDate: new Date().toISOString().split('T')[0],
      startWaypointId: 'SJPP',
      endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
      targetDays: 33,
      restDays: 0,
      dailyTargetKm: 23.5,
      bodyWeightKg: 65,
      day1RouteVariant: 'NAPOLEON',
    })

    // 2. 每日分段資料清單
    const stages = ref<UserStage[]>([])

    // 初始化排程
    function initSchedule() {
      stages.value = generateInitialStages(config.value, waypoints)
    }

    // 依照當前使用者設定重新計算排程（不重設天數）
    function recalculateSchedule() {
      initSchedule()
    }

    // 點擊「重設」時還原回官方標準 33 天全線排程
    function resetToDefaults() {
      config.value.startWaypointId = 'SJPP'
      config.value.endWaypointId = 'SANTIAGO_DE_COMPOSTELA'
      config.value.targetDays = 33
      config.value.restDays = 0
      config.value.day1RouteVariant = 'NAPOLEON'
      initSchedule()
    }

    // 相容別名
    function resetSchedule() {
      resetToDefaults()
    }

    // 設為休息日
    function insertRestDay(dayIndex: number) {
      stages.value = insertRestDayIntoStages(stages.value, dayIndex, waypoints)
    }

    // 移除休息日
    function removeRestDay(dayIndex: number) {
      stages.value = removeRestDayFromStages(stages.value, dayIndex, waypoints)
    }

    // 現場修改某天結束城鎮
    function updateEndWaypoint(dayIndex: number, newEndWaypointId: string) {
      stages.value = updateStageEndWaypointInStages(stages.value, dayIndex, newEndWaypointId, waypoints)
    }

    // 切換 Day 1 路線變更
    function setDay1Variant(variant: 'NAPOLEON' | 'VALCARLOS') {
      config.value.day1RouteVariant = variant
      if (stages.value.length > 0 && stages.value[0].startWaypointId === 'SJPP') {
        stages.value[0].routeVariant = variant
        updateEndWaypoint(1, stages.value[0].endWaypointId)
      }
    }

    // 3. Computed 統計數據
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
      return config.value.startWaypointId === 'SJPP' && isWinterClosure(config.value.startDate)
    })

    // 若尚未初始化過，執行預設初始化
    if (stages.value.length === 0) {
      initSchedule()
    }

    return {
      config,
      stages,
      initSchedule,
      recalculateSchedule,
      resetToDefaults,
      resetSchedule,
      insertRestDay,
      removeRestDay,
      updateEndWaypoint,
      setDay1Variant,
      totalDistanceKm,
      totalElevationGainM,
      totalWalkingDays,
      totalRestDays,
      isWinterLocked,
    }
  },
  {
    persist: true, // 透過 pinia-plugin-persistedstate 本機持久化
  },
)
