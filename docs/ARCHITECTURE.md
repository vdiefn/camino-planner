# 🇪🇸 Camino Taiwan Guide 系統架構與技術決策規格書 (v1.2)

## 1. 技術堆疊 (Tech Stack)
- **前端核心**：Vue 3 (Composition API, `<script setup>`) + Vite + TypeScript
- **套件管理**：pnpm
- **樣式系統**：Tailwind CSS (Utility-first)
- **互動元件**：@headlessui/vue (無頭無障礙浮層/開關元件，零樣式污染)
- **圖示庫**：lucide-vue-next
- **狀態管理與離線**：Pinia + pinia-plugin-persistedstate + vite-plugin-pwa
- **自動化資料同步 (CI/CD)**：GitHub Actions 定期排程 (Cron Workflow) 自動抓取與檢驗
- **雲端同步 (Phase 2)**：Supabase (PostgreSQL JSONB 快照)
- **部署託管**：Cloudflare Pages / Vercel (Jamstack 靜態託管，主機維護成本 NT$ 0)

## 2. UI 設計原則 (UI Design Principles)
- **Template-First**：所有版面結構與視覺樣式 100% 在 `<template>` 內以 Tailwind CSS 類別宣告。
- **極致輕量化**：不引入肥大全域樣式庫，表格與卡片採用原生 HTML5 標籤實作，確保 PWA 離線秒級載入。
- **無障礙與狀態管理**：彈窗（Dialog）、開關（Switch）、手風琴折疊（Disclosure）統一採用 `@headlessui/vue`。

## 3. 核心資料模型 (TypeScript Models)

```typescript
// --- 1. 住宿點與預訂管道 ---
export interface BookingChannels {
  bookingComUrl?: string       // Booking.com 預訂連結（可帶分潤代碼）
  officialWebsiteUrl?: string  // 住宿點官方網站
  phone?: string               // 當地聯絡電話
  whatsapp?: string            // WhatsApp 預約號碼
}

export interface Accommodation {
  id: string
  waypointId: string           // 關聯所屬城鎮 ID
  name: string                 // 住宿原名
  chineseName?: string         // 中文譯名/備註
  type: 'MUNICIPAL' | 'PAROCHIAL' | 'PRIVATE' | 'HOSTEL' | 'HOTEL'
  priceEur?: number            // 參考每晚價格
  bedCount?: number            // 總床位數
  hasKitchen?: boolean         // 是否有廚房
  bookingChannels: BookingChannels
  notes?: string               // 實戰備註
}

// --- 2. 城鎮航點 ---
export interface Waypoint {
  id: string
  localName: string            // 當地官方地名 / 國際通稱（如 "Saint-Jean-Pied-de-Port"）
  spanishName: string          // 西班牙文名稱（如 "Roncesvalles"）
  chineseName: string          // 台灣常用中文譯名（如 "聖讓皮耶德波爾"）
  coordinates: {
    lat: number
    lng: number
  }
  cumulativeKm: number         // 全線累積里程
  elevationM: number           // 海拔高度
  hasAlbergue: boolean
  albergueCount?: number       // 該城鎮收錄之住宿點數量
  albergues?: Accommodation[]  // 該城鎮的住宿點清單
  hasPharmacy?: boolean        // 是否有藥局
  hasSupermarket?: boolean     // 是否有超市
  isMajorCity: boolean         // 是否為重要補給大城
  routeVariant?: 'COMMON' | 'NAPOLEON' | 'VALCARLOS'
}

// --- 3. 每日動態分段 ---
export interface UserStage {
  dayIndex: number
  date: string
  startWaypointId: string
  endWaypointId: string
  passedWaypointIds: string[]  // 當日途經之中繼航點清單
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

export interface PackingItem {
  id: string
  chineseName: string          // 中文品名
  englishName: string          // 英文品名
  spanishName?: string         // 西班牙文對照
  category: PackingCategory
  priority: 'ESSENTIAL' | 'RECOMMENDED' | 'OPTIONAL'
  referenceRangeText: string   // 參考重量區間文字
  proTips?: string             // 台灣實戰避坑指南 Tooltip
  isChecked: boolean
  unitWeightGrams: number      // 單件重量 (克)
  quantity: number             // 數量
  isWornOnBody: boolean        // 當天穿在身上（不計入背包淨負重）
  isCustom?: boolean           // 使用者自訂項目
}

// --- 5. 起點交通轉乘方案 ---
export type TransportType = 'FLIGHT' | 'TRAIN' | 'BUS' | 'TAXI' | 'WALK'

export interface TransportStep {
  stepOrder: number
  type: TransportType
  carrierName?: string         // 營運商/車種（如 "SNCF TGV", "ALSA"）
  from: string
  to: string
  durationMinutes: number
  estimatedCostEur: { min: number; max: number }
  bookingUrl?: string
  warningTip?: string
}

export interface TransportRoute {
  id: string
  originCity: 'PARIS' | 'MADRID' | 'BARCELONA'
  title: string
  totalDurationHours: number
  totalCostEur: { min: number; max: number }
  operatingMonths: string
  steps: TransportStep[]
}

// --- 6. 使用者全域規劃設定 ---
export interface UserPlanConfig {
  startDate: string
  targetDays: number
  bodyWeightKg: number
  day1RouteVariant: 'NAPOLEON' | 'VALCARLOS'
}
```

