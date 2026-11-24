import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const OUTPUT_PATH = path.join(ROOT_DIR, 'src', 'data', 'climate.ts')

const MONTH_ORDER = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const AEMET_STATIONS = [
  {
    id: 'frances-pyrenees',
    routeIds: ['frances'],
    stationId: '9263D',
    k: 'nav',
    stationName: 'Pamplona Aeropuerto',
    stationElevationM: 459,
    trailElevationRangeM: [170, 1430],
    zoneName: '庇里牛斯山與納瓦拉段',
    zoneNameEn: 'Pyrenees & Navarra',
    representativeTowns: 'SJPP・Roncesvalles・Pamplona',
    representativeTownsEn: 'SJPP · Roncesvalles · Pamplona',
    isWindExposed: true,
    hasHighAltitudeDrop: true,
    altitudeNote: '測站位於潘普洛納（459m）；Day 1 庇里牛斯埡口（1,430m）與 Roncesvalles（950m）實際氣溫約低 3–6°C。',
    altitudeNoteEn:
      'Station at Pamplona (459m). Pyrenees pass (1,430m) & Roncesvalles (950m) are typically 3–6°C colder.',
  },
  {
    id: 'frances-rioja',
    routeIds: ['frances'],
    stationId: '9170',
    k: 'rio',
    stationName: 'Logroño Aeropuerto',
    stationElevationM: 353,
    trailElevationRangeM: [350, 750],
    zoneName: '里奧哈酒鄉丘陵段',
    zoneNameEn: 'La Rioja Wine Country',
    representativeTowns: 'Estella・Logroño・Santo Domingo',
    representativeTownsEn: 'Estella · Logroño · Santo Domingo',
    isWindExposed: false,
    hasHighAltitudeDrop: false,
  },
  {
    id: 'frances-meseta-east',
    routeIds: ['frances'],
    stationId: '2331',
    k: 'cle',
    stationName: 'Burgos Aeropuerto',
    stationElevationM: 891,
    trailElevationRangeM: [750, 1150],
    zoneName: '梅塞塔高原東段（布爾戈斯）',
    zoneNameEn: 'Eastern Meseta (Burgos)',
    representativeTowns: 'Burgos・Castrojeriz・Frómista',
    representativeTownsEn: 'Burgos · Castrojeriz · Frómista',
    isWindExposed: true,
    hasHighAltitudeDrop: false,
    altitudeNote: '高原開闊無遮蔽，日夜溫差大且常有強風，夏季午後曝曬強烈。',
    altitudeNoteEn: 'Exposed high plateau with wide diurnal temperature swings, wind, and strong summer sun.',
  },
  {
    id: 'frances-meseta-west',
    routeIds: ['frances'],
    stationId: '2661',
    k: 'cle',
    stationName: 'León Virgen del Camino',
    stationElevationM: 916,
    trailElevationRangeM: [780, 1500],
    zoneName: '梅塞塔高原西段（萊昂）',
    zoneNameEn: 'Western Meseta (León)',
    representativeTowns: 'Sahagún・León・Astorga',
    representativeTownsEn: 'Sahagún · León · Astorga',
    isWindExposed: true,
    hasHighAltitudeDrop: true,
    altitudeNote: '鐵十字架 Cruz de Ferro（1,500m）海拔高出測站近 600m，埡口氣溫約低 3–4°C。',
    altitudeNoteEn: 'Cruz de Ferro (1,500m) sits ~600m higher than the station and is typically 3–4°C colder.',
  },
  {
    id: 'frances-galicia-mountains',
    routeIds: ['frances'],
    stationId: '1549',
    k: 'cle',
    stationName: 'Ponferrada',
    stationElevationM: 534,
    trailElevationRangeM: [500, 1300],
    zoneName: '比耶索山谷與加利西亞山口',
    zoneNameEn: 'El Bierzo & O Cebreiro Pass',
    representativeTowns: 'Ponferrada・O Cebreiro・Sarria',
    representativeTownsEn: 'Ponferrada · O Cebreiro · Sarria',
    isWindExposed: true,
    hasHighAltitudeDrop: true,
    altitudeNote: '測站位於谷地（534m）；翻越 O Cebreiro（1,300m）時氣溫約低 4–5°C 且易起濃霧。',
    altitudeNoteEn: 'Station in valley (534m). O Cebreiro pass (1,300m) is ~4–5°C colder and prone to fog.',
  },
  {
    id: 'santiago-galicia',
    routeIds: ['frances', 'portugues', 'norte'],
    stationId: '1428',
    k: 'gal',
    stationName: 'Santiago de Compostela Aeropuerto',
    stationElevationM: 370,
    trailElevationRangeM: [100, 450],
    zoneName: '加利西亞終點段（聖地牙哥）',
    zoneNameEn: 'Galicia Finale (Santiago)',
    representativeTowns: 'Arzúa・Padrón・Santiago',
    representativeTownsEn: 'Arzúa · Padrón · Santiago',
    isWindExposed: false,
    hasHighAltitudeDrop: false,
  },
  {
    id: 'portugues-vigo',
    routeIds: ['portugues'],
    stationId: '1495',
    k: 'gal',
    stationName: 'Vigo Aeropuerto',
    stationElevationM: 261,
    trailElevationRangeM: [0, 260],
    zoneName: '葡西邊境與加利西亞南岸',
    zoneNameEn: 'Minho Border & Southern Galicia Coast',
    representativeTowns: 'Caminha・Tui・Vigo・Redondela',
    representativeTownsEn: 'Caminha · Tui · Vigo · Redondela',
    isWindExposed: true,
    hasHighAltitudeDrop: false,
  },
  {
    id: 'portugues-pontevedra',
    routeIds: ['portugues'],
    stationId: '1484C',
    k: 'gal',
    stationName: 'Pontevedra',
    stationElevationM: 108,
    trailElevationRangeM: [10, 200],
    zoneName: '龐特韋德拉共線段',
    zoneNameEn: 'Pontevedra & Caldas de Reis',
    representativeTowns: 'Pontevedra・Caldas de Reis',
    representativeTownsEn: 'Pontevedra · Caldas de Reis',
    isWindExposed: false,
    hasHighAltitudeDrop: false,
  },
  {
    id: 'norte-basque',
    routeIds: ['norte'],
    stationId: '1024E',
    k: 'pva',
    stationName: 'Donostia / San Sebastián Igueldo',
    stationElevationM: 251,
    trailElevationRangeM: [0, 350],
    zoneName: '巴斯克海岸段',
    zoneNameEn: 'Basque Coast',
    representativeTowns: 'Irún・San Sebastián・Bilbao',
    representativeTownsEn: 'Irún · San Sebastián · Bilbao',
    isWindExposed: true,
    hasHighAltitudeDrop: false,
  },
  {
    id: 'norte-cantabria',
    routeIds: ['norte'],
    stationId: '1109',
    k: 'can',
    stationName: 'Santander Aeropuerto',
    stationElevationM: 3,
    trailElevationRangeM: [0, 250],
    zoneName: '坎塔布里亞海岸段',
    zoneNameEn: 'Cantabria Coast',
    representativeTowns: 'Laredo・Santander・Santillana',
    representativeTownsEn: 'Laredo · Santander · Santillana',
    isWindExposed: true,
    hasHighAltitudeDrop: false,
  },
  {
    id: 'norte-asturias',
    routeIds: ['norte'],
    stationId: '1212E',
    k: 'ast',
    stationName: 'Asturias Aeropuerto',
    stationElevationM: 127,
    trailElevationRangeM: [0, 300],
    zoneName: '阿斯圖里亞斯海岸段',
    zoneNameEn: 'Asturias Coast',
    representativeTowns: 'Llanes・Gijón・Ribadeo',
    representativeTownsEn: 'Llanes · Gijón · Ribadeo',
    isWindExposed: true,
    hasHighAltitudeDrop: false,
  },
  {
    id: 'norte-galicia-inland',
    routeIds: ['norte'],
    stationId: '1505',
    k: 'gal',
    stationName: 'Lugo Aeropuerto',
    stationElevationM: 445,
    trailElevationRangeM: [300, 650],
    zoneName: '加利西亞內陸高地段',
    zoneNameEn: 'Inland Galicia (Lugo)',
    representativeTowns: 'Mondoñedo・Vilalba・Sobrado',
    representativeTownsEn: 'Mondoñedo · Vilalba · Sobrado',
    isWindExposed: false,
    hasHighAltitudeDrop: false,
  },
  {
    id: 'finisterre-atlantic',
    routeIds: ['finisterre'],
    stationId: '1387',
    k: 'gal',
    stationName: 'A Coruña',
    stationElevationM: 58,
    trailElevationRangeM: [0, 350],
    zoneName: '世界盡頭海岸段',
    zoneNameEn: 'Finisterre & Muxía Coast',
    representativeTowns: 'Negreira・Finisterre・Muxía',
    representativeTownsEn: 'Negreira · Finisterre · Muxía',
    isWindExposed: true,
    hasHighAltitudeDrop: false,
    altitudeNote: '大西洋海角終年海風強勁，濕冷時體感溫度明顯更低，建議備妥防風雨衣。',
    altitudeNoteEn: 'Atlantic capes are exposed to strong sea winds year-round; windproof rain gear is essential.',
  },
]

