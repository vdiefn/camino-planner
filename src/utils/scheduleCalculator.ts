import type { UserPlanConfig, UserStage, Waypoint } from '@/types/camino'

/**
 * 判定日期是否落在 11/1 至 3/31 冬季拿破崙之路強制封閉期
 */
export function isWinterClosure(dateString: string): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return false

  const month = date.getMonth() + 1 // 1 ~ 12
  // 11月、12月、1月、2月、3月
  return month === 11 || month === 12 || month === 1 || month === 2 || month === 3
}

/**
 * 日期加上指定天數，輸出 YYYY-MM-DD
 */
export function addDaysToDate(dateString: string, daysToAdd: number): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() + daysToAdd)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * 計算兩航點間的距離、爬升、爬降與途經中繼點
 */
export function calculateSegmentStats(
  startId: string,
  endId: string,
  routeVariant: 'NAPOLEON' | 'VALCARLOS' | undefined,
  allWaypoints: Waypoint[],
): {
  distanceKm: number
  elevationGainM: number
  elevationLossM: number
  passedWaypointIds: string[]
} {
  if (startId === endId) {
    return {
      distanceKm: 0,
      elevationGainM: 0,
      elevationLossM: 0,
      passedWaypointIds: [],
    }
  }

  const startWp = allWaypoints.find((w) => w.id === startId)
  const endWp = allWaypoints.find((w) => w.id === endId)

  // 自動推導路線分支（如果起點或終點屬於特定分支）
  let inferredVariant = routeVariant
  if (!inferredVariant) {
    if (startWp?.routeVariant === 'NAPOLEON' || endWp?.routeVariant === 'NAPOLEON') {
      inferredVariant = 'NAPOLEON'
    } else if (startWp?.routeVariant === 'VALCARLOS' || endWp?.routeVariant === 'VALCARLOS') {
      inferredVariant = 'VALCARLOS'
    }
  }

  // 取得有效航點鏈（排除不符合當前路線分支的點）
  const activeWaypoints = allWaypoints.filter((w) => {
    if (!w.routeVariant || w.routeVariant === 'COMMON') return true
    return w.routeVariant === inferredVariant
  })

  const startIndex = activeWaypoints.findIndex((w) => w.id === startId)
  const endIndex = activeWaypoints.findIndex((w) => w.id === endId)

  if (startIndex === -1 || endIndex === -1) {
    return {
      distanceKm: 0,
      elevationGainM: 0,
      elevationLossM: 0,
      passedWaypointIds: [],
    }
  }

  const [fromIdx, toIdx] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex]
  const segment = activeWaypoints.slice(fromIdx, toIdx + 1)

  let distanceKm = 0
  let elevationGainM = 0
  let elevationLossM = 0
  const passedWaypointIds: string[] = []

  for (let i = 0; i < segment.length - 1; i++) {
    const current = segment[i]
    const next = segment[i + 1]

    const dist = Math.abs(next.cumulativeKm - current.cumulativeKm)
    distanceKm += dist

    const elevDiff = next.elevationM - current.elevationM
    if (elevDiff > 0) {
      elevationGainM += elevDiff
    } else {
      elevationLossM += Math.abs(elevDiff)
    }

    if (i > 0) {
      passedWaypointIds.push(current.id)
    }
  }

  // 特別修正：Day 1 越嶺真實爬升（因為航點間有最高鞍部）
  if (startId === 'SJPP' && endId === 'RONCESVALLES') {
    if (routeVariant === 'VALCARLOS') {
      distanceKm = 24.1
      elevationGainM = 850
      elevationLossM = 260
    } else {
      // 拿破崙之路爬升經 Col de Lepoeder (1430m)
      distanceKm = 25.1
      elevationGainM = 1250
      elevationLossM = 480
    }
  }

  return {
    distanceKm: Number(distanceKm.toFixed(1)),
    elevationGainM: Math.round(elevationGainM),
    elevationLossM: Math.round(elevationLossM),
    passedWaypointIds,
  }
}

