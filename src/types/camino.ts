// --- 1. 住宿點與預訂管道 ---
export interface BookingChannels {
  bookingComUrl?: string // Booking.com 預訂連結（可帶分潤代碼）
  officialWebsiteUrl?: string // 住宿點官方網站
  phone?: string // 當地聯絡電話
  whatsapp?: string // WhatsApp 預約號碼
}

export type AccommodationType = 'MUNICIPAL' | 'PAROCHIAL' | 'PRIVATE' | 'HOSTEL' | 'HOTEL'

export interface Accommodation {
  id: string
  waypointId: string // 關聯所屬城鎮 ID
  name: string // 住宿原名
  chineseName?: string // 中文譯名/備註
  type: AccommodationType
  priceEur?: number // 參考每晚價格
  bedCount?: number // 總床位數
  hasKitchen?: boolean // 是否有廚房
  bookingChannels: BookingChannels
  notes?: string // 實戰備註
}

// --- 2. 城鎮航點 ---
export type RouteVariant = 'COMMON' | 'NAPOLEON' | 'VALCARLOS'

export interface Waypoint {
  id: string
  localName: string // 當地官方地名 / 國際通稱（如 "Saint-Jean-Pied-de-Port"）
  spanishName: string // 西班牙文名稱（如 "Roncesvalles"）
  chineseName: string // 台灣常用中文譯名（如 "聖讓皮耶德波爾"）
  coordinates: {
    lat: number
    lng: number
  }
  cumulativeKm: number // 全線累積里程
  elevationM: number // 海拔高度
  hasAlbergue: boolean
  albergueCount?: number // 該城鎮收錄之住宿點數量
  albergues?: Accommodation[] // 該城鎮的住宿點清單
  hasPharmacy?: boolean // 是否有藥局
  hasSupermarket?: boolean // 是否有超市
  isMajorCity: boolean // 是否為重要補給大城
  routeVariant?: RouteVariant
}

// --- 3. 每日動態分段 ---
export interface UserStage {
  dayIndex: number
  date: string
  startWaypointId: string
  endWaypointId: string
  passedWaypointIds: string[] // 當日途經之中繼航點清單
  distanceKm: number
  elevationGainM: number
  elevationLossM: number
  isRestDay: boolean
  routeVariant?: 'NAPOLEON' | 'VALCARLOS'
  albergueName?: string
  isBooked?: boolean
  stageNotes?: string
}

// --- 4. 裝備項目 ---
export type PackingCategory =
  | 'PACK'
  | 'CLOTHING'
  | 'FOOTWEAR'
  | 'SLEEP'
  | 'HYGIENE'
  | 'MEDICAL'
  | 'ELECTRONICS'
  | 'DOCS'
  | 'OTHER'

export type PackingPriority = 'ESSENTIAL' | 'RECOMMENDED' | 'OPTIONAL'

export interface PackingItem {
  id: string
  chineseName: string // 中文品名
  englishName: string // 英文品名
  spanishName?: string // 西班牙文對照
  category: PackingCategory
  priority: PackingPriority
  referenceRangeText: string // 參考重量區間文字
  proTips?: string // 台灣實戰避坑指南 Tooltip
  isChecked: boolean
  unitWeightGrams: number // 單件重量 (克)
  quantity: number // 數量
  isWornOnBody: boolean // 當天穿在身上（不計入背包淨負重）
  isCustom?: boolean // 使用者自訂項目
}

// --- 5. 起點交通轉乘方案 ---
export type TransportType = 'FLIGHT' | 'TRAIN' | 'BUS' | 'TAXI' | 'WALK'

export interface TransportStep {
  stepOrder: number
  type: TransportType
  carrierName?: string // 營運商/車種（如 "SNCF TGV", "ALSA"）
  from: string
  to: string
  durationMinutes: number
  estimatedCostEur: { min: number; max: number }
  bookingUrl?: string
  warningTip?: string
}

export type OriginCity = 'PARIS' | 'MADRID' | 'BARCELONA'

export interface TransportRoute {
  id: string
  originCity: OriginCity
  title: string
  totalDurationHours: number
  totalCostEur: { min: number; max: number }
  operatingMonths: string
  steps: TransportStep[]
}

// --- 6. 使用者全域規劃設定 ---
export interface UserPlanConfig {
  startDate: string
  startWaypointId: string
  endWaypointId: string
  targetDays: number // 預計總天數
  restDays?: number // 預計休息天數
  dailyTargetKm: number
  bodyWeightKg: number
  day1RouteVariant: 'NAPOLEON' | 'VALCARLOS' // 僅當起點為 SJPP 時生效
}
