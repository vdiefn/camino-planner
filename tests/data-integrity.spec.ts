import { describe, it, expect } from 'vitest'
import { waypoints, packingItems, transportRoutes, accommodations } from '../src/data'
import type { PackingCategory } from '../src/types/camino'

describe('Camino Francés 靜態資料完整性與防呆檢驗', () => {
  // --- 1. 城鎮航點檢驗 ---
  describe('城鎮航點 (Waypoints)', () => {
    it('航點 ID 必須全域唯一且不可為空', () => {
      const ids = waypoints.map((w) => w.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
      ids.forEach((id) => expect(id.trim().length).toBeGreaterThan(0))
    })

    it('起點必須為 SJPP (0km)，終點必須為 Santiago de Compostela (770~790km)', () => {
      const startPoint = waypoints.find((w) => w.id === 'SJPP')
      const endPoint = waypoints.find((w) => w.id === 'SANTIAGO_DE_COMPOSTELA')

      expect(startPoint).toBeDefined()
      expect(startPoint?.cumulativeKm).toBe(0)

      expect(endPoint).toBeDefined()
      expect(endPoint?.cumulativeKm).toBeGreaterThanOrEqual(770)
      expect(endPoint?.cumulativeKm).toBeLessThanOrEqual(790)
    })

    it('主線航點的累積里程必須嚴格單調遞增', () => {
      const commonWaypoints = waypoints.filter((w) => w.routeVariant === 'COMMON' || !w.routeVariant)
      for (let i = 1; i < commonWaypoints.length; i++) {
        expect(commonWaypoints[i].cumulativeKm).toBeGreaterThan(commonWaypoints[i - 1].cumulativeKm)
      }
    })

    it('所有航點必須具備有效的 GPS 經緯度座標', () => {
      waypoints.forEach((w) => {
        expect(w.coordinates.lat).toBeGreaterThan(40.0)
        expect(w.coordinates.lat).toBeLessThan(44.0)
        expect(w.coordinates.lng).toBeGreaterThan(-9.5)
        expect(w.coordinates.lng).toBeLessThan(0.0)
      })
    })

    it('Day 1 雙路線必須具備正確的分歧標記與代表性航點', () => {
      const napoleonPoint = waypoints.find((w) => w.id === 'ORISSON')
      const valcarlosPoint = waypoints.find((w) => w.id === 'VALCARLOS')

      expect(napoleonPoint?.routeVariant).toBe('NAPOLEON')
      expect(napoleonPoint?.elevationM).toBeGreaterThanOrEqual(750) // Orisson 約 792m

      expect(valcarlosPoint?.routeVariant).toBe('VALCARLOS')
      expect(valcarlosPoint?.elevationM).toBeLessThan(500) // Valcarlos 谷地約 365m
    })
  })

  // --- 2. 任意起訖點區段切片檢驗 ---
  describe('任意起訖點區段切片能力', () => {
    it('支援常見分段：Sarria ➔ Santiago (最後 100km，約 115km)', () => {
      const sarria = waypoints.find((w) => w.id === 'SARRIA')!
      const santiago = waypoints.find((w) => w.id === 'SANTIAGO_DE_COMPOSTELA')!
      expect(sarria).toBeDefined()
      expect(santiago).toBeDefined()
      const distance = santiago.cumulativeKm - sarria.cumulativeKm
      expect(distance).toBeGreaterThanOrEqual(110)
      expect(distance).toBeLessThanOrEqual(120)
    })

    it('支援自訂起訖點：Pamplona ➔ Burgos (約 219km)', () => {
      const pamplona = waypoints.find((w) => w.id === 'PAMPLONA')!
      const burgos = waypoints.find((w) => w.id === 'BURGOS')!
      expect(pamplona).toBeDefined()
      expect(burgos).toBeDefined()
      const distance = burgos.cumulativeKm - pamplona.cumulativeKm
      expect(distance).toBeGreaterThan(200)
    })
  })

  // --- 3. 裝備項目檢驗 ---
  describe('裝備項目 (Packing Items)', () => {
    const validCategories: PackingCategory[] = [
      'PACK',
      'CLOTHING',
      'FOOTWEAR',
      'SLEEP',
      'HYGIENE',
      'MEDICAL',
      'ELECTRONICS',
      'DOCS',
      'OTHER',
    ]

    it('所有裝備項目的分類必須屬於定義的 9 大單一名詞分類', () => {
      expect(packingItems.length).toBeGreaterThanOrEqual(20)
      packingItems.forEach((item) => {
        expect(validCategories).toContain(item.category)
      })
    })

    it('裝備重量與數量必須為合法非負數與大於等於1', () => {
      packingItems.forEach((item) => {
        expect(item.unitWeightGrams).toBeGreaterThanOrEqual(0)
        expect(item.quantity).toBeGreaterThanOrEqual(1)
        expect(item.chineseName.trim().length).toBeGreaterThan(0)
        expect(item.englishName.trim().length).toBeGreaterThan(0)
      })
    })

    it('穿在身上的特定項目（如登山鞋、遮陽帽）預設 isWornOnBody 應為 true', () => {
      const boots = packingItems.find((item) => item.id === 'HIKING_BOOTS')
      expect(boots).toBeDefined()
      expect(boots?.isWornOnBody).toBe(true)
    })
  })

  // --- 4. 起點交通轉乘檢驗 ---
  describe('起點交通方案 (Transport Routes)', () => {
    it('必須涵蓋巴黎 (PARIS)、馬德里 (MADRID)、巴塞隆納 (BARCELONA) 三大起點', () => {
      const cities = transportRoutes.map((r) => r.originCity)
      expect(cities).toContain('PARIS')
      expect(cities).toContain('MADRID')
      expect(cities).toContain('BARCELONA')
    })

    it('交通步驟 stepOrder 必須從 1 開始且相鄰步驟嚴格連續遞增', () => {
      transportRoutes.forEach((route) => {
        expect(route.steps.length).toBeGreaterThanOrEqual(2)
        expect(route.steps[0].stepOrder).toBe(1)
        for (let i = 1; i < route.steps.length; i++) {
          expect(route.steps[i].stepOrder).toBe(route.steps[i - 1].stepOrder + 1)
        }
      })
    })

    it('每個交通步驟的耗時必須 > 0 分鐘，且票價 min <= max 且非負', () => {
      const allSteps = transportRoutes.flatMap((r) => r.steps)
      expect(allSteps.length).toBeGreaterThan(0)
      allSteps.forEach((step) => {
        expect(step.durationMinutes).toBeGreaterThan(0)
        expect(step.estimatedCostEur.min).toBeGreaterThanOrEqual(0)
        expect(step.estimatedCostEur.max).toBeGreaterThanOrEqual(step.estimatedCostEur.min)
      })
    })

    it('交通步驟提供的購票連結 bookingUrl 必須為合法 http/https 格式', () => {
      const stepsWithBooking = transportRoutes
        .flatMap((r) => r.steps)
        .filter((s) => s.bookingUrl !== undefined)

      expect(stepsWithBooking.length).toBeGreaterThan(0)
      stepsWithBooking.forEach((step) => {
        expect(step.bookingUrl).toMatch(/^https?:\/\//)
      })
    })
  })

  // --- 5. 庇護所住宿檢驗 ---
  describe('庇護所住宿 (Accommodations)', () => {
    it('所有住宿點的 waypointId 必須能對應到現有的城鎮航點', () => {
      const waypointIds = new Set(waypoints.map((w) => w.id))
      expect(accommodations.length).toBeGreaterThan(0)
      accommodations.forEach((acc) => {
        expect(waypointIds.has(acc.waypointId)).toBe(true)
      })
    })

    it('每間庇護所住宿至少必須具備一種聯絡方式 (Booking / 官網 / 電話 / WhatsApp)', () => {
      accommodations.forEach((acc) => {
        const hasContact = Boolean(
          acc.bookingChannels.bookingComUrl ||
            acc.bookingChannels.officialWebsiteUrl ||
            acc.bookingChannels.phone ||
            acc.bookingChannels.whatsapp,
        )
        expect(hasContact).toBe(true)
      })
    })
  })
})
