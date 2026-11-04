/**
 * 預算風格型別
 * BUDGET: 極簡省錢型 (以公立/教區庇護所為核心，多超市自煮)
 * STANDARD: 經典平衡型 (公私立穿插，每日朝聖者套餐與咖啡)
 * COMFORT: 舒適無憂型 (私立床位或獨立單人房，外食無拘束，搭配行李托運)
 * CUSTOM: 自訂型態 (使用者已手動微調特定數值)
 */
export type BudgetPersona = 'BUDGET' | 'STANDARD' | 'COMFORT' | 'CUSTOM'

/**
 * 四大象限詳細花費結構
 */
export interface BudgetDetails {
  // 一、行前固定支出 (TWD 計價，null 代表自訂模式下尚未填寫之空白狀態)
  flightTwd: number | null
  gearTwd: number | null
  insuranceAndSimTwd: number | null

  // 二、徒步路上每日浮動開銷 (EUR/天 計價，支援小數點後兩位)
  lodgingEurPerDay: number | null
  foodEurPerDay: number | null
  laundryEurPerDay: number | null
  luggageTransferEurPerDay: number | null

  // 三、前後跨國接駁交通 (EUR 計價)
  transitToStartEur: number | null
  transitFromEndEur: number | null

  // 四、突發應急金 (EUR 計價)
  emergencyFundEur: number | null
}

/**
 * 預算 Store 狀態
 */
export interface BudgetState {
  persona: BudgetPersona
  isSyncWithSchedule: boolean // 是否自動連動排程天數
  customDays: number // 解耦手動調整之天數 (預設: 33)
  eurToTwdRate: number // 個人自訂匯率基準 (預設: 35.5)
  details: BudgetDetails
}

/**
 * 預算四大象限計算摘要與雙幣總計
 */
export interface BudgetSummary {
  totalDays: number
  eurToTwdRate: number
  // 一、行前固定支出 (TWD 整數)
  flightTwd: number
  gearTwd: number
  insuranceAndSimTwd: number
  totalFixedTwd: number

  // 二、徒步路上每日開銷 (EUR 支援小數點後兩位，換算 TWD 為整數)
  lodgingTotalEur: number
  foodTotalEur: number
  laundryTotalEur: number
  luggageTotalEur: number
  totalDailyWalkingEur: number
  totalDailyWalkingTwd: number
  dailyAvgEur: number // 路上日均開銷 (EUR)

  // 三、前後跨國接駁交通 (EUR & TWD)
  transitTotalEur: number
  transitTotalTwd: number

  // 四、突發應急金 (EUR & TWD)
  emergencyFundEur: number
  emergencyFundTwd: number

  // 雙幣全體總計
  totalEur: number // 歐洲當地總花費 (二 + 三 + 四)
  totalEurToTwd: number // 歐洲花費換算為台幣 (整數)
  grandTotalTwd: number // 全體總花費 (行前固定台幣 + 歐洲花費換算台幣，整數)
}

/**
 * 預算導出模型 (供純文字與 A4 紙本列印使用)
 */
export interface BudgetExportMeta extends BudgetSummary {
  routeName: string
  personaName: string
  createdAt: string
}
