# 🇪🇸 Camino Planner（聖雅各朝聖之路智慧規劃器）

專為台灣朝聖者打造的西班牙朝聖之路（Camino de Santiago）現代化 Progressive Web App (PWA)。結合三大經典路線動態自適應排程、世界盡頭延伸規劃、起點跨國交通決策、科學化裝備負重試算與離線優先無狀態跨裝置同步，消除啟程前的未知焦慮。

---

## 🌟 核心特色 (Key Features)

### 1. 三大路線動態排程與世界盡頭延伸 (Multi-Route Schedule)
- **支援三大經典朝聖路線**：
  - 🇫🇷 **法國之路 (Camino Francés)**：SJPP 至聖地牙哥全線 774.5 km，支援「拿破崙越嶺之路」與「瓦卡洛斯冬季安全之路」自由切換，內建冬季封山安全強制鎖（11/1～3/31）。
  - 🇵🇹 **葡萄牙之路 (Camino Portugués)**：波多主教座堂起點，支援「中央線 (Central)」與「海岸線 (Coastal)」雙分支切換。
  - 🌊 **北方之路 (Camino del Norte)**：依倫 (Irún) 邊界起點，縱覽坎塔布里亞海壯闊海岸線。
- **世界盡頭連貫延伸 (Fisterra & Muxía)**：抵達聖地牙哥後，可一鍵無縫串接至大西洋地涯菲尼斯特雷 (Fisterra) 與穆希亞 (Muxía)，日期與步程自動精準推導。
- **彈性天數、均分配速與休息日**：依個人體能自由設定目標天數或每日里程配額（Quota），支援隨時插入停留休息日（Rest Day）或更換停留城鎮。

### 2. 三大起點跨國交通轉乘決策 (Transport Guide)
- **直通朝聖起點**：針對台灣長途航班精選門戶（巴黎 CDG、馬德里 MAD、巴塞隆納 BCN、里斯本 LIS），提供直達 SJPP、Porto、Irún 的最優轉乘方案。
- **票價、車程與避坑提示結構化條列**：整合 TGV 高鐵、Renfe 國鐵、Euskotren 輕軌、CP 葡鐵與 ALSA 長途巴士之官方預訂傳送門、預估車程、票價區間與第一手換乘防坑實戰經驗。

### 3. 科學化裝備負重與三語對照 (Packing Calculator)
- **體重 10% 警戒線試算**：輸入體重即時試算背包負重安全門檻，超過顯示紅色告警。
- **穿戴不計負重**：支援「穿在身上（`isWornOnBody`）」切換開關，穿戴衣鞋自動自背包淨重扣除。
- **中英西三語對照與自訂裝備**：內建九大分類必備清單，裝備名稱附西班牙文與英文對照方便海外補給，支援以 1g 為單位細緻微調重量與自訂裝備項目。
- **分類顯示與準備狀態連動**：依個人需求隱藏非必要分類（如露營睡眠），系統即時連動負重試算與分享狀態，不準備的分類絕不計入背包負重。

### 4. 庇護所與生活機能一覽 (Albergue & Amenities)
- 內建各停留城鎮公立/私立庇護所設施、床位與費用資訊。
- 整合一鍵電話預約、官方網站、Booking.com 連結，並提供超商與藥局的 Google Maps 精準導航。

### 5. 離線優先與無狀態跨裝置同步 (Offline-First PWA & Stateless Sync)
- **離線可用與秒開快取**：純前端 Jamstack 運算與 Pinia 本機持久化（`localStorage`），搭配 Service Worker 靜態資源快取，即使在山區或荒原斷網環境也能 100% 順暢操作。
- **跨裝置 QR Code / 短網址秒傳**：透過 `fflate`（Deflate 二進位壓縮）與 `uqr` 將排程重建種子與裝備差集濃縮為極致短網址與純向量 QR Code，免註冊登入即可在手機相機掃描後一鍵同步。
- **完整 JSON 備份匯出與覆寫防護**：支援跨所有路線草稿與自訂裝備之 `.json` 完整匯出與還原，匯入時提供選擇性勾選與預覽防護機制，保護現有規劃心血。

---

## 🛠️ 技術堆疊 (Tech Stack)

| 領域 | 核心技術 |
| :--- | :--- |
| **前端框架** | Vue 3 (Composition API, `<script setup>`) |
| **建置工具** | Vite 8 + TypeScript 6 |
| **樣式系統** | Tailwind CSS v4 (手機/平板/電腦全端自適應配適) |
| **無障礙元件** | @headlessui/vue (Dialog、Disclosure、Transition) |
| **狀態管理** | Pinia + pinia-plugin-persistedstate (差集架構與本機持久化) |
| **跨端同步與壓縮** | fflate (二進位 Deflate 壓縮) + uqr (極輕量向量 QR Code 生成) |
| **離線機制** | vite-plugin-pwa (Service Worker 快取策略) |
| **圖示庫** | lucide-vue-next |
| **單元測試** | Vitest (覆蓋排程運算、負重試算、二進位編解碼與資料完整性驗證) |

---

## 🗺️ 路線與功能發展藍圖 (Roadmap)

依據朝聖者官方統計受眾數據與 SEO 搜尋意圖，依序推進以下五大功能模組：

- [ ] **P0: 朝聖花費預算計算機 (`/budget`)**：跨全路線連動排程天數，自動試算公立/私立住宿、三餐與應急預備金。
- [ ] **P0: 葡萄牙之路－海岸線 (Coastal Route)**：補齊近兩年成長率第一的波多大西洋海岸路線，全站覆蓋率推升至 86%。
- [ ] **P1: 各月份天氣與出發月份決策 (`/weather`)**：各路線氣候、降雨日數、庇護所開關門淡旺季與新手最佳出發月。
- [ ] **P2: 庇護所預訂與通則指南 (`/albergue`)**：公立 vs 私立庇護所規則、朝聖護照排隊原則與預約管道全攻略。
- [ ] **P3: 英國之路 (Inglés) 與原始之路 (Primitivo)**：適合假日時數有限者的 113km 短程路線與經典高山翻越路線。

---

## 🚀 快速開始 (Getting Started)

### 系統需求
- Node.js >= 18.0.0
- pnpm >= 9.0.0

### 安裝與啟動
```bash
# 1. 複製專案
git clone https://github.com/your-username/camino-planner.git
cd camino-planner

# 2. 安裝相依套件
pnpm install

# 3. 啟動本機開發伺服器
pnpm dev

# 4. 執行單元測試
pnpm test

# 5. 生產環境建置
pnpm build
```
