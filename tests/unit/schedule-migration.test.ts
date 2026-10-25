import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useScheduleStore } from '@/stores/schedule'

describe('Schedule Migration & Multi-Drafts - 快取遷移與草稿隔離測試', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('1. 初始狀態下預設為法國之路，且 drafts 具備 3 條主路線', () => {
    const store = useScheduleStore()
    expect(store.currentRouteId).toBe('frances')
    expect(store.drafts.frances).toBeDefined()
    expect(store.drafts.portugues).toBeDefined()
    expect(store.drafts.norte).toBeDefined()
    expect(store.stages.length).toBe(33)
  })

  it('2. 切換路線至葡萄牙之路時，草稿獨立保存且主線分段正確切換', () => {
    const store = useScheduleStore()
    store.switchRoute('portugues')
    expect(store.currentRouteId).toBe('portugues')
    expect(store.stages[0].startWaypointId).toBe('portugues:porto')
    expect(store.stages[store.stages.length - 1].endWaypointId).toBe('portugues:santiago')

    // 切回法國之路，法國之路行程完好
    store.switchRoute('frances')
    expect(store.currentRouteId).toBe('frances')
    expect(store.stages[0].startWaypointId).toBe('SJPP')
    expect(store.stages[store.stages.length - 1].endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
  })

  it('3. 世界盡頭延伸段啟閉、天數夾擠 (Clamp) 與動態連動重算', () => {
    const store = useScheduleStore()
    store.setFinisterreOption('FINISTERRE_ONLY')
    expect(store.stages.length).toBe(36) // 33 + 3
    const extensionStages = store.stages.filter((s) => s.isExtensionStage)
    expect(extensionStages).toHaveLength(3)
    expect(extensionStages[extensionStages.length - 1].endWaypointId).toBe('finisterre:fisterra')

    // 單線天數夾擠邊界：最小 2 天、最大 8 天
    store.setFinisterreDays(1)
    expect(store.currentDraft.finisterreDays).toBe(2)
    expect(store.stages.length).toBe(35) // 33 + 2
    store.setFinisterreDays(10)
    expect(store.currentDraft.finisterreDays).toBe(8)
    expect(store.stages.length).toBe(41) // 33 + 8

    // 雙線天數夾擠邊界：最小 3 天、最大 15 天
    store.setFinisterreOption('BOTH_FINISTERRE_FIRST')
    store.setFinisterreDays(1)
    expect(store.currentDraft.finisterreDays).toBe(3)
    expect(store.stages.length).toBe(36) // 33 + 3
    store.setFinisterreDays(20)
    expect(store.currentDraft.finisterreDays).toBe(15)
    expect(store.stages.length).toBe(48) // 33 + 15

    // 設定延伸徒步天數為 4 天，雙線終點應抵達 Muxía 且長度為 37 天
    store.setFinisterreDays(4)
    expect(store.stages.length).toBe(37) // 33 主線 + 4 雙線延伸
    expect(store.stages[store.stages.length - 1].endWaypointId).toBe('finisterre:muxia')

    // 關閉延伸
    store.setFinisterreOption('NONE')
    expect(store.stages.length).toBe(33)
  })

  it('4. 舊版快取無損遷移：平鋪 config 與長度不符之髒 stages 注入時自動轉移並校驗重算', () => {
    const store = useScheduleStore()
    const legacyPayload = {
      config: {
        startDate: '2026-07-01',
        startWaypointId: 'SJPP',
        endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
        targetDays: 34,
        dailyTargetKm: 22.8,
        bodyWeightKg: 60,
        day1RouteVariant: 'VALCARLOS',
      },
      // 模擬長度與 targetDays (34) 不吻合之損毀舊版 stages
      stages: [
        {
          dayIndex: 1,
          date: '2026-07-01',
          startWaypointId: 'SJPP',
          endWaypointId: 'RONCESVALLES',
          passedWaypointIds: [],
          distanceKm: 24.1,
          elevationGainM: 850,
          elevationLossM: 260,
          isRestDay: false,
        },
      ],
    }

    store.migrateLegacyStorage(legacyPayload)

    expect(store.version).toBe(2)
    expect(store.currentRouteId).toBe('frances')
    expect(store.drafts.frances.startDate).toBe('2026-07-01')
    expect(store.drafts.frances.targetDays).toBe(34)
    expect(store.drafts.frances.branchId).toBe('valcarlos')
    expect(store.config.day1RouteVariant).toBe('VALCARLOS')
    // 因舊 stages 長度僅 1 筆與 targetDays (34) 不符，自動觸發重算補齊 34 天
    expect(store.stages).toHaveLength(34)
    expect(store.stages[0].routeVariant).toBe('VALCARLOS')
  })

  it('5. 法國之路切換瓦卡洛斯 / 拿破崙分支時，單一真相來源 (branchId) 與爬升數據同步更新', () => {
    const store = useScheduleStore()
    expect(store.currentRouteId).toBe('frances')
    expect(store.currentDraft.branchId).toBe('napoleon')
    expect(store.config.day1RouteVariant).toBe('NAPOLEON')
    expect(store.stages[0].routeVariant).toBe('NAPOLEON')
    expect(store.stages[0].elevationGainM).toBe(1250)

    // 切換至瓦卡洛斯替代道路分支
    store.switchBranch('valcarlos')
    expect(store.currentDraft.branchId).toBe('valcarlos')
    expect(store.config.day1RouteVariant).toBe('VALCARLOS')
    expect(store.stages[0].routeVariant).toBe('VALCARLOS')
    expect(store.stages[0].elevationGainM).toBe(850)

    // 切回拿破崙之路
    store.switchBranch('napoleon')
    expect(store.currentDraft.branchId).toBe('napoleon')
    expect(store.config.day1RouteVariant).toBe('NAPOLEON')
    expect(store.stages[0].routeVariant).toBe('NAPOLEON')
    expect(store.stages[0].elevationGainM).toBe(1250)
  })

  it('6. 起訖點若遭污染為跨路線無效值或順序顛倒時，演算前自動校準為官方標準起訖點 (SJPP ➔ Santiago)', () => {
    const store = useScheduleStore()
    expect(store.currentRouteId).toBe('frances')

    // 模擬髒資料注入：跨路線無效 ID 或空值
    store.drafts.frances.startWaypointId = 'invalid:waypoint'
    store.drafts.frances.endWaypointId = ''
    store.recalculateSchedule()

    expect(store.drafts.frances.startWaypointId).toBe('SJPP')
    expect(store.drafts.frances.endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
    expect(store.stages.length).toBe(33)
    expect(store.stages[0].startWaypointId).toBe('SJPP')
    expect(store.stages[store.stages.length - 1].endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')

    // 模擬順序顛倒 (起點 Pamplona 在 終點 SJPP 之後)
    store.drafts.frances.startWaypointId = 'PAMPLONA'
    store.drafts.frances.endWaypointId = 'SJPP'
    store.recalculateSchedule()

    expect(store.drafts.frances.startWaypointId).toBe('SJPP')
    expect(store.drafts.frances.endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
    expect(store.stages.length).toBe(33)
  })

  it('7. 法國之路在冬季封山期間 (11/1 ~ 3/31) Store 層強制鎖定瓦卡洛斯之路，且阻斷切換至拿破崙之路', () => {
    const store = useScheduleStore()
    expect(store.currentRouteId).toBe('frances')

    // 將出發日期設定在冬季 (12/15)
    store.drafts.frances.startDate = '2026-12-15'
    store.recalculateSchedule()

    // 驗證進入冬季鎖定狀態且 branchId 強制鎖定為 valcarlos
    expect(store.isWinterLocked).toBe(true)
    expect(store.currentDraft.branchId).toBe('valcarlos')
    expect(store.config.day1RouteVariant).toBe('VALCARLOS')
    expect(store.stages[0].routeVariant).toBe('VALCARLOS')
    expect(store.stages[0].elevationGainM).toBe(850)

    // 嘗試在冬季透過 switchBranch 或 setDay1Variant 切換至拿破崙之路 -> 應被阻斷
    store.switchBranch('napoleon')
    expect(store.currentDraft.branchId).toBe('valcarlos')
    expect(store.stages[0].routeVariant).toBe('VALCARLOS')

    store.setDay1Variant('NAPOLEON')
    expect(store.currentDraft.branchId).toBe('valcarlos')
    expect(store.stages[0].routeVariant).toBe('VALCARLOS')
  })

  it('8. 呼叫 updateDraftConfig 能寫入底層草稿狀態、重置舊休息日並重新演算分段', () => {
    const store = useScheduleStore()
    store.insertRestDay(3)
    expect(store.config.restDays).toBe(1)

    // 使用者變更為 Sarria ➔ Santiago 5 天
    store.updateDraftConfig({
      startWaypointId: 'SARRIA',
      endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
      targetDays: 5,
    })

    expect(store.drafts.frances.startWaypointId).toBe('SARRIA')
    expect(store.drafts.frances.targetDays).toBe(5)
    expect(store.config.restDays).toBe(0)
    expect(store.drafts.frances.restDays).toEqual([])
    expect(store.stages).toHaveLength(5)
    expect(store.stages[0].startWaypointId).toBe('SARRIA')
    expect(store.stages[4].endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
  })

  it('9. 切換路線或執行快取還原 (afterHydrate) 時，必須完整保留休息日、自訂結束城鎮並同步 restDays', () => {
    const store = useScheduleStore()
    expect(store.currentRouteId).toBe('frances')

    // 1. 使用者在法國之路設定 Day 1 結束城鎮為 ORISSON，並將 Day 5 設為休息日
    store.updateEndWaypoint(1, 'ORISSON')
    store.insertRestDay(5)
    expect(store.stages[0].endWaypointId).toBe('ORISSON')
    expect(store.stages[4].isRestDay).toBe(true)
    expect(store.drafts.frances.restDays).toEqual([5])

    // 2. 切換至葡萄牙之路再切回法國之路，微調進度不應被洗白
    store.switchRoute('portugues')
    expect(store.currentRouteId).toBe('portugues')
    store.switchRoute('frances')
    expect(store.currentRouteId).toBe('frances')
    expect(store.stages[0].endWaypointId).toBe('ORISSON')
    expect(store.stages[4].isRestDay).toBe(true)
    expect(store.drafts.frances.restDays).toEqual([5])

    // 3. 模擬快取中 restDays 遭清空但 mainStages 完好，觸發 migrateLegacyStorage(store) 後應自動反向校準回 [5]
    store.drafts.frances.restDays = []
    store.migrateLegacyStorage(store)
    expect(store.stages[0].endWaypointId).toBe('ORISSON')
    expect(store.stages[4].isRestDay).toBe(true)
    expect(store.drafts.frances.restDays).toEqual([5])
  })

  it('10. 休息日新增 (insertRestDay) 與移除 (removeRestDay) 雙向還原、同步 config.restDays 與延伸段越界保護', () => {
    const store = useScheduleStore()
    expect(store.totalWalkingDays).toBe(33)
    expect(store.totalRestDays).toBe(0)
    expect(store.config.restDays).toBe(0)

    // 插入第 5 天為休息日：總天數固定為 33 天，徒步天數 32 天、休息日 1 天
    store.insertRestDay(5)
    expect(store.stages[4].isRestDay).toBe(true)
    expect(store.stages[4].distanceKm).toBe(0)
    expect(store.totalWalkingDays).toBe(32)
    expect(store.totalRestDays).toBe(1)
    expect(store.config.restDays).toBe(1)
    expect(store.drafts.frances.restDays).toEqual([5])

    // 對超出主線天數 (如第 99 天) 呼叫 insertRestDay / removeRestDay 應安全阻斷不報錯
    store.insertRestDay(99)
    expect(store.config.restDays).toBe(1)

    // 移除第 5 天休息日：應恢復為 33 個徒步日且 restDays 歸零
    store.removeRestDay(5)
    expect(store.stages[4].isRestDay).toBe(false)
    expect(store.stages[4].distanceKm).toBeGreaterThan(0)
    expect(store.totalWalkingDays).toBe(33)
    expect(store.totalRestDays).toBe(0)
    expect(store.config.restDays).toBe(0)
    expect(store.drafts.frances.restDays).toEqual([])
  })

  it('11. 世界盡頭延伸段支援變更停留城鎮 (updateEndWaypoint) 與設定休息日 (insertRestDay/removeRestDay)', () => {
    const store = useScheduleStore()
    // 啟用世界盡頭 3 天延伸段 (主線 33 天 + 延伸 3 天 = 36 天)
    store.setFinisterreOption('FINISTERRE_ONLY')
    expect(store.stages.length).toBe(36)

    // 第 34 天為延伸段第 1 天，原預設終點為 negreira
    expect(store.stages[33].dayIndex).toBe(34)
    expect(store.stages[33].endWaypointId).toBe('finisterre:negreira')

    // 1. 變更第 34 天結束城鎮至 maronas
    store.updateEndWaypoint(34, 'finisterre:maronas')
    expect(store.stages[33].endWaypointId).toBe('finisterre:maronas')
    expect(store.stages[34].startWaypointId).toBe('finisterre:maronas')
    expect(store.stages[35].endWaypointId).toBe('finisterre:fisterra')

    // 2. 將第 35 天設為休息日
    store.insertRestDay(35)
    expect(store.stages[34].isRestDay).toBe(true)
    expect(store.stages[34].distanceKm).toBe(0)
    expect(store.stages[34].startWaypointId).toBe('finisterre:maronas')
    expect(store.stages[34].endWaypointId).toBe('finisterre:maronas')
    // 主線 config.restDays 依然不受污染
    expect(store.config.restDays).toBe(0)

    // 3. 移除第 35 天休息日
    store.removeRestDay(35)
    expect(store.stages[34].isRestDay).toBe(false)
    expect(store.stages[34].distanceKm).toBeGreaterThan(0)
    expect(store.stages[35].endWaypointId).toBe('finisterre:fisterra')

    // 4. 切換路線再切回，延伸段自訂城鎮狀態依舊完整保留
    store.switchRoute('portugues')
    store.switchRoute('frances')
    expect(store.stages.length).toBe(36)
    expect(store.stages[33].endWaypointId).toBe('finisterre:maronas')
    expect(store.stages[34].startWaypointId).toBe('finisterre:maronas')
    expect(store.stages[35].endWaypointId).toBe('finisterre:fisterra')
  })

  it('12. 驗證更新規劃設定 (updateDraftConfig) 與重設 (resetToDefaults) 時，世界盡頭延伸段與每日規劃即時相應連動重算', () => {
    const store = useScheduleStore()

    // 1. 套用 BOTH_FINISTERRE_FIRST 與延伸 4 天設定
    store.updateDraftConfig({
      finisterreOption: 'BOTH_FINISTERRE_FIRST',
      finisterreDays: 4,
    })
    expect(store.stages.length).toBe(37) // 33 主線 + 4 延伸
    const extStages = store.stages.filter((s) => s.isExtensionStage)
    expect(extStages).toHaveLength(4)
    expect(extStages[0].startWaypointId).toBe('finisterre:santiago')
    expect(extStages[0].endWaypointId).toBe('finisterre:negreira')
    expect(extStages[1].endWaypointId).toBe('finisterre:olveiroa')
    expect(extStages[2].endWaypointId).toBe('finisterre:fisterra')
    expect(extStages[3].endWaypointId).toBe('finisterre:muxia')

    // 2. 變更天數為 5 天，右側每日分段應立即相應重算為 5 天
    store.setFinisterreDays(5)
    expect(store.stages.length).toBe(38) // 33 + 5
    expect(store.stages.filter((s) => s.isExtensionStage)).toHaveLength(5)
    expect(store.stages[store.stages.length - 1].endWaypointId).toBe('finisterre:muxia')

    // 3. 執行重設回官方預設 (resetToDefaults)，右側每日規劃應徹底恢復為 33 天且延伸段清空
    store.resetToDefaults()
    expect(store.stages.length).toBe(33)
    expect(store.stages.filter((s) => s.isExtensionStage)).toHaveLength(0)
    expect(store.stages[0].startWaypointId).toBe('SJPP')
    expect(store.stages[32].endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
  })

  it('13. 深度髒狀態重設防護 (Deep Dirty State Reset) 與延伸段快取無縫失效 (Cache Invalidation)', () => {
    const store = useScheduleStore()

    // 步驟 A：先建立 FINISTERRE_ONLY 3 天快取
    store.setFinisterreOption('FINISTERRE_ONLY')
    expect(store.stages.length).toBe(36)
    expect(store.stages[35].endWaypointId).toBe('finisterre:fisterra')

    // 步驟 B：切換為 BOTH_FINISTERRE_FIRST（4 天），驗證快取徹底失效並正確重建為雙線
    store.setFinisterreOption('BOTH_FINISTERRE_FIRST')
    expect(store.stages.length).toBe(37)
    expect(store.stages[36].endWaypointId).toBe('finisterre:muxia')

    // 步驟 C：建立深度髒狀態（主線修改 + 延伸段修改 + 雙邊插入休息日）
    store.updateEndWaypoint(1, 'ORISSON')
    store.insertRestDay(5)
    store.updateEndWaypoint(34, 'finisterre:maronas')
    store.insertRestDay(35)

    expect(store.stages.length).toBe(37)
    expect(store.stages[0].endWaypointId).toBe('ORISSON')
    expect(store.stages[4].isRestDay).toBe(true)
    expect(store.stages[33].endWaypointId).toBe('finisterre:maronas')
    expect(store.stages[34].isRestDay).toBe(true)
    expect(store.totalRestDays).toBe(2)

    // 步驟 D：執行重設回官方預設，驗證所有主線與延伸段的髒資料與快取全面洗淨
    store.resetToDefaults()

    expect(store.stages.length).toBe(33)
    expect(store.totalRestDays).toBe(0)
    expect(store.config.restDays).toBe(0)
    expect(store.stages.filter((s) => s.isExtensionStage)).toHaveLength(0)
    expect(store.stages[0].startWaypointId).toBe('SJPP')
    expect(store.stages[0].endWaypointId).toBe('RONCESVALLES')
    expect(store.stages[32].endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
    expect(store.drafts.frances.finisterreOption).toBe('NONE')
    expect(store.drafts.frances.restDays).toEqual([])
  })

  it('14. 驗證延伸段第 1 天設為休息日後能成功取消休息，以及主線未抵達聖地牙哥時延伸段不瞬移銜接', () => {
    const store = useScheduleStore()

    // 1. 啟用世界盡頭延伸段 (33 主線 + 3 延伸 = 36 天)
    store.setFinisterreOption('FINISTERRE_ONLY')
    expect(store.stages.length).toBe(36)

    // Day 34 為延伸段第 1 天（index 33）
    expect(store.stages[33].dayIndex).toBe(34)
    expect(store.stages[33].isRestDay).toBe(false)

    // 將 Day 34 設為休息日
    store.insertRestDay(34)
    expect(store.stages[33].isRestDay).toBe(true)
    expect(store.stages[33].distanceKm).toBe(0)

    // 成功取消 Day 34 休息日，必須恢復為正常徒步日，不得崩潰或無效
    store.removeRestDay(34)
    expect(store.stages[33].isRestDay).toBe(false)
    expect(store.stages[33].distanceKm).toBeGreaterThan(0)
    expect(store.stages[35].endWaypointId).toBe('finisterre:fisterra')

    // 2. 驗證即便主線因手動調整未抵達聖地牙哥，世界盡頭規劃依然妥善保留不消失
    // 將主線最後一天（Day 33）結束城鎮改為 Santa Irene
    store.updateEndWaypoint(33, 'SANTA_IRENE')
    expect(store.stages[32].endWaypointId).toBe('SANTA_IRENE')

    // 世界盡頭延伸段依然完整保留呈現，天數與日期無縫順延
    const extStages = store.stages.filter((s) => s.isExtensionStage)
    expect(extStages).toHaveLength(3)
    expect(extStages[0].dayIndex).toBe(34)
    expect(extStages[extStages.length - 1].endWaypointId).toBe('finisterre:fisterra')
  })

  it('15. 驗證當主線分段遭外路線或世界盡頭航點污染時，快取校驗自動判定無效並重算清洗為乾淨主線', () => {
    const store = useScheduleStore()
    expect(store.currentRouteId).toBe('frances')

    // 模擬 LocalStorage 載入之損壞資料：主線中混雜了世界盡頭航點 (finisterre:negreira)
    const corruptedPayload = {
      stages: [
        ...store.stages.slice(0, 32),
        {
          dayIndex: 33,
          date: '2026-06-02',
          startWaypointId: 'O_PEDROUZO',
          endWaypointId: 'finisterre:negreira', // 跨路線髒航點
          passedWaypointIds: [],
          distanceKm: 20,
          elevationGainM: 100,
          elevationLossM: 100,
          isRestDay: false,
        },
      ],
    }

    store.migrateLegacyStorage(corruptedPayload)

    // 經由 isWaypointsValid 嚴格把關，髒資料被成功攔截並全面清洗重算回標準法國之路
    expect(store.stages.length).toBe(33)
    expect(store.stages[0].startWaypointId).toBe('SJPP')
    expect(store.stages[32].endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
  })

  it('16. 驗證最後一天設為休息日後再取消休息，終點能 100% 正確恢復至全線終點航點且延伸段始終保留並自動對齊', () => {
    const store = useScheduleStore()
    store.setFinisterreOption('FINISTERRE_ONLY')
    expect(store.stages.length).toBe(36)

    // 1. 將主線最後一天（Day 33）設為休息日（終點變成起點 O_PEDROUZO）
    store.insertRestDay(33)
    expect(store.stages[32].isRestDay).toBe(true)
    expect(store.stages[32].distanceKm).toBe(0)
    // 依使用者需求：延伸段規劃絕不消失，保持完整呈現
    expect(store.stages.filter((s) => s.isExtensionStage)).toHaveLength(3)

    // 2. 取消 Day 33 休息日，主線終點必須精確恢復為 SANTIAGO_DE_COMPOSTELA，且延伸段自動對齊
    store.removeRestDay(33)
    expect(store.stages[32].isRestDay).toBe(false)
    expect(store.stages[32].distanceKm).toBeGreaterThan(0)
    expect(store.stages[32].endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')

    // 延伸段自動重新接續並呈現 3 天延伸
    const extStages = store.stages.filter((s) => s.isExtensionStage)
    expect(extStages).toHaveLength(3)
    expect(extStages[extStages.length - 1].endWaypointId).toBe('finisterre:fisterra')
  })

  it('17. 驗證世界盡頭自訂天數放寬：單點最高支援 8 天、雙點最高支援 15 天並自動安排海角連住休整', () => {
    const store = useScheduleStore()

    // 1. 單點：設定 8 天
    store.setFinisterreOption('FINISTERRE_ONLY')
    store.setFinisterreDays(8)
    let extStages = store.stages.filter((s) => s.isExtensionStage)
    expect(extStages).toHaveLength(8)
    expect(extStages[extStages.length - 1].endWaypointId).toBe('finisterre:fisterra')

    // 2. 雙點：設定 15 天
    store.setFinisterreOption('BOTH_FINISTERRE_FIRST')
    store.setFinisterreDays(15)
    extStages = store.stages.filter((s) => s.isExtensionStage)
    expect(extStages).toHaveLength(15)
    expect(extStages[extStages.length - 1].endWaypointId).toBe('finisterre:muxia')

    // 驗證末尾天數為海角放空休整日且里程為 0km
    const lastDay = extStages[extStages.length - 1]
    expect(lastDay.isRestDay).toBe(true)
    expect(lastDay.distanceKm).toBe(0)
    expect(lastDay.stageNotes).toContain('海濱漫遊休整日')
  })

  it('18. 驗證世界盡頭若因設休息日導致未能抵達 Fisterra 或 Muxía 時之終點狀態與恢復', () => {
    const store = useScheduleStore()
    store.setFinisterreOption('FINISTERRE_ONLY')
    store.setFinisterreDays(3)
    // 預設 3 天延伸：Day 34, Day 35, Day 36 (終點 finisterre:fisterra)
    let extStages = store.stages.filter((s) => s.isExtensionStage)
    expect(extStages[extStages.length - 1].endWaypointId).toBe('finisterre:fisterra')

    // 將世界盡頭最後一天（Day 36）設為休息日
    store.insertRestDay(36)
    extStages = store.stages.filter((s) => s.isExtensionStage)
    // 最後一天變成休息日，終點縮在起點（未能抵達 Fisterra 燈塔）
    expect(extStages[extStages.length - 1].isRestDay).toBe(true)
    expect(extStages[extStages.length - 1].endWaypointId).not.toBe('finisterre:fisterra')

    // 取消 Day 36 休息日，必須 100% 正確恢復至 finisterre:fisterra
    store.removeRestDay(36)
    extStages = store.stages.filter((s) => s.isExtensionStage)
    expect(extStages[extStages.length - 1].isRestDay).toBe(false)
    expect(extStages[extStages.length - 1].endWaypointId).toBe('finisterre:fisterra')
  })

  it('19. 驗證一鍵快捷追加 1 天抵達聖地牙哥大教堂與世界盡頭海角終點', () => {
    const store = useScheduleStore()
    store.setFinisterreOption('FINISTERRE_ONLY')
    store.setFinisterreDays(3)

    // 1. 模擬主線最後一天落腳於 Santa Irene（未達聖地牙哥）
    store.updateEndWaypoint(33, 'SANTA_IRENE')
    let mainStages = store.stages.filter((s) => !s.isExtensionStage)
    expect(mainStages[mainStages.length - 1].endWaypointId).toBe('SANTA_IRENE')

    // 點擊「一鍵追加 1 天直達大教堂」
    store.appendMainDayToSantiago()
    mainStages = store.stages.filter((s) => !s.isExtensionStage)
    // 主線天數增加為 34 天，前 33 天完整保留，第 34 天起點 Santa Irene，終點聖地牙哥
    expect(mainStages).toHaveLength(34)
    expect(mainStages[33].startWaypointId).toBe('SANTA_IRENE')
    expect(mainStages[33].endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
    expect(mainStages[33].distanceKm).toBeGreaterThan(0)

    // 2. 世界盡頭延伸段天數從 Day 35 起無縫接續，且長度維持 3 天
    let extStages = store.stages.filter((s) => s.isExtensionStage)
    expect(extStages).toHaveLength(3)
    expect(extStages[0].dayIndex).toBe(35)
    expect(extStages[extStages.length - 1].endWaypointId).toBe('finisterre:fisterra')

    // 3. 模擬世界盡頭最後一天停在 Cee（未達 Fisterra 燈塔）
    store.updateEndWaypoint(37, 'finisterre:cee')
    extStages = store.stages.filter((s) => s.isExtensionStage)
    expect(extStages[extStages.length - 1].endWaypointId).toBe('finisterre:cee')

    // 點擊「一鍵追加 1 天直達海角」
    store.appendFinisterreDayToDestination()
    extStages = store.stages.filter((s) => s.isExtensionStage)
    expect(extStages).toHaveLength(4)
    expect(extStages[3].startWaypointId).toBe('finisterre:cee')
    expect(extStages[3].endWaypointId).toBe('finisterre:fisterra')
    expect(store.currentDraft.finisterreDays).toBe(4)
  })
})
