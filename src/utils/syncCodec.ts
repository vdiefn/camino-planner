import { strFromU8, strToU8, unzlibSync, zlibSync } from 'fflate'
import { packingItems as defaultPackingItems } from '@/data/packingItems'
import {
  AVAILABLE_ROUTES,
  getEffectiveRouteMetadata,
  getRouteMetadata,
  getRouteWaypoints,
} from '@/data/routes'
import { finisterreOptionLabels, getFinisterreWaypoints } from '@/data/routes/finisterre'
import { defaultActiveCategories, sanitizePackingState, type UserItemOverride } from '@/stores/packing'
import type { PackingCategory, PackingItem, UserStage } from '@/types/camino'
import type { FinisterreOption, RouteId, RouteScheduleDraft } from '@/types/route'
import {
  addDaysToDate,
  calculateSegmentStats,
  generateFinisterreStages,
  generateInitialStages,
  isWinterClosure,
} from '@/utils/scheduleCalculator'

/**
 * 1. URL / QR Code 極致濃縮格式 (CompactSyncPayload)
 */
export interface CompactSyncPayload {
  v: 1
  s?: {
    r: RouteId
    b?: string
    d: string
    sw: string
    ew: string
    fo: FinisterreOption
    fd?: number
    dq?: number
    ms: string[]
    es?: string[]
  }
  p?: {
    w: number
    ac: PackingCategory[]
    co: string[]
    u: Record<string, [0 | 1, 0 | 1, number, number]>
    c: [string, string, number, number, 0 | 1, 0 | 1, string?, string?][]
  }
}

/**
 * 2. JSON 檔案完整備份格式 (FullBackupPayload)
 */
export interface FullBackupPayload {
  app: 'camino-planner'
  version: 1
  exportedAt: string
  schedule?: {
    currentRouteId: RouteId
    drafts: Partial<Record<RouteId, RouteScheduleDraft>>
    mainStages: Partial<Record<RouteId, UserStage[]>>
    extensionStages: Partial<Record<RouteId, UserStage[]>>
  }
  packing?: {
    version: number
    bodyWeightKg: number
    userItemStates: Record<string, UserItemOverride>
    customItems: PackingItem[]
    activeCategories: PackingCategory[]
    categoryOrder: string[]
  }
}

/**
 * 3. 解碼驗證後之標準化匯入結構（供預覽彈窗與 Store 統一消費）
 */
export interface NormalizedScheduleImport {
  currentRouteId: RouteId
  drafts: Partial<Record<RouteId, RouteScheduleDraft>>
  mainStages: Partial<Record<RouteId, UserStage[]>>
  extensionStages: Partial<Record<RouteId, UserStage[]>>
  summary: {
    routeIds: RouteId[]
    primaryRouteName: string
    startDate: string
    totalDays: number
  }
}

export interface NormalizedPackingImport {
  version: number
  bodyWeightKg: number
  userItemStates: Record<string, UserItemOverride>
  customItems: PackingItem[]
  activeCategories: PackingCategory[]
  categoryOrder: string[]
  summary: {
    bodyWeightKg: number
    activeCategoryCount: number
    excludedCategoryNames: string[]
    customCount: number
    overrideCount: number
  }
}

export interface NormalizedImportPayload {
  source: 'url' | 'file'
  exportedAt?: string
  schedule?: NormalizedScheduleImport
  packing?: NormalizedPackingImport
}

export type DecodeResult =
  | { ok: true; data: NormalizedImportPayload }
  | { ok: false; error: string }

const VALID_ROUTE_IDS = new Set<string>(AVAILABLE_ROUTES.map((r) => r.id))
const VALID_FINISTERRE_OPTIONS = new Set<string>([
  'NONE',
  'FINISTERRE_ONLY',
  'MUXIA_ONLY',
  'BOTH_FINISTERRE_FIRST',
  'BOTH_MUXIA_FIRST',
])

export const OFFICIAL_CATEGORY_LABELS: Record<string, string> = {
  PACK: '背包系統',
  CLOTHING: '服飾穿搭',
  FOOTWEAR: '鞋襪足部',
  SLEEP: '睡眠防護',
  MEDICAL: '個人藥物',
  HYGIENE: '衛生用品',
  ELECTRONICS: '電子設備',
  DOCS: '證件工具',
  OTHER: '其他',
}

