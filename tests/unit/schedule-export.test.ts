import { describe, it, expect } from 'vitest'
import {
  generateScheduleTextChecklist,
  type ScheduleExportMeta,
} from '@/utils/scheduleExport'
import type { UserStage, Waypoint } from '@/types/camino'

describe('scheduleExport 純文字行程路書匯出測試', () => {
  const mockWaypointMap = new Map<string, Waypoint>([
    [
      'SJPP',
      {
        id: 'SJPP',
        localName: 'Saint-Jean-Pied-de-Port',
        spanishName: 'San Juan Pie de Puerto',
        chineseName: '聖讓皮耶德波爾',
        coordinates: { lat: 43.163, lng: -1.237 },
        cumulativeKm: 0,
        elevationM: 170,
        hasAlbergue: true,
        hasPharmacy: true,
        hasSupermarket: true,
        isMajorCity: true,
      },
    ],
    [
      'RONCESVALLES',
      {
        id: 'RONCESVALLES',
        localName: 'Roncesvalles',
        spanishName: 'Orreaga',
        chineseName: '龍塞斯瓦耶斯',
        coordinates: { lat: 43.009, lng: -1.319 },
        cumulativeKm: 25.1,
        elevationM: 950,
        hasAlbergue: true,
        hasPharmacy: false,
        hasSupermarket: false,
        isMajorCity: false,
      },
    ],
    [
      'ZUBIRI',
      {
        id: 'ZUBIRI',
        localName: 'Zubiri',
        spanishName: 'Zubiri',
        chineseName: '蘇維里',
        coordinates: { lat: 42.931, lng: -1.504 },
        cumulativeKm: 46.6,
        elevationM: 530,
        hasAlbergue: true,
        hasPharmacy: true,
        hasSupermarket: true,
        isMajorCity: false,
      },
    ],
  ])

  const mockStages: UserStage[] = [
    {
      dayIndex: 1,
      date: '2026-05-01',
      startWaypointId: 'SJPP',
      endWaypointId: 'RONCESVALLES',
      passedWaypointIds: [],
      distanceKm: 25.1,
      elevationGainM: 1250,
      elevationLossM: 470,
      isRestDay: false,
    },
    {
      dayIndex: 2,
      date: '2026-05-02',
      startWaypointId: 'RONCESVALLES',
      endWaypointId: 'ZUBIRI',
      passedWaypointIds: [],
      distanceKm: 21.5,
      elevationGainM: 230,
      elevationLossM: 650,
      isRestDay: false,
    },
    {
      dayIndex: 3,
      date: '2026-05-03',
      startWaypointId: 'ZUBIRI',
      endWaypointId: 'ZUBIRI',
      passedWaypointIds: [],
      distanceKm: 0,
      elevationGainM: 0,
      elevationLossM: 0,
      isRestDay: true, // 休息日
    },
    {
      dayIndex: 4,
      date: '2026-05-04',
      startWaypointId: 'ZUBIRI',
      endWaypointId: 'RONCESVALLES',
      passedWaypointIds: [],
      distanceKm: 21.5,
      elevationGainM: 650,
      elevationLossM: 230,
      isRestDay: false,
      isExtensionStage: true, // 世界盡頭延伸
    },
  ]

  const mockMeta: ScheduleExportMeta = {
    routeName: '法國之路（拿破崙越嶺）',
    startDate: '2026-05-01',
    totalDays: 4,
    totalDistanceKm: 68.1,
    totalElevationGainM: 2130,
  }

  it('TC-01: 正確輸出標題、行程表與每日分段列表（當地地名、D01 編號、無括號、無爬升資訊、路線資訊拆兩行）', () => {
    const text = generateScheduleTextChecklist(mockStages, mockWaypointMap, mockMeta)

    expect(text).toContain('聖雅各朝聖之路 每日徒步行程 · 2026-05-01 出發')
    expect(text).toContain('路線：法國之路（拿破崙越嶺） ｜ 共 4 天\n總計 68.1 km ｜ 爬升 +2,130 m')
    expect(text).toContain('【行程表】')
    expect(text).toContain('D01 05-01 Saint-Jean-Pied-de-Port ➔ Roncesvalles · 25.1 km')
    expect(text).toContain('D02 05-02 Roncesvalles ➔ Zubiri · 21.5 km')
    expect(text).toContain('Buen Camino! 祝朝聖之路平安順心')
  })

  it('TC-02: 正確識別並標註休息日與世界盡頭延伸段，去除冗贅備註括號', () => {
    const text = generateScheduleTextChecklist(mockStages, mockWaypointMap, mockMeta)

    expect(text).toContain('D03 05-03 Zubiri · 休息日')
    expect(text).toContain('D04 05-04 Zubiri ➔ Roncesvalles [世界盡頭延伸] · 21.5 km')
  })

  it('TC-03: 空行程陣列安全降級，不崩潰拋錯', () => {
    const text = generateScheduleTextChecklist([], mockWaypointMap, mockMeta)

    expect(text).toContain('目前尚未建立分段行程')
  })

  it('TC-04: 航點 ID 於字典中不存在時，安全 fallback 顯示 ID 原值且去除冗贅括號', () => {
    const unknownStage: UserStage = {
      dayIndex: 1,
      date: '2026-05-01',
      startWaypointId: 'UNKNOWN_START',
      endWaypointId: 'UNKNOWN_END',
      passedWaypointIds: [],
      distanceKm: 15.0,
      elevationGainM: 100,
      elevationLossM: 100,
      isRestDay: false,
    }

    const text = generateScheduleTextChecklist([unknownStage], mockWaypointMap, mockMeta)
    expect(text).toContain('D01 05-01 UNKNOWN_START ➔ UNKNOWN_END · 15.0 km')
  })

  it('TC-05: 當地名若帶有括號（如：Zubiri (Town)），純文字匯出時自動清洗去除括號', () => {
    const customMap = new Map<string, Waypoint>([
      [
        'ZUBIRI_NOTE',
        {
          id: 'ZUBIRI_NOTE',
          localName: 'Zubiri (Village)',
          spanishName: 'Zubiri',
          chineseName: '蘇維里',
          coordinates: { lat: 42.931, lng: -1.504 },
          cumulativeKm: 46.6,
          elevationM: 530,
          hasAlbergue: true,
          hasPharmacy: true,
          hasSupermarket: true,
          isMajorCity: false,
        },
      ],
      [
        'RONCES_NOTE',
        {
          id: 'RONCES_NOTE',
          localName: 'Roncesvalles (Start)',
          spanishName: 'Orreaga',
          chineseName: '龍塞斯瓦耶斯',
          coordinates: { lat: 43.009, lng: -1.319 },
          cumulativeKm: 25.1,
          elevationM: 950,
          hasAlbergue: true,
          hasPharmacy: false,
          hasSupermarket: false,
          isMajorCity: false,
        },
      ],
    ])

    const stageWithNotes: UserStage = {
      dayIndex: 2,
      date: '2026-05-02',
      startWaypointId: 'RONCES_NOTE',
      endWaypointId: 'ZUBIRI_NOTE',
      passedWaypointIds: [],
      distanceKm: 21.5,
      elevationGainM: 230,
      elevationLossM: 650,
      isRestDay: false,
    }

    const text = generateScheduleTextChecklist([stageWithNotes], customMap, mockMeta)
    expect(text).toContain('D02 05-02 Roncesvalles ➔ Zubiri · 21.5 km')
    expect(text).not.toContain('Village')
    expect(text).not.toContain('Start')
  })
})
