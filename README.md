# 🇪🇸 Camino Planner（聖雅各朝聖之路 · 法國之路智慧規劃器）

專為台灣朝聖者設計的西班牙朝聖之路（Camino de Santiago · 法國之路）現代化 Progressive Web App (PWA)。結合動態自適應排程、起點交通決策、科學化負重試算與離線優先架構，消除出發前的未知焦慮。

---

## 🌟 核心特色 (Key Features)

### 1. 智慧動態排程與現場重整 (Dynamic Schedule)
- **自適應總天數與起訖點**：支援 SJPP 到聖地牙哥全線 774.5 km 自由挑選起迄城鎮，依個人步速自由均分每日里程。
- **休息日插入 (Rest Day)**：一鍵插入停留日，當日步行里程歸零，後續所有分段日期自動向後順延。
- **隨時調整行程**：路上遇體力不支或想多留一晚時，隨時點選「更換結束點」，系統自動連鎖重算當日與次日步程及爬升。
- **Day 1 越嶺安全防護**：
  - 支援「拿破崙之路（高空爬升 1250m）」與「瓦卡洛斯之路（安全之谷 850m）」雙路線自由切換。
  - **冬季強制安全鎖**：若出發日期落在 11/1～3/31 法國官方強制封閉期，系統會跳出警示提醒使用者。

### 2. 起點 SJPP 交通轉乘決策 (Transport Guide)
- 專為台灣長途航班設計：精選巴黎戴高樂（CDG）、馬德里巴拉哈斯（MAD）、巴塞隆納（BCN）三大抵達門戶。
- 完整呈現 TGV 高鐵、Renfe 國鐵與 ALSA 長途巴士的耗時、票價區間、轉乘防呆細節與官方購票管道。

### 3. 科學化裝備負重與實戰避坑 (Packing Calculator)
- **體重 10% 警戒線**：依使用者輸入體重動態計算負重上限，超過顯示紅色告警。
- **嚴格區分穿戴與包內淨重**：支援「穿在身上（`isWornOnBody`）」開關，穿戴衣鞋不計入背包負重，避免無效焦慮。

### 4. 庇護所與生活機能一覽 (Albergue & Amenities)
- 內建各城鎮公立/私立庇護所資訊（床位、費用、廚房設施）。
- 整合一鍵電話預約、官方網站、Booking.com 連結，並提供超市與藥局的 Google 地圖精準導航。

### 5. 離線優先架構 (Offline-First PWA)
- 採用純前端 Jamstack 運算與 Pinia 本機持久化（`localStorage`）。
- 整合 Service Worker 靜態資源快取，即使在庇里牛斯山區或梅塞塔荒原完全斷網，依然能 100% 順暢查閱與操作。

---

## 🛠️ 技術堆疊 (Tech Stack)

| 領域 | 核心技術 |
| :--- | :--- |
| **前端框架** | Vue 3 (Composition API, `<script setup>`) |
| **建置工具** | Vite 8 + TypeScript 6 |
| **樣式系統** | Tailwind CSS v4 (響應式手機/平板/電腦三端配適) |
| **無障礙元件** | @headlessui/vue (Dialog、Disclosure) |
| **狀態管理** | Pinia + pinia-plugin-persistedstate (本機持久化) |
| **離線機制** | vite-plugin-pwa (Service Worker 快取) |
| **圖示庫** | lucide-vue-next |
| **單元測試** | Vitest (覆蓋排程運算、負重邏輯與資料完整性驗證) |

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
