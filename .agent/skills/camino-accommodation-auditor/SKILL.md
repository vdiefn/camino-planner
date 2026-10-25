---
name: camino-accommodation-auditor
description: 當使用者要求「查證住宿」、「排查幽靈住宿」、「更新住宿資料」、「補齊缺漏住宿」、「核對 Gronze」、「檢查庇護所營運狀態」或維護 src/data/accommodations.ts 時觸發。專責執行西班牙朝聖之路全路線住宿資料之正向真偽稽核與逆向缺漏補齊（若需一般功能開發請改用 base-skill，動工前新模組架構設計請改用 senior-architect-review，既有程式碼審查請改用 code-review）。
---

# SOP

## Phase 1 -- 準備、健康度初篩與範圍確認
1. READ 呼叫原生 `read_file` 讀取 [base-skill/rules/base-規範.md](../../../../../../.gemini/config/skills/base-skill/rules/base-規範.md) 與 [rules/accommodation-audit-規範.md](./rules/accommodation-audit-規範.md)，載入底層核心協定與四維住宿稽核規範。
2. READ 呼叫原生 `read_file` 讀取 [src/data/accommodations.ts](../../../src/data/accommodations.ts) 與目標路線航點檔（`src/data/routes/*.ts`），確認待稽核城鎮航點之既有收錄清單。
3. DELEGATE 依 [rules/accommodation-audit-規範.md](./rules/accommodation-audit-規範.md) 於單一 `run_command` 執行 [scripts/audit_accommodations.mjs](./scripts/audit_accommodations.mjs)，排查重複 ID、無效航點關聯與欄位數值越界。

## Phase 2 -- 四維交叉查證、變更報告與寫入驗收
1. THINK 依 [rules/accommodation-audit-規範.md](./rules/accommodation-audit-規範.md) 比對 Gronze、Wise Pilgrim、官署登記與 Google Maps 街景四維情報，完成正向幽靈排查（嚴格保留季節性休業）與逆向 `P0`～`P2` 缺漏篩選。
2. ASK 依 [rules/accommodation-audit-規範.md](./rules/accommodation-audit-規範.md) 於對話主戰場輸出結構化「住宿變更報告」，並暫停等待使用者核准。
3. WRITE 於取得使用者明確授權後，呼叫原生 `edit_file` 更新 [src/data/accommodations.ts](../../../src/data/accommodations.ts)。
4. DELEGATE 依 [rules/accommodation-audit-規範.md](./rules/accommodation-audit-規範.md) 於單一 `run_command` 中以 `;` 整併執行 [scripts/audit_accommodations.mjs](./scripts/audit_accommodations.mjs) 與 `npx vitest run tests/data-integrity.spec.ts`，確認資料完整性測試全數通過。
5. READ 呼叫原生 `read_file` 回頭檢核修改後之 [src/data/accommodations.ts](../../../src/data/accommodations.ts) 與本技能輸出是否 100% 符合 [rules/accommodation-audit-規範.md](./rules/accommodation-audit-規範.md)；若不符合，立即修正直至達標。
