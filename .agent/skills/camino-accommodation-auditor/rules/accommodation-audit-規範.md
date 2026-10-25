# Rule 1 - [MUST] 四維權威情報交叉查證與季節性休業防誤刪鐵律 (4D Cross-Verification & Seasonal Closure Defense)

- 針對本專案收錄之所有朝聖路線（法國之路、葡萄牙之路中央線/海岸線、北方之路、世界盡頭延伸線等全路線一體適用），執行「正向稽核（排查既有幽靈住宿）」與「逆向探勘（發掘未收錄住宿）」時，必須依序交叉比對以下 **4 大權威維度**：
  1. **維度一（Gronze.com）**：核實營運狀態、床位數、最新年度價格、廚房配置，並識別狀態標記：`Cerrado definitivamente`（永久停業）、`Cerrado por reformas`（整修中）、`Cerrado en invierno / por temporada`（冬季/季節性休業）。
  2. **維度二（Wise Pilgrim）**：核對國際朝聖者社群回報、聯絡電話與 WhatsApp 預約管道。
  3. **維度三（官署營業登記與公立網絡）**：加利西亞全境核對 Xunta de Galicia 公立網絡（Rede Pública）與觀光登記（REAT）；葡萄牙境內核對 Turismo de Portugal；西班牙各自治區（納瓦拉、拉里奧哈、卡斯提亞-雷昂、巴斯克、坎塔布里亞、阿斯圖里亞斯）核對自治區觀光營業執照。
  4. **維度四（Google Maps 即時地標與 Street View 街景）**：檢核地標是否標記「永久停業」、近 6 個月評論動態與實體建築街景招牌。
- **幽靈住宿四分類與處置準則**：

| 分類代碼 | 判定條件 | 強制處置措施 |
| :--- | :--- | :--- |
| **`GHOST_NON_EXISTENT`** | Gronze、Wise Pilgrim、官署登記與 Google Maps 四維均查無痕跡，純屬誤植或虛構登錄 | 提案自陣列中完全移除 |
| **`GHOST_PERMANENTLY_CLOSED`** | Gronze / Wise Pilgrim 明確標記 `Cerrado definitivamente`，且 Google Maps 確認永久停業或街景已拆牌廢棄 | 提案自陣列中移除 |
| **`GHOST_RENAMED`** | 同一實體地址或電話已由新團隊頂讓接手並改名經營 | 保留原物件並更新 `name`、`chineseName` 與聯絡管道，且於 `notes` 註記「原名 XXX，於 YYYY 年更名接手」 |
| **`GHOST_DUPLICATE`** | 同一實體住宿因西文、葡文、加利西亞文或中文譯名差異而重複建檔 | 整併為單一物件，將別名合併至 `notes` |

- **季節性休業絕對保護**：朝聖之路多數庇護所僅於每年 4～10 月開放、冬季休館（`Cerrado en invierno / por temporada`）或短期內部整修（`Cerrado por reformas`），**嚴禁將季節性休業或短期整修誤判為幽靈住宿而剔除**。
- **Exception（例外豁免）**：若某住宿點於 Gronze 標註 `Cerrado por reformas` 已逾 3 年以上，且經 Google Maps 街景與地方官署雙重確認建築已轉作私宅或永久歇業，得升級歸類為 `GHOST_PERMANENTLY_CLOSED` 提案移除。

## Good Example

- 查核法國之路 Rabanal del Camino 的教會庇護所 `Albergue Gaucelmo` 時，發現 Gronze 標記 `Cerrado en invierno`（冬季 11 月至隔年 3 月休館），正確識別為季節性休業予以保留，並於 `notes` 補充開放月份；同城鎮另一間 `Albergue Sanantón` 經查 Gronze 標記 `Cerrado definitivamente` 且 Google Maps 顯示永久停業，始歸類為 `GHOST_PERMANENTLY_CLOSED` 提案移除。

```typescript
// ✅ 正確保留季節性休業之傳統庇護所，僅更新實戰備註
{
  id: 'RABANAL_GAUCELMO',
  waypointId: 'RABANAL_DEL_CAMINO',
  name: 'Albergue Gaucelmo (Confraternity of Saint James)',
  chineseName: '高塞爾莫英國聖雅各兄弟會庇護所',
  type: 'PAROCHIAL',
  bedCount: 26,
  hasKitchen: true,
  bookingChannels: {
    officialWebsiteUrl: 'https://www.csj.org.uk/gaucelmo',
    phone: '+34 987 631 642',
  },
  notes: '傳統隨喜接待（Donativo），每年 4 月至 10 月開放，冬季休館，不可預約。',
}
```

## Bad Example

