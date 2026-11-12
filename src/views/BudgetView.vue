<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBudgetStore } from '@/stores/budget'
import { useScheduleStore } from '@/stores/schedule'
import PrintBudgetModal from '@/components/budget/PrintBudgetModal.vue'
import GoogleAd from '@/components/common/GoogleAd.vue'
import type { BudgetExportMeta, BudgetDetails, BudgetPersona } from '@/types/budget'
import {
  Printer,
  RotateCcw,
  Plane,
  Footprints,
  Train,
  ShieldAlert,
  Info,
} from 'lucide-vue-next'

const { t, locale } = useI18n()
const budgetStore = useBudgetStore()
const scheduleStore = useScheduleStore()

// 列印彈窗狀態
const isPrintModalOpen = ref(false)

// 英文模式下的全程預估總歐元 (行前固定換算歐元 + 歐洲當地總開銷)
const grandTotalEur = computed(() => {
  const rate = budgetStore.eurToTwdRate || 35.5
  const fixedEur = budgetStore.summary.totalFixedTwd / rate
  return budgetStore.summary.totalEur + fixedEur
})

// 英文模式下的行前固定支出小計 (歐元整數)
const fixedSubtotalEur = computed(() => {
  const rate = budgetStore.eurToTwdRate || 35.5
  return Math.round(budgetStore.summary.totalFixedTwd / rate)
})

// 依語系取得風格標籤與描述
function getPersonaName(p: BudgetPersona) {
  return t(`budget.styles.${p}.name`)
}
function getPersonaTag(p: BudgetPersona) {
  if (p === 'CUSTOM' && budgetStore.hasCustomized && budgetStore.customDailyAvgEur > 0) {
    return t('budget.styles.CUSTOM.customDailyTag', { eur: budgetStore.customDailyAvgEur.toFixed(0) })
  }
  return t(`budget.styles.${p}.tag`)
}
function getPersonaDesc(p: BudgetPersona) {
  return t(`budget.styles.${p}.description`)
}

// 組合導出結構
const exportMeta = computed<BudgetExportMeta>(() => {
  const todayStr = new Date().toISOString().split('T')[0]
  const meta = scheduleStore.currentRouteMetadata
  const routeName = locale.value === 'en'
    ? (meta ? meta.name : 'Camino de Santiago')
    : (meta ? meta.chineseName : '朝聖之路')
  return {
    ...budgetStore.summary,
    routeName,
    personaName: getPersonaName(budgetStore.persona),
    createdAt: todayStr,
  }
})

// 滑桿進度百分比 (用於精準渲染清新綠色進度條，杜絕瀏覽器原生深色暗沉失真)
const sliderPercentage = computed(() => {
  const min = 1
  const max = 60
  const val = Math.max(min, Math.min(max, budgetStore.effectiveDays))
  return ((val - min) / (max - min)) * 100
})

// 取得輸入框當前數值：null 呈現乾淨空白，數字（包含 0）如實呈現數字；英文模式下行前固定開銷以歐元換算呈現
function getDetailInputValue(key: keyof BudgetDetails): number | string {
  const val = budgetStore.details[key]
  if (val === null || val === undefined) return ''
  if (locale.value === 'en' && (key === 'flightTwd' || key === 'gearTwd' || key === 'insuranceAndSimTwd')) {
    const rate = budgetStore.eurToTwdRate || 35.5
    return Math.round(val / rate)
  }
  return val
}

// 統一輸入事件處理：刪空時儲存 null 保持該格空白，輸入 0 則儲存 0；英文模式下行前固定開銷以歐元換算存回台幣
function handleInputChange(key: keyof BudgetDetails, event: Event) {
  const target = event.target as HTMLInputElement
  if (!target) return
  const raw = target.value.trim()
  if (raw === '') {
    budgetStore.updateDetail(key, null)
  } else {
    const num = Number(raw)
    if (locale.value === 'en' && (key === 'flightTwd' || key === 'gearTwd' || key === 'insuranceAndSimTwd')) {
      const rate = budgetStore.eurToTwdRate || 35.5
      budgetStore.updateDetail(key, Math.round(num * rate))
    } else {
      budgetStore.updateDetail(key, num)
    }
  }
}

