import type {
  BudgetDetails,
  BudgetPersona,
  BudgetSummary,
} from '@/types/budget'

/**
 * 預設參考基準匯率 (1 EUR = 35.5 TWD)
 */
export const DEFAULT_EUR_TWD_RATE = 35.5

/**
 * 匯率安全夾擠邊界 (避免手滑輸入極端數值破圖)
 */
export const MIN_EUR_RATE = 10.0
export const MAX_EUR_RATE = 100.0

/**
 * 天數安全夾擠邊界
 */
export const MIN_BUDGET_DAYS = 1
export const MAX_BUDGET_DAYS = 90

/**
 * 空預算明細（用於個人自訂型預設或還原時之乾淨狀態）
 */
export const EMPTY_BUDGET_DETAILS: BudgetDetails = {
  flightTwd: null,
  gearTwd: null,
  insuranceAndSimTwd: null,
  lodgingEurPerDay: null,
  foodEurPerDay: null,
  laundryEurPerDay: null,
  luggageTransferEurPerDay: null,
  transitToStartEur: null,
  transitFromEndEur: null,
  emergencyFundEur: null,
}

/**
 * 四大風格預設花費參數 (均經過西班牙實務行情校正)
 */
export const PERSONA_PRESETS: Record<BudgetPersona, BudgetDetails> = {
  // 🌱 極簡省錢型: 公立庇護所為主、多超市自煮、全程自揹、精省交通
  BUDGET: {
    flightTwd: 28000,
    gearTwd: 2500,
    insuranceAndSimTwd: 2000,
    lodgingEurPerDay: 11.0,
    foodEurPerDay: 15.0,
    laundryEurPerDay: 2.0,
    luggageTransferEurPerDay: 0.0,
    transitToStartEur: 45.0,
    transitFromEndEur: 45.0,
    emergencyFundEur: 200.0,
  },
  // 🚶 經典平衡型 (官方推薦): 公私立穿插、每日朝聖者套餐與沿途咖啡、偶爾投幣機洗、自揹
  STANDARD: {
    flightTwd: 35000,
    gearTwd: 4000,
    insuranceAndSimTwd: 2500,
    lodgingEurPerDay: 20.0,
    foodEurPerDay: 25.0,
    laundryEurPerDay: 5.0,
    luggageTransferEurPerDay: 0.0,
    transitToStartEur: 60.0,
    transitFromEndEur: 60.0,
    emergencyFundEur: 300.0,
  },
  // ☕ 舒適無憂型: 私立床位或獨立單人房、三餐餐酒餐廳、搭配行李托運、彈性應急
  COMFORT: {
    flightTwd: 42000,
    gearTwd: 8000,
    insuranceAndSimTwd: 3500,
    lodgingEurPerDay: 55.0,
    foodEurPerDay: 40.0,
    laundryEurPerDay: 8.0,
    luggageTransferEurPerDay: 7.0,
    transitToStartEur: 90.0,
    transitFromEndEur: 90.0,
    emergencyFundEur: 500.0,
  },
  // 🛠️ 個人自訂型: 預設內容為空，輸入框維持空狀態，標準參考值保留於 placeholder
  CUSTOM: { ...EMPTY_BUDGET_DETAILS },
}

/**
 * 風格顯示名稱與標籤
 */
export const PERSONA_LABELS: Record<
  BudgetPersona,
  { name: string; subtitle: string; tag: string; description: string }
> = {
  BUDGET: {
    name: '極簡省錢型',
    subtitle: '苦行僧體驗',
    tag: '日均約 €28',
    description: '以公立/教區庇護所為核心，搭配超市採買自煮，全程自揹，極致省荷包。',
  },
  STANDARD: {
    name: '經典平衡型',
    subtitle: '多數朝聖者推薦',
    tag: '日均約 €50',
    description: '公私立穿插，每日享用朝聖者套餐與沿途咖啡吧台補給，偶爾機洗，兼顧體力與預算。',
  },
  COMFORT: {
    name: '舒適無憂型',
    subtitle: '身心放鬆假期',
    tag: '日均約 €110',
    description: '以私立床位或獨立單人房為主，三餐精緻外食無拘束，搭配行李托運服務，優雅朝聖。',
  },
  CUSTOM: {
    name: '個人自訂型',
    subtitle: '依個人需求調整',
    tag: '個人化試算',
    description: '預設內容為空，可依個人實際規劃自由自訂各項開銷金額。',
  },
}

/**
 * 歐元保留小數點後兩位（防範浮點數運算誤差）
 */
export function roundToTwoDecimals(num: number): number {
  if (!Number.isFinite(num)) return 0
  return Math.round(num * 100) / 100
}

/**
 * 台幣強制整數化（四捨五入）
 */
