import { describe, it, expect } from 'vitest'
import {
  AVAILABLE_ROUTES,
  getRouteMetadata,
  getRouteWaypoints,
  getFinisterreWaypoints,
  buildGlobalWaypointMap,
  getRouteTotalDistance,
  getEffectiveRouteMetadata,
} from '@/data/routes'

describe('Route Registry & Multi-Route Data Integrity - 多路線完整性測試', () => {
  it('註冊中心應包含法國之路、葡萄牙之路與北方之路 3 條主路線', () => {
    expect(AVAILABLE_ROUTES).toHaveLength(3)
    const routeIds = AVAILABLE_ROUTES.map((r) => r.id)
    expect(routeIds).toContain('frances')
    expect(routeIds).toContain('portugues')
    expect(routeIds).toContain('norte')
  })

  describe('法國之路 (Camino Francés)', () => {
    const meta = getRouteMetadata('frances')
    const wps = getRouteWaypoints('frances')

    it('中繼資料設定應正確', () => {
      expect(meta?.totalDistanceKm).toBe(774.5)
      expect(meta?.defaultStartWaypointId).toBe('SJPP')
      expect(meta?.defaultEndWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
    })

    it('所有航點應具備中文與西文名稱，且累積里程遞增', () => {
      for (let i = 0; i < wps.length - 1; i++) {
        expect(wps[i].chineseName).toBeTruthy()
        expect(wps[i + 1].cumulativeKm).toBeGreaterThanOrEqual(wps[i].cumulativeKm)
      }
    })
  })

  describe('葡萄牙之路 (Camino Portugués)', () => {
    const meta = getRouteMetadata('portugues')
    const centralWps = getRouteWaypoints('portugues', 'central')
    const costaWps = getRouteWaypoints('portugues', 'costa')

    it('應支援中央線與海岸線雙分支，且具備各自之總長度與建議天數', () => {
      expect(meta?.branches).toHaveLength(2)
      expect(meta?.branches?.[0].id).toBe('central')
      expect(meta?.branches?.[0].totalDistanceKm).toBe(240.3)
      expect(meta?.branches?.[0].recommendedDays).toBe(11)

      expect(meta?.branches?.[1].id).toBe('costa')
      expect(meta?.branches?.[1].totalDistanceKm).toBe(270.9)
      expect(meta?.branches?.[1].recommendedDays).toBe(13)
    })

    it('中央線與海岸線起點皆為 Porto (0km)，且終點皆為 Santiago', () => {
      expect(centralWps[0].id).toBe('portugues:porto')
      expect(centralWps[0].cumulativeKm).toBe(0)
      expect(centralWps[centralWps.length - 1].id).toBe('portugues:santiago')

      expect(costaWps[0].id).toBe('portugues:porto')
      expect(costaWps[0].cumulativeKm).toBe(0)
      expect(costaWps[costaWps.length - 1].id).toBe('portugues:santiago')
    })

    it('中央線與海岸線在 Redondela 匯流，後段城鎮序列完全一致', () => {
      const centralRedondelaIdx = centralWps.findIndex((w) => w.id === 'portugues:redondela')
      const costaRedondelaIdx = costaWps.findIndex((w) => w.id === 'portugues:redondela')

      expect(centralRedondelaIdx).toBeGreaterThan(0)
      expect(costaRedondelaIdx).toBeGreaterThan(0)

      const centralPostRedondela = centralWps.slice(centralRedondelaIdx).map((w) => w.id)
      const costaPostRedondela = costaWps.slice(costaRedondelaIdx).map((w) => w.id)

      expect(centralPostRedondela).toEqual(costaPostRedondela)
    })

    it('中央線全線里程約 240.3km，海岸線對齊 Gronze 為 270.9km，且里程嚴格遞增', () => {
      expect(centralWps[centralWps.length - 1].cumulativeKm).toBeCloseTo(240.3, 1)
      expect(costaWps[costaWps.length - 1].cumulativeKm).toBeCloseTo(270.9, 1)

      for (let i = 0; i < centralWps.length - 1; i++) {
        expect(centralWps[i + 1].cumulativeKm).toBeGreaterThan(centralWps[i].cumulativeKm)
      }
      for (let i = 0; i < costaWps.length - 1; i++) {
        expect(costaWps[i + 1].cumulativeKm).toBeGreaterThan(costaWps[i].cumulativeKm)
      }
    })

    it('城鎮航點數量應完整對齊 Gronze 官方全量目錄（中央線 60+ 站、海岸線 50+ 站）', () => {
      expect(centralWps.length).toBeGreaterThanOrEqual(60)
      expect(costaWps.length).toBeGreaterThanOrEqual(50)

      // 驗證關鍵歷史與海濱中繼村鎮均已成功收錄
      const centralIds = centralWps.map((w) => w.id)
      expect(centralIds).toContain('portugues:rates')
      expect(centralIds).toContain('portugues:labruja')
      expect(centralIds).toContain('portugues:valenca')

      const costaIds = costaWps.map((w) => w.id)
      expect(costaIds).toContain('portugues:labruge')
      expect(costaIds).toContain('portugues:oia')
      expect(costaIds).toContain('portugues:a-ramallosa')
    })
  })

  describe('北方之路 (Camino del Norte)', () => {
    const meta = getRouteMetadata('norte')
    const wps = getRouteWaypoints('norte')

    it('起點為伊倫 (Irún)，終點為聖地牙哥 (Santiago)，全程約 828km', () => {
      expect(meta?.totalDistanceKm).toBeCloseTo(828.2, 1)
      expect(wps[0].id).toBe('norte:irun')
      expect(wps[0].cumulativeKm).toBe(0)
      expect(wps[wps.length - 1].id).toBe('norte:santiago')
      expect(wps[wps.length - 1].cumulativeKm).toBeCloseTo(828.2, 1)
    })

    it('應行經關鍵大城 (畢爾包、桑坦德、希洪、阿爾蘇阿匯流點)', () => {
      const ids = wps.map((w) => w.id)
      expect(ids).toContain('norte:bilbao')
      expect(ids).toContain('norte:santander')
      expect(ids).toContain('norte:gijon')
      expect(ids).toContain('norte:arzua')
    })

    it('城鎮航點數量應完整對齊 Gronze 官方全量目錄（北方之路 150+ 站）', () => {
      expect(wps.length).toBeGreaterThanOrEqual(150)
      const ids = wps.map((w) => w.id)
      expect(ids).toContain('norte:pasajes-san-juan')
      expect(ids).toContain('norte:orio')
      expect(ids).toContain('norte:getaria')
      expect(ids).toContain('norte:zumaia')
      expect(ids).toContain('norte:zenarruza')
      expect(ids).toContain('norte:guemes')
      expect(ids).toContain('norte:san-vicente-barquera')
      expect(ids).toContain('norte:cudillero')
      expect(ids).toContain('norte:tapia-de-casariego')
      expect(ids).toContain('norte:miraz')
    })
  })

  describe('世界盡頭外掛延伸 (Finisterre & Muxía Extension)', () => {
    it('NONE 選項應回傳空陣列', () => {
      expect(getFinisterreWaypoints('NONE')).toHaveLength(0)
    })

    it('FINISTERRE_ONLY 應由 Santiago 前往 Fisterra，全長約 89.5km', () => {
      const wps = getFinisterreWaypoints('FINISTERRE_ONLY')
      expect(wps[0].id).toBe('finisterre:santiago')
      expect(wps[wps.length - 1].id).toBe('finisterre:fisterra')
      expect(wps[wps.length - 1].cumulativeKm).toBe(89.5)
    })

    it('MUXIA_ONLY 應由 Santiago 前往 Muxía，全長約 86.3km', () => {
      const wps = getFinisterreWaypoints('MUXIA_ONLY')
      expect(wps[0].id).toBe('finisterre:santiago')
      expect(wps[wps.length - 1].id).toBe('finisterre:muxia')
      expect(wps[wps.length - 1].cumulativeKm).toBe(86.3)
    })

    it('兩者皆去環線（先 Fisterra 後 Muxía / 先 Muxía 後 Fisterra）總里程皆約 118.5km 且嚴格遞增', () => {
      const fFirst = getFinisterreWaypoints('BOTH_FINISTERRE_FIRST')
      const mFirst = getFinisterreWaypoints('BOTH_MUXIA_FIRST')

      expect(fFirst[fFirst.length - 1].id).toBe('finisterre:muxia')
      expect(fFirst[fFirst.length - 1].cumulativeKm).toBeCloseTo(118.5, 1)

      expect(mFirst[mFirst.length - 1].id).toBe('finisterre:fisterra')
      expect(mFirst[mFirst.length - 1].cumulativeKm).toBeCloseTo(118.5, 1)

      for (let i = 0; i < fFirst.length - 1; i++) {
        expect(fFirst[i + 1].cumulativeKm).toBeGreaterThan(fFirst[i].cumulativeKm)
      }
      for (let i = 0; i < mFirst.length - 1; i++) {
        expect(mFirst[i + 1].cumulativeKm).toBeGreaterThan(mFirst[i].cumulativeKm)
      }
    })
  })

  describe('全域航點查找快取字典 (Global Waypoint Map)', () => {
    it('應能以 O(1) 成功查找到所有路線之航點', () => {
      const map = buildGlobalWaypointMap()
      expect(map.get('SJPP')?.chineseName).toContain('聖讓皮耶德波爾')
      expect(map.get('portugues:porto')?.chineseName).toBe('波多')
      expect(map.get('portugues:redondela')?.chineseName).toContain('雷東德拉')
      expect(map.get('norte:irun')?.chineseName).toContain('伊倫')
      expect(map.get('finisterre:fisterra')?.chineseName).toContain('菲尼斯特雷')
      expect(map.get('finisterre:muxia')?.chineseName).toContain('穆希亞')
    })
  })

  describe('航點動態長度推導與有效 Metadata (Dynamic Distance Derivation)', () => {
    it('所有路線總長度應直接從航點計算且精準無誤', () => {
      expect(getRouteTotalDistance('frances')).toBe(774.5)
      expect(getRouteTotalDistance('norte')).toBe(828.2)
      expect(getRouteTotalDistance('portugues', 'central')).toBe(240.3)
      expect(getRouteTotalDistance('portugues', 'costa')).toBe(270.9)
    })

    it('getEffectiveRouteMetadata 應依分支動態更新長度與建議天數', () => {
      const centralMeta = getEffectiveRouteMetadata('portugues', 'central')
      expect(centralMeta?.totalDistanceKm).toBe(240.3)
      expect(centralMeta?.recommendedDays).toBe(11)

      const costaMeta = getEffectiveRouteMetadata('portugues', 'costa')
      expect(costaMeta?.totalDistanceKm).toBe(270.9)
      expect(costaMeta?.recommendedDays).toBe(13)

      // 各分支的 totalDistanceKm 亦應由航點動態推導
      expect(costaMeta?.branches?.[0].totalDistanceKm).toBe(240.3)
      expect(costaMeta?.branches?.[1].totalDistanceKm).toBe(270.9)
    })
  })
})