// 葡萄牙氣象局 IPMA 1991–2020 官方基準：Porto / Pedras Rubras（Estação 545，海拔 69m）
const IPMA_PORTO_ZONE = {
  id: 'portugues-porto',
  routeIds: ['portugues'],
  stationId: 'IPMA-545',
  stationName: 'Porto / Pedras Rubras',
  source: 'IPMA',
  sourcePeriod: '1991-2020',
  stationElevationM: 69,
  trailElevationRangeM: [0, 220],
  zoneName: '波多與葡北海岸／中央段',
  zoneNameEn: 'Porto & Northern Portugal',
  representativeTowns: 'Porto・Barcelos・Viana do Castelo',
  representativeTownsEn: 'Porto · Barcelos · Viana do Castelo',
  isWindExposed: true,
  hasHighAltitudeDrop: false,
  monthly: [
    { month: 1, avgMeanC: 9.6, avgHighC: 13.8, avgLowC: 5.4, precipMm: 154, rainyDays: 12.8, frostDays: 1.5, snowDays: 0 },
    { month: 2, avgMeanC: 10.5, avgHighC: 14.7, avgLowC: 6.4, precipMm: 130, rainyDays: 10.0, frostDays: 0.8, snowDays: 0 },
    { month: 3, avgMeanC: 11.9, avgHighC: 16.5, avgLowC: 7.3, precipMm: 100, rainyDays: 9.9, frostDays: 0.3, snowDays: 0 },
    { month: 4, avgMeanC: 13.0, avgHighC: 17.3, avgLowC: 8.6, precipMm: 110, rainyDays: 10.4, frostDays: 0, snowDays: 0 },
    { month: 5, avgMeanC: 14.9, avgHighC: 19.0, avgLowC: 10.8, precipMm: 95, rainyDays: 8.9, frostDays: 0, snowDays: 0 },
    { month: 6, avgMeanC: 17.7, avgHighC: 22.1, avgLowC: 13.3, precipMm: 50, rainyDays: 4.9, frostDays: 0, snowDays: 0 },
    { month: 7, avgMeanC: 19.4, avgHighC: 24.1, avgLowC: 14.7, precipMm: 25, rainyDays: 3.1, frostDays: 0, snowDays: 0 },
    { month: 8, avgMeanC: 19.3, avgHighC: 24.2, avgLowC: 14.4, precipMm: 35, rainyDays: 3.2, frostDays: 0, snowDays: 0 },
    { month: 9, avgMeanC: 18.4, avgHighC: 23.1, avgLowC: 13.6, precipMm: 75, rainyDays: 5.8, frostDays: 0, snowDays: 0 },
    { month: 10, avgMeanC: 15.8, avgHighC: 20.1, avgLowC: 11.4, precipMm: 150, rainyDays: 11.1, frostDays: 0, snowDays: 0 },
    { month: 11, avgMeanC: 12.7, avgHighC: 16.8, avgLowC: 8.6, precipMm: 165, rainyDays: 13.0, frostDays: 0.2, snowDays: 0 },
    { month: 12, avgMeanC: 10.8, avgHighC: 14.6, avgLowC: 7.0, precipMm: 155, rainyDays: 12.9, frostDays: 0.9, snowDays: 0 },
  ],
}

