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
})
