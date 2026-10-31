import type { PackingCategory, PackingItem } from '@/types/camino'

export interface PackingExportMeta {
  backpackWeightKg: number
  wornWeightKg: number
  totalItemCount: number
  bodyWeightKg?: number
}

export interface CategoryInfo {
  id: PackingCategory | string
  label: string
}

/**
 * 產生供 Apple 備忘錄 / Google Keep / 通訊軟體張貼之繁體中文標準純文字檢查清單
 * 排版貼近 PDF 格式：包含標題、日期、數據摘要、分類項數、標準 ☐ 方框與靠右重量對齊
 */
export function generatePackingTextChecklist(
  items: PackingItem[],
  categories: CategoryInfo[],
  meta: PackingExportMeta
): string {
  // 1. 僅保留勾選要攜帶之項目
  const checkedItems = items.filter((item) => item.isChecked)

  // 2. 依分類分組
  const itemsByCategory = new Map<string, PackingItem[]>()
  for (const item of checkedItems) {
    const list = itemsByCategory.get(item.category) || []
    list.push(item)
    itemsByCategory.set(item.category, list)
  }

  // 3. 組裝文字內容（樣式 B：極簡俐落，適配各類文字編輯器與通訊軟體，零破版）
  const todayStr = new Date().toISOString().split('T')[0]
  const lines: string[] = []
  lines.push(`聖雅各朝聖之路 裝備清單（${todayStr}）`)
  lines.push('')

  // 數據摘要區塊
  const limitStr = meta.bodyWeightKg
    ? ` ｜ 10% 警戒線 ${(meta.bodyWeightKg * 0.1).toFixed(1)} kg`
    : ''
  lines.push(
    `背包淨重 ${meta.backpackWeightKg.toFixed(2)} kg ｜ 身上穿戴 ${meta.wornWeightKg.toFixed(2)} kg ｜ 共 ${meta.totalItemCount} 件${limitStr}`
  )

  // 4. 逐一輸出有內容的分類（無項目的分類自動排除）
  for (const cat of categories) {
    const catItems = itemsByCategory.get(cat.id)
    if (!catItems || catItems.length === 0) continue

    lines.push('')
    lines.push(`【${cat.label}】`)

    for (const item of catItems) {
      const wornTag = item.isWornOnBody ? ' [穿在身上]' : ''
      const qtyPart = (item.quantity ?? 1) > 1 ? ` ×${item.quantity}` : ''
      const totalWeight = item.unitWeightGrams * (item.quantity ?? 1)
      const weightPart = `${totalWeight}g`

      lines.push(`☐ ${item.chineseName}${qtyPart}${wornTag} · ${weightPart}`)
    }
  }

  lines.push('')
  lines.push('Buen Camino! 祝朝聖之路平安順心')

  return lines.join('\n')
}
