import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useScheduleStore } from '@/stores/schedule'

describe('Schedule Migration & Multi-Drafts - 快取遷移與草稿隔離測試', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始狀態下預設為法國之路，且 drafts 具備 3 條主路線', () => {
    const store = useScheduleStore()
    expect(store.currentRouteId).toBe('frances')
    expect(store.drafts.frances).toBeDefined()
    expect(store.drafts.portugues).toBeDefined()
    expect(store.drafts.norte).toBeDefined()
    expect(store.stages.length).toBe(33)
  })

  it('切換路線至葡萄牙之路時，草稿獨立保存且主線分段正確切換', () => {
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

  it('啟用世界盡頭延伸時，stages 陣列末端動態接續世界盡頭分段', () => {
    const store = useScheduleStore()
    store.setFinisterreOption('FINISTERRE_ONLY')
    expect(store.stages.length).toBe(36) // 33 + 3
    const extensionStages = store.stages.filter((s) => s.isExtensionStage)
    expect(extensionStages).toHaveLength(3)
    expect(extensionStages[extensionStages.length - 1].endWaypointId).toBe('finisterre:fisterra')

    // 關閉延伸
    store.setFinisterreOption('NONE')
    expect(store.stages.length).toBe(33)
  })

  it('舊版快取無損遷移：偵測到舊結構時自動轉移至 drafts.frances', () => {
    const store = useScheduleStore()
    // 模擬舊版 localStorage 注入平鋪屬性
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
    }

    // 觸發遷移
    store.migrateLegacyStorage(legacyPayload)

    expect(store.version).toBe(2)
    expect(store.currentRouteId).toBe('frances')
    expect(store.drafts.frances.startDate).toBe('2026-07-01')
    expect(store.drafts.frances.targetDays).toBe(34)
    expect((store.drafts.frances as any).day1RouteVariant).toBe('VALCARLOS')
  })

  it('法國之路切換至瓦卡洛斯分支時，Day 1 自動切換為瓦卡洛斯走法且爬升更新為 850m', () => {
    const store = useScheduleStore()
    expect(store.currentRouteId).toBe('frances')
    expect(store.stages[0].routeVariant).toBe('NAPOLEON')
    expect(store.stages[0].elevationGainM).toBe(1250)

    // 切換至瓦卡洛斯替代道路分支
    store.switchBranch('valcarlos')
    expect(store.currentDraft.branchId).toBe('valcarlos')
    expect((store.currentDraft as any).day1RouteVariant).toBe('VALCARLOS')
    expect(store.stages[0].routeVariant).toBe('VALCARLOS')
    expect(store.stages[0].elevationGainM).toBe(850)

    // 切回拿破崙之路
    store.switchBranch('napoleon')
    expect(store.currentDraft.branchId).toBe('napoleon')
    expect((store.currentDraft as any).day1RouteVariant).toBe('NAPOLEON')
    expect(store.stages[0].routeVariant).toBe('NAPOLEON')
    expect(store.stages[0].elevationGainM).toBe(1250)
  })

  it('起訖點若遭污染為跨路線無效值或順序顛倒時，演算前自動校準為官方標準起訖點 (SJPP ➔ Santiago)', () => {
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

  it('法國之路在冬季封山期間 (11/1 ~ 3/31) 強制鎖定瓦卡洛斯之路，且阻斷切換至拿破崙之路', () => {
    const store = useScheduleStore()
    expect(store.currentRouteId).toBe('frances')

    // 將出發日期設定在冬季 (12/15)
    store.drafts.frances.startDate = '2026-12-15'
    store.recalculateSchedule()

    // 驗證進入冬季鎖定狀態
    expect(store.isWinterLocked).toBe(true)
    // 自動被強制鎖定為瓦卡洛斯之路
    expect(store.currentDraft.branchId).toBe('valcarlos')
    expect((store.currentDraft as any).day1RouteVariant).toBe('VALCARLOS')
    expect(store.stages[0].routeVariant).toBe('VALCARLOS')
    expect(store.stages[0].elevationGainM).toBe(850)

    // 嘗試在冬季切換至拿破崙之路 -> 應被拒絕/阻斷
    store.switchBranch('napoleon')
    expect(store.currentDraft.branchId).toBe('valcarlos')
    expect(store.stages[0].routeVariant).toBe('VALCARLOS')

    // 嘗試透過 setDay1Variant 切換至 NAPOLEON -> 應被拒絕/阻斷
    store.setDay1Variant('NAPOLEON')
    expect((store.currentDraft as any).day1RouteVariant).toBe('VALCARLOS')
    expect(store.stages[0].routeVariant).toBe('VALCARLOS')
  })

  it('呼叫 updateDraftConfig 能真正寫入底層草稿狀態並重新演算分段', () => {
    const store = useScheduleStore()
    expect(store.currentRouteId).toBe('frances')

    // 使用者變更為 Sarria ➔ Santiago 5 天
    store.updateDraftConfig({
      startWaypointId: 'SARRIA',
      endWaypointId: 'SANTIAGO_DE_COMPOSTELA',
      targetDays: 5,
    })

    expect(store.drafts.frances.startWaypointId).toBe('SARRIA')
    expect(store.drafts.frances.targetDays).toBe(5)
    expect(store.stages).toHaveLength(5)
    expect(store.stages[0].startWaypointId).toBe('SARRIA')
    expect(store.stages[4].endWaypointId).toBe('SANTIAGO_DE_COMPOSTELA')
  })
})
