import type { UserStage } from './camino'

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
  totalDistanceKm?: number
  recommendedDays?: number
  startWaypointId: string
  mergeWaypointId?: string
}

export interface RouteMetadata {
  id: RouteId
  name: string
  chineseName: string
  description: string
  totalDistanceKm: number
  recommendedDays: number
  defaultStartWaypointId: string
  defaultEndWaypointId: string
  branches?: RouteBranch[]
  badgeColor?: string
}

export interface RouteScheduleDraft {
  routeId: RouteId
  branchId?: string
  startWaypointId: string
  endWaypointId: string
  startDate: string
  targetDays: number
  dailyKmQuota: number
  restDays: number[]
  customStages?: UserStage[]
  finisterreOption: FinisterreOption
  santiagoLayoverDays?: number
  updatedAt: string
}

export interface MultiRouteScheduleState {
  version: number
  currentRouteId: RouteId
  drafts: Record<RouteId, RouteScheduleDraft>
}
