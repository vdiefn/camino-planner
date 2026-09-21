import { describe, it, expect } from 'vitest'
import {
  isWinterClosure,
  addDaysToDate,
  calculateSegmentStats,
  generateInitialStages,
  insertRestDay,
  removeRestDay,
  updateStageEndWaypoint,
} from '../src/utils/scheduleCalculator'
import { waypoints } from '../src/data/waypoints'
import type { UserPlanConfig } from '../src/types/camino'

describe('排程運算核心引擎單元測試 (Schedule Calculator Engine)', () => {
  // --- 1. 冬季封閉檢驗 ---
  describe('冬季強制封閉檢驗 isWinterClosure', () => {
    it('11月至3月應判定為冬季封閉', () => {
      expect(isWinterClosure('2026-11-01')).toBe(true)
      expect(isWinterClosure('2026-12-15')).toBe(true)
      expect(isWinterClosure('2027-01-20')).toBe(true)
      expect(isWinterClosure('2027-02-28')).toBe(true)
      expect(isWinterClosure('2027-03-31')).toBe(true)
    })

    it('4月至10月應為開放通行期間', () => {
      expect(isWinterClosure('2026-04-01')).toBe(false)
      expect(isWinterClosure('2026-05-15')).toBe(false)
      expect(isWinterClosure('2026-09-10')).toBe(false)
      expect(isWinterClosure('2026-10-31')).toBe(false)
    })
  })

  // --- 2. 日期累加檢驗 ---
  describe('日期加減計算 addDaysToDate', () => {
    it('正確處理跨月與閏年日期加減', () => {
      expect(addDaysToDate('2026-09-10', 1)).toBe('2026-09-11')
      expect(addDaysToDate('2026-09-30', 1)).toBe('2026-10-01')
      expect(addDaysToDate('2026-12-31', 1)).toBe('2027-01-01')
      expect(addDaysToDate('2026-10-05', -1)).toBe('2026-10-04')
    })
  })

  // --- 3. 航點段落數據計算 ---
  describe('兩點間里程與爬升計算 calculateSegmentStats', () => {
    it('Day 1 拿破崙之路 (SJPP ➔ Roncesvalles) 爬升應為 1250m、距離 25.1km', () => {
      const stats = calculateSegmentStats('SJPP', 'RONCESVALLES', 'NAPOLEON', waypoints)
      expect(stats.distanceKm).toBe(25.1)
      expect(stats.elevationGainM).toBe(1250)
    })

    it('Day 1 瓦卡洛斯之路 (SJPP ➔ Roncesvalles) 爬升應為 850m、距離 24.1km', () => {
      const stats = calculateSegmentStats('SJPP', 'RONCESVALLES', 'VALCARLOS', waypoints)
      expect(stats.distanceKm).toBe(24.1)
      expect(stats.elevationGainM).toBe(850)
    })

    it('一般段落 (Roncesvalles ➔ Zubiri) 應正確算出距離', () => {
      const stats = calculateSegmentStats('RONCESVALLES', 'ZUBIRI', undefined, waypoints)
      expect(stats.distanceKm).toBe(21.5)
      expect(stats.elevationLossM).toBeGreaterThan(300)
    })

    it('起點等於終點時距離與爬升應為 0', () => {
      const stats = calculateSegmentStats('PAMPLONA', 'PAMPLONA', undefined, waypoints)
      expect(stats.distanceKm).toBe(0)
      expect(stats.elevationGainM).toBe(0)
      expect(stats.elevationLossM).toBe(0)
    })
  })

  // --- 4. 初始排程生成 ---
  describe('排程動態生成 generateInitialStages', () => {
    it('生成 33 天全線排程 (SJPP ➔ Santiago)，第一天起點為 SJPP，最後一天終點為 Santiago', () => {
      const config: UserPlanConfig = {
        startDate: '2026-05-01',
        startWaypointId: 'SJPP',
        endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
        targetDays: 33,
        bodyWeightKg: 65,
        day1RouteVariant: 'NAPOLEON',
      }

      const stages = generateInitialStages(config, waypoints)
      expect(stages.length).toBeGreaterThan(0)
      expect(stages[0].startWaypointId).toBe('SJPP')
      expect(stages[0].date).toBe('2026-05-01')
      expect(stages[stages.length - 1].endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
    })

    it('冬季出發時尊重使用者路線設定，不強制覆寫為 VALCARLOS', () => {
      const config: UserPlanConfig = {
        startDate: '2026-12-01',
        startWaypointId: 'SJPP',
        endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
        targetDays: 33,
        bodyWeightKg: 65,
        day1RouteVariant: 'NAPOLEON',
      }

      const stages = generateInitialStages(config, waypoints)
      expect(stages[0].routeVariant).toBe('NAPOLEON')
    })

    it('生成 Sarria ➔ Santiago (最後 100km 短程 5 天排程)', () => {
      const config: UserPlanConfig = {
        startDate: '2026-06-01',
        startWaypointId: 'SARRIA',
        endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
        targetDays: 5,
        bodyWeightKg: 60,
        day1RouteVariant: 'NAPOLEON',
      }

      const stages = generateInitialStages(config, waypoints)
      expect(stages[0].startWaypointId).toBe('SARRIA')
      expect(stages[stages.length - 1].endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
    })
  })

  // --- 5. 插入與移除休息日 ---
  describe('休息日動態平衡與日均里程計算 (39天總天數 + 3天休息日 = 36天步行)', () => {
    it('設定總天數 39 天，插入 3 天休息日後，總天數仍為 39 天、步行天數精確為 36 天，且日均里程依 36 天均分', () => {
      const config: UserPlanConfig = {
        startDate: '2026-05-01',
        startWaypointId: 'SJPP',
        endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
        targetDays: 39,
        bodyWeightKg: 65,
        day1RouteVariant: 'NAPOLEON',
      }

      let stages = generateInitialStages(config, waypoints)
      expect(stages.length).toBe(39)

      // 在 Day 5, Day 15, Day 25 設定休息日
      stages = insertRestDay(stages, 5, waypoints)
      stages = insertRestDay(stages, 15, waypoints)
      stages = insertRestDay(stages, 25, waypoints)

      // 1. 總天數保持 39 天
      expect(stages.length).toBe(39)

      // 2. 休息天數為 3 天
      const restCount = stages.filter(s => s.isRestDay).length
      expect(restCount).toBe(3)

      // 3. 步行天數為 36 天
      const walkingStages = stages.filter(s => !s.isRestDay)
      expect(walkingStages.length).toBe(36)

      // 4. 休息日里程為 0km 且起訖城鎮相同
      expect(stages[4].distanceKm).toBe(0)
      expect(stages[4].startWaypointId).toBe(stages[4].endWaypointId)
      expect(stages[14].distanceKm).toBe(0)
      expect(stages[14].startWaypointId).toBe(stages[14].endWaypointId)
      expect(stages[24].distanceKm).toBe(0)
      expect(stages[24].startWaypointId).toBe(stages[24].endWaypointId)

      // 5. 總里程不變且全線終點依然為 Santiago
      const totalDist = stages.reduce((acc, s) => acc + s.distanceKm, 0)
      expect(stages[38].endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
      expect(totalDist).toBeCloseTo(774.5, 0)

      // 6. 平均日步行距離 (日均徒步) 精確為 總里程 / 36
      const avgKm = totalDist / walkingStages.length
      expect(avgKm).toBeCloseTo(774.5 / 36, 1)
    })

    it('設定總天數 29 天且休息 3 天，初始生成應為 26 天徒步 + 3 天休息，日均徒步距離增加為約 29.8km', () => {
      const config: UserPlanConfig = {
        startDate: '2026-05-01',
        startWaypointId: 'SJPP',
        endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
        targetDays: 29,
        restDays: 3,
        bodyWeightKg: 65,
        day1RouteVariant: 'NAPOLEON',
      }

      const stages = generateInitialStages(config, waypoints)
      expect(stages.length).toBe(29)

      const walkingStages = stages.filter(s => !s.isRestDay)
      const restStages = stages.filter(s => s.isRestDay)

      expect(walkingStages.length).toBe(26)
      expect(restStages.length).toBe(3)

      const totalDist = stages.reduce((acc, s) => acc + s.distanceKm, 0)
      expect(totalDist).toBeCloseTo(774.5, 0)

      const avgDailyKm = totalDist / walkingStages.length
      expect(avgDailyKm).toBeCloseTo(774.5 / 26, 1) // 約 29.8 km/日
    })

    it('移除休息日後，步行天數自動恢復為 37 天並重新均分', () => {
      const config: UserPlanConfig = {
        startDate: '2026-05-01',
        startWaypointId: 'SJPP',
        endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
        targetDays: 39,
        bodyWeightKg: 65,
        day1RouteVariant: 'NAPOLEON',
      }

      let stages = generateInitialStages(config, waypoints)
      stages = insertRestDay(stages, 5, waypoints)
      stages = insertRestDay(stages, 15, waypoints)
      stages = insertRestDay(stages, 25, waypoints)

      // 取消 Day 25 休息日
      stages = removeRestDay(stages, 25, waypoints)

      const restCount = stages.filter(s => s.isRestDay).length
      const walkingCount = stages.filter(s => !s.isRestDay).length
      expect(restCount).toBe(2)
      expect(walkingCount).toBe(37)
      expect(stages.length).toBe(39)
    })
  })

  // --- 6. 現場修改結束城鎮連鎖重算 ---
  describe('現場修改結束城鎮連鎖重算 updateStageEndWaypoint', () => {
    it('修改 Day 1 結束城鎮為 ORISSON 時，Day 1 距離變為 7.8km，Day 2 起點變為 ORISSON 且後續天數自動重新均分', () => {
      const config: UserPlanConfig = {
        startDate: '2026-05-01',
        startWaypointId: 'SJPP',
        endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
        targetDays: 33,
        bodyWeightKg: 65,
        day1RouteVariant: 'NAPOLEON',
      }

      const initialStages = generateInitialStages(config, waypoints)
      const updated = updateStageEndWaypoint(initialStages, 1, 'ORISSON', waypoints)

      // Day 1 驗證
      expect(updated[0].endWaypointId).toBe('ORISSON')
      expect(updated[0].distanceKm).toBe(7.8)

      // Day 2 驗證起點自動連鎖接軌
      expect(updated[1].startWaypointId).toBe('ORISSON')
      expect(updated[1].distanceKm).toBeGreaterThan(0)

      // 全線最後一天終點依然保持 SANTIAGO_DE_COMPOSTELA
      expect(updated[updated.length - 1].endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
    })
  })

  // --- 7. 極端邊界條件防護 (Edge Cases) ---
  describe('排程極端邊界條件防護 (Edge Cases)', () => {
    it('連續設定 2 個休息日時，總天數固定且步行天數精確減少 2 天', () => {
      const config: UserPlanConfig = {
        startDate: '2026-05-01',
        startWaypointId: 'SJPP',
        endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
        targetDays: 33,
        bodyWeightKg: 65,
        day1RouteVariant: 'NAPOLEON',
      }

      const initialStages = generateInitialStages(config, waypoints)
      const onceRest = insertRestDay(initialStages, 3, waypoints)
      const twiceRest = insertRestDay(onceRest, 4, waypoints)

      expect(twiceRest.length).toBe(33)
      expect(twiceRest[2].isRestDay).toBe(true)
      expect(twiceRest[3].isRestDay).toBe(true)

      const walkingCount = twiceRest.filter(s => !s.isRestDay).length
      expect(walkingCount).toBe(31)
      expect(twiceRest[32].endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
    })

    it('起訖點倒置 (如 Santiago ➔ SJPP) 時應安全返回空陣列，不發生當機', () => {
      const config: UserPlanConfig = {
        startDate: '2026-05-01',
        startWaypointId: 'SANTIAGO_DE_COMPOSTELA',
        endWaypointId: 'SJPP',
        targetDays: 33,
        dailyTargetKm: 23.5,
        bodyWeightKg: 65,
        day1RouteVariant: 'NAPOLEON',
      }

      const stages = generateInitialStages(config, waypoints)
      expect(stages).toEqual([])
    })
  })

  // --- 8. 排程自訂調整與重設為官方 33 天 ---
  describe('排程自訂調整與重設回官方 33 天 (Customization & Reset to Official 33 Days)', () => {
    it('使用者調整為 28 天與特定日期重新規劃時，排程精確為 28 天且出發日期吻合', () => {
      const customConfig: UserPlanConfig = {
        startDate: '2026-09-20',
        startWaypointId: 'SJPP',
        endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
        targetDays: 28,
        dailyTargetKm: 27.6,
        bodyWeightKg: 65,
        day1RouteVariant: 'NAPOLEON',
      }

      const stages = generateInitialStages(customConfig, waypoints)
      expect(stages.length).toBe(28)
      expect(stages[0].date).toBe('2026-09-20')
      expect(stages[0].startWaypointId).toBe('SJPP')
      expect(stages[27].endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
    })

    it('使用者設定總天數 37 天時，必須精確生成 37 天排程且第 37 天抵達 Santiago', () => {
      const config37: UserPlanConfig = {
        startDate: '2026-05-01',
        startWaypointId: 'SJPP',
        endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
        targetDays: 37,
        dailyTargetKm: 20.9,
        bodyWeightKg: 65,
        day1RouteVariant: 'NAPOLEON',
      }

      const stages = generateInitialStages(config37, waypoints)
      expect(stages.length).toBe(37)
      expect(stages[0].startWaypointId).toBe('SJPP')
      expect(stages[0].dayIndex).toBe(1)
      expect(stages[36].dayIndex).toBe(37)
      expect(stages[36].endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
      
      // 驗證每天銜接順暢
      for (let i = 0; i < stages.length - 1; i++) {
        expect(stages[i].endWaypointId).toBe(stages[i + 1].startWaypointId)
        expect(stages[i].distanceKm).toBeGreaterThan(0)
      }
    })

    it('使用者調整為 36 天後，按下重設時排程必須精確回歸官方建議的 33 天', () => {
      // 1. 使用者自訂 36 天
      const modifiedConfig: UserPlanConfig = {
        startDate: '2026-06-01',
        startWaypointId: 'SJPP',
        endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
        targetDays: 36,
        dailyTargetKm: 21.5,
        bodyWeightKg: 65,
        day1RouteVariant: 'NAPOLEON',
      }
      const customStages = generateInitialStages(modifiedConfig, waypoints)
      expect(customStages.length).toBe(36)

      // 2. 模擬按下重設：還原官方標準設定 (33天)
      const officialDefaultConfig: UserPlanConfig = {
        ...modifiedConfig,
        startWaypointId: 'SJPP',
        endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
        targetDays: 33, // 官方建議 33 天
        restDays: 0,
      }
      const resetStages = generateInitialStages(officialDefaultConfig, waypoints)

      // 驗證恢復為官方 33 天
      expect(resetStages.length).toBe(33)
      expect(resetStages[0].startWaypointId).toBe('SJPP')
      expect(resetStages[32].endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
      expect(resetStages.filter(s => !s.isRestDay).length).toBe(33)
    })
  })
})

