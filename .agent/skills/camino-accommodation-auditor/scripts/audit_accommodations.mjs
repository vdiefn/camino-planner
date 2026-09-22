/**
 * 西班牙朝聖之路住宿資料健康度稽核工具
 * 用途：
 * 1. 檢驗 src/data/accommodations.ts 中住宿點 ID 唯一性
 * 2. 檢驗 waypointId 是否在 waypoints.ts 中存在
 * 3. 檢查必填欄位、價格/床位異常值、URL 語法
 * 4. 統計各城鎮住宿分佈，列出可疑與待核實名單
 *
 * 執行方式：node .agent/skills/camino-accommodation-auditor/scripts/audit_accommodations.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 專案根目錄
const projectRoot = path.resolve(__dirname, '../../../..')
const accommodationsPath = path.join(projectRoot, 'src/data/accommodations.ts')
const waypointsPath = path.join(projectRoot, 'src/data/waypoints.ts')

function parseTypeScriptArray(filePath, arrayName) {
  const content = fs.readFileSync(filePath, 'utf-8')
  // 簡易提取陣列定義內容
  const regex = new RegExp(`export const ${arrayName}[^=]*=\\s*(\\[[\\s\\S]*?\\n\\]);?`)
  const match = content.match(regex)
  if (!match) {
    throw new Error(`無法在 ${filePath} 找到 ${arrayName} 陣列定義`)
  }

  // 將 TypeScript 物件轉換為符合 JSON 語法的形式進行解析
  const rawJs = match[1]
    // 移除純註解行（避免誤截斷 https:// 等合法網址）
    .replace(/^\s*\/\/.*$/gm, '')
    // 移除型別斷言（如果有）
    .replace(/as\s+[A-Za-z0-9_<>]+/g, '')
    // 補齊 key 雙引號與結尾逗號處理，改用 Function 安全執行 evaluator
  
  try {
    const evaluator = new Function(`return ${rawJs}`)
    return evaluator()
  } catch (err) {
    throw new Error(`解析 ${arrayName} 失敗: ${err.message}`)
  }
}

function runAudit() {
  console.log('====================================================')
  console.log('🔍 開始執行 Camino 住宿資料健康度與幽靈點初步排查...')
  console.log('====================================================\n')

  if (!fs.existsSync(accommodationsPath)) {
    console.error(`❌ 找不到住宿資料檔: ${accommodationsPath}`)
    process.exit(1)
  }

  const waypoints = parseTypeScriptArray(waypointsPath, 'waypoints')
  const accommodations = parseTypeScriptArray(accommodationsPath, 'accommodations')

  console.log(`ℹ️ 讀取完成：共收錄 ${waypoints.length} 個航點，${accommodations.length} 筆住宿資料。\n`)

  const waypointIdSet = new Set(waypoints.map(w => w.id))
  const seenIds = new Map()
  const duplicateIds = []
  const invalidWaypoints = []
  const anomalies = []

  accommodations.forEach((acc, index) => {
    // 1. 檢查 ID 唯一性
    if (seenIds.has(acc.id)) {
      duplicateIds.push({
        id: acc.id,
        name: acc.name,
        previousIndex: seenIds.get(acc.id),
        currentIndex: index,
      })
    } else {
      seenIds.set(acc.id, index)
    }

    // 2. 檢查 waypointId 關聯有效性
    if (!waypointIdSet.has(acc.waypointId)) {
      invalidWaypoints.push({
        id: acc.id,
        name: acc.name,
        invalidWaypointId: acc.waypointId,
      })
    }

    // 3. 檢查基本欄位完整性
    const issues = []
    if (!acc.name || acc.name.trim() === '') issues.push('缺少名稱')
    if (!acc.type) issues.push('缺少住宿類型 (type)')
    if (acc.priceEur !== undefined && (acc.priceEur < 0 || acc.priceEur > 500)) {
      issues.push(`異常價格: €${acc.priceEur}`)
    }
    if (acc.bedCount !== undefined && (acc.bedCount <= 0 || acc.bedCount > 1000)) {
      issues.push(`異常床位數: ${acc.bedCount}`)
    }

    // 4. 檢查 URL 格式
    if (acc.bookingChannels) {
      for (const [key, url] of Object.entries(acc.bookingChannels)) {
        if (key.includes('Url') && url && !url.startsWith('http://') && !url.startsWith('https://')) {
          issues.push(`不合法的網址格式 (${key}: ${url})`)
        }
      }
    }

    if (issues.length > 0) {
      anomalies.push({
        id: acc.id,
        name: acc.name,
        waypointId: acc.waypointId,
        issues,
      })
    }
  })

  // 輸出結果
  console.log('📊 【稽核報告摘要】')
  console.log(`- 總住宿筆數：${accommodations.length}`)
  console.log(`- 重複 ID 數：${duplicateIds.length}`)
  console.log(`- 無效航點關聯數：${invalidWaypoints.length}`)
  console.log(`- 資料異常/待補全數：${anomalies.length}\n`)

  if (duplicateIds.length > 0) {
    console.log('⚠️ 【發現重複 ID】')
    duplicateIds.forEach(item => {
      console.log(`  • ID: ${item.id} (${item.name})`)
    })
    console.log('')
  }

  if (invalidWaypoints.length > 0) {
    console.log('⚠️ 【發現關聯到不存在的航點 (高度疑似幽靈住宿)】')
    invalidWaypoints.forEach(item => {
      console.log(`  • 住宿: [${item.id}] ${item.name} -> 無效航點: ${item.invalidWaypointId}`)
    })
    console.log('')
  }

  if (anomalies.length > 0) {
    console.log('⚠️ 【欄位數值與格式異常清單 (前 10 筆)】')
    anomalies.slice(0, 10).forEach(item => {
      console.log(`  • [${item.id}] ${item.name} (${item.waypointId}): ${item.issues.join(', ')}`)
    })
    if (anomalies.length > 10) {
      console.log(`  ... 以及其餘 ${anomalies.length - 10} 筆`)
    }
    console.log('')
  }

  if (duplicateIds.length === 0 && invalidWaypoints.length === 0 && anomalies.length === 0) {
    console.log('✅ 資料結構完整，無明顯結構性幽靈項目！可進一步進行 Gronze / 官方權威人工聯網查驗。')
  }

  console.log('====================================================')
}

runAudit()