const MAX_URL_TOKEN_LENGTH = 8192
const MAX_DECOMPRESSED_BYTES = 512 * 1024

/**
 * 將二進位陣列轉為無 '=' 尾綴之 URL 安全 Base64 字串
 */
export function uint8ToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * 將 URL 安全 Base64 字串還原為二進位陣列（自動補齊 Padding 並校驗字元）
 */
export function base64UrlToUint8(base64Url: string): Uint8Array {
  const cleaned = base64Url.trim()
  if (
    !cleaned ||
    cleaned.length > MAX_URL_TOKEN_LENGTH ||
    !/^[A-Za-z0-9_-]+={0,2}$/.test(cleaned)
  ) {
    throw new Error('INVALID_BASE64URL')
  }
  const base64 = cleaned.replace(/-/g, '+').replace(/_/g, '/')
  const padLen = (4 - (base64.length % 4)) % 4
  const padded = base64 + '='.repeat(padLen)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function isValidDateString(dateStr: unknown): dateStr is string {
  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false
  }
  const d = new Date(dateStr)
  return !Number.isNaN(d.getTime())
}

/**
 * 將當前路線排程與裝備狀態濃縮並以 fflate 壓縮為 Base64URL 字串
 */
export function encodeCompactUrlPayload(options: {
  includeSchedule: boolean
  includePacking: boolean
  scheduleSource?: {
    routeId: RouteId
    draft: RouteScheduleDraft
    mainStages: UserStage[]
    extensionStages: UserStage[]
  }
  packingSource?: {
    bodyWeightKg: number
    userItemStates: Record<string, UserItemOverride>
    customItems: PackingItem[]
    activeCategories: PackingCategory[]
    categoryOrder: string[]
  }
}): string {
  const payload: CompactSyncPayload = { v: 1 }

  if (options.includeSchedule && options.scheduleSource) {
    const { routeId, draft, mainStages, extensionStages } = options.scheduleSource
    payload.s = {
      r: routeId,
      b: draft.branchId,
      d: draft.startDate,
      sw: draft.startWaypointId,
      ew: draft.endWaypointId,
      fo: draft.finisterreOption || 'NONE',
      fd: draft.finisterreOption !== 'NONE' ? draft.finisterreDays : undefined,
      dq: draft.dailyKmQuota,
      ms: mainStages.map((s) => s.endWaypointId),
      es:
        draft.finisterreOption !== 'NONE' && extensionStages.length > 0
          ? extensionStages.map((s) => s.endWaypointId)
          : undefined,
    }
  }

  if (options.includePacking && options.packingSource) {
    const { bodyWeightKg, userItemStates, customItems, activeCategories, categoryOrder } =
      options.packingSource

    const activeCategorySet = new Set(activeCategories)

    // 僅記錄與官方預設值實際有差異之項目（若分類未啟用/不顯示，強制視為不準備 isChecked = false）
    const compactOverrides: Record<string, [0 | 1, 0 | 1, number, number]> = {}
    for (const defaultItem of defaultPackingItems) {
      const isCatActive = activeCategorySet.has(defaultItem.category)
      const itemOverride = userItemStates[defaultItem.id]
      const isChecked = isCatActive ? (itemOverride?.isChecked ?? defaultItem.isChecked) : false
      const isWorn = itemOverride?.isWornOnBody ?? defaultItem.isWornOnBody
      const weight = itemOverride?.unitWeightGrams ?? defaultItem.unitWeightGrams
      const qty = itemOverride?.quantity ?? defaultItem.quantity

      if (
        isChecked !== defaultItem.isChecked ||
        isWorn !== defaultItem.isWornOnBody ||
        weight !== defaultItem.unitWeightGrams ||
        qty !== defaultItem.quantity
      ) {
        compactOverrides[defaultItem.id] = [
          isChecked ? 1 : 0,
          isWorn ? 1 : 0,
          weight,
          qty,
        ]
      }
    }

    const compactCustom: [string, string, number, number, 0 | 1, 0 | 1, string?, string?][] =
      customItems.map((item) => {
        const isCatActive = activeCategorySet.has(item.category)
        const isChecked = isCatActive ? item.isChecked : false
        const tuple: [string, string, number, number, 0 | 1, 0 | 1, string?, string?] = [
          item.chineseName,
          item.category,
          item.unitWeightGrams,
          item.quantity,
          isChecked ? 1 : 0,
          item.isWornOnBody ? 1 : 0,
        ]
        const hasDiffEng = item.englishName && item.englishName !== item.chineseName
        if (hasDiffEng || item.spanishName) {
          tuple.push(hasDiffEng ? item.englishName : '')
        }
        if (item.spanishName) {
          tuple.push(item.spanishName)
        }
        return tuple
      })

    payload.p = {
      w: bodyWeightKg,
      ac: activeCategories,
      co: categoryOrder,
      u: compactOverrides,
      c: compactCustom,
    }
  }

  const jsonBytes = strToU8(JSON.stringify(payload))
  const compressed = zlibSync(jsonBytes, { level: 9 })
  return uint8ToBase64Url(compressed)
}

