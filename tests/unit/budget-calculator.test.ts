import { describe, it, expect } from 'vitest'
import {
  calculateBudgetSummary,
  DEFAULT_EUR_TWD_RATE,
  EMPTY_BUDGET_DETAILS,
  isDetailsMatchingPreset,
  PERSONA_PRESETS,
  roundToInteger,
  roundToTwoDecimals,
  sanitizeBudgetNumber,
} from '@/utils/budgetCalculator'
import { generateBudgetTextChecklist } from '@/utils/budgetExport'
import type { BudgetExportMeta } from '@/types/budget'

describe('budgetCalculator 預算試算與精度防禦測試', () => {
  it('1. 歐元保留小數點兩位、台幣強制四捨五入整數化', () => {
    expect(roundToTwoDecimals(18.556)).toBe(18.56)
    expect(roundToTwoDecimals(18.554)).toBe(18.55)
    expect(roundToTwoDecimals(NaN)).toBe(0)

    expect(roundToInteger(35000.4)).toBe(35000)
    expect(roundToInteger(35000.6)).toBe(35001)
    expect(roundToInteger(NaN)).toBe(0)
  })

  it('2. 邊界防禦：sanitizeBudgetNumber 能防禦 NaN、負數與超出上限', () => {
    expect(sanitizeBudgetNumber('invalid', 35.5)).toBe(35.5)
    expect(sanitizeBudgetNumber(-10, 0, 0, 100)).toBe(0)
    expect(sanitizeBudgetNumber(200, 0, 0, 100)).toBe(100)
    expect(sanitizeBudgetNumber(45.5)).toBe(45.5)
  })

  it('3. 經典平衡型 (STANDARD) 在 33 天、35.5 匯率下各象限推導正確', () => {
    const summary = calculateBudgetSummary(33, DEFAULT_EUR_TWD_RATE, PERSONA_PRESETS.STANDARD)

    expect(summary.totalDays).toBe(33)
    expect(summary.eurToTwdRate).toBe(35.5)

    // 行前固定: 35000 + 4000 + 2500 = 41500
    expect(summary.totalFixedTwd).toBe(41500)

    // 每日住宿: 20 * 33 = 660
    expect(summary.lodgingTotalEur).toBe(660)
    // 每日飲食: 25 * 33 = 825
    expect(summary.foodTotalEur).toBe(825)
    // 每日洗衣: 5 * 33 = 165
    expect(summary.laundryTotalEur).toBe(165)
    // 徒步路上開銷小計: 660 + 825 + 165 = 1650
    expect(summary.totalDailyWalkingEur).toBe(1650)
    expect(summary.dailyAvgEur).toBe(50.0)

    // 跨國接駁: 60 + 60 = 120
    expect(summary.transitTotalEur).toBe(120)
    // 突發應急金: 300
    expect(summary.emergencyFundEur).toBe(300)

    // 歐洲總計: 1650 + 120 + 300 = 2070
    expect(summary.totalEur).toBe(2070)
    // 歐洲總計折合台幣 (整數): 2070 * 35.5 = 73485
    expect(summary.totalEurToTwd).toBe(73485)
    // 全程總花費: 41500 + 73485 = 114985
    expect(summary.grandTotalTwd).toBe(114985)
  })

  it('4. 極簡省錢型 (BUDGET) 比對與精度驗證', () => {
    expect(isDetailsMatchingPreset(PERSONA_PRESETS.BUDGET, PERSONA_PRESETS.BUDGET)).toBe(true)
    expect(isDetailsMatchingPreset(PERSONA_PRESETS.BUDGET, PERSONA_PRESETS.STANDARD)).toBe(false)

    // 20 天試算
    const summary = calculateBudgetSummary(20, 35.0, PERSONA_PRESETS.BUDGET)
    expect(summary.totalDays).toBe(20)
    expect(summary.lodgingTotalEur).toBe(220) // 11 * 20
    expect(summary.foodTotalEur).toBe(300) // 15 * 20
  })

  it('5. 異常天數自動夾擠於 1 ~ 90 天', () => {
    const minDaysSummary = calculateBudgetSummary(-5, 35.5, PERSONA_PRESETS.STANDARD)
    expect(minDaysSummary.totalDays).toBe(1)

    const maxDaysSummary = calculateBudgetSummary(999, 35.5, PERSONA_PRESETS.STANDARD)
    expect(maxDaysSummary.totalDays).toBe(90)
  })

  it('6. generateBudgetTextChecklist 純文字路書產出格式符合預期', () => {
    const mockMeta: BudgetExportMeta = {
      routeName: '法國之路',
      totalDays: 33,
      personaName: '經典平衡型',
      eurToTwdRate: 35.5,
      flightTwd: 35000,
      gearTwd: 4000,
      insuranceAndSimTwd: 2500,
      totalFixedTwd: 41500,
      lodgingTotalEur: 660,
      foodTotalEur: 825,
      laundryTotalEur: 165,
      luggageTotalEur: 0,
      totalDailyWalkingEur: 1650,
      totalDailyWalkingTwd: 58575,
      dailyAvgEur: 50.0,
      transitTotalEur: 120,
      transitTotalTwd: 4260,
      emergencyFundEur: 300,
      emergencyFundTwd: 10650,
      totalEur: 2070,
      totalEurToTwd: 73485,
      grandTotalTwd: 114985,
      createdAt: '2026-11-01',
    }

    const text = generateBudgetTextChecklist(mockMeta)

    expect(text).toContain('【🇪🇸 聖雅各朝聖之路 · 行程花費預算表】')
    expect(text).toContain('路線：法國之路 ｜ 規劃天數：33 天')
    expect(text).toContain('預算風格：經典平衡型')
    expect(text).toContain('約 NT$ 41,500')
    expect(text).toContain('約 €1650.00')
    expect(text).toContain('全程預估總額：約 NT$ 114,985')
    expect(text).toContain('Buen Camino!')
  })

  it('7. 個人自訂預算 (CUSTOM) 預設內容為空，EMPTY_BUDGET_DETAILS 各欄位皆為 0', () => {
    const customPreset = PERSONA_PRESETS.CUSTOM
    expect(customPreset.flightTwd).toBe(0)
    expect(customPreset.gearTwd).toBe(0)
    expect(customPreset.insuranceAndSimTwd).toBe(0)
    expect(customPreset.lodgingEurPerDay).toBe(0)
    expect(customPreset.foodEurPerDay).toBe(0)
    expect(customPreset.transitToStartEur).toBe(0)
    expect(customPreset.transitFromEndEur).toBe(0)
    expect(customPreset.emergencyFundEur).toBe(0)
  })

  it('8. EMPTY_BUDGET_DETAILS 在 33 天、35.5 匯率下推導計算總額全面歸零 (0)', () => {
    const emptySummary = calculateBudgetSummary(33, DEFAULT_EUR_TWD_RATE, EMPTY_BUDGET_DETAILS)
    expect(emptySummary.totalFixedTwd).toBe(0)
    expect(emptySummary.totalDailyWalkingEur).toBe(0)
    expect(emptySummary.dailyAvgEur).toBe(0)
    expect(emptySummary.transitTotalEur).toBe(0)
    expect(emptySummary.emergencyFundEur).toBe(0)
    expect(emptySummary.totalEur).toBe(0)
    expect(emptySummary.grandTotalTwd).toBe(0)
  })
})