/**
 * 數字輸入框聚焦優化：
 * 自動全選（select），使用者直接鍵入新金額即可覆蓋原內容（包含 0），無須手動按 Backspace 刪除。
 */
function handleInputFocus(event: FocusEvent) {
  const target = event.target as HTMLInputElement
  if (!target) return
  target.select()
}
</script>

<template>
  <div class="container mx-auto px-4 pt-0 pb-8 max-w-7xl">
    <!-- 頂部吸頂標題列 ＋ 核心看板 -->
    <div
      class="sticky top-14 sm:top-16 z-30 -mx-4 px-4 py-2.5 sm:py-3 mb-4 sm:mb-6 bg-slate-50/85 backdrop-blur-md border-b border-slate-200/60"
    >
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <!-- 左側：大標題 ＋ 操作按鈕 -->
        <div class="flex items-center justify-between md:justify-start gap-2.5 sm:gap-3">
          <div class="flex items-center gap-2">
            <div>
              <h2 class="text-base sm:text-lg md:text-xl font-bold text-slate-800 leading-tight">
                {{ t('budget.title') }}
              </h2>
            </div>
          </div>

          <!-- 右側小工具：列印 ＋ 純文字複製 -->
          <div class="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              @click="isPrintModalOpen = true"
              class="text-xs border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 text-slate-600 px-2.5 sm:px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0"
              :title="t('budget.printModal.title')"
            >
              <Printer class="w-3.5 h-3.5 text-slate-500" />
              <span>{{ t('budget.printBudget') }}</span>
            </button>
          </div>
        </div>

        <!-- 右側：三大即時看板數值 (無豎線、不粗體、純淨間距排版) -->
        <div class="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 shrink-0 bg-white sm:bg-transparent p-2 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
          <!-- 全程預估總額 -->
          <div class="flex flex-col items-start sm:items-end">
            <span class="text-[10px] sm:text-xs text-slate-500">{{ t('budget.grandTotal') }}</span>
            <div class="flex items-baseline gap-1 text-slate-900 font-mono text-base sm:text-xl">
              <template v-if="locale === 'en'">
                <span>€</span>
                <span>{{ Math.round(grandTotalEur).toLocaleString() }}</span>
              </template>
              <template v-else>
                <span>NT$</span>
                <span>{{ budgetStore.summary.grandTotalTwd.toLocaleString() }}</span>
              </template>
            </div>
          </div>

          <!-- 歐洲當地開銷 -->
          <div class="flex flex-col items-start sm:items-end">
            <span class="text-[10px] sm:text-xs text-slate-500">{{ t('budget.localTotal') }}</span>
            <div class="flex items-baseline gap-1 text-slate-900 font-mono text-sm sm:text-base">
              <span>€</span>
              <span>{{ budgetStore.summary.totalEur.toFixed(2) }}</span>
            </div>
          </div>

          <!-- 路上日均 -->
          <div class="flex flex-col items-start sm:items-end">
            <span class="text-[10px] sm:text-xs text-slate-500">{{ t('budget.dailyWalkingAvg') }}</span>
            <div class="flex items-baseline gap-1 text-slate-900 font-mono text-sm sm:text-base">
              <span>€</span>
              <span>{{ budgetStore.summary.dailyAvgEur.toFixed(2) }}</span>
              <span class="text-[10px] text-slate-400">{{ t('budget.perDay') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要內容網格 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
      <!-- 左欄：控制面板（風格卡片 ＋ 天數微調 ＋ 匯率自訂）(lg: 5 欄) -->
      <div class="lg:col-span-5 space-y-4">
        <!-- 1. 三大風格選擇卡片 -->
        <div class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm sm:text-base text-slate-800">
              {{ t('budget.budgetStyle') }}
            </h3>
            <button
              type="button"
              @click="budgetStore.resetToDefaults()"
              class="text-[12px] text-slate-500 hover:text-slate-700 flex items-center gap-1 transition cursor-pointer"
              :title="t('budget.resetTitle')"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              {{ t('budget.reset') }}
            </button>
          </div>

          <div class="grid grid-cols-1 gap-2.5">
            <!-- 極簡省錢型 -->
            <button
              type="button"
              @click="budgetStore.setPersona('BUDGET')"
              class="p-3 rounded-xl border text-left transition-all cursor-pointer relative"
              :class="[
                budgetStore.persona === 'BUDGET'
                  ? 'border-amber-400 ring-2 ring-amber-300 bg-white shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50',
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <span>{{ getPersonaName('BUDGET') }}</span>
                </span>
                <span class="text-[12px] font-mono font-medium px-2 py-0.5 rounded-full text-slate-600">
                  {{ getPersonaTag('BUDGET') }}
                </span>
              </div>
              <p class="text-[12px] text-slate-500 mt-1 leading-relaxed">
                {{ getPersonaDesc('BUDGET') }}
              </p>
            </button>

            <!-- 經典平衡型 (推薦) -->
            <button
              type="button"
              @click="budgetStore.setPersona('STANDARD')"
              class="p-3 rounded-xl border text-left transition-all cursor-pointer relative"
              :class="[
                budgetStore.persona === 'STANDARD'
                  ? 'border-amber-500 ring-2 ring-amber-400 bg-white shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50',
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <span>{{ getPersonaName('STANDARD') }}</span>
                  <span class="text-[9px] font-normal px-1.5 py-0.5 rounded text-emerald-800 bg-emerald-20 border border-emerald-600">
                    {{ t('budget.styles.STANDARD.recommended') }}
                  </span>
                </span>
                <span class="text-[12px] font-mono font-medium px-2 py-0.5 rounded-full text-slate-600">
                  {{ getPersonaTag('STANDARD') }}
                </span>
              </div>
              <p class="text-[12px] text-slate-500 mt-1 leading-relaxed">
                {{ getPersonaDesc('STANDARD') }}
              </p>
            </button>

            <!-- 舒適無憂型 -->
            <button
              type="button"
              @click="budgetStore.setPersona('COMFORT')"
              class="p-3 rounded-xl border text-left transition-all cursor-pointer relative"
              :class="[
                budgetStore.persona === 'COMFORT'
                  ? 'border-amber-500 ring-2 ring-amber-400 bg-white shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50',
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <span>{{ getPersonaName('COMFORT') }}</span>
                </span>
                <span class="text-[12px] font-mono font-medium px-2 py-0.5 rounded-full text-slate-600">
                  {{ getPersonaTag('COMFORT') }}
                </span>
              </div>
              <p class="text-[12px] text-slate-500 mt-1 leading-relaxed">
                {{ getPersonaDesc('COMFORT') }}
              </p>
            </button>

            <!-- 個人自訂型 (常態常駐，微調後自動切換高亮) -->
            <button
              type="button"
              @click="budgetStore.setPersona('CUSTOM')"
              class="p-3 rounded-xl border text-left transition-all cursor-pointer relative"
              :class="[
                budgetStore.persona === 'CUSTOM'
                  ? 'border-amber-500 ring-2 ring-amber-400 bg-white shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50',
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <span>{{ getPersonaName('CUSTOM') }}</span>
                </span>
                <span class="text-[12px] font-mono font-medium px-2 py-0.5 rounded-full text-slate-600">
                  {{ getPersonaTag('CUSTOM') }}
                </span>
              </div>
              <p class="text-[12px] text-slate-500 mt-1 leading-relaxed">
                {{ getPersonaDesc('CUSTOM') }}
              </p>
            </button>
          </div>
        </div>

        <!-- 2. 天數連動與自訂控制器 -->
        <div class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
          <div class="flex items-center justify-between">
            <h3 class="text-sm sm:text-base text-slate-800">
              {{ t('budget.daysControl.title') }}
            </h3>
            <span class="text-sm font-mono text-slate-700 px-2 py-0.5">
              {{ t('budget.daysControl.daysUnit', { days: budgetStore.effectiveDays }) }}
            </span>
          </div>

          <!-- 直覺 Segmented Control 分段切換 -->
          <div class="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs gap-1">
            <button
              type="button"
              @click="budgetStore.syncWithSchedule()"
              class="py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer font-medium"
              :class="[
                budgetStore.isSyncWithSchedule
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800',
              ]"
            >
              <span>{{ t('budget.daysControl.syncSchedule', { days: budgetStore.scheduleTotalDays }) }}</span>
            </button>

            <button
              type="button"
              @click="budgetStore.setCustomDays(budgetStore.effectiveDays)"
              class="py-1.5 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer font-medium"
              :class="[
                !budgetStore.isSyncWithSchedule
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800',
              ]"
            >
              <span>{{ t('budget.daysControl.customDays') }}</span>
            </button>
          </div>

          <!-- 模式狀態提示說明 -->
          <div class="text-[11px] leading-relaxed text-slate-500">
            <template v-if="budgetStore.isSyncWithSchedule">
              {{ t('budget.daysControl.syncScheduleHint', { days: budgetStore.scheduleTotalDays }) }}
            </template>
            <template v-else>
              {{ t('budget.daysControl.customDaysHint', { days: budgetStore.effectiveDays }) }}
              <span v-if="budgetStore.isScheduleDaysDifferent" class="text-amber-700 font-medium ml-1">
                {{ t('budget.daysControl.diffScheduleHint', { days: budgetStore.scheduleTotalDays }) }}
              </span>
            </template>
          </div>

          <!-- 天數滑桿 (精確翡翠綠 #10b981 進度條，絕無暗沉黑化) -->
          <div class="space-y-2 pt-0.5">
            <input
              type="range"
              min="1"
              max="60"
              :value="budgetStore.effectiveDays"
              @input="budgetStore.setCustomDays(Number(($event.target as HTMLInputElement).value))"
              class="budget-slider w-full cursor-pointer h-1.5 rounded-lg"
              :style="{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${sliderPercentage}%, #e2e8f0 ${sliderPercentage}%, #e2e8f0 100%)`,
              }"
            />
            <div class="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{{ t('budget.daysControl.dayMarks.one') }}</span>
              <span>{{ t('budget.daysControl.dayMarks.twenty') }}</span>
              <span>{{ t('budget.daysControl.dayMarks.classic') }}</span>
              <span>{{ t('budget.daysControl.dayMarks.sixty') }}</span>
            </div>
          </div>
        </div>

        <!-- 3. 自訂參考匯率控制列 (英文模式隱藏) -->
        <div
          v-if="locale !== 'en'"
          class="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-2">
            <Info class="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span class="text-sm text-slate-800 block">{{ t('budget.exchangeRate.title') }}</span>
              <span class="text-[12px] text-slate-400">{{ t('budget.exchangeRate.hint') }}</span>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <span class="text-xs text-slate-600 font-mono">{{ t('budget.exchangeRate.unit') }}</span>
            <input
              type="number"
              step="0.1"
              min="10"
              max="100"
              :value="budgetStore.eurToTwdRate"
              @focus="handleInputFocus"
              @change="budgetStore.setRate(Number(($event.target as HTMLInputElement).value))"
              class="w-16 px-2 py-1 text-xs font-mono text-slate-900 border border-slate-200 rounded-lg bg-slate-50 text-right focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
            />
            <span class="text-xs text-slate-600">TWD</span>
          </div>
        </div>
      </div>

      <!-- 右欄：四大象限詳細開銷面板 (lg: 7 欄) -->
      <div class="lg:col-span-7 space-y-4">
        <!-- 一、行前固定支出 -->
        <div class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <h3 class="text-xs sm:text-sm md:text-base text-slate-800 flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Plane class="w-4 h-4 text-sky-600 shrink-0" />
              <span>{{ t('budget.categories.fixed') }}</span>
            </h3>
            <span class="text-xs font-bold font-mono text-slate-900 shrink-0 whitespace-nowrap">
              <template v-if="locale === 'en'">
                {{ t('budget.categories.fixedSubtotal', { eur: fixedSubtotalEur.toLocaleString() }) }}
              </template>
              <template v-else>
                {{ t('budget.categories.fixedSubtotal', { twd: budgetStore.summary.totalFixedTwd.toLocaleString() }) }}
              </template>
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[12px] text-slate-500 mb-1">{{ t('budget.categories.flight') }}</label>
              <input
                type="number"
                :step="locale === 'en' ? 10 : 500"
                min="0"
                :value="getDetailInputValue('flightTwd')"
                @focus="handleInputFocus"
                @input="handleInputChange('flightTwd', $event)"
                class="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label class="block text-[12px] text-slate-500 mb-1">{{ t('budget.categories.gear') }}</label>
              <input
                type="number"
                :step="locale === 'en' ? 10 : 500"
                min="0"
                :value="getDetailInputValue('gearTwd')"
                @focus="handleInputFocus"
                @input="handleInputChange('gearTwd', $event)"
                class="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label class="block text-[12px] text-slate-500 mb-1">{{ t('budget.categories.insuranceAndSim') }}</label>
              <input
                type="number"
                :step="locale === 'en' ? 5 : 200"
                min="0"
                :value="getDetailInputValue('insuranceAndSimTwd')"
                @focus="handleInputFocus"
                @input="handleInputChange('insuranceAndSimTwd', $event)"
                class="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
            </div>
          </div>
        </div>

        <!-- 二、徒步路上每日開銷 (EUR/天) -->
        <div class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <h3 class="text-xs sm:text-sm md:text-base text-slate-800 flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Footprints class="w-4 h-4 text-amber-500 shrink-0" />
              <span>{{ t('budget.categories.daily', { days: budgetStore.effectiveDays }) }}</span>
            </h3>
            <div class="text-right shrink-0">
              <span class="text-xs font-bold font-mono text-slate-900 block">
                €{{ budgetStore.summary.totalDailyWalkingEur.toFixed(2) }}
              </span>
              <span
                v-if="locale !== 'en'"
                class="text-[11px] text-slate-400 font-mono block whitespace-nowrap"
              >
                約 NT$ {{ budgetStore.summary.totalDailyWalkingTwd.toLocaleString() }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label class="block text-[12px] text-slate-500 mb-1">{{ t('budget.categories.lodging') }}</label>
              <input
                type="number"
                step="1"
                min="0"
                :value="getDetailInputValue('lodgingEurPerDay')"
                @focus="handleInputFocus"
                @input="handleInputChange('lodgingEurPerDay', $event)"
                class="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block font-mono text-right">
                {{ t('budget.categories.lodgingSubtotal', { eur: budgetStore.summary.lodgingTotalEur.toFixed(2) }) }}
              </span>
            </div>

            <div>
              <label class="block text-[12px] text-slate-500 mb-1">{{ t('budget.categories.food') }}</label>
              <input
                type="number"
                step="1"
                min="0"
                :value="getDetailInputValue('foodEurPerDay')"
                @focus="handleInputFocus"
                @input="handleInputChange('foodEurPerDay', $event)"
                class="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block font-mono text-right">
                {{ t('budget.categories.foodSubtotal', { eur: budgetStore.summary.foodTotalEur.toFixed(2) }) }}
              </span>
            </div>

            <div>
              <label class="block text-[12px] text-slate-500 mb-1">{{ t('budget.categories.laundry') }}</label>
              <input
                type="number"
                step="1"
                min="0"
                :value="getDetailInputValue('laundryEurPerDay')"
                @focus="handleInputFocus"
                @input="handleInputChange('laundryEurPerDay', $event)"
                class="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block font-mono text-right">
                {{ t('budget.categories.laundrySubtotal', { eur: budgetStore.summary.laundryTotalEur.toFixed(2) }) }}
              </span>
            </div>

            <div>
              <label class="block text-[12px] text-slate-500 mb-1">{{ t('budget.categories.luggage') }}</label>
              <input
                type="number"
                step="1"
                min="0"
                :value="getDetailInputValue('luggageTransferEurPerDay')"
                @focus="handleInputFocus"
                @input="handleInputChange('luggageTransferEurPerDay', $event)"
                class="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block font-mono text-right">
                {{ t('budget.categories.luggageSubtotal', { eur: budgetStore.summary.luggageTotalEur.toFixed(2) }) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 三、前後跨國接駁交通 (EUR) -->
        <div class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <h3 class="text-xs sm:text-sm md:text-base text-slate-800 flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Train class="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{{ t('budget.categories.transit') }}</span>
            </h3>
            <div class="text-right shrink-0">
              <span class="text-xs font-bold font-mono text-slate-900 block">
                €{{ budgetStore.summary.transitTotalEur.toFixed(2) }}
              </span>
              <span
                v-if="locale !== 'en'"
                class="text-[11px] text-slate-400 font-mono block whitespace-nowrap"
              >
                約 NT$ {{ budgetStore.summary.transitTotalTwd.toLocaleString() }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] text-slate-500 mb-1">{{ t('budget.categories.transitToStart') }}</label>
              <input
                type="number"
                step="5"
                min="0"
                :value="getDetailInputValue('transitToStartEur')"
                @focus="handleInputFocus"
                @input="handleInputChange('transitToStartEur', $event)"
                class="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label class="block text-[12px] text-slate-500 mb-1">{{ t('budget.categories.transitFromEnd') }}</label>
              <input
                type="number"
                step="5"
                min="0"
                :value="getDetailInputValue('transitFromEndEur')"
                @focus="handleInputFocus"
                @input="handleInputChange('transitFromEndEur', $event)"
                class="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
            </div>
          </div>
        </div>

        <!-- 四、突發應急金 (EUR) -->
        <div class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <h3 class="text-xs sm:text-sm md:text-base text-slate-800 flex items-center gap-1.5 sm:gap-2 min-w-0">
              <ShieldAlert class="w-4 h-4 text-amber-600 shrink-0" />
              <span>{{ t('budget.categories.emergency') }}</span>
            </h3>
            <div class="text-right shrink-0">
              <span class="text-xs font-bold font-mono text-slate-900 block">
                €{{ budgetStore.summary.emergencyFundEur.toFixed(2) }}
              </span>
              <span
                v-if="locale !== 'en'"
                class="text-[11px] text-slate-400 font-mono block whitespace-nowrap"
              >
                約 NT$ {{ budgetStore.summary.emergencyFundTwd.toLocaleString() }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-4">
            <p class="text-xs text-slate-500 leading-relaxed">
              {{ t('budget.categories.emergencyDesc') }}
            </p>
            <div class="w-32 shrink-0">
              <input
                type="number"
                step="50"
                min="0"
                :value="getDetailInputValue('emergencyFundEur')"
                @focus="handleInputFocus"
                @input="handleInputChange('emergencyFundEur', $event)"
                class="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden text-right"
              />
            </div>
          </div>
        </div>

        <!-- 商業廣告插槽 -->
        <GoogleAd slot-id="budget-bottom-ad" format="rectangle" />
      </div>
    </div>

    <!-- A4 紙本列印對話框 -->
    <PrintBudgetModal
      :is-open="isPrintModalOpen"
      :meta="exportMeta"
      @close="isPrintModalOpen = false"
    />
  </div>
</template>

<style scoped>
/* 精緻清新翠綠滑桿樣式，杜絕 Windows 瀏覽器原生 accent-color 造成的深墨綠黑化 */
.budget-slider {
  -webkit-appearance: none;
  appearance: none;
  outline: none;
}

.budget-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #10b981;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.budget-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.budget-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #10b981;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}
</style>
