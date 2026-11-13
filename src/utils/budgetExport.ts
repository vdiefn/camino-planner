import type { BudgetExportMeta } from '@/types/budget'

/**
 * 產生供通訊軟體（LINE / 備忘錄）分享之繁體中文極簡預算清單
 * 格式抗破版、無長折線、資訊分層清晰，雙幣清楚對照
 */
export function generateBudgetTextChecklist(
  meta: BudgetExportMeta,
  locale: string = 'zh-TW'
): string {
  const isEn = locale === 'en'
  const lines: string[] = []

  if (isEn) {
    const totalFixedEur = meta.totalFixedTwd / meta.eurToTwdRate
    const grandTotalEur = meta.totalEur + totalFixedEur
    const flightEur = meta.flightTwd / meta.eurToTwdRate
    const gearEur = meta.gearTwd / meta.eurToTwdRate
    const insEur = meta.insuranceAndSimTwd / meta.eurToTwdRate

    lines.push('[Camino de Santiago · Budget Breakdown Sheet]')
    lines.push(`Route: ${meta.routeName} ｜ Planned Days: ${meta.totalDays} days`)
    lines.push(`Budget Style: ${meta.personaName}`)
    lines.push('')
    lines.push('----------------------------------------')
    lines.push('[Budget Breakdown]')
    lines.push('')

    // 1. Pre-trip Fixed Expenses
    lines.push(`1. Pre-trip Fixed Expenses: ~€${totalFixedEur.toFixed(2)}`)
    lines.push(`  · Round-trip Flights: €${flightEur.toFixed(2)}`)
    lines.push(`  · Gear & Clothing: €${gearEur.toFixed(2)}`)
    lines.push(`  · Travel Insurance & eSIM: €${insEur.toFixed(2)}`)
    lines.push('')

    // 2. Daily Walking Expenses
    const dailyAvgStr = meta.dailyAvgEur.toFixed(2)
    lines.push(`2. Daily Walking Expenses (${meta.totalDays} days, ~€${dailyAvgStr}/day):`)
    lines.push(`  Subtotal: ~€${meta.totalDailyWalkingEur.toFixed(2)}`)
    lines.push(`  · Lodging / Bed: €${meta.lodgingTotalEur.toFixed(2)}`)
    lines.push(`  · Meals & Food: €${meta.foodTotalEur.toFixed(2)}`)
    lines.push(`  · Laundry & Sundries: €${meta.laundryTotalEur.toFixed(2)}`)
    if (meta.luggageTotalEur > 0) {
      lines.push(`  · Luggage Transfer: €${meta.luggageTotalEur.toFixed(2)}`)
    }
    lines.push('')

    // 3. Transit
    lines.push(`3. Trailhead & Return Transit: ~€${meta.transitTotalEur.toFixed(2)}`)
    lines.push('')

    // 4. Emergency Fund
    lines.push(`4. Emergency Contingency Fund: ~€${meta.emergencyFundEur.toFixed(2)}`)
    lines.push('----------------------------------------')
    lines.push('')

    // Summary
    lines.push('[Total Estimated Expenses (EUR)]')
    lines.push(`  · On-Trail Expenses: ~€${meta.totalEur.toFixed(2)}`)
    lines.push(`  · Pre-trip Fixed: ~€${totalFixedEur.toFixed(2)}`)
    lines.push(`  · Grand Total: ~€${grandTotalEur.toFixed(2)}`)
    lines.push('')
    lines.push('Buen Camino! Wishing you a peaceful journey.')

    return lines.join('\n')
  }

  lines.push('【聖雅各朝聖之路 · 行程花費預算表】')
  lines.push(`路線：${meta.routeName} ｜ 規劃天數：${meta.totalDays} 天`)
  lines.push(`預算風格：${meta.personaName} ｜ 參考匯率：1 EUR ≈ ${meta.eurToTwdRate.toFixed(1)} TWD`)
  lines.push('')
  lines.push('----------------------------------------')
  lines.push('【預算明細】')
  lines.push('')

  // 一、行前固定支出
  lines.push(`一、行前固定支出：約 NT$ ${meta.totalFixedTwd.toLocaleString()}`)
  lines.push(`  · 台灣來回機票：NT$ ${meta.flightTwd.toLocaleString()}`)
  lines.push(`  · 裝備增補採購：NT$ ${meta.gearTwd.toLocaleString()}`)
  lines.push(`  · 申根保險與網卡：NT$ ${meta.insuranceAndSimTwd.toLocaleString()}`)
  lines.push('')

  // 二、徒步路上開銷
  const dailyAvgStr = meta.dailyAvgEur.toFixed(2)
  lines.push(`二、徒步路上每日開銷（共 ${meta.totalDays} 天，日均約 €${dailyAvgStr}）：`)
  lines.push(`  小計：約 €${meta.totalDailyWalkingEur.toFixed(2)} (約 NT$ ${meta.totalDailyWalkingTwd.toLocaleString()})`)
  lines.push(`  · 庇護所住宿：€${meta.lodgingTotalEur.toFixed(2)}`)
  lines.push(`  · 三餐飲食補給：€${meta.foodTotalEur.toFixed(2)}`)
  lines.push(`  · 洗衣日常雜支：€${meta.laundryTotalEur.toFixed(2)}`)
  if (meta.luggageTotalEur > 0) {
    lines.push(`  · 行李托運服務：€${meta.luggageTotalEur.toFixed(2)}`)
  }
  lines.push('')

  // 三、前後接駁交通
  lines.push(`三、前後跨國接駁交通：約 €${meta.transitTotalEur.toFixed(2)} (約 NT$ ${meta.transitTotalTwd.toLocaleString()})`)
  lines.push('')

  // 四、突發應急金
  lines.push(`四、突發應急預備金：約 €${meta.emergencyFundEur.toFixed(2)} (約 NT$ ${meta.emergencyFundTwd.toLocaleString()})`)
  lines.push('----------------------------------------')
  lines.push('')

  // 總計
  lines.push('【預估總花費（雙幣對照）】')
  lines.push(`  · 歐洲當地開銷：約 €${meta.totalEur.toFixed(2)} (換算約 NT$ ${meta.totalEurToTwd.toLocaleString()})`)
  lines.push(`  · 台灣行前固定：約 NT$ ${meta.totalFixedTwd.toLocaleString()}`)
  lines.push(`  · 全程預估總額：約 NT$ ${meta.grandTotalTwd.toLocaleString()}`)
  lines.push('')
  lines.push('Buen Camino! 祝朝聖之路行前準備順利平安')

  return lines.join('\n')
}
