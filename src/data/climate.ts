import type { ClimateRouteId, ClimateZone } from '@/types/climate'

/**
 * 全線官方歷史氣候基準資料庫（1991–2020）
 * 資料來源：西班牙國家氣象局 (AEMET) 與葡萄牙海洋與大氣研究所 (IPMA)
 * 由 scripts/fetch-climate.mjs 自動產出，請勿手動修改數值。
 */
export const CLIMATE_ZONES: ClimateZone[] = [
  {
    "id": "frances-pyrenees",
    "routeIds": [
      "frances"
    ],
    "stationId": "9263D",
    "stationName": "Pamplona Aeropuerto",
    "stationElevationM": 459,
    "trailElevationRangeM": [
      170,
      1430
    ],
    "zoneName": "庇里牛斯山與納瓦拉段",
    "zoneNameEn": "Pyrenees & Navarra",
    "representativeTowns": "SJPP・Roncesvalles・Pamplona",
    "representativeTownsEn": "SJPP · Roncesvalles · Pamplona",
    "isWindExposed": true,
    "hasHighAltitudeDrop": true,
    "altitudeNote": "測站位於潘普洛納（459m）；Day 1 庇里牛斯埡口（1,430m）與 Roncesvalles（950m）實際氣溫約低 3–6°C。",
    "altitudeNoteEn": "Station at Pamplona (459m). Pyrenees pass (1,430m) & Roncesvalles (950m) are typically 3–6°C colder.",
    "source": "AEMET",
    "sourcePeriod": "1991-2020",
    "monthly": [
      {
        "month": 1,
        "avgMeanC": 5.2,
        "avgHighC": 9.1,
        "avgLowC": 1.4,
        "precipMm": 57,
        "rainyDays": 8.7,
        "frostDays": 11.2,
        "snowDays": 2
      },
      {
        "month": 2,
        "avgMeanC": 6.3,
        "avgHighC": 10.9,
        "avgLowC": 1.6,
        "precipMm": 50,
        "rainyDays": 8,
        "frostDays": 10.1,
        "snowDays": 2.6
      },
      {
        "month": 3,
        "avgMeanC": 9.1,
        "avgHighC": 14.6,
        "avgLowC": 3.7,
        "precipMm": 54,
        "rainyDays": 7.7,
        "frostDays": 4.5,
        "snowDays": 1.4
      },
      {
        "month": 4,
        "avgMeanC": 10.9,
        "avgHighC": 16.4,
        "avgLowC": 5.3,
        "precipMm": 74,
        "rainyDays": 9.7,
        "frostDays": 1.2,
        "snowDays": 0.8
      },
      {
        "month": 5,
        "avgMeanC": 14.7,
        "avgHighC": 20.8,
        "avgLowC": 8.6,
        "precipMm": 60,
        "rainyDays": 9.2,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 6,
        "avgMeanC": 18.6,
        "avgHighC": 25.2,
        "avgLowC": 11.9,
        "precipMm": 46,
        "rainyDays": 5.8,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 7,
        "avgMeanC": 21.2,
        "avgHighC": 28.2,
        "avgLowC": 14.2,
        "precipMm": 33,
        "rainyDays": 4.3,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 8,
        "avgMeanC": 21.4,
        "avgHighC": 28.3,
        "avgLowC": 14.5,
        "precipMm": 38,
        "rainyDays": 4.7,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 9,
        "avgMeanC": 18.2,
        "avgHighC": 24.5,
        "avgLowC": 12,
        "precipMm": 44,
        "rainyDays": 5.7,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 10,
        "avgMeanC": 14.1,
        "avgHighC": 19.3,
        "avgLowC": 8.9,
        "precipMm": 68,
        "rainyDays": 8.6,
        "frostDays": 0.2,
        "snowDays": 0
      },
      {
        "month": 11,
        "avgMeanC": 9,
        "avgHighC": 13.1,
        "avgLowC": 4.8,
        "precipMm": 75,
        "rainyDays": 9.6,
        "frostDays": 3.3,
        "snowDays": 0.7
      },
      {
        "month": 12,
        "avgMeanC": 6,
        "avgHighC": 9.7,
        "avgLowC": 2.2,
        "precipMm": 72,
        "rainyDays": 10.1,
        "frostDays": 9.1,
        "snowDays": 1.5
      }
    ]
  },
  {
    "id": "frances-rioja",
    "routeIds": [
      "frances"
    ],
    "stationId": "9170",
    "stationName": "Logroño Aeropuerto",
    "stationElevationM": 353,
    "trailElevationRangeM": [
      350,
      750
    ],
    "zoneName": "里奧哈酒鄉丘陵段",
    "zoneNameEn": "La Rioja Wine Country",
    "representativeTowns": "Estella・Logroño・Santo Domingo",
    "representativeTownsEn": "Estella · Logroño · Santo Domingo",
    "isWindExposed": false,
    "hasHighAltitudeDrop": false,
    "source": "AEMET",
    "sourcePeriod": "1991-2020",
    "monthly": [
      {
        "month": 1,
        "avgMeanC": 5.9,
        "avgHighC": 9.9,
        "avgLowC": 2,
        "precipMm": 28,
        "rainyDays": 5.6,
        "frostDays": 9.5,
        "snowDays": 1.5
      },
      {
        "month": 2,
        "avgMeanC": 7.2,
        "avgHighC": 12,
        "avgLowC": 2.4,
        "precipMm": 23,
        "rainyDays": 5.1,
        "frostDays": 7.3,
        "snowDays": 1.4
      },
      {
        "month": 3,
        "avgMeanC": 10.2,
        "avgHighC": 15.9,
        "avgLowC": 4.6,
        "precipMm": 26,
        "rainyDays": 4.7,
        "frostDays": 2.2,
        "snowDays": 0.6
      },
      {
        "month": 4,
        "avgMeanC": 12,
        "avgHighC": 17.8,
        "avgLowC": 6.3,
        "precipMm": 46,
        "rainyDays": 7.4,
        "frostDays": 0.6,
        "snowDays": 0.3
      },
      {
        "month": 5,
        "avgMeanC": 15.9,
        "avgHighC": 22,
        "avgLowC": 9.7,
        "precipMm": 47,
        "rainyDays": 8,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 6,
        "avgMeanC": 20.1,
        "avgHighC": 26.9,
        "avgLowC": 13.3,
        "precipMm": 44,
        "rainyDays": 5.2,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 7,
        "avgMeanC": 22.8,
        "avgHighC": 30.1,
        "avgLowC": 15.6,
        "precipMm": 30,
        "rainyDays": 3.7,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 8,
        "avgMeanC": 22.7,
        "avgHighC": 29.8,
        "avgLowC": 15.6,
        "precipMm": 21,
        "rainyDays": 3.4,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 9,
        "avgMeanC": 19.3,
        "avgHighC": 25.8,
        "avgLowC": 12.9,
        "precipMm": 26,
        "rainyDays": 3.9,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 10,
        "avgMeanC": 14.7,
        "avgHighC": 20.1,
        "avgLowC": 9.2,
        "precipMm": 37,
        "rainyDays": 6.5,
        "frostDays": 0.2,
        "snowDays": 0
      },
      {
        "month": 11,
        "avgMeanC": 9.5,
        "avgHighC": 13.8,
        "avgLowC": 5.3,
        "precipMm": 40,
        "rainyDays": 6.7,
        "frostDays": 2.7,
        "snowDays": 0.2
      },
      {
        "month": 12,
        "avgMeanC": 6.5,
        "avgHighC": 10.2,
        "avgLowC": 2.8,
        "precipMm": 38,
        "rainyDays": 6.5,
        "frostDays": 6.7,
        "snowDays": 0.9
      }
    ]
  },
  {
    "id": "frances-meseta-east",
    "routeIds": [
      "frances"
    ],
    "stationId": "2331",
    "stationName": "Burgos Aeropuerto",
    "stationElevationM": 891,
    "trailElevationRangeM": [
      750,
      1150
    ],
    "zoneName": "梅塞塔高原東段（布爾戈斯）",
    "zoneNameEn": "Eastern Meseta (Burgos)",
    "representativeTowns": "Burgos・Castrojeriz・Frómista",
    "representativeTownsEn": "Burgos · Castrojeriz · Frómista",
    "isWindExposed": true,
    "hasHighAltitudeDrop": false,
    "altitudeNote": "高原開闊無遮蔽，日夜溫差大且常有強風，夏季午後曝曬強烈。",
    "altitudeNoteEn": "Exposed high plateau with wide diurnal temperature swings, wind, and strong summer sun.",
    "source": "AEMET",
    "sourcePeriod": "1991-2020",
    "monthly": [
      {
        "month": 1,
        "avgMeanC": 3.1,
        "avgHighC": 7,
        "avgLowC": -0.8,
        "precipMm": 44,
        "rainyDays": 7.5,
        "frostDays": 18,
        "snowDays": 4.7
      },
      {
        "month": 2,
        "avgMeanC": 4.1,
        "avgHighC": 9,
        "avgLowC": -0.8,
        "precipMm": 35,
        "rainyDays": 6.9,
        "frostDays": 17.2,
        "snowDays": 3.7
      },
      {
        "month": 3,
        "avgMeanC": 7,
        "avgHighC": 12.9,
        "avgLowC": 1.1,
        "precipMm": 34,
        "rainyDays": 6.1,
        "frostDays": 12.3,
        "snowDays": 2.8
      },
      {
        "month": 4,
        "avgMeanC": 8.6,
        "avgHighC": 14.4,
        "avgLowC": 2.7,
        "precipMm": 61,
        "rainyDays": 9.2,
        "frostDays": 6.6,
        "snowDays": 1.9
      },
      {
        "month": 5,
        "avgMeanC": 12.2,
        "avgHighC": 18.4,
        "avgLowC": 5.9,
        "precipMm": 63,
        "rainyDays": 9.3,
        "frostDays": 1.1,
        "snowDays": 0.3
      },
      {
        "month": 6,
        "avgMeanC": 16.5,
        "avgHighC": 23.7,
        "avgLowC": 9.2,
        "precipMm": 41,
        "rainyDays": 5.7,
        "frostDays": 0.1,
        "snowDays": 0
      },
      {
        "month": 7,
        "avgMeanC": 19.5,
        "avgHighC": 27.6,
        "avgLowC": 11.5,
        "precipMm": 23,
        "rainyDays": 3.6,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 8,
        "avgMeanC": 19.5,
        "avgHighC": 27.5,
        "avgLowC": 11.5,
        "precipMm": 23,
        "rainyDays": 3.4,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 9,
        "avgMeanC": 16.1,
        "avgHighC": 23.3,
        "avgLowC": 8.9,
        "precipMm": 38,
        "rainyDays": 5.3,
        "frostDays": 0.1,
        "snowDays": 0
      },
      {
        "month": 10,
        "avgMeanC": 11.5,
        "avgHighC": 17.2,
        "avgLowC": 5.9,
        "precipMm": 60,
        "rainyDays": 8.3,
        "frostDays": 1.9,
        "snowDays": 0
      },
      {
        "month": 11,
        "avgMeanC": 6.6,
        "avgHighC": 10.9,
        "avgLowC": 2.1,
        "precipMm": 60,
        "rainyDays": 8.7,
        "frostDays": 9.7,
        "snowDays": 1.7
      },
      {
        "month": 12,
        "avgMeanC": 3.9,
        "avgHighC": 7.7,
        "avgLowC": 0.2,
        "precipMm": 63,
        "rainyDays": 9.3,
        "frostDays": 15,
        "snowDays": 3.4
      }
    ]
  },
  {
    "id": "frances-meseta-west",
    "routeIds": [
      "frances"
    ],
    "stationId": "2661",
    "stationName": "León Virgen del Camino",
    "stationElevationM": 916,
    "trailElevationRangeM": [
      780,
      1500
    ],
    "zoneName": "梅塞塔高原西段（萊昂）",
    "zoneNameEn": "Western Meseta (León)",
    "representativeTowns": "Sahagún・León・Astorga",
    "representativeTownsEn": "Sahagún · León · Astorga",
    "isWindExposed": true,
    "hasHighAltitudeDrop": true,
    "altitudeNote": "鐵十字架 Cruz de Ferro（1,500m）海拔高出測站近 600m，埡口氣溫約低 3–4°C。",
    "altitudeNoteEn": "Cruz de Ferro (1,500m) sits ~600m higher than the station and is typically 3–4°C colder.",
    "source": "AEMET",
    "sourcePeriod": "1991-2020",
    "monthly": [
      {
        "month": 1,
        "avgMeanC": 3.2,
        "avgHighC": 7.1,
        "avgLowC": -0.7,
        "precipMm": 50,
        "rainyDays": 7.6,
        "frostDays": 18.6,
        "snowDays": 4.1
      },
      {
        "month": 2,
        "avgMeanC": 4.7,
        "avgHighC": 9.5,
        "avgLowC": 0,
        "precipMm": 34,
        "rainyDays": 6,
        "frostDays": 15,
        "snowDays": 3.1
      },
      {
        "month": 3,
        "avgMeanC": 7.6,
        "avgHighC": 13.3,
        "avgLowC": 1.9,
        "precipMm": 32,
        "rainyDays": 5.6,
        "frostDays": 9.4,
        "snowDays": 1.6
      },
      {
        "month": 4,
        "avgMeanC": 9,
        "avgHighC": 14.8,
        "avgLowC": 3.3,
        "precipMm": 45,
        "rainyDays": 7.7,
        "frostDays": 5.2,
        "snowDays": 0.9
      },
      {
        "month": 5,
        "avgMeanC": 12.6,
        "avgHighC": 18.6,
        "avgLowC": 6.6,
        "precipMm": 56,
        "rainyDays": 8.8,
        "frostDays": 0.7,
        "snowDays": 0.1
      },
      {
        "month": 6,
        "avgMeanC": 17.1,
        "avgHighC": 24,
        "avgLowC": 10.2,
        "precipMm": 31,
        "rainyDays": 4.6,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 7,
        "avgMeanC": 19.8,
        "avgHighC": 27.4,
        "avgLowC": 12.2,
        "precipMm": 19,
        "rainyDays": 2.8,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 8,
        "avgMeanC": 19.6,
        "avgHighC": 26.9,
        "avgLowC": 12.3,
        "precipMm": 23,
        "rainyDays": 2.7,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 9,
        "avgMeanC": 16.5,
        "avgHighC": 22.9,
        "avgLowC": 10.1,
        "precipMm": 39,
        "rainyDays": 4.5,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 10,
        "avgMeanC": 11.7,
        "avgHighC": 16.7,
        "avgLowC": 6.7,
        "precipMm": 61,
        "rainyDays": 8.2,
        "frostDays": 0.7,
        "snowDays": 0
      },
      {
        "month": 11,
        "avgMeanC": 7,
        "avgHighC": 11.2,
        "avgLowC": 2.8,
        "precipMm": 59,
        "rainyDays": 7.5,
        "frostDays": 7.3,
        "snowDays": 0.8
      },
      {
        "month": 12,
        "avgMeanC": 4.2,
        "avgHighC": 8,
        "avgLowC": 0.4,
        "precipMm": 66,
        "rainyDays": 8.7,
        "frostDays": 14.6,
        "snowDays": 2.2
      }
    ]
  },
  {
    "id": "frances-galicia-mountains",
    "routeIds": [
      "frances"
    ],
    "stationId": "1549",
    "stationName": "Ponferrada",
    "stationElevationM": 534,
    "trailElevationRangeM": [
      500,
      1300
    ],
    "zoneName": "比耶索山谷與加利西亞山口",
    "zoneNameEn": "El Bierzo & O Cebreiro Pass",
    "representativeTowns": "Ponferrada・O Cebreiro・Sarria",
    "representativeTownsEn": "Ponferrada · O Cebreiro · Sarria",
    "isWindExposed": true,
    "hasHighAltitudeDrop": true,
    "altitudeNote": "測站位於谷地（534m）；翻越 O Cebreiro（1,300m）時氣溫約低 4–5°C 且易起濃霧。",
    "altitudeNoteEn": "Station in valley (534m). O Cebreiro pass (1,300m) is ~4–5°C colder and prone to fog.",
    "source": "AEMET",
    "sourcePeriod": "1991-2020",
    "monthly": [
      {
        "month": 1,
        "avgMeanC": 4.9,
        "avgHighC": 8.7,
        "avgLowC": 1.1,
        "precipMm": 67,
        "rainyDays": 8.8,
        "frostDays": 12.9,
        "snowDays": 1.6
      },
      {
        "month": 2,
        "avgMeanC": 6.9,
        "avgHighC": 11.9,
        "avgLowC": 1.8,
        "precipMm": 54,
        "rainyDays": 7.5,
        "frostDays": 9.6,
        "snowDays": 1.2
      },
      {
        "month": 3,
        "avgMeanC": 10,
        "avgHighC": 15.9,
        "avgLowC": 4,
        "precipMm": 46,
        "rainyDays": 7.7,
        "frostDays": 4.1,
        "snowDays": 0.4
      },
      {
        "month": 4,
        "avgMeanC": 11.6,
        "avgHighC": 17.6,
        "avgLowC": 5.7,
        "precipMm": 50,
        "rainyDays": 9.1,
        "frostDays": 1,
        "snowDays": 0.3
      },
      {
        "month": 5,
        "avgMeanC": 14.9,
        "avgHighC": 21.2,
        "avgLowC": 8.7,
        "precipMm": 54,
        "rainyDays": 9.6,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 6,
        "avgMeanC": 19.3,
        "avgHighC": 26.4,
        "avgLowC": 12.3,
        "precipMm": 32,
        "rainyDays": 5,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 7,
        "avgMeanC": 21.8,
        "avgHighC": 29.4,
        "avgLowC": 14.2,
        "precipMm": 23,
        "rainyDays": 3.4,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 8,
        "avgMeanC": 21.4,
        "avgHighC": 29,
        "avgLowC": 13.8,
        "precipMm": 25,
        "rainyDays": 3.7,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 9,
        "avgMeanC": 18.2,
        "avgHighC": 24.9,
        "avgLowC": 11.5,
        "precipMm": 49,
        "rainyDays": 5.9,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 10,
        "avgMeanC": 13.4,
        "avgHighC": 18.5,
        "avgLowC": 8.3,
        "precipMm": 81,
        "rainyDays": 10.1,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 11,
        "avgMeanC": 8.5,
        "avgHighC": 12.5,
        "avgLowC": 4.4,
        "precipMm": 82,
        "rainyDays": 9.7,
        "frostDays": 4.8,
        "snowDays": 0.2
      },
      {
        "month": 12,
        "avgMeanC": 5.4,
        "avgHighC": 8.8,
        "avgLowC": 2,
        "precipMm": 89,
        "rainyDays": 10.5,
        "frostDays": 10.8,
        "snowDays": 1
      }
    ]
  },
  {
    "id": "santiago-galicia",
    "routeIds": [
      "frances",
      "portugues",
      "norte"
    ],
    "stationId": "1428",
    "stationName": "Santiago de Compostela Aeropuerto",
    "stationElevationM": 370,
    "trailElevationRangeM": [
      100,
      450
    ],
    "zoneName": "加利西亞終點段（聖地牙哥）",
    "zoneNameEn": "Galicia Finale (Santiago)",
    "representativeTowns": "Arzúa・Padrón・Santiago",
    "representativeTownsEn": "Arzúa · Padrón · Santiago",
    "isWindExposed": false,
    "hasHighAltitudeDrop": false,
    "source": "AEMET",
    "sourcePeriod": "1991-2020",
    "monthly": [
      {
        "month": 1,
        "avgMeanC": 7.7,
        "avgHighC": 11.2,
        "avgLowC": 4.1,
        "precipMm": 210,
        "rainyDays": 15.2,
        "frostDays": 4.5,
        "snowDays": 1
      },
      {
        "month": 2,
        "avgMeanC": 8.3,
        "avgHighC": 12.5,
        "avgLowC": 4.1,
        "precipMm": 167,
        "rainyDays": 12.6,
        "frostDays": 3.7,
        "snowDays": 0.7
      },
      {
        "month": 3,
        "avgMeanC": 10.2,
        "avgHighC": 15,
        "avgLowC": 5.4,
        "precipMm": 146,
        "rainyDays": 12.8,
        "frostDays": 1.5,
        "snowDays": 0.2
      },
      {
        "month": 4,
        "avgMeanC": 11.2,
        "avgHighC": 16.1,
        "avgLowC": 6.2,
        "precipMm": 146,
        "rainyDays": 14.4,
        "frostDays": 0.4,
        "snowDays": 0.3
      },
      {
        "month": 5,
        "avgMeanC": 13.6,
        "avgHighC": 18.6,
        "avgLowC": 8.5,
        "precipMm": 135,
        "rainyDays": 12.7,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 6,
        "avgMeanC": 16.8,
        "avgHighC": 22.2,
        "avgLowC": 11.3,
        "precipMm": 72,
        "rainyDays": 7.6,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 7,
        "avgMeanC": 18.6,
        "avgHighC": 24.3,
        "avgLowC": 13,
        "precipMm": 43,
        "rainyDays": 5.7,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 8,
        "avgMeanC": 19,
        "avgHighC": 24.7,
        "avgLowC": 13.3,
        "precipMm": 57,
        "rainyDays": 5.5,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 9,
        "avgMeanC": 17.4,
        "avgHighC": 22.8,
        "avgLowC": 11.9,
        "precipMm": 107,
        "rainyDays": 8.4,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 10,
        "avgMeanC": 13.8,
        "avgHighC": 18.1,
        "avgLowC": 9.5,
        "precipMm": 226,
        "rainyDays": 14,
        "frostDays": 0.1,
        "snowDays": 0
      },
      {
        "month": 11,
        "avgMeanC": 10.4,
        "avgHighC": 14.1,
        "avgLowC": 6.7,
        "precipMm": 217,
        "rainyDays": 14.9,
        "frostDays": 1,
        "snowDays": 0.1
      },
      {
        "month": 12,
        "avgMeanC": 8.5,
        "avgHighC": 11.9,
        "avgLowC": 5,
        "precipMm": 261,
        "rainyDays": 15.9,
        "frostDays": 2.6,
        "snowDays": 0.3
      }
    ]
  },
  {
    "id": "portugues-porto",
    "routeIds": [
      "portugues"
    ],
    "stationId": "IPMA-545",
    "stationName": "Porto / Pedras Rubras",
    "source": "IPMA",
    "sourcePeriod": "1991-2020",
    "stationElevationM": 69,
    "trailElevationRangeM": [
      0,
      220
    ],
    "zoneName": "波多與葡北海岸／中央段",
    "zoneNameEn": "Porto & Northern Portugal",
    "representativeTowns": "Porto・Barcelos・Viana do Castelo",
    "representativeTownsEn": "Porto · Barcelos · Viana do Castelo",
    "isWindExposed": true,
    "hasHighAltitudeDrop": false,
    "monthly": [
      {
        "month": 1,
        "avgMeanC": 9.6,
        "avgHighC": 13.8,
        "avgLowC": 5.4,
        "precipMm": 154,
        "rainyDays": 12.8,
        "frostDays": 1.5,
        "snowDays": 0
      },
      {
        "month": 2,
        "avgMeanC": 10.5,
        "avgHighC": 14.7,
        "avgLowC": 6.4,
        "precipMm": 130,
        "rainyDays": 10,
        "frostDays": 0.8,
        "snowDays": 0
      },
      {
        "month": 3,
        "avgMeanC": 11.9,
        "avgHighC": 16.5,
        "avgLowC": 7.3,
        "precipMm": 100,
        "rainyDays": 9.9,
        "frostDays": 0.3,
        "snowDays": 0
      },
      {
        "month": 4,
        "avgMeanC": 13,
        "avgHighC": 17.3,
        "avgLowC": 8.6,
        "precipMm": 110,
        "rainyDays": 10.4,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 5,
        "avgMeanC": 14.9,
        "avgHighC": 19,
        "avgLowC": 10.8,
        "precipMm": 95,
        "rainyDays": 8.9,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 6,
        "avgMeanC": 17.7,
        "avgHighC": 22.1,
        "avgLowC": 13.3,
        "precipMm": 50,
        "rainyDays": 4.9,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 7,
        "avgMeanC": 19.4,
        "avgHighC": 24.1,
        "avgLowC": 14.7,
        "precipMm": 25,
        "rainyDays": 3.1,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 8,
        "avgMeanC": 19.3,
        "avgHighC": 24.2,
        "avgLowC": 14.4,
        "precipMm": 35,
        "rainyDays": 3.2,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 9,
        "avgMeanC": 18.4,
        "avgHighC": 23.1,
        "avgLowC": 13.6,
        "precipMm": 75,
        "rainyDays": 5.8,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 10,
        "avgMeanC": 15.8,
        "avgHighC": 20.1,
        "avgLowC": 11.4,
        "precipMm": 150,
        "rainyDays": 11.1,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 11,
        "avgMeanC": 12.7,
        "avgHighC": 16.8,
        "avgLowC": 8.6,
        "precipMm": 165,
        "rainyDays": 13,
        "frostDays": 0.2,
        "snowDays": 0
      },
      {
        "month": 12,
        "avgMeanC": 10.8,
        "avgHighC": 14.6,
        "avgLowC": 7,
        "precipMm": 155,
        "rainyDays": 12.9,
        "frostDays": 0.9,
        "snowDays": 0
      }
    ]
  },
  {
    "id": "portugues-vigo",
    "routeIds": [
      "portugues"
    ],
    "stationId": "1495",
    "stationName": "Vigo Aeropuerto",
    "stationElevationM": 261,
    "trailElevationRangeM": [
      0,
      260
    ],
    "zoneName": "葡西邊境與加利西亞南岸",
    "zoneNameEn": "Minho Border & Southern Galicia Coast",
    "representativeTowns": "Caminha・Tui・Vigo・Redondela",
    "representativeTownsEn": "Caminha · Tui · Vigo · Redondela",
    "isWindExposed": true,
    "hasHighAltitudeDrop": false,
    "source": "AEMET",
    "sourcePeriod": "1991-2020",
    "monthly": [
      {
        "month": 1,
        "avgMeanC": 8.6,
        "avgHighC": 11.9,
        "avgLowC": 5.4,
        "precipMm": 208,
        "rainyDays": 14,
        "frostDays": 1.7,
        "snowDays": 0.1
      },
      {
        "month": 2,
        "avgMeanC": 9.6,
        "avgHighC": 13.3,
        "avgLowC": 5.8,
        "precipMm": 162,
        "rainyDays": 11.7,
        "frostDays": 0.9,
        "snowDays": 0.2
      },
      {
        "month": 3,
        "avgMeanC": 11.5,
        "avgHighC": 15.7,
        "avgLowC": 7.3,
        "precipMm": 141,
        "rainyDays": 11.6,
        "frostDays": 0.3,
        "snowDays": 0.1
      },
      {
        "month": 4,
        "avgMeanC": 12.4,
        "avgHighC": 16.6,
        "avgLowC": 8.2,
        "precipMm": 157,
        "rainyDays": 13.5,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 5,
        "avgMeanC": 14.6,
        "avgHighC": 18.8,
        "avgLowC": 10.4,
        "precipMm": 127,
        "rainyDays": 12.4,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 6,
        "avgMeanC": 17.9,
        "avgHighC": 22.5,
        "avgLowC": 13.2,
        "precipMm": 62,
        "rainyDays": 6.9,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 7,
        "avgMeanC": 19.6,
        "avgHighC": 24.4,
        "avgLowC": 14.8,
        "precipMm": 44,
        "rainyDays": 5,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 8,
        "avgMeanC": 19.8,
        "avgHighC": 24.7,
        "avgLowC": 15,
        "precipMm": 45,
        "rainyDays": 4.7,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 9,
        "avgMeanC": 18.3,
        "avgHighC": 22.8,
        "avgLowC": 13.8,
        "precipMm": 102,
        "rainyDays": 7.8,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 10,
        "avgMeanC": 15,
        "avgHighC": 18.8,
        "avgLowC": 11.2,
        "precipMm": 231,
        "rainyDays": 13.1,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 11,
        "avgMeanC": 11.5,
        "avgHighC": 14.9,
        "avgLowC": 8.2,
        "precipMm": 246,
        "rainyDays": 13.1,
        "frostDays": 0.1,
        "snowDays": 0
      },
      {
        "month": 12,
        "avgMeanC": 9.3,
        "avgHighC": 12.4,
        "avgLowC": 6.3,
        "precipMm": 262,
        "rainyDays": 15.1,
        "frostDays": 0.8,
        "snowDays": 0.1
      }
    ]
  },
  {
    "id": "portugues-pontevedra",
    "routeIds": [
      "portugues"
    ],
    "stationId": "1484C",
    "stationName": "Pontevedra",
    "stationElevationM": 108,
    "trailElevationRangeM": [
      10,
      200
    ],
    "zoneName": "龐特韋德拉共線段",
    "zoneNameEn": "Pontevedra & Caldas de Reis",
    "representativeTowns": "Pontevedra・Caldas de Reis",
    "representativeTownsEn": "Pontevedra · Caldas de Reis",
    "isWindExposed": false,
    "hasHighAltitudeDrop": false,
    "source": "AEMET",
    "sourcePeriod": "1991-2020",
    "monthly": [
      {
        "month": 1,
        "avgMeanC": 9.6,
        "avgHighC": 12.9,
        "avgLowC": 6.3,
        "precipMm": 178,
        "rainyDays": 14.3,
        "frostDays": 0.6,
        "snowDays": 0.1
      },
      {
        "month": 2,
        "avgMeanC": 10.4,
        "avgHighC": 14.2,
        "avgLowC": 6.5,
        "precipMm": 133,
        "rainyDays": 11.3,
        "frostDays": 0.4,
        "snowDays": 0
      },
      {
        "month": 3,
        "avgMeanC": 12.4,
        "avgHighC": 16.9,
        "avgLowC": 7.8,
        "precipMm": 120,
        "rainyDays": 11.2,
        "frostDays": 0.2,
        "snowDays": 0
      },
      {
        "month": 4,
        "avgMeanC": 13,
        "avgHighC": 17.6,
        "avgLowC": 8.4,
        "precipMm": 143,
        "rainyDays": 14.2,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 5,
        "avgMeanC": 15.8,
        "avgHighC": 20.6,
        "avgLowC": 10.9,
        "precipMm": 118,
        "rainyDays": 12,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 6,
        "avgMeanC": 18.6,
        "avgHighC": 23.8,
        "avgLowC": 13.4,
        "precipMm": 64,
        "rainyDays": 7,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 7,
        "avgMeanC": 20.4,
        "avgHighC": 25.9,
        "avgLowC": 14.9,
        "precipMm": 44,
        "rainyDays": 5.1,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 8,
        "avgMeanC": 20.6,
        "avgHighC": 26,
        "avgLowC": 15.2,
        "precipMm": 56,
        "rainyDays": 5.5,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 9,
        "avgMeanC": 18.8,
        "avgHighC": 23.7,
        "avgLowC": 13.8,
        "precipMm": 95,
        "rainyDays": 8.4,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 10,
        "avgMeanC": 15.7,
        "avgHighC": 19.6,
        "avgLowC": 11.7,
        "precipMm": 224,
        "rainyDays": 13.6,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 11,
        "avgMeanC": 12.1,
        "avgHighC": 15.4,
        "avgLowC": 8.7,
        "precipMm": 222,
        "rainyDays": 14.1,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 12,
        "avgMeanC": 10.3,
        "avgHighC": 13.4,
        "avgLowC": 7.1,
        "precipMm": 216,
        "rainyDays": 14.4,
        "frostDays": 0.5,
        "snowDays": 0
      }
    ]
  },
  {
    "id": "norte-basque",
    "routeIds": [
      "norte"
    ],
    "stationId": "1024E",
    "stationName": "Donostia / San Sebastián Igueldo",
    "stationElevationM": 251,
    "trailElevationRangeM": [
      0,
      350
    ],
    "zoneName": "巴斯克海岸段",
    "zoneNameEn": "Basque Coast",
    "representativeTowns": "Irún・San Sebastián・Bilbao",
    "representativeTownsEn": "Irún · San Sebastián · Bilbao",
    "isWindExposed": true,
    "hasHighAltitudeDrop": false,
    "source": "AEMET",
    "sourcePeriod": "1991-2020",
    "monthly": [
      {
        "month": 1,
        "avgMeanC": 8.5,
        "avgHighC": 11,
        "avgLowC": 5.9,
        "precipMm": 141,
        "rainyDays": 13.2,
        "frostDays": 2.6,
        "snowDays": 1.3
      },
      {
        "month": 2,
        "avgMeanC": 8.7,
        "avgHighC": 11.5,
        "avgLowC": 5.9,
        "precipMm": 110,
        "rainyDays": 11.6,
        "frostDays": 1.8,
        "snowDays": 1.6
      },
      {
        "month": 3,
        "avgMeanC": 10.3,
        "avgHighC": 13.4,
        "avgLowC": 7.2,
        "precipMm": 113,
        "rainyDays": 12.4,
        "frostDays": 0.6,
        "snowDays": 0.3
      },
      {
        "month": 4,
        "avgMeanC": 11.3,
        "avgHighC": 14.5,
        "avgLowC": 8.1,
        "precipMm": 138,
        "rainyDays": 13.4,
        "frostDays": 0,
        "snowDays": 0.1
      },
      {
        "month": 5,
        "avgMeanC": 14.4,
        "avgHighC": 17.7,
        "avgLowC": 11.1,
        "precipMm": 120,
        "rainyDays": 12.2,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 6,
        "avgMeanC": 16.9,
        "avgHighC": 20,
        "avgLowC": 13.8,
        "precipMm": 90,
        "rainyDays": 10.6,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 7,
        "avgMeanC": 18.9,
        "avgHighC": 21.8,
        "avgLowC": 16,
        "precipMm": 86,
        "rainyDays": 9.8,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 8,
        "avgMeanC": 19.5,
        "avgHighC": 22.5,
        "avgLowC": 16.5,
        "precipMm": 117,
        "rainyDays": 10.5,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 9,
        "avgMeanC": 18,
        "avgHighC": 21.1,
        "avgLowC": 14.8,
        "precipMm": 111,
        "rainyDays": 10.1,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 10,
        "avgMeanC": 15.5,
        "avgHighC": 18.5,
        "avgLowC": 12.4,
        "precipMm": 159,
        "rainyDays": 11.8,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 11,
        "avgMeanC": 11.3,
        "avgHighC": 14,
        "avgLowC": 8.7,
        "precipMm": 169,
        "rainyDays": 13,
        "frostDays": 0.5,
        "snowDays": 0.2
      },
      {
        "month": 12,
        "avgMeanC": 9.1,
        "avgHighC": 11.6,
        "avgLowC": 6.6,
        "precipMm": 151,
        "rainyDays": 12.4,
        "frostDays": 1.6,
        "snowDays": 0.5
      }
    ]
  },
  {
    "id": "norte-cantabria",
    "routeIds": [
      "norte"
    ],
    "stationId": "1109",
    "stationName": "Santander Aeropuerto",
    "stationElevationM": 3,
    "trailElevationRangeM": [
      0,
      250
    ],
    "zoneName": "坎塔布里亞海岸段",
    "zoneNameEn": "Cantabria Coast",
    "representativeTowns": "Laredo・Santander・Santillana",
    "representativeTownsEn": "Laredo · Santander · Santillana",
    "isWindExposed": true,
    "hasHighAltitudeDrop": false,
    "source": "AEMET",
    "sourcePeriod": "1991-2020",
    "monthly": [
      {
        "month": 1,
        "avgMeanC": 9.7,
        "avgHighC": 13.6,
        "avgLowC": 5.8,
        "precipMm": 106,
        "rainyDays": 12.3,
        "frostDays": 2.1,
        "snowDays": 0.4
      },
      {
        "month": 2,
        "avgMeanC": 9.8,
        "avgHighC": 13.8,
        "avgLowC": 5.7,
        "precipMm": 92,
        "rainyDays": 11.1,
        "frostDays": 1.2,
        "snowDays": 0.3
      },
      {
        "month": 3,
        "avgMeanC": 11.3,
        "avgHighC": 15.7,
        "avgLowC": 7,
        "precipMm": 88,
        "rainyDays": 9.9,
        "frostDays": 0.4,
        "snowDays": 0.1
      },
      {
        "month": 4,
        "avgMeanC": 12.4,
        "avgHighC": 16.6,
        "avgLowC": 8.3,
        "precipMm": 102,
        "rainyDays": 11.9,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 5,
        "avgMeanC": 15.1,
        "avgHighC": 19.1,
        "avgLowC": 11.1,
        "precipMm": 78,
        "rainyDays": 10.4,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 6,
        "avgMeanC": 17.8,
        "avgHighC": 21.6,
        "avgLowC": 13.9,
        "precipMm": 58,
        "rainyDays": 7.6,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 7,
        "avgMeanC": 19.8,
        "avgHighC": 23.6,
        "avgLowC": 16,
        "precipMm": 52,
        "rainyDays": 7.3,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 8,
        "avgMeanC": 20.3,
        "avgHighC": 24.2,
        "avgLowC": 16.4,
        "precipMm": 73,
        "rainyDays": 7.6,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 9,
        "avgMeanC": 18.6,
        "avgHighC": 22.8,
        "avgLowC": 14.4,
        "precipMm": 83,
        "rainyDays": 8.9,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 10,
        "avgMeanC": 16.1,
        "avgHighC": 20.3,
        "avgLowC": 11.8,
        "precipMm": 120,
        "rainyDays": 11.1,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 11,
        "avgMeanC": 12.5,
        "avgHighC": 16.3,
        "avgLowC": 8.7,
        "precipMm": 157,
        "rainyDays": 13.3,
        "frostDays": 0.4,
        "snowDays": 0
      },
      {
        "month": 12,
        "avgMeanC": 10.5,
        "avgHighC": 14.2,
        "avgLowC": 6.7,
        "precipMm": 118,
        "rainyDays": 12.1,
        "frostDays": 2,
        "snowDays": 0.1
      }
    ]
  },
  {
    "id": "norte-asturias",
    "routeIds": [
      "norte"
    ],
    "stationId": "1212E",
    "stationName": "Asturias Aeropuerto",
    "stationElevationM": 127,
    "trailElevationRangeM": [
      0,
      300
    ],
    "zoneName": "阿斯圖里亞斯海岸段",
    "zoneNameEn": "Asturias Coast",
    "representativeTowns": "Llanes・Gijón・Ribadeo",
    "representativeTownsEn": "Llanes · Gijón · Ribadeo",
    "isWindExposed": true,
    "hasHighAltitudeDrop": false,
    "source": "AEMET",
    "sourcePeriod": "1991-2020",
    "monthly": [
      {
        "month": 1,
        "avgMeanC": 9.4,
        "avgHighC": 12.9,
        "avgLowC": 5.9,
        "precipMm": 103,
        "rainyDays": 12.2,
        "frostDays": 1,
        "snowDays": 0.4
      },
      {
        "month": 2,
        "avgMeanC": 9.4,
        "avgHighC": 13.1,
        "avgLowC": 5.7,
        "precipMm": 88,
        "rainyDays": 11.1,
        "frostDays": 0.9,
        "snowDays": 0.5
      },
      {
        "month": 3,
        "avgMeanC": 10.7,
        "avgHighC": 14.6,
        "avgLowC": 6.8,
        "precipMm": 82,
        "rainyDays": 10.8,
        "frostDays": 0.3,
        "snowDays": 0
      },
      {
        "month": 4,
        "avgMeanC": 11.3,
        "avgHighC": 15.1,
        "avgLowC": 7.5,
        "precipMm": 99,
        "rainyDays": 12.8,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 5,
        "avgMeanC": 13.6,
        "avgHighC": 17.3,
        "avgLowC": 10,
        "precipMm": 79,
        "rainyDays": 11.9,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 6,
        "avgMeanC": 16.2,
        "avgHighC": 19.6,
        "avgLowC": 12.8,
        "precipMm": 61,
        "rainyDays": 7.8,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 7,
        "avgMeanC": 18.2,
        "avgHighC": 21.5,
        "avgLowC": 14.8,
        "precipMm": 47,
        "rainyDays": 7.2,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 8,
        "avgMeanC": 18.8,
        "avgHighC": 22.2,
        "avgLowC": 15.3,
        "precipMm": 60,
        "rainyDays": 7.3,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 9,
        "avgMeanC": 17.4,
        "avgHighC": 21.2,
        "avgLowC": 13.7,
        "precipMm": 73,
        "rainyDays": 8.3,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 10,
        "avgMeanC": 15.1,
        "avgHighC": 18.7,
        "avgLowC": 11.3,
        "precipMm": 116,
        "rainyDays": 11.5,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 11,
        "avgMeanC": 11.8,
        "avgHighC": 15.3,
        "avgLowC": 8.4,
        "precipMm": 134,
        "rainyDays": 12.9,
        "frostDays": 0.1,
        "snowDays": 0
      },
      {
        "month": 12,
        "avgMeanC": 9.9,
        "avgHighC": 13.3,
        "avgLowC": 6.5,
        "precipMm": 117,
        "rainyDays": 13.6,
        "frostDays": 0.6,
        "snowDays": 0.1
      }
    ]
  },
  {
    "id": "norte-galicia-inland",
    "routeIds": [
      "norte"
    ],
    "stationId": "1505",
    "stationName": "Lugo Aeropuerto",
    "stationElevationM": 445,
    "trailElevationRangeM": [
      300,
      650
    ],
    "zoneName": "加利西亞內陸高地段",
    "zoneNameEn": "Inland Galicia (Lugo)",
    "representativeTowns": "Mondoñedo・Vilalba・Sobrado",
    "representativeTownsEn": "Mondoñedo · Vilalba · Sobrado",
    "isWindExposed": false,
    "hasHighAltitudeDrop": false,
    "source": "AEMET",
    "sourcePeriod": "1991-2020",
    "monthly": [
      {
        "month": 1,
        "avgMeanC": 6.2,
        "avgHighC": 10.6,
        "avgLowC": 1.8,
        "precipMm": 114,
        "rainyDays": 14,
        "frostDays": 11.5,
        "snowDays": 1.7
      },
      {
        "month": 2,
        "avgMeanC": 7,
        "avgHighC": 12.3,
        "avgLowC": 1.7,
        "precipMm": 87,
        "rainyDays": 11.1,
        "frostDays": 10.7,
        "snowDays": 1.7
      },
      {
        "month": 3,
        "avgMeanC": 9.2,
        "avgHighC": 15.2,
        "avgLowC": 3,
        "precipMm": 80,
        "rainyDays": 11.2,
        "frostDays": 6.3,
        "snowDays": 0.8
      },
      {
        "month": 4,
        "avgMeanC": 10,
        "avgHighC": 15.7,
        "avgLowC": 4.3,
        "precipMm": 102,
        "rainyDays": 14,
        "frostDays": 2.8,
        "snowDays": 0.7
      },
      {
        "month": 5,
        "avgMeanC": 13.2,
        "avgHighC": 19.3,
        "avgLowC": 7.2,
        "precipMm": 81,
        "rainyDays": 11.6,
        "frostDays": 0.4,
        "snowDays": 0
      },
      {
        "month": 6,
        "avgMeanC": 16.1,
        "avgHighC": 22.3,
        "avgLowC": 9.9,
        "precipMm": 52,
        "rainyDays": 6.6,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 7,
        "avgMeanC": 18.2,
        "avgHighC": 24.4,
        "avgLowC": 12,
        "precipMm": 34,
        "rainyDays": 4.6,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 8,
        "avgMeanC": 18.5,
        "avgHighC": 25.2,
        "avgLowC": 11.8,
        "precipMm": 36,
        "rainyDays": 5.2,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 9,
        "avgMeanC": 16.4,
        "avgHighC": 23,
        "avgLowC": 9.8,
        "precipMm": 68,
        "rainyDays": 7.7,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 10,
        "avgMeanC": 12.9,
        "avgHighC": 18.3,
        "avgLowC": 7.6,
        "precipMm": 137,
        "rainyDays": 13.6,
        "frostDays": 0.7,
        "snowDays": 0
      },
      {
        "month": 11,
        "avgMeanC": 8.9,
        "avgHighC": 13.3,
        "avgLowC": 4.5,
        "precipMm": 144,
        "rainyDays": 14.3,
        "frostDays": 5.1,
        "snowDays": 0.3
      },
      {
        "month": 12,
        "avgMeanC": 6.9,
        "avgHighC": 11,
        "avgLowC": 2.7,
        "precipMm": 134,
        "rainyDays": 13.8,
        "frostDays": 10.2,
        "snowDays": 1
      }
    ]
  },
  {
    "id": "finisterre-atlantic",
    "routeIds": [
      "finisterre"
    ],
    "stationId": "1387",
    "stationName": "A Coruña",
    "stationElevationM": 58,
    "trailElevationRangeM": [
      0,
      350
    ],
    "zoneName": "世界盡頭海岸段",
    "zoneNameEn": "Finisterre & Muxía Coast",
    "representativeTowns": "Negreira・Finisterre・Muxía",
    "representativeTownsEn": "Negreira · Finisterre · Muxía",
    "isWindExposed": true,
    "hasHighAltitudeDrop": false,
    "altitudeNote": "大西洋海角終年海風強勁，濕冷時體感溫度明顯更低，建議備妥防風雨衣。",
    "altitudeNoteEn": "Atlantic capes are exposed to strong sea winds year-round; windproof rain gear is essential.",
    "source": "AEMET",
    "sourcePeriod": "1991-2020",
    "monthly": [
      {
        "month": 1,
        "avgMeanC": 10.8,
        "avgHighC": 13.5,
        "avgLowC": 8.1,
        "precipMm": 112,
        "rainyDays": 14,
        "frostDays": 0.1,
        "snowDays": 0.1
      },
      {
        "month": 2,
        "avgMeanC": 11.1,
        "avgHighC": 14.1,
        "avgLowC": 8,
        "precipMm": 88,
        "rainyDays": 12,
        "frostDays": 0,
        "snowDays": 0.1
      },
      {
        "month": 3,
        "avgMeanC": 12.4,
        "avgHighC": 15.5,
        "avgLowC": 9.2,
        "precipMm": 75,
        "rainyDays": 11.5,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 4,
        "avgMeanC": 13,
        "avgHighC": 16.2,
        "avgLowC": 9.9,
        "precipMm": 88,
        "rainyDays": 13.3,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 5,
        "avgMeanC": 15,
        "avgHighC": 18.1,
        "avgLowC": 12,
        "precipMm": 74,
        "rainyDays": 11.1,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 6,
        "avgMeanC": 17.4,
        "avgHighC": 20.6,
        "avgLowC": 14.3,
        "precipMm": 44,
        "rainyDays": 6.7,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 7,
        "avgMeanC": 19,
        "avgHighC": 22.1,
        "avgLowC": 15.9,
        "precipMm": 34,
        "rainyDays": 5.5,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 8,
        "avgMeanC": 19.6,
        "avgHighC": 22.8,
        "avgLowC": 16.4,
        "precipMm": 35,
        "rainyDays": 5.7,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 9,
        "avgMeanC": 18.6,
        "avgHighC": 22,
        "avgLowC": 15.2,
        "precipMm": 64,
        "rainyDays": 7.9,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 10,
        "avgMeanC": 16.1,
        "avgHighC": 19.1,
        "avgLowC": 13,
        "precipMm": 130,
        "rainyDays": 12.9,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 11,
        "avgMeanC": 13.3,
        "avgHighC": 16,
        "avgLowC": 10.5,
        "precipMm": 138,
        "rainyDays": 14.3,
        "frostDays": 0,
        "snowDays": 0
      },
      {
        "month": 12,
        "avgMeanC": 11.5,
        "avgHighC": 14.1,
        "avgLowC": 8.9,
        "precipMm": 131,
        "rainyDays": 14.6,
        "frostDays": 0,
        "snowDays": 0
      }
    ]
  }
]

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
