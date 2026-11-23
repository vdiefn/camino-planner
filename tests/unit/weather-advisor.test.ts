import { describe, it, expect } from 'vitest'
import { buildWeatherAdvisory, summarizeRouteMonth } from '@/utils/weatherAdvisor'
import { getClimateZonesByRoute } from '@/data/climate'
import type { MonthlyClimateStats } from '@/types/climate'

describe('weatherAdvisor 裝備與實戰決策推導測試', () => {
  it('高海拔落差路段（如庇里牛斯山春季）應套用 -4°C 有效低溫並建議保暖睡袋', () => {
    const springStats: MonthlyClimateStats = {
      month: 4,
      avgMeanC: 10.8,
      avgHighC: 16.0,
      avgLowC: 5.5,
      precipMm: 78,
      rainyDays: 9.8,
      frostDays: 2.0,
      snowDays: 1.2,
    }
    const advisory = buildWeatherAdvisory(springStats, {
      isWindExposed: true,
      hasHighAltitudeDrop: true,
    })

    expect(advisory.sleepingBagRating).toContain('0°C–5°C')
    expect(advisory.alerts.some((a) => a.includes('降雪'))).toBe(true)
  })

  it('高溫且日夜溫差大（如夏季梅塞塔）應觸發防暑與清晨出發提醒', () => {
    const summerMeseta: MonthlyClimateStats = {
      month: 7,
      avgMeanC: 21.5,
      avgHighC: 30.2,
      avgLowC: 12.8,
      precipMm: 18,
      rainyDays: 2.5,
      frostDays: 0,
      snowDays: 0,
    }
    const advisory = buildWeatherAdvisory(summerMeseta, {
      isWindExposed: true,
      hasHighAltitudeDrop: false,
    })

    expect(advisory.rainGearLevel).toBe('light')
    expect(advisory.alerts.some((a) => a.includes('2L'))).toBe(true)
    expect(advisory.alerts.some((a) => a.includes('日夜溫差'))).toBe(true)
  })

  it('強風且多雨路段應建議使用防水斗篷而非雨傘', () => {
    const wetAtlantic: MonthlyClimateStats = {
      month: 11,
      avgMeanC: 12.0,
      avgHighC: 15.2,
      avgLowC: 8.8,
      precipMm: 160,
      rainyDays: 14.5,
      frostDays: 0,
      snowDays: 0,
    }
    const advisory = buildWeatherAdvisory(wetAtlantic, {
      isWindExposed: true,
      hasHighAltitudeDrop: false,
    })

    expect(advisory.rainGearLevel).toBe('heavy')
    expect(advisory.alerts.some((a) => a.includes('避免使用雨傘'))).toBe(true)
  })

  it('summarizeRouteMonth 應正確彙整法國之路 5 月全線區間並夾緊異常月份邊界', () => {
    const zones = getClimateZonesByRoute('frances')
    const maySummary = summarizeRouteMonth(zones, 5)
    expect(maySummary).not.toBeNull()
    expect(maySummary!.minLowC).toBeLessThan(maySummary!.maxHighC)
    expect(maySummary!.maxRainyDays).toBeGreaterThan(0)

    const clampedSummary = summarizeRouteMonth(zones, 99)
    const decSummary = summarizeRouteMonth(zones, 12)
    expect(clampedSummary).toEqual(decSummary)
  })
})