function parseCsvNumber(val) {
  const cleaned = (val ?? '').replace(/"/g, '').trim()
  if (!cleaned || cleaned === '-') return 0
  const n = Number(cleaned)
  if (!Number.isFinite(n)) {
    throw new Error(`無法解析數值欄位: "${val}"`)
  }
  return n
}

async function fetchAemetStation(station) {
  const pageUrl = `https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=${station.stationId}&k=${station.k}`
  const pageRes = await fetch(pageUrl)
  if (!pageRes.ok) {
    throw new Error(`AEMET 頁面請求失敗 (${station.stationId}): ${pageRes.status}`)
  }
  const html = await pageRes.text()
  const match = html.match(/href="([^"]*\.csv[^"]*)"/)
  if (!match) {
    throw new Error(`找不到 CSV 下載連結 (${station.stationId})`)
  }
  const csvPath = match[1].replace(/&amp;/g, '&')
  const csvUrl = csvPath.startsWith('http') ? csvPath : `https://www.aemet.es${csvPath}`

  const csvRes = await fetch(csvUrl)
  if (!csvRes.ok) {
    throw new Error(`AEMET CSV 下載失敗 (${station.stationId}): ${csvRes.status}`)
  }
  const csvText = await csvRes.text()
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0)

  const headerIdx = lines.findIndex((l) => l.startsWith('"Mes"'))
  if (headerIdx === -1) {
    throw new Error(`找不到 CSV 標題列 (${station.stationId})`)
  }

  const headers = lines[headerIdx]
    .split(',')
    .map((h) => h.replace(/"/g, '').trim())
    .filter(Boolean)

  const col = (name) => headers.indexOf(name)
  const monthly = []

  for (let i = 0; i < MONTH_ORDER.length; i++) {
    const monthName = MONTH_ORDER[i]
    const rowLine = lines.find((l) => l.startsWith(`"${monthName}"`))
    if (!rowLine) {
      throw new Error(`缺少月份 ${monthName} (${station.stationId})`)
    }
    const cells = rowLine.split(',').map((c) => c.replace(/"/g, '').trim())
    monthly.push({
      month: i + 1,
      avgMeanC: parseCsvNumber(cells[col('T')]),
      avgHighC: parseCsvNumber(cells[col('TM')]),
      avgLowC: parseCsvNumber(cells[col('Tm')]),
      precipMm: parseCsvNumber(cells[col('R')]),
      rainyDays: parseCsvNumber(cells[col('DR')]),
      frostDays: parseCsvNumber(cells[col('DH')]),
      snowDays: parseCsvNumber(cells[col('DN')]),
    })
  }

  const { k: _k, ...rest } = station
  return {
    ...rest,
    source: 'AEMET',
    sourcePeriod: '1991-2020',
    monthly,
  }
}

async function main() {
  const zones = []
  for (const station of AEMET_STATIONS) {
    console.log(`[climate] Fetching ${station.stationName} (${station.stationId})...`)
    const data = await fetchAemetStation(station)
    zones.push(data)
  }

  // 將波多測站插入葡萄牙之路最前面
  const vigoIdx = zones.findIndex((z) => z.id === 'portugues-vigo')
  zones.splice(vigoIdx, 0, IPMA_PORTO_ZONE)

  const fileContent = `import type { ClimateRouteId, ClimateZone } from '@/types/climate'

/**
 * 全線官方歷史氣候基準資料庫（1991–2020）
 * 資料來源：西班牙國家氣象局 (AEMET) 與葡萄牙海洋與大氣研究所 (IPMA)
 * 由 scripts/fetch-climate.mjs 自動產出，請勿手動修改數值。
 */
export const CLIMATE_ZONES: ClimateZone[] = ${JSON.stringify(zones, null, 2)}

export function getClimateZonesByRoute(routeId: ClimateRouteId): ClimateZone[] {
  if (routeId === 'portugues') {
    // 葡萄牙之路顯示順序：波多 ➔ 邊境/Vigo ➔ 龐特韋德拉 ➔ 聖地牙哥
    const order = ['portugues-porto', 'portugues-vigo', 'portugues-pontevedra', 'santiago-galicia']
    return order
      .map((id) => CLIMATE_ZONES.find((z) => z.id === id))
      .filter((z): z is ClimateZone => Boolean(z))
  }
  return CLIMATE_ZONES.filter((z) => z.routeIds.includes(routeId))
}
`

  fs.writeFileSync(OUTPUT_PATH, fileContent, 'utf-8')
  console.log(`[climate] 成功產出 ${zones.length} 個官方氣候區段至 ${OUTPUT_PATH}`)
}

main().catch((err) => {
  console.error('[climate] 失敗:', err)
  process.exit(1)
})
