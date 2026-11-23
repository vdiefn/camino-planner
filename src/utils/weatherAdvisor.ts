import type {
  ClimateZone,
  MonthlyClimateStats,
  WeatherAdvisory,
} from '@/types/climate'

/**
 * 依據單月氣候數據與地形旗標，推導朝聖者實戰睡袋、雨具與注意事項建議
 */
export function buildWeatherAdvisory(
  stats: MonthlyClimateStats,
  zone: Pick<ClimateZone, 'isWindExposed' | 'hasHighAltitudeDrop'>,
): WeatherAdvisory {
  const effectiveLowC = zone.hasHighAltitudeDrop ? stats.avgLowC - 4 : stats.avgLowC
  const diurnalSwing = stats.avgHighC - stats.avgLowC

  // 1. 睡袋舒適溫標建議
  let sleepingBagRating = '10°C–15°C 輕量睡袋或睡袋內襯'
  let sleepingBagRatingEn = '10°C–15°C lightweight bag or liner'
  if (effectiveLowC <= 2) {
    sleepingBagRating = '建議耐寒 0°C–5°C 保暖睡袋'
    sleepingBagRatingEn = '0°C–5°C insulated sleeping bag'
  } else if (effectiveLowC <= 8) {
    sleepingBagRating = '建議舒適溫標 5°C–10°C 睡袋'
    sleepingBagRatingEn = '5°C–10°C comfort-rated sleeping bag'
  }

  // 3. 雨具防護等級
  let rainGearLevel: WeatherAdvisory['rainGearLevel'] = 'light'
  if (stats.rainyDays >= 11 || stats.precipMm >= 130) {
    rainGearLevel = 'heavy'
  } else if (stats.rainyDays >= 6 || stats.precipMm >= 60) {
    rainGearLevel = 'moderate'
  }

  // 4. 實戰警示清單
  const alerts: string[] = []
  const alertsEn: string[] = []

  if (stats.frostDays >= 3 || effectiveLowC <= 2) {
    alerts.push('清晨可能出現接近 0°C 低溫或結霜，建議洋蔥式穿搭＋輕量羽絨與手套')
    alertsEn.push('Near-freezing dawn temperatures or frost possible; pack a light down layer & gloves')
  }

  if (stats.snowDays >= 1) {
    alerts.push('冬季高海拔路段有降雪風險，出發前務必確認山區路線開放狀態')
    alertsEn.push('Snow risk at higher elevations; verify pass closures before setting out')
  }

  if (stats.avgHighC >= 28) {
    alerts.push('午後高溫曝曬強烈，建議清晨 6:00 前出發並備足 2L 飲水與防曬')
    alertsEn.push('Strong afternoon heat; start before 06:00 and carry at least 2L of water')
  }

  if (diurnalSwing >= 12) {
    alerts.push(`日夜溫差高達 ${Math.round(diurnalSwing)}°C，清晨保暖與正午透氣層需可快速穿脫`)
    alertsEn.push(`Wide ${Math.round(diurnalSwing)}°C day-night swing; wear easy-to-remove layers`)
  }

  if (rainGearLevel === 'heavy') {
    alerts.push(
      zone.isWindExposed
        ? '多雨且強風頻繁，建議穿著可蓋住背包的防水斗篷，避免使用雨傘'
        : '降雨日數偏高，務必備妥防水斗篷、背包套與鞋襪快乾對策',
    )
    alertsEn.push(
      zone.isWindExposed
        ? 'Frequent rain and strong winds; wear a backpack-covering poncho instead of an umbrella'
        : 'High rainy-day count; bring a reliable poncho, pack cover, and quick-dry socks',
    )
  } else if (zone.isWindExposed && stats.avgHighC <= 18) {
    alerts.push('開闊強風路段體感溫度較低，建議外層搭配防風外套')
    alertsEn.push('Exposed windy sections feel colder; carry a windproof outer shell')
  }

  return {
    sleepingBagRating,
    sleepingBagRatingEn,
    rainGearLevel,
    alerts,
    alertsEn,
  }
}

/**
 * 彙整整條路線在指定月份的總覽摘要（用於排程連動或頁面頂部總結）
 */
export function summarizeRouteMonth(
  zones: ClimateZone[],
  month: number,
): {
  minLowC: number
  maxHighC: number
  maxRainyDays: number
  hasFrostRisk: boolean
  hasHeatRisk: boolean
} | null {
  if (zones.length === 0) return null
  const clampedMonth = Math.min(12, Math.max(1, Math.round(month)))

  let minLowC = Infinity
  let maxHighC = -Infinity
  let maxRainyDays = 0
  let hasFrostRisk = false
  let hasHeatRisk = false

  for (const zone of zones) {
    const m = zone.monthly.find((item) => item.month === clampedMonth)
    if (!m) continue
    const effectiveLow = zone.hasHighAltitudeDrop ? m.avgLowC - 4 : m.avgLowC
    if (m.avgLowC < minLowC) minLowC = m.avgLowC
    if (m.avgHighC > maxHighC) maxHighC = m.avgHighC
    if (m.rainyDays > maxRainyDays) maxRainyDays = m.rainyDays
    if (m.frostDays >= 3 || effectiveLow <= 2) hasFrostRisk = true
    if (m.avgHighC >= 28) hasHeatRisk = true
  }

  if (!Number.isFinite(minLowC) || !Number.isFinite(maxHighC)) return null

  return {
    minLowC,
    maxHighC,
    maxRainyDays,
    hasFrostRisk,
    hasHeatRisk,
  }
}
