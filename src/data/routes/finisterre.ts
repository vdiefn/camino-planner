import type { Waypoint } from '@/types/camino'
import type { FinisterreOption } from '@/types/route'

export const finisterreOptionLabels: Record<
  FinisterreOption,
  { title: string; subtitle: string; totalKm: number; days: number }
> = {
  NONE: {
    title: '不延伸（於聖地牙哥結束）',
    subtitle: '朝聖旅程在聖地牙哥大教堂劃下完美句點',
    totalKm: 0,
    days: 0,
  },
  FINISTERRE_ONLY: {
    title: '僅前往菲尼斯特雷 (Finisterre)',
    subtitle: '走向大西洋海角、參訪 0.00km 燈塔日落（約 90km）',
    totalKm: 89.5,
    days: 3,
  },
  MUXIA_ONLY: {
    title: '僅前往穆希亞 (Muxía)',
    subtitle: '前往聖船聖母聖殿與海邊傳奇巨石（約 86km）',
    totalKm: 86.3,
    days: 3,
  },
  BOTH_FINISTERRE_FIRST: {
    title: '兩者皆去（先菲尼斯特雷 ➔ 後穆希亞）',
    subtitle: '經典走法：先至天涯海角燈塔，再經由 Lires 抵達穆希亞聖殿（約 119km）',
    totalKm: 118.5,
    days: 4,
  },
  BOTH_MUXIA_FIRST: {
    title: '兩者皆去（先穆希亞 ➔ 後菲尼斯特雷）',
    subtitle: '反向環線：先參訪聖船聖母聖殿，再橫跨海岸線至世界盡頭燈塔（約 119km）',
    totalKm: 118.5,
    days: 4,
  },
}

// 基礎節點定義
const santiagoStart: Waypoint = {
  id: 'finisterre:santiago',
  localName: 'Santiago de Compostela',
  spanishName: 'Santiago de Compostela',
  chineseName: '聖地牙哥大教堂（延伸起點）',
  coordinates: { lat: 42.8806, lng: -8.5447 },
  cumulativeKm: 0,
  elevationM: 260,
  hasAlbergue: true,
  isMajorCity: true,
  routeVariant: 'COMMON',
}

const negreira: Waypoint = {
  id: 'finisterre:negreira',
  localName: 'Negreira',
  spanishName: 'Negreira',
  chineseName: '內格雷拉',
  coordinates: { lat: 42.9097, lng: -8.7358 },
  cumulativeKm: 21.0,
  elevationM: 160,
  hasAlbergue: true,
  isMajorCity: true,
  routeVariant: 'COMMON',
}

const maronas: Waypoint = {
  id: 'finisterre:maronas',
  localName: 'Santa Mariña',
  spanishName: 'Maroñas',
  chineseName: '馬羅尼亞斯',
  coordinates: { lat: 42.9469, lng: -8.9242 },
  cumulativeKm: 42.0,
  elevationM: 380,
  hasAlbergue: true,
  isMajorCity: false,
  routeVariant: 'COMMON',
}

const olveiroa: Waypoint = {
  id: 'finisterre:olveiroa',
  localName: 'Olveiroa',
  spanishName: 'Olveiroa',
  chineseName: '奧爾韋羅阿',
  coordinates: { lat: 42.9786, lng: -9.0433 },
  cumulativeKm: 54.0,
  elevationM: 280,
  hasAlbergue: true,
  isMajorCity: false,
  routeVariant: 'COMMON',
}

const hospital: Waypoint = {
  id: 'finisterre:hospital',
  localName: 'Hospital',
  spanishName: 'Hospital',
  chineseName: '奧斯皮塔爾（世界盡頭分岔點）',
  coordinates: { lat: 42.9989, lng: -9.0889 },
  cumulativeKm: 60.0,
  elevationM: 360,
  hasAlbergue: true,
  isMajorCity: false,
  routeVariant: 'COMMON',
}

// 菲尼斯特雷段
const cee: Waypoint = {
  id: 'finisterre:cee',
  localName: 'Cee',
  spanishName: 'Cee',
  chineseName: '塞埃（海灣補給城鎮）',
  coordinates: { lat: 42.9558, lng: -9.1903 },
  cumulativeKm: 75.0,
  elevationM: 15,
  hasAlbergue: true,
  isMajorCity: true,
  routeVariant: 'COMMON',
}

const corcubion: Waypoint = {
  id: 'finisterre:corcubion',
  localName: 'Corcubión',
  spanishName: 'Corcubión',
  chineseName: '科爾庫維翁',
  coordinates: { lat: 42.9442, lng: -9.1947 },
  cumulativeKm: 76.8,
  elevationM: 10,
  hasAlbergue: true,
  isMajorCity: true,
  routeVariant: 'COMMON',
}

