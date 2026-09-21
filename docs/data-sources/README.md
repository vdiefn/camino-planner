# 朝聖之路原始資料來源歸檔說明 (Data Sources Archive)

此目錄存放專案初期爬取、校對與整理庇護所資料時的原始暫存檔案，作為未來擴充資料或比對原始連結時的參考備份。

> **注意**：前端正式運行時並不讀取本目錄之檔案，所有正式資料均已型別化並維護於 `src/data/accommodations.ts` 與 `src/data/waypoints.ts`。

---

## 檔案說明

### 1. `booking_items.json`
- **內容**：全線庇護所與旅館對應之 Booking.com 預訂連結與 ID 對照表。
- **欄位說明**：
  - `id`：住宿點唯一識別碼（如 `ACC_SJPP_CHEMIN`）
  - `name`：住宿官方/常用名稱
  - `waypointId`：所屬城鎮代碼（如 `SJPP`, `RONCESVALLES`）
  - `type`：住宿類型（`PRIVATE`, `MUNICIPAL`, `HOSTEL` 等）
  - `url`：Booking.com 預訂連結

### 2. `scratch_accommodations.json`
- **內容**：住宿資料庫的原始草稿集合。
- **用途**：包含庇護所聯絡電話、官方網站、初版中文譯名等資訊，為 `src/data/accommodations.ts` 的前身。

### 3. `scratch_wp_summary.json`
- **內容**：各城鎮航點（Waypoint）收錄的住宿點數量統計與名稱清單。
- **用途**：資料建檔初期的稽核與對帳表，用以確認各中繼點是否有漏抓庇護所。