/**
 * 依據使用者規劃設定與起訖航點，動態生成每日分段 (Initial Stages)
 * 依每日預估里程與有庇護所的城鎮優先排列
 */
export function generateInitialStages(
  config: UserPlanConfig,
  allWaypoints: Waypoint[],
): UserStage[] {
  const { startDate, startWaypointId, endWaypointId, targetDays, restDays = 0, day1RouteVariant } = config

  // 1. 取得主線主幹航點清單（以 COMMON 航點為主）
  const commonWaypoints = allWaypoints.filter((w) => w.routeVariant === 'COMMON' || !w.routeVariant)

  const startIndex = commonWaypoints.findIndex((w) => w.id === startWaypointId)
  const endIndex = commonWaypoints.findIndex((w) => w.id === endWaypointId)

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    return []
  }

  const subRouteWaypoints = commonWaypoints.slice(startIndex, endIndex + 1)
  
  // 計算總天數與徒步天數
  const totalDays = Math.max(1, targetDays)
  const safeRestDays = Math.min(Math.max(0, restDays), totalDays - 1)
  const walkingDays = totalDays - safeRestDays

  // Day 1 路線分支（NAPOLEON 或 VALCARLOS，由使用者設定決定，冬季僅前端提醒不強制限制）
  const actualDay1Variant: 'NAPOLEON' | 'VALCARLOS' = day1RouteVariant || 'NAPOLEON'
  const finalWaypoint = subRouteWaypoints[subRouteWaypoints.length - 1]

  // 先生成純徒步分段
  const walkingStages: UserStage[] = []
  let currentWaypoint = subRouteWaypoints[0]

  for (let day = 1; day <= walkingDays; day++) {
    const isLastDay = day === walkingDays
    const remainingDays = walkingDays - day + 1
    const remainingDistance = Math.max(0, finalWaypoint.cumulativeKm - currentWaypoint.cumulativeKm)
    const dynamicDailyKm = remainingDistance / remainingDays

    let endWaypoint: Waypoint
    if (isLastDay) {
      endWaypoint = finalWaypoint
    } else {
      const targetKm = currentWaypoint.cumulativeKm + dynamicDailyKm
      let bestMatchWithAlbergue: Waypoint | null = null
      let minAlbergueDiff = Infinity
      let fallbackBestMatch: Waypoint = finalWaypoint
      let minFallbackDiff = Infinity

      for (let i = 0; i < subRouteWaypoints.length; i++) {
        const wp = subRouteWaypoints[i]
        if (wp.cumulativeKm > currentWaypoint.cumulativeKm && wp.cumulativeKm < finalWaypoint.cumulativeKm) {
          const diff = Math.abs(wp.cumulativeKm - targetKm)
          if (wp.hasAlbergue && diff < minAlbergueDiff) {
            minAlbergueDiff = diff
            bestMatchWithAlbergue = wp
          }
          if (diff < minFallbackDiff) {
            minFallbackDiff = diff
            fallbackBestMatch = wp
          }
        }
      }

      endWaypoint = bestMatchWithAlbergue || fallbackBestMatch
    }

    const isDay1WithSJPP = day === 1 && currentWaypoint.id === 'SJPP'
    const routeVariant = isDay1WithSJPP ? actualDay1Variant : undefined

    const stats = calculateSegmentStats(
      currentWaypoint.id,
      endWaypoint.id,
      routeVariant,
      allWaypoints,
    )

    walkingStages.push({
      dayIndex: day,
      date: '', // 後續統一編排日期
      startWaypointId: currentWaypoint.id,
      endWaypointId: endWaypoint.id,
      passedWaypointIds: stats.passedWaypointIds,
      distanceKm: stats.distanceKm,
      elevationGainM: stats.elevationGainM,
      elevationLossM: stats.elevationLossM,
      isRestDay: false,
      routeVariant,
    })

    currentWaypoint = endWaypoint
  }

  // 若無休息日，直接加上連續日期
  if (safeRestDays === 0) {
    let curDate = startDate
    for (const stg of walkingStages) {
      stg.date = curDate
      curDate = addDaysToDate(curDate, 1)
    }
    return walkingStages
  }

  // 若有休息日，計算均勻插入的位置（優先在大城或均勻間隔）
  const restPositions = new Set<number>()
  for (let r = 1; r <= safeRestDays; r++) {
    // 依據休息天數均勻計算插入點（例如 26 天分 3 個休息日：約第 7, 14, 20 天徒步後）
    const pos = Math.round((walkingDays / (safeRestDays + 1)) * r)
    const validPos = Math.max(1, Math.min(pos, walkingDays - 1))
    // 避免重複
    let chosen = validPos
    while (restPositions.has(chosen) && chosen < walkingDays) {
      chosen++
    }
    restPositions.add(chosen)
  }

  const combinedStages: UserStage[] = []
  let dayCounter = 1
  let curDate = startDate

  for (let i = 0; i < walkingStages.length; i++) {
    const wStage = walkingStages[i]
    wStage.dayIndex = dayCounter++
    wStage.date = curDate
    curDate = addDaysToDate(curDate, 1)
    combinedStages.push(wStage)

    if (restPositions.has(i + 1)) {
      // 插入休息日
      combinedStages.push({
        dayIndex: dayCounter++,
        date: curDate,
        startWaypointId: wStage.endWaypointId,
        endWaypointId: wStage.endWaypointId,
        passedWaypointIds: [],
        distanceKm: 0,
        elevationGainM: 0,
        elevationLossM: 0,
        isRestDay: true,
        stageNotes: '休息停留日 🛌',
      })
      curDate = addDaysToDate(curDate, 1)
    }
  }

  return combinedStages
}

