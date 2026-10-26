import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { defaultActiveCategories, usePackingStore } from '@/stores/packing'
import { useScheduleStore } from '@/stores/schedule'
import {
  createFullBackupJson,
  decodeCompactUrlPayload,
  encodeCompactUrlPayload,
  parseBackupJson,
} from '@/utils/syncCodec'

describe('syncCodec 跨裝置同步與備份編解碼測試', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('TC-01: 行程與裝備濃縮編碼後解碼，應 100% 無損還原休息日、世界盡頭延伸段與自訂裝備', () => {
    const scheduleStore = useScheduleStore()
    const packingStore = usePackingStore()

    // 設定出發日與插入第 3 天休息日、開啟世界盡頭延伸段
    scheduleStore.updateDraftConfig({
      startDate: '2026-05-10',
      targetDays: 33,
      finisterreOption: 'FINISTERRE_ONLY',
      finisterreDays: 3,
    })
    scheduleStore.insertRestDay(3)

    // 修改體重、官方裝備重量與新增自訂裝備
    packingStore.bodyWeightKg = 68
    packingStore.updateItemWeight('BACKPACK_MAIN', 950)
    packingStore.toggleWornOnBody('HIKING_SHIRT')
    packingStore.addCustomItem({
      chineseName: '超輕碳纖登山杖',
      englishName: 'Carbon Poles',
      spanishName: 'Bastones',
      category: 'OTHER',
      priority: 'OPTIONAL',
      referenceRangeText: '320g',
      isChecked: true,
      unitWeightGrams: 320,
      quantity: 1,
      isWornOnBody: false,
    })

    const token = encodeCompactUrlPayload({
      includeSchedule: true,
      includePacking: true,
      scheduleSource: {
        routeId: scheduleStore.currentRouteId,
        draft: scheduleStore.currentDraft,
        mainStages: scheduleStore.mainStages[scheduleStore.currentRouteId],
        extensionStages: scheduleStore.extensionStages[scheduleStore.currentRouteId],
      },
      packingSource: {
        bodyWeightKg: packingStore.bodyWeightKg,
        userItemStates: packingStore.userItemStates,
        customItems: packingStore.customItems,
        activeCategories: packingStore.activeCategories,
        categoryOrder: packingStore.categoryOrder,
      },
    })

    // 確認濃縮後 Token 長度遠低於 QR Code 掃描上限 (1,200 字元)
    expect(token.length).toBeLessThan(800)

    const decoded = decodeCompactUrlPayload(token)
    expect(decoded.ok).toBe(true)
    if (!decoded.ok) return

    const sched = decoded.data.schedule!
    expect(sched.currentRouteId).toBe('frances')
    expect(sched.drafts.frances?.startDate).toBe('2026-05-10')
    expect(sched.mainStages.frances?.[2]?.isRestDay).toBe(true)
    expect(sched.mainStages.frances?.[2]?.distanceKm).toBe(0)
    expect(sched.extensionStages.frances?.length).toBe(3)

    const pack = decoded.data.packing!
    expect(pack.bodyWeightKg).toBe(68)
    expect(pack.userItemStates.BACKPACK_MAIN?.unitWeightGrams).toBe(950)
    expect(pack.userItemStates.HIKING_SHIRT?.isWornOnBody).toBe(true)
    expect(pack.customItems.length).toBe(1)
    expect(pack.customItems[0].chineseName).toBe('超輕碳纖登山杖')
    expect(pack.customItems[0].unitWeightGrams).toBe(320)
  })

  it('TC-02: 勾選範圍過濾與隱私隔離 — 僅勾選行程時，Payload 不得包含體重與裝備資料', () => {
    const scheduleStore = useScheduleStore()
    const packingStore = usePackingStore()
    packingStore.bodyWeightKg = 75

    const token = encodeCompactUrlPayload({
      includeSchedule: true,
      includePacking: false,
      scheduleSource: {
        routeId: scheduleStore.currentRouteId,
        draft: scheduleStore.currentDraft,
        mainStages: scheduleStore.mainStages[scheduleStore.currentRouteId],
        extensionStages: [],
      },
      packingSource: {
        bodyWeightKg: packingStore.bodyWeightKg,
        userItemStates: packingStore.userItemStates,
        customItems: packingStore.customItems,
        activeCategories: packingStore.activeCategories,
        categoryOrder: packingStore.categoryOrder,
      },
    })

    const decoded = decodeCompactUrlPayload(token)
    expect(decoded.ok).toBe(true)
    if (!decoded.ok) return

    expect(decoded.data.schedule).toBeDefined()
    expect(decoded.data.packing).toBeUndefined()
  })

  it('TC-03: 階段九邊界驗證 (Day 1 原地休息日) 與冬季封山強制鎖防禦', () => {
    // 構造自 SARRIA 出發且 Day 1 原地休息 (ms[0] === sw)，同時測試冬季 SJPP 強制轉為 valcarlos
    const tokenSarriaRest = encodeCompactUrlPayload({
      includeSchedule: true,
      includePacking: false,
      scheduleSource: {
        routeId: 'frances',
        draft: {
          routeId: 'frances',
          branchId: 'napoleon',
          startWaypointId: 'SARRIA',
          endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
          startDate: '2026-06-01',
          targetDays: 3,
          dailyKmQuota: 25,
          restDays: [1],
          finisterreOption: 'NONE',
          updatedAt: new Date().toISOString(),
        },
        mainStages: [
          {
            dayIndex: 1,
            date: '2026-06-01',
            startWaypointId: 'SARRIA',
            endWaypointId: 'SARRIA',
            passedWaypointIds: [],
            distanceKm: 0,
            elevationGainM: 0,
            elevationLossM: 0,
            isRestDay: true,
          },
          {
            dayIndex: 2,
            date: '2026-06-02',
            startWaypointId: 'SARRIA',
            endWaypointId: 'PORTOMARIN',
            passedWaypointIds: [],
            distanceKm: 22.2,
            elevationGainM: 230,
            elevationLossM: 320,
            isRestDay: false,
          },
          {
            dayIndex: 3,
            date: '2026-06-03',
            startWaypointId: 'PORTOMARIN',
            endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
            passedWaypointIds: [],
            distanceKm: 91.5,
            elevationGainM: 1200,
            elevationLossM: 1300,
            isRestDay: false,
          },
        ],
        extensionStages: [],
      },
    })

    const resSarria = decodeCompactUrlPayload(tokenSarriaRest)
    expect(resSarria.ok).toBe(true)
    if (resSarria.ok) {
      const stages = resSarria.data.schedule!.mainStages.frances!
      expect(stages[0].isRestDay).toBe(true)
      expect(stages[0].startWaypointId).toBe('SARRIA')
      expect(stages[0].endWaypointId).toBe('SARRIA')
      expect(stages[0].distanceKm).toBe(0)
    }

    // 測試冬季 12 月自 SJPP 出發但偽造 napoleon 分支，解碼時應自動強制修正為 valcarlos
    const tokenWinter = encodeCompactUrlPayload({
      includeSchedule: true,
      includePacking: false,
      scheduleSource: {
        routeId: 'frances',
        draft: {
          routeId: 'frances',
          branchId: 'napoleon',
          startWaypointId: 'SJPP',
          endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
          startDate: '2026-12-20',
          targetDays: 2,
          dailyKmQuota: 25,
          restDays: [],
          finisterreOption: 'NONE',
          updatedAt: new Date().toISOString(),
        },
        mainStages: [
          {
            dayIndex: 1,
            date: '2026-12-20',
            startWaypointId: 'SJPP',
            endWaypointId: 'RONCESVALLES',
            passedWaypointIds: [],
            distanceKm: 25.1,
            elevationGainM: 1250,
            elevationLossM: 480,
            isRestDay: false,
          },
          {
            dayIndex: 2,
            date: '2026-12-21',
            startWaypointId: 'RONCESVALLES',
            endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
            passedWaypointIds: [],
            distanceKm: 750,
            elevationGainM: 5000,
            elevationLossM: 5000,
            isRestDay: false,
          },
        ],
        extensionStages: [],
      },
    })

    const resWinter = decodeCompactUrlPayload(tokenWinter)
    expect(resWinter.ok).toBe(true)
    if (resWinter.ok) {
      expect(resWinter.data.schedule!.drafts.frances?.branchId).toBe('valcarlos')
      expect(resWinter.data.schedule!.mainStages.frances?.[0].routeVariant).toBe('VALCARLOS')
    }
  })

  it('TC-04: 破損字串、非本專案 JSON 與 Store 局部路線覆寫防禦', () => {
    expect(decodeCompactUrlPayload('').ok).toBe(false)
    expect(decodeCompactUrlPayload('invalid_corrupted_token_$$$').ok).toBe(false)
    expect(parseBackupJson('{"hello":"world"}').ok).toBe(false)

    // 驗證匯入單一路線時，不會洗掉接收端其他路線之草稿
    const scheduleStore = useScheduleStore()
    scheduleStore.switchRoute('portugues')
    scheduleStore.updateDraftConfig({ startDate: '2026-09-01', targetDays: 14 })

    const backupJson = createFullBackupJson({
      includeSchedule: true,
      includePacking: true,
      scheduleSource: {
        currentRouteId: 'norte',
        drafts: {
          norte: {
            routeId: 'norte',
            startWaypointId: 'norte:irun',
            endWaypointId: 'norte:santiago',
            startDate: '2026-07-15',
            targetDays: 35,
            dailyKmQuota: 23.6,
            restDays: [],
            finisterreOption: 'NONE',
            updatedAt: new Date().toISOString(),
          },
        } as any,
        mainStages: {
          norte: scheduleStore.mainStages.norte,
        } as any,
        extensionStages: {
          norte: [],
        } as any,
      },
      packingSource: {
        version: 2,
        bodyWeightKg: 55,
        userItemStates: {},
        customItems: [],
        activeCategories: [...defaultActiveCategories],
        categoryOrder: [...defaultActiveCategories],
      },
    })

    const parsed = parseBackupJson(backupJson)
    expect(parsed.ok).toBe(true)
    if (parsed.ok && parsed.data.schedule) {
      scheduleStore.applyImportedSchedule(parsed.data.schedule)
      expect(scheduleStore.currentRouteId).toBe('norte')
      expect(scheduleStore.drafts.norte.startDate).toBe('2026-07-15')
      // 原先編輯過的葡萄牙之路草稿必須完好無損保留
      expect(scheduleStore.drafts.portugues.startDate).toBe('2026-09-01')
      expect(scheduleStore.drafts.portugues.targetDays).toBe(14)
    }
  })

  it('TC-05: 類別不顯示連動防禦 — 當取消顯示某分類時，該分類下的所有裝備在分享與匯出時應自動判定為不準備 (isChecked = false)', () => {
    const packingStore = usePackingStore()

    // 預設 SLEEP 分類下有睡袋 (SLEEPING_BAG)
    expect(packingStore.packingItems.find((i) => i.id === 'SLEEPING_BAG')?.isChecked).toBe(true)

    // 新增屬於 SLEEP 分類的自訂裝備
    packingStore.addCustomItem({
      chineseName: '羽絨眼罩',
      englishName: 'Eye Mask',
      category: 'SLEEP',
      priority: 'OPTIONAL',
      referenceRangeText: '30g',
      isChecked: true,
      unitWeightGrams: 30,
      quantity: 1,
      isWornOnBody: false,
    })

    // 使用者在類別篩選中將 SLEEP 類別排除 (不顯示該類別)
    packingStore.toggleCategory('SLEEP')
    expect(packingStore.activeCategories.includes('SLEEP')).toBe(false)

    // 進行分享打包
    const token = encodeCompactUrlPayload({
      includeSchedule: false,
      includePacking: true,
      packingSource: {
        bodyWeightKg: packingStore.bodyWeightKg,
        userItemStates: packingStore.userItemStates,
        customItems: packingStore.customItems,
        activeCategories: packingStore.activeCategories,
        categoryOrder: packingStore.categoryOrder,
      },
    })

    // 解碼驗證分享出去的資料，未啟用的分類下的物品確實皆為 isChecked: false
    const res = decodeCompactUrlPayload(token)
    expect(res.ok).toBe(true)
    if (res.ok && res.data.packing) {
      expect(res.data.packing.activeCategories.includes('SLEEP')).toBe(false)
      expect(res.data.packing.summary.activeCategoryCount).toBe(8)
      expect(res.data.packing.summary.excludedCategoryNames).toEqual(['睡眠防護'])
      expect(res.data.packing.userItemStates.SLEEPING_BAG?.isChecked).toBe(false)
      const customEyeMask = res.data.packing.customItems.find((i) => i.chineseName === '羽絨眼罩')
      expect(customEyeMask?.isChecked).toBe(false)

      // 模擬接收端設備套用匯入，驗證未啟用的分類不會被強制補齊顯示在畫面上
      const receiverStore = usePackingStore()
      receiverStore.applyImportedPacking(res.data.packing)
      expect(receiverStore.activeCategories.includes('SLEEP')).toBe(false)
      expect(receiverStore.activeCategories.length).toBe(8)
    }
  })
})
