import { describe, it, expect } from 'vitest'
import { CLIMATE_ZONES, getClimateZonesByRoute } from '@/data/climate'
import type { ClimateRouteId } from '@/types/climate'

describe('官方氣候基準資料庫完整性驗證 (AEMET & IPMA 1991–2020)', () => {
  it('四大路線（frances / portugues / norte / finisterre）皆應有對應氣候區段', () => {
    const routes: ClimateRouteId[] = ['frances', 'portugues', 'norte', 'finisterre']
    for (const routeId of routes) {
      const zones = getClimateZonesByRoute(routeId)
      expect(zones.length, `${routeId} 應至少包含 1 個氣候區段`).toBeGreaterThanOrEqual(1)
    }
  })

  it('葡萄牙之路氣候區段應以波多作為起點，聖地牙哥作為終點', () => {
    const zones = getClimateZonesByRoute('portugues')
    expect(zones[0]?.id).toBe('portugues-porto')
    expect(zones[zones.length - 1]?.id).toBe('santiago-galicia')
  })

  it('每個氣候區段皆應具備 1–12 月完整且數值合理的統計資料', () => {
    for (const zone of CLIMATE_ZONES) {
      expect(zone.monthly).toHaveLength(12)
      expect(zone.sourcePeriod).toBe('1991-2020')

      zone.monthly.forEach((m, idx) => {
        expect(m.month).toBe(idx + 1)
        expect(Number.isFinite(m.avgMeanC)).toBe(true)
        expect(Number.isFinite(m.avgHighC)).toBe(true)
        expect(Number.isFinite(m.avgLowC)).toBe(true)
        expect(m.avgLowC).toBeLessThanOrEqual(m.avgMeanC)
        expect(m.avgMeanC).toBeLessThanOrEqual(m.avgHighC)
        expect(m.rainyDays).toBeGreaterThanOrEqual(0)
        expect(m.rainyDays).toBeLessThanOrEqual(31)
        expect(m.precipMm).toBeGreaterThanOrEqual(0)
        expect(m.frostDays).toBeGreaterThanOrEqual(0)
        expect(m.snowDays).toBeGreaterThanOrEqual(0)
      })
    }
  })
})
