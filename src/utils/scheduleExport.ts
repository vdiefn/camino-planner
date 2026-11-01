import type { UserStage, Waypoint } from '@/types/camino'

export interface ScheduleExportMeta {
  routeName: string
  startDate: string
  totalDays: number
  totalDistanceKm: number
  totalElevationGainM: number
  arrivalDate?: string
}

/**
 * 去除字串中所有全形或半形括號及其內容（如：景點備註、英譯簡稱）
 */
function stripParentheses(str: string): string {
  return str.replace(/\s*[（(][^）)]*[）)]/g, '').trim()
}

/**
 * 取得航點之當地語言名稱（優先取 localName，次取 spanishName，再次取 chineseName），並去除括號
 */
function getWaypointLocalName(wp?: Waypoint, fallbackId = ''): string {
  if (!wp) return fallbackId
  const raw = wp.localName || wp.spanishName || wp.chineseName || fallbackId
  return stripParentheses(raw)
}

/**
 * 產生供通訊軟體（LINE / 備忘錄）分享之繁體中文極簡行程路書（格式 2）
 * 包含路線、出發日期、總天數、里程、爬升與每日分段列表（當地地名、D01 編號）
 */
export function generateScheduleTextChecklist(
  stages: UserStage[],
  waypointMap: Map<string, Waypoint>,
  meta: ScheduleExportMeta
): string {
  if (!stages || stages.length === 0) {
    return '【聖雅各朝聖之路 · 行程規劃】\n目前尚未建立分段行程。'
  }

  const lines: string[] = []
  lines.push(`聖雅各朝聖之路 每日徒步行程 · ${meta.startDate} 出發`)
  lines.push('')
  lines.push(`路線：${meta.routeName} ｜ 共 ${meta.totalDays} 天`)
  lines.push(
    `總計 ${meta.totalDistanceKm.toFixed(1)} km ｜ 爬升 +${Math.round(meta.totalElevationGainM).toLocaleString()} m`
  )
  lines.push('')
  lines.push('【行程表】')

  for (const stage of stages) {
    const dayLabel = `D${String(stage.dayIndex).padStart(2, '0')}`
    // 日期格式化：從 YYYY-MM-DD 取 MM-DD（純文字不帶括號）
    const datePart = stage.date ? stage.date.slice(5) : ''
    const dateLabel = datePart ? ` ${datePart}` : ''

    const startWp = waypointMap.get(stage.startWaypointId)
    const endWp = waypointMap.get(stage.endWaypointId)
    const startName = getWaypointLocalName(startWp, stage.startWaypointId)
    const endName = getWaypointLocalName(endWp, stage.endWaypointId)

    if (stage.isRestDay) {
      lines.push(`${dayLabel}${dateLabel} ${startName} · 休息日`)
    } else {
      const extTag = stage.isExtensionStage ? ' [世界盡頭延伸]' : ''
      const distStr = `${stage.distanceKm.toFixed(1)} km`
      lines.push(`${dayLabel}${dateLabel} ${startName} ➔ ${endName}${extTag} · ${distStr}`)
    }
  }

  lines.push('')
  lines.push('Buen Camino! 祝朝聖之路平安順心')

  return lines.join('\n')
}