export function roundToInteger(num: number): number {
  if (!Number.isFinite(num)) return 0
  return Math.round(num)
}

/**
 * 數值安全性防禦與夾擠（防範 NaN、負數與極端值）
 */
export function sanitizeBudgetNumber(
  val: unknown,
  fallback = 0,
  min = 0,
  max = 10000000
): number {
  const num = Number(val)
  if (!Number.isFinite(num)) return fallback
  if (num < min) return min
  if (num > max) return max
  return num
}

/**
 * 比對兩組明細數值是否完全相同（用於判斷是否偏離風格預設）
 */
export function isDetailsMatchingPreset(
  current: BudgetDetails,
  preset: BudgetDetails
): boolean {
  const keys = Object.keys(preset) as (keyof BudgetDetails)[]
  return keys.every((k) => Math.abs((current[k] ?? 0) - (preset[k] ?? 0)) < 0.001)
}

/**
 * 依據天數、匯率與花費明細，動態計算四大象限與雙幣總計
 */
export function calculateBudgetSummary(
  days: number,
  rate: number,
  details: BudgetDetails
): BudgetSummary {
  const validDays = Math.max(
    MIN_BUDGET_DAYS,
    Math.min(MAX_BUDGET_DAYS, Math.round(sanitizeBudgetNumber(days, 33)))
  )
  const validRate = sanitizeBudgetNumber(
    rate,
    DEFAULT_EUR_TWD_RATE,
    MIN_EUR_RATE,
    MAX_EUR_RATE
  )

  // 1. 行前固定支出 (TWD 整數)
  const flightTwd = roundToInteger(sanitizeBudgetNumber(details.flightTwd))
  const gearTwd = roundToInteger(sanitizeBudgetNumber(details.gearTwd))
  const insuranceAndSimTwd = roundToInteger(
    sanitizeBudgetNumber(details.insuranceAndSimTwd)
  )
  const totalFixedTwd = flightTwd + gearTwd + insuranceAndSimTwd

  // 2. 徒步路上每日開銷 (EUR 保留 2 位小數)
  const dailyLodging = sanitizeBudgetNumber(details.lodgingEurPerDay)
  const dailyFood = sanitizeBudgetNumber(details.foodEurPerDay)
  const dailyLaundry = sanitizeBudgetNumber(details.laundryEurPerDay)
  const dailyLuggage = sanitizeBudgetNumber(details.luggageTransferEurPerDay)

  const lodgingTotalEur = roundToTwoDecimals(dailyLodging * validDays)
  const foodTotalEur = roundToTwoDecimals(dailyFood * validDays)
  const laundryTotalEur = roundToTwoDecimals(dailyLaundry * validDays)
  const luggageTotalEur = roundToTwoDecimals(dailyLuggage * validDays)

  const totalDailyWalkingEur = roundToTwoDecimals(
    lodgingTotalEur + foodTotalEur + laundryTotalEur + luggageTotalEur
  )
  const totalDailyWalkingTwd = roundToInteger(totalDailyWalkingEur * validRate)
  const dailyAvgEur = roundToTwoDecimals(totalDailyWalkingEur / validDays)

  // 3. 前後跨國接駁交通 (EUR 保留 2 位小數，換算 TWD 整數)
  const transitTo = sanitizeBudgetNumber(details.transitToStartEur)
  const transitFrom = sanitizeBudgetNumber(details.transitFromEndEur)
  const transitTotalEur = roundToTwoDecimals(transitTo + transitFrom)
  const transitTotalTwd = roundToInteger(transitTotalEur * validRate)

  // 4. 突發應急金 (EUR & TWD)
  const emergencyFundEur = roundToTwoDecimals(
    sanitizeBudgetNumber(details.emergencyFundEur)
  )
  const emergencyFundTwd = roundToInteger(emergencyFundEur * validRate)

  // 雙幣全體總計
  const totalEur = roundToTwoDecimals(
    totalDailyWalkingEur + transitTotalEur + emergencyFundEur
  )
  const totalEurToTwd = roundToInteger(totalEur * validRate)
  const grandTotalTwd = totalFixedTwd + totalEurToTwd

  return {
    totalDays: validDays,
    eurToTwdRate: validRate,
    flightTwd,
    gearTwd,
    insuranceAndSimTwd,
    totalFixedTwd,
    lodgingTotalEur,
    foodTotalEur,
    laundryTotalEur,
    luggageTotalEur,
    totalDailyWalkingEur,
    totalDailyWalkingTwd,
    dailyAvgEur,
    transitTotalEur,
    transitTotalTwd,
    emergencyFundEur,
    emergencyFundTwd,
    totalEur,
    totalEurToTwd,
    grandTotalTwd,
  }
}