## 4. 資料管線與品質驗證機制 (Data Pipeline & Quality)
- **資料來源標準**：對齊西班牙國立地理研究所 (IGN) 官方 GPX 軌跡、聖地牙哥朝聖者辦公室距離表與 Gronze 資料庫。
- **自動化檢驗測試 (Vitest)**：
  - 驗證里程嚴格遞增與連續性（Day N 終點 === Day N+1 起點）。
  - 驗證 Day 1 雙路線爬升數據（拿破崙之路 1250m、瓦卡洛斯之路 850m）。
  - 驗證所有官方外連、Booking 與 WhatsApp 格式合法性。
- **定期排程同步**：透過 GitHub Actions 定期排程自動巡檢，資料有變動時自動檢驗、打包發布至 Cloudflare Pages。

### 4.1 住宿資料來源階層與核對標準作業程序 (SOP)

當進行 `src/data/accommodations.ts` 住宿點之新增、修改、停業標記或重複清理時，必須依序與下列階層式權威資料進行交叉核對：

#### 1. 權威資料來源階層 (Hierarchy of Truth)
- **【主要資料來源（Primary Source）】**
  - **[Albergues del Camino de Santiago](https://www.alberguescaminosantiago.com/camino-frances/guia-albergues/)**：作為基礎主資料來源，核對最新標配電話、公定價格、總床位數、開放月份季節、是否有廚房及近期頁面更新日期。
- **【交叉核對來源（Cross-check Source）】**
  - **[Gronze Camino Francés](https://www.gronze.com/camino-frances)** 與 **[Gronze Maps](https://www.gronze.com/gronze-maps)**：用於交叉驗證床位數、公定價格、各項硬體設施、實際地址與能否提早預訂等重要營運現況。
- **【終極營運現況依據（Ultimate Operational Truth）】**
  - **住宿方官方網站、直營聯絡電話、WhatsApp 或官方社群專頁**：作為確認「是否仍在營業」、「當季公定價格」、「剩餘床位」與「預約規則」的最終準則。Booking.com 價格不宜寫死進資料，因為會隨日期變動。
- **【公立／教區可靠來源（Regional Authorities）】**
  - 對公立（Municipal）、教區（Parroquial）或公營庇護所，以各自治區官方旅遊網站為準：
    - [Navarra 官方 Camino 資訊](https://www.visitnavarra.es/es/te-gusta/camino-de-santiago/)
    - [Castilla y León 官方旅遊住宿資料](https://www.turismocastillayleon.com/es/servicios/dormir/albergues)
    - [Galicia 公共庇護所網](https://www.caminodesantiago.gal/es/descubre/el-camino-en-la-actualidad/la-red-de-albergues-publicos)
    - [Galicia 旅宿登記目錄](https://descargascdn.xunta.gal/interno/smarxa/reat_directorio-aloxamentos_gal.html)
- **【協會與志工補充來源（Supplementary）】**
  - **[西班牙 Camino 協會聯盟 FEAACS](https://www.caminosantiago.org/)**：適合作為各地志工輪流接待、地方協會管理或特殊修會庇護所的補充聯絡管道與季節異動通知。

#### 2. 住宿欄位維護規範 (Data Hygiene Rules)
1. **價格欄位 (`priceEur`)**：
   - 僅收錄官方公布之基準床位價或公定價。
   - **嚴禁將 Booking.com 的浮動即時房價硬編碼**；若為浮動計價飯店，僅保留 `bookingComUrl`，或填寫淡季基準參考價並於 `notes` 註明。
   - 捐獻制（Donativo）統一填寫 `0`，並於 `notes` 明確說明「自由奉獻（Donativo）」。
2. **電話格式 (`bookingChannels.phone`)**：
   - 統一使用國際格式 `+34 XXX XX XX XX`。
3. **重複與停業清查**：
   - 當住宿方永久停業（Cerrado definitivamente），確認後應直接自清單移除。
   - 若同城鎮存在同名物件，必須核實是否為重複登錄，合併為單筆。

## 5. 商業化與廣告整合架構 (Google AdSense)
- **環境變數控制**：透過 `VITE_GOOGLE_ADSENSE_CLIENT_ID` 決定是否啟用；未配置時元件自體隱藏，零版面空間佔用。
- **離線安靜降級**：PWA 離線環境下使用 `try-catch` 捕獲請求例外，絕不阻塞主執行緒或產生錯誤。
- **CLS 防護**：容器設定 `min-h-[100px]` 預留高度，防止廣告載入時推擠操作按鈕。
- **3 大預留插槽位置**：
  1. `ScheduleView.vue` 頁尾（33天分段清單底部）
  2. `PackingView.vue` 頁尾（裝備打包清單底部）
  3. `TransportView.vue` 頁尾（起點交通決策步驟卡片底部）
