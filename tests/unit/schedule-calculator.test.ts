import { describe, it, expect } from 'vitest'
import { generateInitialStages, generateFinisterreStages } from '@/utils/scheduleCalculator'
import { francesWaypoints as waypoints } from '@/data/routes/frances'
import type { UserPlanConfig } from '@/types/camino'

describe('Schedule Calculator - 里程精確度與世界盡頭延伸段排程鏈', () => {
  const defaultConfig: UserPlanConfig = {
    startDate: '2026-05-01',
    startWaypointId: 'SJPP',
    endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
    targetDays: 33,
    restDays: 0,
    dailyTargetKm: 23.5,
    bodyWeightKg: 60,
    day1RouteVariant: 'NAPOLEON',
  }

  it('全線 33 天累積里程加總應精確等於 774.5 km', () => {
    const stages = generateInitialStages(defaultConfig, waypoints)
    const totalKm = Number(stages.reduce((acc, s) => acc + s.distanceKm, 0).toFixed(1))
    expect(totalKm).toBe(774.5)
  })

  describe('世界盡頭延伸段排程鏈 (Finisterre Schedule Chaining)', () => {
    const mockLastStage = {
      dayIndex: 33,
      date: '2026-06-02',
      startWaypointId: 'O_PEDROUZO',
      endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
      passedWaypointIds: [],
      distanceKm: 19.4,
      elevationGainM: 200,
      elevationLossM: 230,
      isRestDay: false,
    }

    it('NONE 選項應回傳空陣列', () => {
      const stages = generateFinisterreStages(mockLastStage, 'NONE')
      expect(stages).toHaveLength(0)
    })

    it('FINISTERRE_ONLY 應產生 3 天延伸分段且日期嚴格連續', () => {
      const stages = generateFinisterreStages(mockLastStage, 'FINISTERRE_ONLY')
      expect(stages).toHaveLength(3)
      expect(stages[0].dayIndex).toBe(34)
      expect(stages[0].date).toBe('2026-06-03')
      expect(stages[0].endWaypointId).toBe('finisterre:negreira')
      expect(stages[2].dayIndex).toBe(36)
      expect(stages[2].date).toBe('2026-06-05')
      expect(stages[2].endWaypointId).toBe('finisterre:fisterra')
      expect(stages.every((s) => s.isExtensionStage)).toBe(true)
    })

    it('設定聖地牙哥休整 1 天時，應先插入聖地牙哥休息日，延伸段出發順延至 6/4', () => {
      const stages = generateFinisterreStages(mockLastStage, 'FINISTERRE_ONLY', 1)
      expect(stages).toHaveLength(4) // 1 天休息 + 3 天徒步
      expect(stages[0].dayIndex).toBe(34)
      expect(stages[0].date).toBe('2026-06-03')
      expect(stages[0].isRestDay).toBe(true)
      expect(stages[0].distanceKm).toBe(0)

      expect(stages[1].dayIndex).toBe(35)
      expect(stages[1].date).toBe('2026-06-04')
      expect(stages[1].isRestDay).toBe(false)
      expect(stages[1].endWaypointId).toBe('finisterre:negreira')
    })

    it('兩者皆去環線（先 Fisterra 後 Muxía）應產生 4 天徒步分段，終抵 Muxía', () => {
      const stages = generateFinisterreStages(mockLastStage, 'BOTH_FINISTERRE_FIRST')
      expect(stages).toHaveLength(4)
      expect(stages[2].endWaypointId).toBe('finisterre:fisterra')
      expect(stages[3].endWaypointId).toBe('finisterre:muxia')
    })

    it('FINISTERRE_ONLY 支援自訂為 4 天（輕鬆漫遊版），總里程保持為 89.5 km 且終抵 Fisterra', () => {
      const stages = generateFinisterreStages(mockLastStage, 'FINISTERRE_ONLY', 0, 4)
      expect(stages).toHaveLength(4)
      expect(stages[stages.length - 1].endWaypointId).toBe('finisterre:fisterra')
      const totalKm = Number(stages.reduce((acc, s) => acc + s.distanceKm, 0).toFixed(1))
      expect(totalKm).toBe(89.5)
      // 確保航點首尾相接
      for (let i = 0; i < stages.length - 1; i++) {
        expect(stages[i].endWaypointId).toBe(stages[i + 1].startWaypointId)
      }
    })

    it('BOTH_FINISTERRE_FIRST 支援自訂為 5 天（包含中繼停靠 Lires），終抵 Muxía', () => {
      const stages = generateFinisterreStages(mockLastStage, 'BOTH_FINISTERRE_FIRST', 0, 5)
      expect(stages).toHaveLength(5)
      expect(stages[stages.length - 1].endWaypointId).toBe('finisterre:muxia')
      const totalKm = Number(stages.reduce((acc, s) => acc + s.distanceKm, 0).toFixed(1))
      expect(totalKm).toBe(118.5)
      for (let i = 0; i < stages.length - 1; i++) {
        expect(stages[i].endWaypointId).toBe(stages[i + 1].startWaypointId)
      }
    })
  })
})