- 同一城鎮查核情境下，在 12 月冬季執行稽核時，僅看到 Google Maps 或 Gronze 顯示「暫停營業 / Cerrado en invierno」，未區分季節性休館與永久倒閉，便誤將知名的 `Albergue Gaucelmo` 當成幽靈住宿直接提案刪除。

```markdown
- 🔴 **【停業 GHOST_REMOVED】**
  - 項目：`RABANAL_GAUCELMO` Albergue Gaucelmo
  - 佐證來源：目前冬季查詢狀態為 Cerrado（關閉中），判定為停業幽靈住宿予以刪除。
```

---

# Rule 2 - [MUST] 住宿收錄優先順序矩陣與 Casa 民宿型別映射規範 (Inclusion Priority Matrix & Type Mapping)

- 執行逆向探勘補齊缺漏住宿時，為防止大城鎮一般觀光飯店湧入導致資料庫失焦，必須嚴格依據以下 **`P0` ～ `P3` 收錄優先順序矩陣** 篩選並映射至 [`AccommodationType`](file:///c:/Users/user/Desktop/file/Project/camino-planner/src/types/camino.ts#L9)（`'MUNICIPAL' | 'PAROCHIAL' | 'PRIVATE' | 'HOSTEL' | 'HOTEL'`）：

| 優先等級 | 適用住宿型態 | 判定條件與收錄原則 | 強制映射之 `AccommodationType` |
| :---: | :--- | :--- | :--- |
| **`P0`**<br>*(核心必補)* | 公立庇護所、教會/堂區庇護所、傳統隨喜庇護所 | 各城鎮之公立（Municipal / Xunta）、堂區（Parroquial）、傳統非營利/隨喜接待（Donativo / Acogida Tradicional） | 公立 ➔ `'MUNICIPAL'`<br>教會/修道院 ➔ `'PAROCHIAL'`<br>協會隨喜 ➔ `'PRIVATE'` |
| **`P1`**<br>*(強烈建議)* | 知名私立朝聖庇護所、**偏鄉孤島救援民宿（Casa）** | 1. 評價良好之私立庇護所（Albergue Privado）<br>2. **偏鄉民宿（Casa Rural / Pensión / Gîte）**：該航點**無任何 Albergue**，為當地唯一或極稀缺之過夜救援點 | 備有上下舖床位（Litera）➔ `'PRIVATE'`<br>純獨立客房（Habitación）➔ `'HOSTEL'` 或 `'HOTEL'` |
| **`P2`**<br>*(次要選補)* | 大城鎮常規平價民宿、客棧、青年旅館 | 資源充裕大城鎮之特色客棧（Hostal / Pensión），僅作獨立房需求之代表性選配 | `'HOSTEL'` 或 `'HOTEL'` |
| **`P3`**<br>*(嚴禁收錄)* | 純商務飯店、日租度假公寓 | 遠離朝聖主線無接駁之商業旅館、整棟出租公寓（Apartamento turístico / Vivienda vacacional） | **嚴禁收錄** |

- **偏鄉救援民宿（Casa）必填約束**：因房間數極少（通常僅 3～8 間），補齊時**必須至少提供 1 項有效預訂或聯絡管道**（`bookingComUrl`、`whatsapp`、`phone` 或 `officialWebsiteUrl`），且於 `notes` 明確標註「純獨立房無上下舖，房間數少建議提早預訂」。

## Good Example

- 探勘法國之路偏鄉小村（當地無任何公立或私立 Albergue）時，精準收錄當地唯一的朝聖者救援民宿 `Casa Rural El Camino`（`P1` 級），因僅有獨立雙人房故正確映射為 `'HOSTEL'` 並附註預訂提醒；同時拒絕收錄大城 Burgos 外圍的純日租觀光公寓（`P3` 級）。

```typescript
{
  id: 'VILLAMAYOR_CASA_EL_CAMINO',
  waypointId: 'VILLAMAYOR_DE_MONJARDIN',
  name: 'Casa Rural El Camino',
  chineseName: '朝聖之路鄉村民宿',
  type: 'HOSTEL',
  priceEur: 45,
  bedCount: 10,
  hasKitchen: false,
  bookingChannels: {
    phone: '+34 948 537 112',
    bookingComUrl: 'https://www.booking.com/hotel/es/casa-rural-el-camino.html',
  },
  notes: '純獨立房無上下舖（共 5 間雙人房），為當地稀缺過夜點，旺季強烈建議提早預訂。',
}
```

## Bad Example

- 同一探勘場景下，將僅提供獨立雙人房的 `Casa Rural` 錯誤映射為 `'MUNICIPAL'`（公立庇護所），未填寫任何聯絡電話或預訂連結，且把大城鎮遠離步道的日租公寓（`Apartamento Turístico`）一併塞入陣列。

```typescript
{
  id: 'VILLAMAYOR_CASA_EL_CAMINO',
  waypointId: 'VILLAMAYOR_DE_MONJARDIN',
  name: 'Casa Rural El Camino',
  type: 'MUNICIPAL', // ❌ 誤將私人獨立房民宿標為公立庇護所
  bookingChannels: {}, // ❌ 違反至少 1 項聯絡管道之資料完整性約束
},
{
  id: 'BURGOS_LUXURY_APARTMENT',
  waypointId: 'BURGOS',
  name: 'Apartamento Turístico Centro', // ❌ 違反 P3 嚴禁收錄純觀光日租公寓之規定
  type: 'HOTEL',
  bookingChannels: { phone: '+34 600 000 000' },
}
```

---

# Rule 3 - [MUST] 住宿變更報告固定輸出模板 (Mandatory Accommodation Change Report Template)

- 於對話主戰場向使用者申請修改 [`src/data/accommodations.ts`](file:///c:/Users/user/Desktop/file/Project/camino-planner/src/data/accommodations.ts) 授權時，必須嚴格輸出以下結構之住宿變更報告。
- **禁止事項 (Never)**：嚴禁省略「佐證來源」或「聯絡管道」欄位，亦嚴禁在未獲使用者明確核准前先行呼叫 `edit_file` 修改 [`src/data/accommodations.ts`](file:///c:/Users/user/Desktop/file/Project/camino-planner/src/data/accommodations.ts)。

## Good Example

- 完整包含雙向對齊統計、新增/修訂/停業三分類明細（含優先級與權威佐證來源）及精簡 Before / After 程式碼預覽。

```markdown
### 📋 住宿變更報告：法國之路 (Camino Francés) - [RONCESVALLES] 龍塞斯瓦耶斯

#### 1. 雙向對齊現況總覽
- **專案既有收錄**：1 間
- **權威來源收錄（Gronze / 官署）**：2 間
- **異動提議**：新增 `0` 間 ／ 修訂 `1` 間 ／ 移除停業 `0` 間

#### 2. 詳細變更清單
- 🟡 **【修訂 DRIFT_UPDATED】**
  - **項目**：`RONCESVALLES_COLEGIATA` Real Colegiata de Roncesvalles
  - **異動內容**：床位數由 `183` 更新為 `240`；參考價格由 `€14` 更新為 `€15`
  - **佐證來源**：Gronze 2026 最新年度核實資料與官方網站預訂系統

#### 3. 程式碼精簡對照 (Before / After)
// 修改前
priceEur: 14,
bedCount: 183,

// 修改後
priceEur: 15,
bedCount: 240,
```

---

# Rule 4 - [MUST] 純 Node.js 工具鏈與單次整併驗證鐵律 (Node.js-Only Toolchain & Single-Shot Verification)

- **嚴禁使用 Python**：本專案為純 Node.js / TypeScript 生態系（本機未安裝 Python），絕對禁止於終端機執行 `python`、`python3` 或撰寫 `.py` 腳本驗證資料。
- **單次整併驗證（Single-Shot Verification）**：於 Phase 1 初篩或 Phase 2 寫入 [`src/data/accommodations.ts`](file:///c:/Users/user/Desktop/file/Project/camino-planner/src/data/accommodations.ts) 後執行驗證時，必須於**單一 `run_command`** 中使用分號 `;` 整併執行健康度稽核腳本 [`audit_accommodations.mjs`](file:///c:/Users/user/Desktop/file/Project/camino-planner/.agent/skills/camino-accommodation-auditor/scripts/audit_accommodations.mjs) 與 Vitest 單元測試，嚴禁拆分為多次終端機呼叫。

## Good Example

- 使用 Node.js 執行專屬稽核腳本與單元測試，並透過 PowerShell 分號 `;` 將指令整併於單次 `run_command` 執行完畢，零 Python 依賴且僅觸發 1 次終端呼叫。

```powershell
# 於單一 run_command 中一次完成住宿健康度稽核與資料完整性測試
node .agent/skills/camino-accommodation-auditor/scripts/audit_accommodations.mjs; npx vitest run tests/data-integrity.spec.ts
```

## Bad Example

- 同一驗證情境下，不僅違規呼叫 `python3` 嘗試解析 TypeScript 檔案導致報錯，還將腳本稽核、單元測試與編譯檢查拆成 3 次獨立的 `run_command` 呼叫，造成多次彈窗干擾。

```powershell
# ❌ 呼叫第 1 次 run_command（違規使用 python3 報錯）
python3 -c "import re; print(open('src/data/accommodations.ts').read())"
# ❌ 呼叫第 2 次 run_command（未整併）
node .agent/skills/camino-accommodation-auditor/scripts/audit_accommodations.mjs
# ❌ 呼叫第 3 次 run_command（未整併）
npm run test
```