/**
 * 依據濃縮種子安全重建單一路線之草稿與分段（含 Day 1 原地休息日推導與冬季封山防禦）
 */
function reconstructSingleRouteSchedule(
  s: NonNullable<CompactSyncPayload['s']>,
): NormalizedScheduleImport | null {
  if (!VALID_ROUTE_IDS.has(s.r)) return null

  const routeId = s.r
  const meta = getRouteMetadata(routeId)
  const todayStr = new Date().toISOString().split('T')[0]
  const startDate = isValidDateString(s.d) ? s.d : todayStr

  // 檢驗分支合法性與冬季封山強制鎖
  let branchId = typeof s.b === 'string' && s.b.trim() ? s.b.trim() : undefined
  if (meta?.branches && meta.branches.length > 0) {
    const branchExists = meta.branches.some((b) => b.id === branchId)
    if (!branchExists) {
      branchId = meta.branches[0].id
    }
  }

  const waypoints = getRouteWaypoints(routeId, branchId)
  const defaultStart = meta?.defaultStartWaypointId || waypoints[0]?.id || 'SJPP'
  const defaultEnd =
    meta?.defaultEndWaypointId || waypoints[waypoints.length - 1]?.id || 'SANTIAGO_DE_COMPOSTELA'

  let startWaypointId = typeof s.sw === 'string' ? s.sw : defaultStart
  let endWaypointId = typeof s.ew === 'string' ? s.ew : defaultEnd

  const startWp = waypoints.find((w) => w.id === startWaypointId)
  const endWp = waypoints.find((w) => w.id === endWaypointId)
  if (!startWp || !endWp || startWp.cumulativeKm >= endWp.cumulativeKm) {
    startWaypointId = defaultStart
    endWaypointId = defaultEnd
  }

  // 冬季 11/1 ~ 3/31 自 SJPP 出發，強制鎖定為瓦卡洛斯線
  if (routeId === 'frances' && startWaypointId === 'SJPP' && isWinterClosure(startDate)) {
    branchId = 'valcarlos'
  }

  const effectiveWaypoints = getRouteWaypoints(routeId, branchId)
  const effectiveMeta = getEffectiveRouteMetadata(routeId, branchId)
  const finisterreOption: FinisterreOption = VALID_FINISTERRE_OPTIONS.has(s.fo) ? s.fo : 'NONE'

  const day1Variant: 'NAPOLEON' | 'VALCARLOS' =
    branchId === 'valcarlos' ? 'VALCARLOS' : 'NAPOLEON'

  // 重建主線分段
  let mainStages: UserStage[] = []
  const rawEnds = Array.isArray(s.ms) ? s.ms.slice(0, 120) : []
  const allEndsValid =
    rawEnds.length > 0 &&
    rawEnds.every((id) => typeof id === 'string' && effectiveWaypoints.some((w) => w.id === id))

  if (allEndsValid) {
    let curDate = startDate
    for (let i = 0; i < rawEnds.length; i++) {
      // 階段九邊界公式：第 1 天 (i === 0) 與使用者設定之起點 startWaypointId 比對，其餘與前一天終點比對
      const startWpId = i === 0 ? startWaypointId : rawEnds[i - 1]
      const endWpId = rawEnds[i]
      const isRestDay = endWpId === startWpId
      const isDay1WithSJPP = i === 0 && startWpId === 'SJPP'
      const routeVariant = isDay1WithSJPP ? day1Variant : undefined

      if (isRestDay) {
        mainStages.push({
          dayIndex: i + 1,
          date: curDate,
          startWaypointId: startWpId,
          endWaypointId: endWpId,
          passedWaypointIds: [],
          distanceKm: 0,
          elevationGainM: 0,
          elevationLossM: 0,
          isRestDay: true,
          isExtensionStage: false,
          routeVariant,
          stageNotes: '休息停留日 🛌',
        })
      } else {
        const segStats = calculateSegmentStats(
          startWpId,
          endWpId,
          routeVariant,
          effectiveWaypoints,
        )
        mainStages.push({
          dayIndex: i + 1,
          date: curDate,
          startWaypointId: startWpId,
          endWaypointId: endWpId,
          passedWaypointIds: segStats.passedWaypointIds,
          distanceKm: segStats.distanceKm,
          elevationGainM: segStats.elevationGainM,
          elevationLossM: segStats.elevationLossM,
          isRestDay: false,
          isExtensionStage: false,
          routeVariant,
        })
      }
      curDate = addDaysToDate(curDate, 1)
    }
  } else {
    const recDays = effectiveMeta?.recommendedDays || 33
    mainStages = generateInitialStages(
      {
        startDate,
        startWaypointId,
        endWaypointId,
        targetDays: recDays,
        dailyTargetKm: effectiveMeta
          ? Number((effectiveMeta.totalDistanceKm / recDays).toFixed(1))
          : 23.5,
        restDays: 0,
        bodyWeightKg: 60,
        day1RouteVariant: day1Variant,
      },
      effectiveWaypoints,
    )
  }

  // 重建世界盡頭延伸段
  let extensionStages: UserStage[] = []
  if (finisterreOption !== 'NONE' && mainStages.length > 0) {
    const finWaypoints = getFinisterreWaypoints(finisterreOption)
    const rawExtEnds = Array.isArray(s.es) ? s.es.slice(0, 30) : []
    const allExtEndsValid =
      rawExtEnds.length > 0 &&
      rawExtEnds.every((id) => typeof id === 'string' && finWaypoints.some((w) => w.id === id))

    if (allExtEndsValid && finWaypoints.length >= 2) {
      const lastMain = mainStages[mainStages.length - 1]
      let curDate = lastMain.date
      let curDayIndex = lastMain.dayIndex
      const extOriginId = finWaypoints[0].id

      for (let j = 0; j < rawExtEnds.length; j++) {
        curDate = addDaysToDate(curDate, 1)
        curDayIndex++
        const startWpId = j === 0 ? extOriginId : rawExtEnds[j - 1]
        const endWpId = rawExtEnds[j]
        const isRestDay = endWpId === startWpId

        if (isRestDay) {
          extensionStages.push({
            dayIndex: curDayIndex,
            date: curDate,
            startWaypointId: startWpId,
            endWaypointId: endWpId,
            passedWaypointIds: [],
            distanceKm: 0,
            elevationGainM: 0,
            elevationLossM: 0,
            isRestDay: true,
            isExtensionStage: true,
            stageNotes: '休息停留日 🛌',
          })
        } else {
          const segStats = calculateSegmentStats(startWpId, endWpId, undefined, finWaypoints)
          extensionStages.push({
            dayIndex: curDayIndex,
            date: curDate,
            startWaypointId: startWpId,
            endWaypointId: endWpId,
            passedWaypointIds: segStats.passedWaypointIds,
            distanceKm: segStats.distanceKm,
            elevationGainM: segStats.elevationGainM,
            elevationLossM: segStats.elevationLossM,
            isRestDay: false,
            isExtensionStage: true,
            stageNotes: endWpId.includes('fisterra')
              ? '大西洋地涯菲尼斯特雷 🌅'
              : endWpId.includes('muxia')
                ? '穆希亞聖船聖母聖殿 ⛵'
                : undefined,
          })
        }
      }
    } else {
      const finDays =
        typeof s.fd === 'number' && s.fd >= 2
          ? Math.min(15, Math.round(s.fd))
          : finisterreOptionLabels[finisterreOption]?.days || 3
      extensionStages = generateFinisterreStages(
        mainStages[mainStages.length - 1],
        finisterreOption,
        0,
        finDays,
      )
    }
  }

  const totalMainKm = mainStages.reduce((sum, stg) => sum + stg.distanceKm, 0)
  const walkingDays = Math.max(1, mainStages.filter((stg) => !stg.isRestDay).length)
  const dailyKmQuota =
    typeof s.dq === 'number' && s.dq > 0
      ? s.dq
      : Number((totalMainKm / walkingDays).toFixed(1))

  const draft: RouteScheduleDraft = {
    routeId,
    branchId,
    startWaypointId,
    endWaypointId,
    startDate,
    targetDays: mainStages.length,
    dailyKmQuota,
    restDays: mainStages.filter((stg) => stg.isRestDay).map((stg) => stg.dayIndex),
    finisterreOption,
    finisterreDays:
      finisterreOption !== 'NONE' && extensionStages.length > 0
        ? extensionStages.length
        : finisterreOptionLabels[finisterreOption]?.days || 3,
    santiagoLayoverDays: 0,
    updatedAt: new Date().toISOString(),
  }

  return {
    currentRouteId: routeId,
    drafts: { [routeId]: draft },
    mainStages: { [routeId]: mainStages },
    extensionStages: { [routeId]: extensionStages },
    summary: {
      routeIds: [routeId],
      primaryRouteName: effectiveMeta?.chineseName || meta?.chineseName || routeId,
      startDate,
      totalDays: mainStages.length + extensionStages.length,
    },
  }
}

