import type { RouteId, RouteMetadata, FinisterreOption } from '@/types/route'
import type { Waypoint } from '@/types/camino'
import { francesMetadata, francesWaypoints, francesBranches, getFrancesWaypoints } from './frances'
import { portuguesMetadata, getPortuguesWaypoints } from './portugues'
import { norteMetadata, norteWaypoints } from './norte'
import { getFinisterreWaypoints, allFinisterreWaypoints } from './finisterre'

/**
 * 系統當前已收錄之官方推薦朝聖主路線清單
 */
export const AVAILABLE_ROUTES: RouteMetadata[] = [
  francesMetadata,
  portuguesMetadata,
  norteMetadata,
]

/**
 * 依據路線 ID 獲取路線中繼資料
 */
export function getRouteMetadata(routeId: RouteId): RouteMetadata | undefined {
  return AVAILABLE_ROUTES.find((r) => r.id === routeId)
}

/**
 * 依據路線 ID 與分支 ID，從航點資料動態推導出該路線/分支之總長度（公里）
 * 單一真相來源（Single Source of Truth）：終點航點 cumulativeKm - 起點航點 cumulativeKm
 */
export function getRouteTotalDistance(routeId: RouteId, branchId?: string): number {
  const wps = getRouteWaypoints(routeId, branchId)
  if (!wps || wps.length === 0) return 0
  const startKm = wps[0].cumulativeKm || 0
  const endKm = wps[wps.length - 1].cumulativeKm || 0
  return Number((endKm - startKm).toFixed(1))
}

/**
 * 取得指定路線在特定分支下的有效 Metadata（動態由航點計算長度，並適配分支建議天數）
 */
export function getEffectiveRouteMetadata(
  routeId: RouteId,
  branchId?: string,
): RouteMetadata | undefined {
  const baseMeta = getRouteMetadata(routeId)
  if (!baseMeta) return undefined

  const activeBranch = baseMeta.branches?.find((b) => b.id === branchId)
  const totalDistanceKm = getRouteTotalDistance(routeId, branchId)
  const recommendedDays = activeBranch?.recommendedDays ?? baseMeta.recommendedDays

  // 同步為所有分支動態計算各自分支之航點推導長度
  const branches = baseMeta.branches?.map((b) => ({
    ...b,
    totalDistanceKm: getRouteTotalDistance(routeId, b.id),
  }))

  return {
    ...baseMeta,
    totalDistanceKm,
    recommendedDays,
    branches,
  }
}

/**
 * 依據路線 ID 與分支 ID，取得完整且連續累計里程 (cumulativeKm) 之主線航點陣列
 */
export function getRouteWaypoints(routeId: RouteId, branchId?: string): Waypoint[] {
  switch (routeId) {
    case 'frances':
      return getFrancesWaypoints(branchId)
    case 'portugues':
      return getPortuguesWaypoints((branchId as 'central' | 'costa') || 'central')
    case 'norte':
      return norteWaypoints
    default:
      return francesWaypoints
  }
}

/**
 * 取得當前路線與世界盡頭外掛合併後的完整航點集合（排除重複 ID）
 */
export function getCombinedRouteWaypoints(
  routeId: RouteId,
  branchId?: string,
  finisterreOption: FinisterreOption = 'NONE',
): Waypoint[] {
  const mainWaypoints = getRouteWaypoints(routeId, branchId)
  if (finisterreOption === 'NONE') {
    return mainWaypoints
  }

  const finisterreWaypoints = getFinisterreWaypoints(finisterreOption)
  // 世界盡頭航點緊接於主線之後（排除首點 santiagoStart 以防重複）
  const extensionWps = finisterreWaypoints.filter((w) => w.id !== 'finisterre:santiago')
  return [...mainWaypoints, ...extensionWps]
}

/**
 * 建立全系統所有航點之 Map 查找字典，提供 O(1) 效能之全域航點解析
 */
export function buildGlobalWaypointMap(): Map<string, Waypoint> {
  const map = new Map<string, Waypoint>()

  // 1. 法國之路航點
  francesWaypoints.forEach((wp) => map.set(wp.id, wp))

  // 2. 葡萄牙之路所有分支航點
  getPortuguesWaypoints('central').forEach((wp) => map.set(wp.id, wp))
  getPortuguesWaypoints('costa').forEach((wp) => map.set(wp.id, wp))

  // 3. 北方之路航點
  norteWaypoints.forEach((wp) => map.set(wp.id, wp))

  // 4. 世界盡頭所有拓撲航點
  allFinisterreWaypoints.forEach((wp) => map.set(wp.id, wp))

  return map
}

export {
  francesMetadata,
  francesWaypoints,
  francesBranches,
  getFrancesWaypoints,
  portuguesMetadata,
  getPortuguesWaypoints,
  norteMetadata,
  norteWaypoints,
  getFinisterreWaypoints,
  allFinisterreWaypoints,
}
