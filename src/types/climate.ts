export type ClimateRouteId = 'frances' | 'portugues' | 'norte' | 'finisterre'

export interface MonthlyClimateStats {
  month: number // 1-12
  avgMeanC: number
  avgHighC: number
  avgLowC: number
  precipMm: number
  rainyDays: number
  frostDays: number
  snowDays: number
}

export interface ClimateZone {
  id: string
  routeIds: ClimateRouteId[]
  stationId: string
  stationName: string
  source: 'AEMET' | 'IPMA'
  sourcePeriod: '1991-2020'
  stationElevationM: number
  trailElevationRangeM: [number, number]
  zoneName: string
  zoneNameEn: string
  representativeTowns: string
  representativeTownsEn: string
  isWindExposed: boolean
  hasHighAltitudeDrop: boolean
  altitudeNote?: string
  altitudeNoteEn?: string
  monthly: MonthlyClimateStats[]
}

export interface WeatherAdvisory {
  sleepingBagRating: string
  sleepingBagRatingEn: string
  rainGearLevel: 'light' | 'moderate' | 'heavy'
  alerts: string[]
  alertsEn: string[]
}
