import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useScheduleStore } from '@/stores/schedule'
import type {
  BudgetDetails,
  BudgetPersona,
  BudgetSummary,
} from '@/types/budget'
import {
  calculateBudgetSummary,
  DEFAULT_EUR_TWD_RATE,
  EMPTY_BUDGET_DETAILS,
  isDetailsMatchingPreset,
  MAX_BUDGET_DAYS,
  MIN_BUDGET_DAYS,
  PERSONA_PRESETS,
  sanitizeBudgetNumber,
} from '@/utils/budgetCalculator'

export const useBudgetStore = defineStore(
  'budget',
  () => {
    const scheduleStore = useScheduleStore()

    // 狀態
    const persona = ref<BudgetPersona>('STANDARD')
    const isSyncWithSchedule = ref<boolean>(true)
    const customDays = ref<number>(33)
    const eurToTwdRate = ref<number>(DEFAULT_EUR_TWD_RATE)
    const details = ref<BudgetDetails>({ ...PERSONA_PRESETS.STANDARD })
    // 是否曾使用/輸入過個人化試算 (未自訂前為 false，格子維持空，標籤顯示「個人化試算」)
    const hasCustomized = ref<boolean>(false)
    // 專屬保存使用者自己微調的自訂數值，切換到其他風格再切回時完整保留
    const customDetails = ref<BudgetDetails>({ ...EMPTY_BUDGET_DETAILS })

    // 當前排程中的實際總天數 (至少 1 天，未初始化時 fallback 33)
    const scheduleTotalDays = computed(() => {
      const stagesLen = scheduleStore.stages?.length || 0
      return stagesLen > 0 ? stagesLen : 33
    })

    // 實際計算使用的有效天數
    const effectiveDays = computed(() => {
      if (isSyncWithSchedule.value) {
        return scheduleTotalDays.value
      }
      return Math.max(
        MIN_BUDGET_DAYS,
        Math.min(MAX_BUDGET_DAYS, Math.round(customDays.value || 33))
      )
    })

    // 判斷排程天數是否與當前自訂天數不同 (供自訂天數模式下顯示溫馨提示)
    const isScheduleDaysDifferent = computed(() => {
      if (isSyncWithSchedule.value) return false
      return scheduleTotalDays.value !== effectiveDays.value
    })

    // 當前路線名稱
    const currentRouteName = computed(() => {
      const meta = scheduleStore.currentRouteMetadata
      return meta ? meta.chineseName : '朝聖之路'
    })

    // 動態預算總結
    const summary = computed<BudgetSummary>(() => {
      return calculateBudgetSummary(
        effectiveDays.value,
        eurToTwdRate.value,
        details.value
      )
    })

    // 判斷當前明細是否與所屬風格預設值相符
    const isMatchingCurrentPreset = computed(() => {
      if (persona.value === 'CUSTOM') {
        // 自訂型若尚未自訂過，即處於預設初始狀態
        return !hasCustomized.value
      }
      const preset = PERSONA_PRESETS[persona.value]
      return isDetailsMatchingPreset(details.value, preset)
    })

    // 動作：切換風格
    function setPersona(newPersona: BudgetPersona) {
      persona.value = newPersona
      if (newPersona === 'CUSTOM') {
        if (!hasCustomized.value) {
          // 若從未自訂過或已按過還原鈕，確保右側試算內容全面歸零
          customDetails.value = { ...EMPTY_BUDGET_DETAILS }
          details.value = { ...EMPTY_BUDGET_DETAILS }
        } else {
          // 切換回個人自訂型：完整還原使用者自己設定的自訂數值
          details.value = { ...customDetails.value }
        }
      } else {
        details.value = { ...PERSONA_PRESETS[newPersona] }
      }
    }

    // 動作：更新天數並切換至自訂天數模式
    function setCustomDays(days: number) {
      customDays.value = Math.max(
        MIN_BUDGET_DAYS,
        Math.min(MAX_BUDGET_DAYS, Math.round(sanitizeBudgetNumber(days, 33)))
      )
      isSyncWithSchedule.value = false
    }

    // 動作：一鍵重新與排程天數連動
    function syncWithSchedule() {
      isSyncWithSchedule.value = true
      customDays.value = scheduleTotalDays.value
    }

    // 動作：更新自訂匯率
    function setRate(rate: number) {
      eurToTwdRate.value = sanitizeBudgetNumber(rate, DEFAULT_EUR_TWD_RATE, 10, 100)
    }

    // 動作：更新特定開銷細項
    function updateDetail<K extends keyof BudgetDetails>(key: K, val: number) {
      const cleanVal = sanitizeBudgetNumber(val, 0)
      details.value[key] = cleanVal
      // 標記已使用個人化自訂，並同步持久記錄至自訂數值快照
      hasCustomized.value = true
      customDetails.value[key] = cleanVal

      // 若修改後已與現有風格預設不同，標註為 CUSTOM
      if (persona.value !== 'CUSTOM') {
        persona.value = 'CUSTOM'
      }
    }

    // 動作：還原回當前風格預設值 (若為 CUSTOM 則重設為空狀態)
    function resetToDefaults() {
      // 點選還原鈕時，個人化自訂快照一律同步徹底重設為乾淨空狀態
      hasCustomized.value = false
      customDetails.value = { ...EMPTY_BUDGET_DETAILS }

      if (persona.value === 'CUSTOM') {
        details.value = { ...EMPTY_BUDGET_DETAILS }
      } else {
        const targetPreset = persona.value
        details.value = { ...PERSONA_PRESETS[targetPreset] }
      }
      isSyncWithSchedule.value = true
      eurToTwdRate.value = DEFAULT_EUR_TWD_RATE
    }

    return {
      persona,
      isSyncWithSchedule,
      customDays,
      eurToTwdRate,
      details,
      hasCustomized,
      customDetails,
      scheduleTotalDays,
      effectiveDays,
      isScheduleDaysDifferent,
      currentRouteName,
      summary,
      isMatchingCurrentPreset,
      setPersona,
      setCustomDays,
      syncWithSchedule,
      setRate,
      updateDetail,
      resetToDefaults,
    }
  },
  {
    persist: {
      key: 'camino_budget_v1',
      pick: [
        'persona',
        'isSyncWithSchedule',
        'customDays',
        'eurToTwdRate',
        'details',
        'hasCustomized',
        'customDetails',
      ],
    },
  }
)