const fisterra: Waypoint = {
  id: 'finisterre:fisterra',
  localName: 'Fisterra',
  spanishName: 'Finisterre',
  chineseName: '菲尼斯特雷',
  coordinates: { lat: 42.9086, lng: -9.2631 },
  cumulativeKm: 89.5,
  elevationM: 10,
  hasAlbergue: true,
  isMajorCity: true,
  routeVariant: 'COMMON',
}

// 穆希亞段
const dumbria: Waypoint = {
  id: 'finisterre:dumbria',
  localName: 'Dumbría',
  spanishName: 'Dumbría',
  chineseName: '敦布里亞',
  coordinates: { lat: 43.0519, lng: -9.1158 },
  cumulativeKm: 64.5,
  elevationM: 320,
  hasAlbergue: true,
  isMajorCity: false,
  routeVariant: 'COMMON',
}

const muxia: Waypoint = {
  id: 'finisterre:muxia',
  localName: 'Muxía',
  spanishName: 'Muxía',
  chineseName: '穆希亞（聖船聖母聖殿）',
  coordinates: { lat: 43.1047, lng: -9.2178 },
  cumulativeKm: 86.3,
  elevationM: 10,
  hasAlbergue: true,
  isMajorCity: true,
  routeVariant: 'COMMON',
}

// 橫向聯絡點
const lires: Waypoint = {
  id: 'finisterre:lires',
  localName: 'Lires',
  spanishName: 'Lires',
  chineseName: '利雷斯',
  coordinates: { lat: 43.0039, lng: -9.2458 },
  cumulativeKm: 103.5,
  elevationM: 30,
  hasAlbergue: true,
  isMajorCity: false,
  routeVariant: 'COMMON',
}

/**
 * 依據延伸選項，產生具備連續單調遞增 cumulativeKm 之世界盡頭航點拓撲陣列
 */
export function getFinisterreWaypoints(option: FinisterreOption): Waypoint[] {
  if (option === 'NONE') return []

  if (option === 'FINISTERRE_ONLY') {
    return [
      { ...santiagoStart, cumulativeKm: 0 },
      { ...negreira, cumulativeKm: 21.0 },
      { ...maronas, cumulativeKm: 42.0 },
      { ...olveiroa, cumulativeKm: 54.0 },
      { ...hospital, cumulativeKm: 60.0 },
      { ...cee, cumulativeKm: 75.0 },
      { ...corcubion, cumulativeKm: 76.8 },
      { ...fisterra, cumulativeKm: 89.5 },
    ]
  }

  if (option === 'MUXIA_ONLY') {
    return [
      { ...santiagoStart, cumulativeKm: 0 },
      { ...negreira, cumulativeKm: 21.0 },
      { ...maronas, cumulativeKm: 42.0 },
      { ...olveiroa, cumulativeKm: 54.0 },
      { ...hospital, cumulativeKm: 60.0 },
      { ...dumbria, cumulativeKm: 64.5 },
      { ...muxia, cumulativeKm: 86.3 },
    ]
  }

  if (option === 'BOTH_FINISTERRE_FIRST') {
    // Santiago ➔ Negreira (21) ➔ Olveiroa (54) ➔ Fisterra (89.5) ➔ Lires (103.5) ➔ Muxía (118.5)
    return [
      { ...santiagoStart, cumulativeKm: 0 },
      { ...negreira, cumulativeKm: 21.0 },
      { ...maronas, cumulativeKm: 42.0 },
      { ...olveiroa, cumulativeKm: 54.0 },
      { ...hospital, cumulativeKm: 60.0 },
      { ...cee, cumulativeKm: 75.0 },
      { ...corcubion, cumulativeKm: 76.8 },
      { ...fisterra, cumulativeKm: 89.5 },
      { ...lires, cumulativeKm: 103.5 },
      { ...muxia, cumulativeKm: 118.5 },
    ]
  }

  if (option === 'BOTH_MUXIA_FIRST') {
    // Santiago ➔ Negreira (21) ➔ Olveiroa (54) ➔ Muxía (86.3) ➔ Lires (101.3) ➔ Fisterra (118.5)
    return [
      { ...santiagoStart, cumulativeKm: 0 },
      { ...negreira, cumulativeKm: 21.0 },
      { ...maronas, cumulativeKm: 42.0 },
      { ...olveiroa, cumulativeKm: 54.0 },
      { ...hospital, cumulativeKm: 60.0 },
      { ...dumbria, cumulativeKm: 64.5 },
      { ...muxia, cumulativeKm: 86.3 },
      { ...lires, cumulativeKm: 101.3 },
      { ...fisterra, cumulativeKm: 118.5 },
    ]
  }

  return []
}

/**
 * 世界盡頭所有航點清單（包含分岔與橫向連接），供全域查找使用
 */
export const allFinisterreWaypoints: Waypoint[] = [
  santiagoStart,
  negreira,
  maronas,
  olveiroa,
  hospital,
  cee,
  corcubion,
  fisterra,
  dumbria,
  muxia,
  lires,
]