/**
 * 將指定索引之後的徒步段落重新動態均分至終點
 */
function reallocateRemainingWalkingStages(
  stages: UserStage[],
  startIndex: number,
  allWaypoints: Waypoint[],
): UserStage[] {
  if (startIndex + 1 >= stages.length) return stages

  const finalEndWaypointId = stages[stages.length - 1].endWaypointId
  const remainingStages = stages.slice(startIndex + 1)
  const remainingWalkingCount = remainingStages.filter((s) => !s.isRestDay).length

  if (remainingWalkingCount <= 0) return stages

  const commonWaypoints = allWaypoints.filter((w) => w.routeVariant === 'COMMON' || !w.routeVariant)
  const previousStage = stages[startIndex]
  const currentStartWp = allWaypoints.find((w) => w.id === previousStage.endWaypointId)
  const finalEndWp = allWaypoints.find((w) => w.id === finalEndWaypointId)

  if (!currentStartWp || !finalEndWp) return stages

  let currentWp = currentStartWp
  let walkingIndex = 0

  for (let i = startIndex + 1; i < stages.length; i++) {
    const stg = stages[i]

    if (stg.isRestDay) {
      stg.startWaypointId = currentWp.id
      stg.endWaypointId = currentWp.id
      stg.distanceKm = 0
      stg.elevationGainM = 0
      stg.elevationLossM = 0
      stg.passedWaypointIds = []
      continue
    }

    walkingIndex++
    const isFinalWalkingDay = walkingIndex === remainingWalkingCount
    const remainingDays = remainingWalkingCount - walkingIndex + 1
    const currentRemainingDist = Math.max(0, finalEndWp.cumulativeKm - currentWp.cumulativeKm)
    const dynamicDailyKm = currentRemainingDist / remainingDays

    let targetEndWp: Waypoint
    if (isFinalWalkingDay) {
      targetEndWp = finalEndWp
    } else {
      const targetKm = currentWp.cumulativeKm + dynamicDailyKm
      let bestMatchWithAlbergue: Waypoint | null = null
      let minAlbergueDiff = Infinity
      let fallbackMatch: Waypoint = finalEndWp
      let minFallbackDiff = Infinity

      for (const wp of commonWaypoints) {
        if (wp.cumulativeKm > currentWp.cumulativeKm && wp.cumulativeKm < finalEndWp.cumulativeKm) {
          const diff = Math.abs(wp.cumulativeKm - targetKm)
          if (wp.hasAlbergue && diff < minAlbergueDiff) {
            minAlbergueDiff = diff
            bestMatchWithAlbergue = wp
          }
          if (diff < minFallbackDiff) {
            minFallbackDiff = diff
            fallbackMatch = wp
          }
        }
      }

      targetEndWp = bestMatchWithAlbergue || fallbackMatch
    }

    const segStats = calculateSegmentStats(
      currentWp.id,
      targetEndWp.id,
      undefined,
      allWaypoints,
    )

    stg.startWaypointId = currentWp.id
    stg.endWaypointId = targetEndWp.id
    stg.distanceKm = segStats.distanceKm
    stg.elevationGainM = segStats.elevationGainM
    stg.elevationLossM = segStats.elevationLossM
    stg.passedWaypointIds = segStats.passedWaypointIds

    currentWp = targetEndWp
  }

  return stages
}