/**
 * 解壓縮並驗證 URL / QR Code 濃縮字串
 */
export function decodeCompactUrlPayload(token: string): DecodeResult {
  try {
    const compressed = base64UrlToUint8(token)
    const decompressed = unzlibSync(compressed)
    if (decompressed.byteLength > MAX_DECOMPRESSED_BYTES) {
      return { ok: false, error: '同步資料超過安全容量上限' }
    }

    const raw = JSON.parse(strFromU8(decompressed))
    if (!raw || typeof raw !== 'object' || raw.v !== 1 || (!raw.s && !raw.p)) {
      return { ok: false, error: '無效或不相容的同步連結格式' }
    }

    const result: NormalizedImportPayload = { source: 'url' }

    if (raw.s && typeof raw.s === 'object') {
      const scheduleImport = reconstructSingleRouteSchedule(raw.s)
      if (!scheduleImport) {
        return { ok: false, error: '行程路線資料格式不合法' }
      }
      result.schedule = scheduleImport
    }

    if (raw.p && typeof raw.p === 'object') {
      const p = raw.p as NonNullable<CompactSyncPayload['p']>
      const rawUserItemStates: Record<string, UserItemOverride> = {}
      if (p.u && typeof p.u === 'object') {
        for (const [id, tuple] of Object.entries(p.u)) {
          if (Array.isArray(tuple) && tuple.length >= 4) {
            rawUserItemStates[id] = {
              isChecked: Boolean(tuple[0]),
              isWornOnBody: Boolean(tuple[1]),
              unitWeightGrams: Number(tuple[2]),
              quantity: Number(tuple[3]),
            }
          }
        }
      }

      const rawCustomItems: Partial<PackingItem>[] = []
      if (Array.isArray(p.c)) {
        p.c.slice(0, 200).forEach((tuple, idx) => {
          if (Array.isArray(tuple) && tuple.length >= 6) {
            const chineseName = String(tuple[0] || '').trim()
            if (!chineseName) return
            const weight = Math.max(0, Number(tuple[2]) || 0)
            rawCustomItems.push({
              id: `CUSTOM_SYNC_${Date.now()}_${idx}`,
              chineseName,
              englishName: tuple[6] ? String(tuple[6]) : chineseName,
              spanishName: tuple[7] ? String(tuple[7]) : '',
              category: String(tuple[1] || 'OTHER') as PackingCategory,
              priority: 'OPTIONAL',
              referenceRangeText: `${weight}g`,
              unitWeightGrams: weight,
              quantity: Math.max(1, Math.round(Number(tuple[3]) || 1)),
              isChecked: Boolean(tuple[4]),
              isWornOnBody: Boolean(tuple[5]),
              isCustom: true,
            })
          }
        })
      }

      const sanitized = sanitizePackingState({
        version: 2,
        bodyWeightKg: p.w,
        userItemStates: rawUserItemStates,
        customItems: rawCustomItems,
        activeCategories: p.ac,
        categoryOrder: p.co,
      })

      const activeSet = new Set(sanitized.activeCategories)
      const excludedNames = defaultActiveCategories
        .filter((c) => !activeSet.has(c))
        .map((c) => OFFICIAL_CATEGORY_LABELS[c] || c)

      result.packing = {
        version: 2,
        bodyWeightKg: sanitized.bodyWeightKg,
        userItemStates: sanitized.userItemStates,
        customItems: sanitized.customItems,
        activeCategories: sanitized.activeCategories,
        categoryOrder: sanitized.categoryOrder,
        summary: {
          bodyWeightKg: sanitized.bodyWeightKg,
          activeCategoryCount: sanitized.activeCategories.length,
          excludedCategoryNames: excludedNames,
          customCount: sanitized.customItems.length,
          overrideCount: Object.keys(sanitized.userItemStates).length,
        },
      }
    }

    return { ok: true, data: result }
  } catch (err) {
    console.warn('[SyncCodec] decodeCompactUrlPayload failed:', err)
    return { ok: false, error: '同步連結已損毀或遭通訊軟體截斷，請重新複製完整連結或改用備份檔匯入' }
  }
}

