<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBudgetStore } from '@/stores/budget'
import { PERSONA_LABELS } from '@/utils/budgetCalculator'
import PrintBudgetModal from '@/components/budget/PrintBudgetModal.vue'
import GoogleAd from '@/components/common/GoogleAd.vue'
import type { BudgetExportMeta, BudgetDetails } from '@/types/budget'
import {
  Printer,
  RotateCcw,
  Plane,
  Footprints,
  Train,
  ShieldAlert,
  Info,
} from 'lucide-vue-next'

const budgetStore = useBudgetStore()

// 列印彈窗狀態
const isPrintModalOpen = ref(false)

// 組合導出結構
const exportMeta = computed<BudgetExportMeta>(() => {
  const personaInfo = PERSONA_LABELS[budgetStore.persona]
  const todayStr = new Date().toISOString().split('T')[0]
  return {
    ...budgetStore.summary,
    routeName: budgetStore.currentRouteName,
    personaName: personaInfo ? personaInfo.name : '個人自訂',
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

// 取得輸入框當前數值：null 呈現乾淨空白，數字（包含 0）如實呈現數字，兼顧自訂全空與 0 輸入保留
function getDetailInputValue(key: keyof BudgetDetails): number | string {
  const val = budgetStore.details[key]
  return val === null || val === undefined ? '' : val
}

// 統一輸入事件處理：刪空時儲存 null 保持該格空白，輸入 0 則儲存 0，不污染其他欄位
function handleInputChange(key: keyof BudgetDetails, event: Event) {
  const target = event.target as HTMLInputElement
  if (!target) return
  const raw = target.value.trim()
  if (raw === '') {
    budgetStore.updateDetail(key, null)
  } else {
    budgetStore.updateDetail(key, Number(raw))
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
              <h2 class="text-base sm:text-lg md:text-xl text-slate-800 leading-tight">
                朝聖花費預算試算
              </h2>
            </div>
          </div>

          <!-- 右側小工具：列印 ＋ 純文字複製 -->
          <div class="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              @click="isPrintModalOpen = true"
              class="text-xs border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 text-slate-600 px-2.5 sm:px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0"
              title="開啟 A4 紙本預算單預覽與列印"
            >
              <Printer class="w-3.5 h-3.5 text-slate-500" />
              <span>列印預算表</span>
            </button>
          </div>
        </div>

        <!-- 右側：三大即時看板數值 (無豎線、不粗體、純淨間距排版) -->
        <div class="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 shrink-0 bg-white sm:bg-transparent p-2 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
          <!-- 全程預估總額 -->
          <div class="flex flex-col items-start sm:items-end">
            <span class="text-[10px] sm:text-xs text-slate-500">全程預估總花費</span>
            <div class="flex items-baseline gap-1 text-slate-900 font-mono text-base sm:text-xl">
              <span>NT$</span>
              <span>{{ budgetStore.summary.grandTotalTwd.toLocaleString() }}</span>
            </div>
          </div>

          <!-- 歐洲當地開銷 -->
          <div class="flex flex-col items-start sm:items-end">
            <span class="text-[10px] sm:text-xs text-slate-500">歐洲當地總開銷</span>
            <div class="flex items-baseline gap-1 text-slate-900 font-mono text-sm sm:text-base">
              <span>€</span>
              <span>{{ budgetStore.summary.totalEur.toFixed(2) }}</span>
            </div>
          </div>

          <!-- 路上日均 -->
          <div class="flex flex-col items-start sm:items-end">
            <span class="text-[10px] sm:text-xs text-slate-500">路上步行日均</span>
            <div class="flex items-baseline gap-1 text-slate-900 font-mono text-sm sm:text-base">
              <span>€</span>
              <span>{{ budgetStore.summary.dailyAvgEur.toFixed(2) }}</span>
              <span class="text-[10px] text-slate-400">/天</span>
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
              預算風格類型
            </h3>
            <button
              type="button"
              @click="budgetStore.resetToDefaults()"
              class="text-[12px] text-slate-500 hover:text-slate-700 flex items-center gap-1 transition cursor-pointer"
              title="重設回預設值"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              重設
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
                  ? 'border-amber-300 bg-amber-50/50 ring-1 ring-amber-300'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50',
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <span>{{ PERSONA_LABELS.BUDGET.name }}</span>
                </span>
                <span class="text-[12px] font-mono font-medium px-2 py-0.5 rounded-full text-slate-600">
                  {{ PERSONA_LABELS.BUDGET.tag }}
                </span>
              </div>
              <p class="text-[12px] text-slate-500 mt-1 leading-relaxed">
                {{ PERSONA_LABELS.BUDGET.description }}
              </p>
            </button>

            <!-- 經典平衡型 (推薦) -->
            <button
              type="button"
              @click="budgetStore.setPersona('STANDARD')"
              class="p-3 rounded-xl border text-left transition-all cursor-pointer relative"
              :class="[
                budgetStore.persona === 'STANDARD'
                  ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50',
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <span>{{ PERSONA_LABELS.STANDARD.name }}</span>
                  <span class="text-[9px] font-normal px-1.5 py-0.5 rounded text-emerald-800 bg-emerald-20 border border-emerald-600">官方推薦</span>
                </span>
                <span class="text-[12px] font-mono font-medium px-2 py-0.5 rounded-full text-slate-600">
                  {{ PERSONA_LABELS.STANDARD.tag }}
                </span>
              </div>
              <p class="text-[12px] text-slate-500 mt-1 leading-relaxed">
                {{ PERSONA_LABELS.STANDARD.description }}
              </p>
            </button>

            <!-- 舒適無憂型 -->
            <button
              type="button"
              @click="budgetStore.setPersona('COMFORT')"
              class="p-3 rounded-xl border text-left transition-all cursor-pointer relative"
              :class="[
                budgetStore.persona === 'COMFORT'
                  ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50',
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <span>{{ PERSONA_LABELS.COMFORT.name }}</span>
                </span>
                <span class="text-[12px] font-mono font-medium px-2 py-0.5 rounded-full text-slate-600">
                  {{ PERSONA_LABELS.COMFORT.tag }}
                </span>
              </div>
              <p class="text-[12px] text-slate-500 mt-1 leading-relaxed">
                {{ PERSONA_LABELS.COMFORT.description }}
              </p>
            </button>

            <!-- 個人自訂型 (常態常駐，微調後自動切換高亮) -->
            <button
              type="button"
              @click="budgetStore.setPersona('CUSTOM')"
              class="p-3 rounded-xl border text-left transition-all cursor-pointer relative"
              :class="[
                budgetStore.persona === 'CUSTOM'
                  ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50',
              ]"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <span>{{ PERSONA_LABELS.CUSTOM.name }}</span>
                </span>
                <span class="text-[12px] font-mono font-medium px-2 py-0.5 rounded-full text-slate-600">
                  {{
                    budgetStore.hasCustomized && budgetStore.customDailyAvgEur > 0
                      ? `日均約 €${budgetStore.customDailyAvgEur.toFixed(0)}`
                      : PERSONA_LABELS.CUSTOM.tag
                  }}
                </span>
              </div>
              <p class="text-[12px] text-slate-500 mt-1 leading-relaxed">
                {{ PERSONA_LABELS.CUSTOM.description }}
              </p>
            </button>
          </div>
        </div>

        <!-- 2. 天數連動與自訂控制器 -->
        <div class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
          <div class="flex items-center justify-between">
            <h3 class="text-sm sm:text-base text-slate-800">
              徒步總天數設定
            </h3>
            <span class="text-sm font-mono text-slate-700 px-2 py-0.5">
              {{ budgetStore.effectiveDays }} 天
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
              <span>連動排程 ({{ budgetStore.scheduleTotalDays }}天)</span>
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

              <span>自訂天數</span>
            </button>
          </div>

          <!-- 模式狀態提示說明 -->
          <div class="text-[11px] leading-relaxed text-slate-500">
            <template v-if="budgetStore.isSyncWithSchedule">
              即時連動目前排程天數（共 {{ budgetStore.scheduleTotalDays }} 天）。拖動滑桿可隨時切換為自訂天數推演。
            </template>
            <template v-else>
              目前為自訂模式（{{ budgetStore.effectiveDays }} 天）。
              <span v-if="budgetStore.isScheduleDaysDifferent" class="text-amber-700 font-medium">
                目前排程設定為 {{ budgetStore.scheduleTotalDays }} 天。
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
              <span>1 天</span>
              <span>20 天</span>
              <span>33 天 (經典)</span>
              <span>60 天</span>
            </div>
          </div>
        </div>

        <!-- 3. 自訂參考匯率控制列 -->
        <div class="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <Info class="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span class="text-sm text-slate-800 block">試算參考匯率</span>
              <span class="text-[12px] text-slate-400">可依個人實際換匯成本微調</span>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <span class="text-xs text-slate-600 font-mono">1 € ≈</span>
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
        <!-- 一、行前固定支出 (TWD) -->
        <div class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <h3 class="text-xs sm:text-sm md:text-base text-slate-800 flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Plane class="w-4 h-4 text-sky-600 shrink-0" />
              <span>一、行前固定支出</span>
            </h3>
            <span class="text-xs font-bold font-mono text-slate-900 shrink-0 whitespace-nowrap">
              小計：NT$ {{ budgetStore.summary.totalFixedTwd.toLocaleString() }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[12px] text-slate-500 mb-1">台灣來回機票 (NT$)</label>
              <input
                type="number"
                step="500"
                min="0"
                :value="getDetailInputValue('flightTwd')"
                @focus="handleInputFocus"
                @input="handleInputChange('flightTwd', $event)"
                class="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label class="block text-[12px] text-slate-500 mb-1">裝備增補採購 (NT$)</label>
              <input
                type="number"
                step="500"
                min="0"
                :value="getDetailInputValue('gearTwd')"
                @focus="handleInputFocus"
                @input="handleInputChange('gearTwd', $event)"
                class="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label class="block text-[12px] text-slate-500 mb-1">申根保險與網卡 (NT$)</label>
              <input
                type="number"
                step="200"
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
              <span>二、徒步每日開銷 ( {{ budgetStore.effectiveDays }} 天)</span>
            </h3>
            <div class="text-right shrink-0">
              <span class="text-xs font-bold font-mono text-slate-900 block">
                €{{ budgetStore.summary.totalDailyWalkingEur.toFixed(2) }}
              </span>
              <span class="text-[11px] text-slate-400 font-mono block whitespace-nowrap">
                約 NT$ {{ budgetStore.summary.totalDailyWalkingTwd.toLocaleString() }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label class="block text-[12px] text-slate-500 mb-1">住宿床位 (€/晚)</label>
              <input
                type="number"
                step="1"
                min="0"
                :value="getDetailInputValue('lodgingEurPerDay')"
                @focus="handleInputFocus"
                @input="handleInputChange('lodgingEurPerDay', $event)"
                class="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block font-mono text-right">小計 €{{ budgetStore.summary.lodgingTotalEur.toFixed(2) }}</span>
            </div>

            <div>
              <label class="block text-[12px] text-slate-500 mb-1">三餐補給 (€/天)</label>
              <input
                type="number"
                step="1"
                min="0"
                :value="getDetailInputValue('foodEurPerDay')"
                @focus="handleInputFocus"
                @input="handleInputChange('foodEurPerDay', $event)"
                class="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block font-mono text-right">小計 €{{ budgetStore.summary.foodTotalEur.toFixed(2) }}</span>
            </div>

            <div>
              <label class="block text-[12px] text-slate-500 mb-1">洗衣雜支 (€/天)</label>
              <input
                type="number"
                step="1"
                min="0"
                :value="getDetailInputValue('laundryEurPerDay')"
                @focus="handleInputFocus"
                @input="handleInputChange('laundryEurPerDay', $event)"
                class="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block font-mono text-right">小計 €{{ budgetStore.summary.laundryTotalEur.toFixed(2) }}</span>
            </div>

            <div>
              <label class="block text-[12px] text-slate-500 mb-1">行李托運 (€/天)</label>
              <input
                type="number"
                step="1"
                min="0"
                :value="getDetailInputValue('luggageTransferEurPerDay')"
                @focus="handleInputFocus"
                @input="handleInputChange('luggageTransferEurPerDay', $event)"
                class="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-amber-500 outline-hidden"
              />
              <span class="text-[10px] text-slate-400 mt-0.5 block font-mono text-right">小計 €{{ budgetStore.summary.luggageTotalEur.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- 三、前後跨國接駁交通 (EUR) -->
        <div class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <h3 class="text-xs sm:text-sm md:text-base text-slate-800 flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Train class="w-4 h-4 text-indigo-600 shrink-0" />
              <span>三、前後跨國接駁交通</span>
            </h3>
            <div class="text-right shrink-0">
              <span class="text-xs font-bold font-mono text-slate-900 block">
                €{{ budgetStore.summary.transitTotalEur.toFixed(2) }}
              </span>
              <span class="text-[11px] text-slate-400 font-mono block whitespace-nowrap">
                約 NT$ {{ budgetStore.summary.transitTotalTwd.toLocaleString() }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] text-slate-500 mb-1">入境機場前往徒步起點 (€)</label>
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
              <label class="block text-[12px] text-slate-500 mb-1">終點返回出境機場 (€)</label>
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
              <span>四、突發應急預備金</span>
            </h3>
            <div class="text-right shrink-0">
              <span class="text-xs font-bold font-mono text-slate-900 block">
                €{{ budgetStore.summary.emergencyFundEur.toFixed(2) }}
              </span>
              <span class="text-[11px] text-slate-400 font-mono block whitespace-nowrap">
                約 NT$ {{ budgetStore.summary.emergencyFundTwd.toLocaleString() }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-4">
            <p class="text-xs text-slate-500 leading-relaxed">
              建議準備之緊急醫療、看病買藥、臨時搭計程車或因罷工緊急改票之預備現金或信用卡額度。
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