/**
 * 設為休息日 (Rest Day)：固定總天數，該天設為休息停留（0km），剩餘徒步天數減少 1 天並將後續城鎮動態均分
 */
export function insertRestDay(
  stages: UserStage[],
  dayIndex: number,
  allWaypoints: Waypoint[],
): UserStage[] {
  const stageIndex = stages.findIndex((s) => s.dayIndex === dayIndex)
  if (stageIndex === -1) return stages

  const newStages = stages.map((s) => ({ ...s }))
  const currentStage = newStages[stageIndex]

  currentStage.endWaypointId = currentStage.startWaypointId
  currentStage.distanceKm = 0
  currentStage.elevationGainM = 0
  currentStage.elevationLossM = 0
  currentStage.passedWaypointIds = []
  currentStage.isRestDay = true
  currentStage.stageNotes = '休息停留日 🛌'

  return reallocateRemainingWalkingStages(newStages, stageIndex, allWaypoints)
}

/**
 * 移除休息日 (Remove Rest Day)：取消休息日，恢復為徒步日，可用徒步天數增加 1 天並將後續城鎮動態均分
 */
export function removeRestDay(
  stages: UserStage[],
  dayIndex: number,
  allWaypoints: Waypoint[],
): UserStage[] {
  const stageIndex = stages.findIndex((s) => s.dayIndex === dayIndex && s.isRestDay)
  if (stageIndex === -1) return stages

  const newStages = stages.map((s) => ({ ...s }))
  newStages[stageIndex].isRestDay = false
  newStages[stageIndex].stageNotes = undefined

  return reallocateRemainingWalkingStages(newStages, stageIndex - 1, allWaypoints)
}

/**
 * 變更某天的結束城鎮：連鎖智慧重算當天與後續所有天數的起訖城鎮與每日里程
 */
export function updateStageEndWaypoint(
  stages: UserStage[],
  dayIndex: number,
  newEndWaypointId: string,
  allWaypoints: Waypoint[],
): UserStage[] {
  const stageIndex = stages.findIndex((s) => s.dayIndex === dayIndex)
  if (stageIndex === -1) return stages

  const newStages = stages.map((s) => ({ ...s }))
  const currentStage = newStages[stageIndex]

  // 1. 更新當天結束點與各項數據
  currentStage.endWaypointId = newEndWaypointId
  const currentStats = calculateSegmentStats(
    currentStage.startWaypointId,
    newEndWaypointId,
    currentStage.routeVariant,
    allWaypoints,
  )
  currentStage.distanceKm = currentStats.distanceKm
  currentStage.elevationGainM = currentStats.elevationGainM
  currentStage.elevationLossM = currentStats.elevationLossM
  currentStage.passedWaypointIds = currentStats.passedWaypointIds

  // 2. 如果後面沒有其他天數，直接返回
  if (stageIndex + 1 >= newStages.length) {
    return newStages
  }

  // 3. 連鎖重算後續天數
  return reallocateRemainingWalkingStages(newStages, stageIndex, allWaypoints)
}