/**
 * 產生跨路線完整 JSON 備份字串
 */
export function createFullBackupJson(options: {
  includeSchedule: boolean
  includePacking: boolean
  scheduleSource?: {
    currentRouteId: RouteId
    drafts: Record<RouteId, RouteScheduleDraft>
    mainStages: Record<RouteId, UserStage[]>
    extensionStages: Record<RouteId, UserStage[]>
  }
  packingSource?: {
    version: number
    bodyWeightKg: number
    userItemStates: Record<string, UserItemOverride>
    customItems: PackingItem[]
    activeCategories: PackingCategory[]
    categoryOrder: string[]
  }
}): string {
  const payload: FullBackupPayload = {
    app: 'camino-planner',
    version: 1,
    exportedAt: new Date().toISOString(),
  }

  if (options.includeSchedule && options.scheduleSource) {
    payload.schedule = {
      currentRouteId: options.scheduleSource.currentRouteId,
      drafts: options.scheduleSource.drafts,
      mainStages: options.scheduleSource.mainStages,
      extensionStages: options.scheduleSource.extensionStages,
    }
  }

  if (options.includePacking && options.packingSource) {
    const activeCategorySet = new Set(options.packingSource.activeCategories)
    const sanitizedOverrides: Record<string, UserItemOverride> = {}
    for (const [id, ov] of Object.entries(options.packingSource.userItemStates)) {
      sanitizedOverrides[id] = { ...ov }
    }
    // 未顯示/未啟用的分類，其下官方物品強制標記為 isChecked: false
    for (const defaultItem of defaultPackingItems) {
      if (!activeCategorySet.has(defaultItem.category)) {
        sanitizedOverrides[defaultItem.id] = {
          ...sanitizedOverrides[defaultItem.id],
          isChecked: false,
        }
      }
    }
    const sanitizedCustom = options.packingSource.customItems.map((item) => ({
      ...item,
      isChecked: activeCategorySet.has(item.category) ? item.isChecked : false,
    }))

    payload.packing = {
      version: options.packingSource.version,
      bodyWeightKg: options.packingSource.bodyWeightKg,
      userItemStates: sanitizedOverrides,
      customItems: sanitizedCustom,
      activeCategories: options.packingSource.activeCategories,
      categoryOrder: options.packingSource.categoryOrder,
    }
  }

  return JSON.stringify(payload, null, 2)
}

