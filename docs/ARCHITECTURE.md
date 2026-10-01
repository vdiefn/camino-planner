# 🇪🇸 Camino Taiwan Guide 系統架構與技術決策規格書 (v1.3)

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
- **漸進式揭露 (Progressive Disclosure)**：清單項目預設折疊外語對照與微調控制項，僅凸顯主要品名與總重小計；行內操作（如「穿在身上」膠囊按鈕）阻斷事件冒泡以避免誤觸品名切換。
- **低疲勞視覺語義**：分類標籤與過濾按鈕採用柔和的琥珀暖色（Soft Amber），取代刺眼的高飽和色，兼顧戶外強光下的閱讀對比與視覺舒適度。

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
  isExtensionStage?: boolean   // 是否為世界盡頭延伸段
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

// --- 4.1 使用者本機裝備覆寫狀態 (Delta Storage) ---
export interface UserItemState {
  isChecked?: boolean
  isWornOnBody?: boolean
  unitWeightGrams?: number
  quantity?: number
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

// --- 7. 多路線、分支與世界盡頭外掛模型 (Multi-Route & Extensions) ---
export type RouteId = 'frances' | 'portugues' | 'norte'

export type PortuguesBranchId = 'central' | 'costa'

export type FinisterreOption =
  | 'NONE'
  | 'FINISTERRE_ONLY'
  | 'MUXIA_ONLY'
  | 'BOTH_FINISTERRE_FIRST'
  | 'BOTH_MUXIA_FIRST'

export interface RouteBranch {
  id: string
  name: string
  chineseName: string
  description?: string
  startWaypointId: string
  mergeWaypointId?: string     // 匯流中繼點（如葡萄牙之路中央/海岸線匯合於 Redondela）
}

export interface RouteMetadata {
  id: RouteId
  name: string                 // 官方名稱（如 "Camino Francés"）
  chineseName: string          // 台灣常用譯名（如 "法國之路"）
  description: string
  totalDistanceKm: number      // 官方標準全程公里數
  recommendedDays: number      // 官方建議步行天數
  defaultStartWaypointId: string
  defaultEndWaypointId: string
  branches?: RouteBranch[]     // 分支路線清單（如葡萄牙之路之中央線/海岸線）
  badgeColor?: string          // UI 標籤識別色
}

export interface RouteScheduleDraft {
  routeId: RouteId
  branchId?: string            // 當前啟用之分支（若該路線具備分支）
  startWaypointId: string
  endWaypointId: string
  startDate: string
  targetDays: number
  dailyKmQuota: number
  restDays: number[]           // 插入休息日之天數索引
  customStages?: UserStage[]   // 使用者微調後的分段紀錄
  finisterreOption: FinisterreOption // 世界盡頭延伸選項
  santiagoLayoverDays?: number // 聖地牙哥停留休整天數（0~2天）
  updatedAt: string
}

export interface MultiRouteScheduleState {
  currentRouteId: RouteId
  drafts: Record<RouteId, RouteScheduleDraft>
}
```

## 4. 資料管線與品質驗證機制 (Data Pipeline & Quality)
- **資料來源標準**：對齊西班牙國立地理研究所 (IGN) 官方 GPX 軌跡、聖地牙哥朝聖者辦公室距離表與 Gronze 資料庫。
- **自動化檢驗測試 (Vitest)**：
  - 驗證里程嚴格遞增與連續性（Day N 終點 === Day N+1 起點）。
  - 驗證 Day 1 雙路線爬升數據（拿破崙之路 1250m、瓦卡洛斯之路 850m）。
  - 驗證所有官方外連、Booking 與 WhatsApp 格式合法性。
- **定期排程同步**：透過 GitHub Actions 定期排程自動巡檢，資料有變動時自動檢驗、打包發布至 Cloudflare Pages。

### 4.0 路線途經城鎮（Localidades）收錄標準與 Gronze 對齊 SOP

全系統所有收錄之朝聖路線，其沿途城鎮清單（Waypoints）必須 100% 依循權威指南 **Gronze.com** 之各階段目錄完整收錄，嚴禁任意省略過渡聚落：
1. **全量收錄原則**：凡 Gronze.com 上各 Etapa 官方列出之 Localidades（例如葡萄牙中央線 60+ 個、海岸線 50+ 個），均必須於資料層建立獨立之 `Waypoint` 節點。
2. **多語對照與地名標準化**：
   - `localName`：當地官方語言名稱（如葡萄牙文 `São Pedro de Rates`、加利西亞文 `A Guarda`）。
   - `spanishName`：西班牙文標準名稱。
   - `chineseName`：符合台灣工程與朝聖圈慣用之繁體中文標準譯名。
3. **機能屬性完整標記**：
   - `hasAlbergue`：是否有朝聖者專屬庇護所（公立、教區或私立）。
   - `hasPharmacy`：是否有藥局（緊急醫療照護）。
   - `hasSupermarket`：是否有超市或雜貨店（飲食補給）。
   - `isMajorCity`：是否為各自治區首府、歷史大城或主要交通樞紐。
4. **里程單調遞增保證**：
   - 航點之 `segmentKm` 依路段實測分配，最後節點累計里程必須精準吻合官方總長（中央線 240.3km、海岸線 270.9km）。

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

### 4.2 裝備狀態儲存架構與本機持久化機制 (Delta Storage Architecture)

為了徹底解決「官方裝備清單發布更新（修訂譯名、新增避坑指南、調整分類）後，既有使用者的 `localStorage` 鎖死過時資料」之技術痛點，裝備模組採用**差異化儲存架構（Delta Storage）**：

#### 1. 三層式資料狀態劃分
- **官方靜態資料庫 (`defaultPackingItems`)**：
  - 存放於原始碼中，受版本控管。
  - 負責供應項目的靜態屬性（中文品名、英文品名、西班牙文品名、分類、優先級、參考重量區間文字、ProTips 指南）。
- **使用者狀態覆寫字典 (`userItemStates: Record<string, UserItemState>`)**：
  - 僅儲存使用者對官方項目的個別操作差異：`{ isChecked, isWornOnBody, unitWeightGrams, quantity }`。
  - 達成儲存空間最佳化，使 `localStorage` 儲存體積縮減 85% 以上。
- **自訂裝備清單 (`customItems: PackingItem[]`)**：
  - 獨立保存使用者自行新增的裝備物件（包含中、英、西三語名稱）。
- **運算整合格位 (`packingItems: ComputedRef<PackingItem[]>`)**：
  - 透過 Pinia Store 的 `computed` 動態將程式碼中最新的 `defaultPackingItems` 與 `userItemStates` 結合，並附加 `customItems`。
  - **架構效益**：官方發布最新指南或翻譯時，使用者無需手動重設或清除快取即可即刻同步，且使用者輸入的秤重克數與勾選狀態完好保留。

#### 2. Pinia 本機持久化設定 (Persistence)
- 配合 `pinia-plugin-persistedstate` v4 規範，持久化配置嚴格限定白名單：
  ```typescript
  persist: {
    key: 'camino-packing-store',
    pick: ['version', 'bodyWeightKg', 'userItemStates', 'customItems'],
  }
  ```
- 杜絕將由公式計算而得的整合陣列儲存進本機，完全消弭快取膨脹與多路線擴充時的狀態衝突。

### 4.3 多路線註冊與世界盡頭外掛架構 (Route Registry & Finisterre Add-on Architecture)

為達成未來路線持續擴充的「開放封閉原則（OCP）」，並杜絕多路線狀態互相污染，系統採用註冊表模式結合外掛插件設計：

#### 1. 路線模組化組織架構 (`src/data/routes/`)
- 拆分原先單一的巨石航點檔，按路線各自維護獨立的資料模組：
  - `src/data/routes/frances.ts`：法國之路（SJPP ➔ Santiago，全長 774.5km，含 Day 1 雙路線）。
  - `src/data/routes/portugues.ts`：葡萄牙之路（波多起點，內含中央線與海岸線雙分支，全長約 240~280km）。
  - `src/data/routes/norte.ts`：北方之路經典版（Irún ➔ Arzúa ➔ Santiago，全長約 825km）。
  - `src/data/routes/finisterre.ts`：世界盡頭延伸拓撲網（Santiago ➔ Finisterre / Muxía / 橫向連接段）。
  - `src/data/routes/index.ts`：核心註冊中心（Route Registry），提供 `AVAILABLE_ROUTES`、`getRouteMetadata`、`getRouteWaypoints` 等統一查詢介面。

#### 2. 航點命名空間規範 (Namespace Pattern)
- 航點識別碼強制採用前綴命名空間格式 `${routeId}:${localSlug}`（例如 `frances:sjpp`、`portugues:porto`、`norte:irun`、`finisterre:fisterra`）。
- 徹底消除不同路線同名市鎮在 Pinia store 快取、搜尋索引與分段航點關聯中的碰撞問題。

#### 3. 葡萄牙之路雙分支匯流機制 (Branching & Merging)
- 波多起點提供「中央線（Camino Central）」與「海岸線（Camino de la Costa）」雙分支：
  - **中央線路徑**：Porto ➔ Vairão ➔ Barcelos ➔ Ponte de Lima ➔ Valença ➔ Tui ➔ Redondela。
  - **海岸線路徑**：Porto ➔ Matosinhos ➔ Vila do Conde ➔ Viana do Castelo ➔ Caminha ➔ Vigo ➔ Redondela。
  - **匯流共線路段**：兩條分支於加利西亞小鎮 **Redondela** 正式匯流，後續共線經 Pontevedra ➔ Caldas de Reis ➔ Padrón 抵達聖地牙哥。
- 資料層在航點上標記 `branchId` 與 `mergeWaypointId`，排程計算機依使用者選擇之分支動態過濾並拼接共線航段。

#### 4. 世界盡頭延伸線拓撲圖 (DAG) 與排程接續鏈 (Schedule Chaining)
- 世界盡頭定義為全域外掛模組，所有主路線抵達聖地牙哥後皆可掛載。
- **節點拓撲網**：
  - 主幹段：Santiago ➔ Negreira ➔ Olveiroa ➔ Hospital。
  - Hospital 分岔口：
    - 往菲尼斯特雷：Hospital ➔ Cee ➔ Corcubión ➔ Finisterre（約 90km）。
    - 往穆希亞：Hospital ➔ Dumbría ➔ Muxía（約 86km）。
  - 橫向段：Finisterre ⟷ Lires ⟷ Muxía（約 29km，雙向可逆，爬升/下降高度隨前進方向動態反轉）。
- **排程鏈推導演算法與停留休整日**：
  - 當使用者啟用世界盡頭延伸時，系統以聖地牙哥抵達日為錨點。
  - 支援「聖地牙哥停留天數（0~2 天）」設定，自動在抵達聖地牙哥與延伸段出發之間插入休整日，日期嚴格連續遞增。
  - **延伸段邊界防護**：延伸分段（標記 `isExtensionStage: true`）更換結束點時，候選航點嚴格隔離於世界盡頭子拓撲節點範圍內，防止倒流回主線城鎮。

#### 5. 多路線獨立草稿持久化機制 (Multi-Draft Persistence)
- `scheduleStore` 採用分層狀態樹：
  ```typescript
  {
    currentRouteId: 'frances',
    drafts: {
      frances: { ... },
      portugues: { ... },
      norte: { ... }
    }
  }
  ```
- 當使用者在導覽列切換路線時，系統自動將現有規劃快照存入對應的 `drafts[routeId]`，並無縫切換讀取新路線之獨立草稿，確保排程紀錄永不被非預期覆寫。

### 4.4 子元件航點解析解耦與全域快取查驗架構 (Subcomponent Decoupling & Waypoint Resolution Pipeline)

為徹底解決 UI 子元件（`StageCard.vue`、`ChangeWaypointModal.vue`、`AlbergueModal.vue` 等）硬編碼綁定單一航點檔案之缺陷，建立集中式航點解析管線：

1. **Store 集中真理來源**：
   - `scheduleStore` 暴露 `currentWaypoints` 計算屬性（當前路線有效航點 + 啟用中的世界盡頭延伸航點）。
   - Store 維護航點查找快取字典（`Map<string, Waypoint>`），提供 O(1) 效能的 `getWaypoint(id: string)` 統一介面。
2. **UI 子元件依賴倒置 (Dependency Inversion)**：
   - 子元件全面移除對 `src/data/waypoints.ts` 的靜態引用，一律改由 Store 的 `getWaypoint` 或 Props 傳遞，使元件完全正交並具備跨路線通用能力。
3. **庇護所空狀態優雅降級**：
   - 針對尚未建置完整本機住宿清單之新路線航點，`AlbergueModal.vue` 提供友善空狀態提示，並提供精確直通 Gronze 該城鎮之官方外連，保障前端零拋錯與流暢的使用者體驗。

### 4.5 本機快取遷移管線與自動化測試架構 (Storage Migration & Vitest Testing Pipeline)

#### 1. 快取無損升級管線 (Zero-Break Schema Migration)
- **問題防護**：舊版使用者瀏覽器儲存的是平鋪的 `{ config: { startWaypointId: 'SJPP' }, stages: [...] }`。Pinia 還原時若無攔截將使新版 `drafts` 覆蓋為 `undefined`。
- **解決機制**：
  - 在 `pinia-plugin-persistedstate` 配置 `afterRestore` 生命週期 Hook。
  - 檢測快取若缺少 `version` 或為 v1.0 舊格式，自動觸發 `migrateLegacyStorage()`：將現有配置深拷貝搬遷至 `drafts.frances`，設定 `currentRouteId = 'frances'`，並寫入新版 schema 版本標籤，實現使用者完全無感的平滑升級。

#### 2. Vitest 自動化測試金字塔 (Testing Pyramid)
透過 `pnpm test` (Vitest) 建立 3 大專屬驗證測試套件，嚴格阻絕任何架構退化（Regression）：
- `tests/unit/routes-data.test.ts`：
  - 驗證所有航點 ID 具備正確命名空間前綴（`frances:*`, `portugues:*`, `norte:*`, `finisterre:*`）。
  - 驗證各路線里程 `cumulativeKm` 單調遞增無跳空，座標與海拔皆在合法數值區間。
  - 驗證葡萄牙之路雙分支於 Redondela 匯流之節點連續性。
  - 驗證世界盡頭 5 種走向路徑之有向圖節點閉環性。
- `tests/unit/schedule-calculator.test.ts`：
  - **迴歸基準驗證**：法國之路經典 33 天推導結果（總天數、各日停靠點、總里程 774.5km、總爬升）與重構前 100% 完全相符。
  - **葡萄牙分支切換驗證**：中央線 vs 海岸線天數與每日配額推導精準度。
  - **世界盡頭排程鏈驗證**：延伸段 5 種走向接續天數、日期連續性、聖地牙哥停留休整日推導，以及雙向環線之爬升/下降高度動態反轉運算。
- `tests/unit/schedule-migration.test.ts`：
  - 模擬舊版 localStorage schema 還原，驗證自動遷移邏輯與草稿隔離性。

## 5. 商業化與廣告整合架構 (Google AdSense)
- **環境變數控制**：透過 `VITE_GOOGLE_ADSENSE_CLIENT_ID` 決定是否啟用；未配置時元件自體隱藏，零版面空間佔用。
- **離線安靜降級**：PWA 離線環境下使用 `try-catch` 捕獲請求例外，絕不阻塞主執行緒或產生錯誤。
- **CLS 防護**：容器設定 `min-h-[100px]` 預留高度，防止廣告載入時推擠操作按鈕。
- **3 大預留插槽位置**：
  1. `ScheduleView.vue` 頁尾（33天分段清單底部）
  2. `PackingView.vue` 頁尾（裝備打包清單底部）
  3. `TransportView.vue` 頁尾（起點交通決策步驟卡片底部）