/**
 * 解析並安全驗證完整 JSON 備份檔
 */
export function parseBackupJson(rawJson: string): DecodeResult {
  try {
    if (!rawJson || rawJson.length > MAX_DECOMPRESSED_BYTES * 2) {
      return { ok: false, error: '備份檔案空白或超過大小限制' }
    }

    const parsed = JSON.parse(rawJson)
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      parsed.app !== 'camino-planner' ||
      (!parsed.schedule && !parsed.packing)
    ) {
      return { ok: false, error: '此檔案並非 Camino Planner 產出的有效備份檔' }
    }

    const result: NormalizedImportPayload = {
      source: 'file',
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : undefined,
    }

    if (parsed.schedule && typeof parsed.schedule === 'object') {
      const sched = parsed.schedule
      const validRouteIds: RouteId[] = []
      const safeDrafts: Partial<Record<RouteId, RouteScheduleDraft>> = {}
      const safeMainStages: Partial<Record<RouteId, UserStage[]>> = {}
      const safeExtStages: Partial<Record<RouteId, UserStage[]>> = {}

      if (sched.drafts && typeof sched.drafts === 'object') {
        for (const [rId, draftObj] of Object.entries(sched.drafts)) {
          if (!VALID_ROUTE_IDS.has(rId) || !draftObj || typeof draftObj !== 'object') continue
          const routeId = rId as RouteId
          const d = draftObj as RouteScheduleDraft
          const rawMain = Array.isArray(sched.mainStages?.[routeId])
            ? (sched.mainStages[routeId] as UserStage[])
            : []
          const rawExt = Array.isArray(sched.extensionStages?.[routeId])
            ? (sched.extensionStages[routeId] as UserStage[])
            : []

          const reconstructed = reconstructSingleRouteSchedule({
            r: routeId,
            b: d.branchId,
            d: d.startDate,
            sw: d.startWaypointId,
            ew: d.endWaypointId,
            fo: d.finisterreOption || 'NONE',
            fd: d.finisterreDays,
            dq: d.dailyKmQuota,
            ms: rawMain.map((s) => s.endWaypointId),
            es: rawExt.map((s) => s.endWaypointId),
          })

          if (reconstructed && reconstructed.drafts[routeId]) {
            validRouteIds.push(routeId)
            safeDrafts[routeId] = reconstructed.drafts[routeId]
            safeMainStages[routeId] = reconstructed.mainStages[routeId]
            safeExtStages[routeId] = reconstructed.extensionStages[routeId]
          }
        }
      }

      if (validRouteIds.length === 0) {
        return { ok: false, error: '備份檔中未包含合法的行程路線資料' }
      }

      const primaryRouteId: RouteId = VALID_ROUTE_IDS.has(sched.currentRouteId) &&
        validRouteIds.includes(sched.currentRouteId)
        ? sched.currentRouteId
        : validRouteIds[0]

      const primaryDraft = safeDrafts[primaryRouteId]!
      const primaryMeta = getEffectiveRouteMetadata(primaryRouteId, primaryDraft.branchId)
      const primaryDays =
        (safeMainStages[primaryRouteId]?.length || 0) +
        (safeExtStages[primaryRouteId]?.length || 0)

      result.schedule = {
        currentRouteId: primaryRouteId,
        drafts: safeDrafts,
        mainStages: safeMainStages,
        extensionStages: safeExtStages,
        summary: {
          routeIds: validRouteIds,
          primaryRouteName: primaryMeta?.chineseName || primaryRouteId,
          startDate: primaryDraft.startDate,
          totalDays: primaryDays,
        },
      }
    }

    if (parsed.packing && typeof parsed.packing === 'object') {
      const sanitized = sanitizePackingState(parsed.packing)
      const activeSet = new Set(sanitized.activeCategories)
      const excludedNames = defaultActiveCategories
        .filter((c) => !activeSet.has(c))
        .map((c) => OFFICIAL_CATEGORY_LABELS[c] || c)

      result.packing = {
        version: 2,
        bodyWeightKg: sanitized.bodyWeightKg,
        userItemStates: sanitized.userItemStates,
        customItems: sanitized.customItems,
        activeCategories: sanitized.activeCategories,
        categoryOrder: sanitized.categoryOrder,
        summary: {
          bodyWeightKg: sanitized.bodyWeightKg,
          activeCategoryCount: sanitized.activeCategories.length,
          excludedCategoryNames: excludedNames,
          customCount: sanitized.customItems.length,
          overrideCount: Object.keys(sanitized.userItemStates).length,
        },
      }
    }

    return { ok: true, data: result }
  } catch (err) {
    console.warn('[SyncCodec] parseBackupJson failed:', err)
    return { ok: false, error: '無法解析 JSON 備份檔案，請確認檔案未遭修改或損毀' }
  }
}
