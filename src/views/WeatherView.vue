<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  CloudSun,
  Thermometer,
  CloudRain,
  Umbrella,
  Wind,
  Mountain,
  Calendar,
  ArrowRight,
  Sparkles,
  Compass,
  BookOpen,
  HelpCircle,
  Menu,
  AlertTriangle,
  Info,
  ExternalLink,
  ChevronDown,
} from 'lucide-vue-next'
import AppFooter from '@/components/common/AppFooter.vue'
import MobileMenuDrawer from '@/components/common/MobileMenuDrawer.vue'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import ClimateChart from '@/components/weather/ClimateChart.vue'
import EditorialGuideSection from '@/components/common/EditorialGuideSection.vue'
import { getClimateZonesByRoute } from '@/data/climate'
import { buildWeatherAdvisory, summarizeRouteMonth } from '@/utils/weatherAdvisor'
import { useScheduleStore } from '@/stores/schedule'
import type { ClimateRouteId, ClimateZone, MonthlyClimateStats } from '@/types/climate'

const { t, locale } = useI18n()
const isEn = computed(() => locale.value.startsWith('en'))
const isMenuDrawerOpen = ref(false)
const isAdvisoryMobileOpen = ref(false)
const scheduleStore = useScheduleStore()

const ROUTE_OPTIONS: { id: ClimateRouteId; labelZh: string; labelEn: string }[] = [
  { id: 'frances', labelZh: '法國之路', labelEn: 'Camino Francés' },
  { id: 'portugues', labelZh: '葡萄牙之路', labelEn: 'Camino Portugués' },
  { id: 'norte', labelZh: '北方之路', labelEn: 'Camino del Norte' },
  { id: 'finisterre', labelZh: '世界盡頭延伸線', labelEn: 'Finisterre & Muxía' },
]

// 預設帶入使用者排程路線與出發月份（若尚未設定則預設法國之路 5 月）
function parseScheduleMonth(): number | null {
  const dateStr = scheduleStore.currentDraft?.startDate
  if (!dateStr) return null
  const parts = dateStr.split('-')
  const month = Number(parts[1])
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : null
}

function resolveInitialRoute(routeId?: string): ClimateRouteId {
  return ROUTE_OPTIONS.some((opt) => opt.id === routeId)
    ? (routeId as ClimateRouteId)
    : 'frances'
}

const scheduleMonth = computed(() => parseScheduleMonth())
const selectedRoute = ref<ClimateRouteId>(resolveInitialRoute(scheduleStore.currentRouteId))
const selectedMonth = ref<number>(scheduleMonth.value ?? 5)

const routeZones = computed<ClimateZone[]>(() => getClimateZonesByRoute(selectedRoute.value))
const activeZoneId = ref<string>(routeZones.value[0]?.id ?? '')
const expandedMobileZoneId = ref<string | null>(activeZoneId.value || null)

watch(routeZones, (zones) => {
  if (!zones.some((z) => z.id === activeZoneId.value)) {
    activeZoneId.value = zones[0]?.id ?? ''
  }
})

watch(activeZoneId, (id) => {
  expandedMobileZoneId.value = id || null
})

const activeZone = computed<ClimateZone | undefined>(() =>
  routeZones.value.find((z) => z.id === activeZoneId.value) ?? routeZones.value[0],
)

function getMonthStats(zone: ClimateZone, month: number): MonthlyClimateStats {
  return zone.monthly.find((m) => m.month === month) ?? zone.monthly[0]!
}

const activeMonthStats = computed<MonthlyClimateStats | null>(() => {
  if (!activeZone.value) return null
  return getMonthStats(activeZone.value, selectedMonth.value)
})

const activeAdvisory = computed(() => {
  if (!activeZone.value || !activeMonthStats.value) return null
  return buildWeatherAdvisory(activeMonthStats.value, activeZone.value)
})

const routeSummary = computed(() => summarizeRouteMonth(routeZones.value, selectedMonth.value))

function applyScheduleMonth() {
  if (scheduleMonth.value) {
    selectedMonth.value = scheduleMonth.value
  }
  if (scheduleStore.currentRouteId) {
    selectedRoute.value = scheduleStore.currentRouteId as ClimateRouteId
  }
}

function getMonthLabel(month: number): string {
  if (isEn.value) {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return names[month - 1] ?? ''
  }
  return `${month}月`
}

function getStationSourceUrl(zone: ClimateZone): string {
  if (zone.source === 'IPMA') {
    return 'https://www.ipma.pt/pt/oclima/normais.clima/1991-2020/'
  }
  return `https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos?l=${encodeURIComponent(zone.stationId)}`
}

function toggleMobileZone(zoneId: string) {
  expandedMobileZoneId.value = expandedMobileZoneId.value === zoneId ? null : zoneId
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
    <!-- 頂部導覽列 -->
    <header class="sticky top-0 z-40 h-14 sm:h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div class="mx-auto flex h-full max-w-360 items-center justify-between px-4 sm:px-6">
        <LocaleLink
          to="/"
          class="flex items-center gap-2.5 sm:gap-3 shrink-0 hover:opacity-85 transition-opacity"
        >
          <img
            src="/favicon.svg"
            :alt="$t('app.logoAlt')"
            width="36"
            height="36"
            class="h-8 w-8 sm:h-9 sm:w-9 shrink-0 drop-shadow-2xs"
          />
          <span class="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900">
            Camino Plan
          </span>
        </LocaleLink>

        <div class="hidden lg:flex items-center gap-2 whitespace-nowrap">
          <LocaleLink
            to="/history"
            active-class="!text-slate-800 bg-amber-50/80 font-semibold"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-amber-600 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles class="w-4 h-4 text-amber-500" />
            <span>{{ t('nav.history') }}</span>
          </LocaleLink>
          <LocaleLink
            to="/routes/frances"
            active-class="!text-slate-800 bg-emerald-50/80 font-semibold"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-emerald-600 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Compass class="w-4 h-4 text-emerald-600" />
            <span>{{ t('nav.routes') }}</span>
          </LocaleLink>
          <LocaleLink
            to="/guides"
            active-class="!text-slate-800 bg-violet-50/80 font-semibold"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-violet-600 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <BookOpen class="w-4 h-4 text-violet-500" />
            <span>{{ t('nav.guides') }}</span>
          </LocaleLink>
          <LocaleLink
            to="/weather"
            active-class="!text-slate-800 bg-teal-50/80 font-semibold"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-teal-600 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <CloudSun class="w-4 h-4 text-teal-600" />
            <span>{{ t('nav.weather') }}</span>
          </LocaleLink>
          <LocaleLink
            to="/faq"
            active-class="!text-slate-800 bg-sky-50/80 font-semibold"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-sky-600 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <HelpCircle class="w-4 h-4 text-sky-600" />
            <span>{{ t('nav.faq') }}</span>
          </LocaleLink>
          <LanguageSwitcher mode="dropdown" />
          <LocaleLink
            to="/schedule/frances"
            class="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-white shadow-xs transition-colors"
          >
            <span>{{ t('landing.startPlanning') }}</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </LocaleLink>
        </div>

        <button
          type="button"
          class="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          :aria-label="t('nav.openMenu')"
          @click="isMenuDrawerOpen = true"
        >
          <Menu class="w-5 h-5" />
        </button>
      </div>
    </header>

    <MobileMenuDrawer v-model:is-open="isMenuDrawerOpen" />

    <!-- 主內容區 -->
    <main class="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      <!-- 頁首標題 -->
      <section class="space-y-2">
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {{ t('weather.title') }}
        </h1>
        <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
          {{ t('weather.subtitle') }}
        </p>
      </section>

      <!-- 控制列：手機版雙欄下拉選單，桌機版快速按鈕列 -->
      <section class="rounded-2xl bg-white border border-slate-200/90 p-3.5 sm:p-5 shadow-2xs">
        <!-- 手機版（< sm）：路線 + 月份雙欄下拉選單 -->
        <div class="sm:hidden space-y-2.5">
          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label for="mobile-route-select" class="block text-[11px] font-medium text-slate-500 mb-1">
                {{ t('weather.selectRoute') }}
              </label>
              <select
                id="mobile-route-select"
                v-model="selectedRoute"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-amber-400 focus:bg-white focus:outline-hidden"
              >
                <option v-for="opt in ROUTE_OPTIONS" :key="opt.id" :value="opt.id">
                  {{ isEn ? opt.labelEn : opt.labelZh }}
                </option>
              </select>
            </div>
            <div>
              <label for="mobile-month-select" class="block text-[11px] font-medium text-slate-500 mb-1">
                {{ t('weather.selectMonth') }}
              </label>
              <select
                id="mobile-month-select"
                v-model.number="selectedMonth"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-sky-400 focus:bg-white focus:outline-hidden"
              >
                <option v-for="m in 12" :key="m" :value="m">
                  {{ getMonthLabel(m) }}
                </option>
              </select>
            </div>
          </div>

          <div v-if="scheduleMonth" class="flex items-center justify-between gap-2 pt-0.5">
            <span v-if="routeSummary" class="text-[11px] text-slate-500 pl-0.5">
              {{
                t('weather.routeMonthSummaryShort', {
                  low: routeSummary.minLowC,
                  high: routeSummary.maxHighC,
                  rain: routeSummary.maxRainyDays,
                })
              }}
            </span>
            <span v-else></span>
            <button
              type="button"
              @click="applyScheduleMonth"
              class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer shrink-0"
            >
              <Calendar class="w-3 h-3 shrink-0" />
              <span>{{ t('weather.syncScheduleBtn') }}</span>
            </button>
          </div>
        </div>

        <!-- 桌機版（>= sm）：路線按鈕 + 12 個月份快捷列 -->
        <div class="hidden sm:block space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2" role="tablist" :aria-label="t('weather.selectRoute')">
              <button
                v-for="opt in ROUTE_OPTIONS"
                :key="opt.id"
                type="button"
                role="tab"
                :aria-selected="selectedRoute === opt.id"
                :data-testid="`weather-route-${opt.id}`"
                @click="selectedRoute = opt.id"
                :class="[
                  'rounded-xl px-3.5 py-2 text-sm font-semibold border transition-all cursor-pointer',
                  selectedRoute === opt.id
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-white',
                ]"
              >
                {{ isEn ? opt.labelEn : opt.labelZh }}
              </button>
            </div>

            <button
              v-if="scheduleMonth"
              type="button"
              @click="applyScheduleMonth"
              class="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <Calendar class="w-3.5 h-3.5" />
              <span>{{ t('weather.syncScheduleBtn') }}</span>
            </button>
          </div>

          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span class="font-medium">{{ t('weather.selectMonth') }}</span>
              <span v-if="routeSummary" class="font-medium text-slate-700">
                {{
                  t('weather.routeMonthSummary', {
                    month: getMonthLabel(selectedMonth),
                    low: routeSummary.minLowC,
                    high: routeSummary.maxHighC,
                    rain: routeSummary.maxRainyDays,
                  })
                }}
              </span>
            </div>
            <div class="grid grid-cols-12 gap-1.5">
              <button
                v-for="m in 12"
                :key="m"
                type="button"
                :data-testid="`weather-month-${m}`"
                @click="selectedMonth = m"
                :class="[
                  'rounded-lg py-1.5 text-xs font-semibold border transition-all cursor-pointer',
                  selectedMonth === m
                    ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-700',
                ]"
              >
                {{ getMonthLabel(m) }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 主視覺化區：12 個月趨勢圖 + 當月裝備決策 -->
      <section v-if="activeZone && activeMonthStats && activeAdvisory" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左側 2/3：Chart.js 互動圖表 -->
        <div class="lg:col-span-2 rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-4">
          <div>
            <h2 class="text-base sm:text-lg font-bold text-slate-900">
              {{ isEn ? activeZone.zoneNameEn : activeZone.zoneName }}
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span>{{ isEn ? activeZone.representativeTownsEn : activeZone.representativeTowns }}</span>
              <span>·</span>
              <a
                :href="getStationSourceUrl(activeZone)"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 hover:underline font-medium"
              >
                <span>{{ activeZone.source }} {{ activeZone.stationName }} ({{ activeZone.stationElevationM }}m)</span>
                <ExternalLink class="w-3 h-3" />
              </a>
            </p>
          </div>

          <!-- 區段切換：手機版下拉選單，桌機版頁籤 -->
          <div class="sm:hidden">
            <select
              v-model="activeZoneId"
              aria-label="選擇氣候區段"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-sky-400 focus:bg-white focus:outline-hidden"
            >
              <option v-for="zone in routeZones" :key="zone.id" :value="zone.id">
                {{ isEn ? zone.zoneNameEn : zone.zoneName }}
              </option>
            </select>
          </div>

          <div class="hidden sm:flex flex-wrap gap-1.5">
            <button
              v-for="zone in routeZones"
              :key="zone.id"
              type="button"
              @click="activeZoneId = zone.id"
              :class="[
                'rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer',
                activeZone.id === zone.id
                  ? 'bg-sky-50 text-sky-800 border-sky-300 font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white',
              ]"
            >
              {{ isEn ? zone.zoneNameEn : zone.zoneName }}
            </button>
          </div>

          <!-- 當前區段當月即時數據摘要（手機免往下滑即可直接檢視） -->
          <div class="grid grid-cols-3 gap-2 rounded-xl bg-slate-50/90 border border-slate-200/70 p-2.5 text-center">
            <div>
              <div class="text-[11px] text-slate-500">{{ getMonthLabel(selectedMonth) }} {{ t('weather.cardLowHigh') }}</div>
              <div class="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                {{ activeMonthStats.avgLowC }}°–{{ activeMonthStats.avgHighC }}°C
              </div>
            </div>
            <div>
              <div class="text-[11px] text-slate-500">{{ t('weather.cardRainDays') }}</div>
              <div class="text-xs sm:text-sm font-bold text-sky-700 mt-0.5">
                {{ activeMonthStats.rainyDays }} {{ t('weather.daysUnit') }}
              </div>
            </div>
            <div>
              <div class="text-[11px] text-slate-500">{{ t('weather.cardPrecip') }}</div>
              <div class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                {{ activeMonthStats.precipMm }} mm
              </div>
            </div>
          </div>

          <ClimateChart
            :monthly="activeZone.monthly"
            :selected-month="selectedMonth"
            :station-label="isEn ? activeZone.zoneNameEn : activeZone.zoneName"
            @select-month="selectedMonth = $event"
          />

          <div class="space-y-2 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
            <p>
              {{ t('weather.chartHint') }}
            </p>
            <div class="flex items-start gap-1.5 text-slate-500">
              <Info class="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <i18n-t keypath="weather.sourceNote" tag="p" class="leading-relaxed">
                <template #aemet>
                  <a
                    href="https://www.aemet.es/es/serviciosclimaticos/datosclimatologicos/valoresclimatologicos"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="underline decoration-slate-400 hover:text-slate-700 transition-colors"
                  >AEMET</a>
                </template>
                <template #ipma>
                  <a
                    href="https://www.ipma.pt/pt/oclima/normais.clima/1991-2020/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="underline decoration-slate-400 hover:text-slate-700 transition-colors"
                  >IPMA</a>
                </template>
              </i18n-t>
            </div>
          </div>
        </div>

        <!-- 右側 1/3：選定月份之睡袋與雨具決策卡（手機可收合，桌機常駐展開） -->
        <aside
          :class="[
            'rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between',
            isAdvisoryMobileOpen ? 'p-4 sm:p-6 space-y-4' : 'px-4 py-3 lg:p-6 lg:space-y-4',
          ]"
        >
          <div :class="[isAdvisoryMobileOpen ? 'space-y-4' : 'lg:space-y-4']">
            <!-- 手機版可點擊收合標題列 -->
            <button
              type="button"
              @click="isAdvisoryMobileOpen = !isAdvisoryMobileOpen"
              class="lg:hidden w-full flex items-center justify-between gap-2 text-left cursor-pointer"
              :aria-expanded="isAdvisoryMobileOpen"
            >
              <div>
                <h2 class="text-sm font-bold text-slate-900">
                  {{ getMonthLabel(selectedMonth) }} · {{ t('weather.advisoryTitle') }}
                </h2>
                <p v-if="!isAdvisoryMobileOpen" class="text-xs text-slate-500 mt-0.5">
                  {{ isEn ? activeAdvisory.sleepingBagRatingEn : activeAdvisory.sleepingBagRating }} · {{ t(`weather.rainGearShort.${activeAdvisory.rainGearLevel}`) }}
                </p>
              </div>
              <ChevronDown
                :class="[
                  'w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200',
                  isAdvisoryMobileOpen ? 'rotate-180' : '',
                ]"
              />
            </button>

            <!-- 桌機版標題列 -->
            <div class="hidden lg:flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 class="text-base font-bold text-slate-900">
                {{ getMonthLabel(selectedMonth) }} · {{ t('weather.advisoryTitle') }}
              </h2>
              <span class="text-sm font-bold text-slate-800">
                {{ activeMonthStats.avgLowC }}°C – {{ activeMonthStats.avgHighC }}°C
              </span>
            </div>

            <div :class="[isAdvisoryMobileOpen ? 'block' : 'hidden lg:block', 'space-y-4']">
              <!-- 核心建議指標 -->
              <div class="space-y-3 text-xs sm:text-sm">
                <div class="rounded-xl bg-slate-50 p-3 space-y-1">
                  <div class="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Thermometer class="w-4 h-4 text-amber-500" />
                    <span>{{ t('weather.sleepingBagLabel') }}</span>
                  </div>
                  <p class="text-slate-600 pl-5.5">
                    {{ isEn ? activeAdvisory.sleepingBagRatingEn : activeAdvisory.sleepingBagRating }}
                  </p>
                </div>

                <div class="rounded-xl bg-slate-50 p-3 space-y-1">
                  <div class="font-semibold text-slate-700 flex items-center gap-1.5">
                    <CloudRain class="w-4 h-4 text-sky-500" />
                    <span>{{ t('weather.rainGearLabel') }}</span>
                  </div>
                  <p class="text-slate-600 pl-5.5">
                    {{ t(`weather.rainGear.${activeAdvisory.rainGearLevel}`) }}
                    （{{ activeMonthStats.rainyDays }} {{ t('weather.daysUnit') }} / {{ activeMonthStats.precipMm }} mm）
                  </p>
                </div>
              </div>

              <!-- 注意事項清單（一般項目採數字編號，高海拔溫差特別強調才使用圖示） -->
              <div v-if="activeAdvisory.alerts.length > 0 || activeZone.altitudeNote" class="space-y-2">
                <div class="text-xs font-semibold text-slate-500 tracking-wider">
                  {{ t('weather.alertsTitle') }}
                </div>
                <ol v-if="activeAdvisory.alerts.length > 0" class="space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 leading-relaxed">
                  <li
                    v-for="(alert, idx) in isEn ? activeAdvisory.alertsEn : activeAdvisory.alerts"
                    :key="idx"
                    class="flex items-start gap-2"
                  >
                    <span class="font-semibold text-slate-400 shrink-0">{{ idx + 1 }}.</span>
                    <span>{{ alert }}</span>
                  </li>
                </ol>

                <!-- 特別強調：高海拔溫差落差提醒 -->
                <div
                  v-if="activeZone.altitudeNote"
                  class="flex items-start gap-2 rounded-xl bg-amber-50/80 border border-amber-200/80 p-2.5 text-xs text-amber-900 leading-relaxed"
                >
                  <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{{ isEn ? activeZone.altitudeNoteEn : activeZone.altitudeNote }}</span>
                </div>
              </div>
            </div>
          </div>

          <div :class="[isAdvisoryMobileOpen ? 'block' : 'hidden lg:block', 'space-y-2.5']">
            <LocaleLink
              to="/packing"
              class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 transition-colors"
            >
              <span>{{ t('weather.goPackingBtn') }}</span>
              <ArrowRight class="w-4 h-4" />
            </LocaleLink>
            <LocaleLink
              to="/guides/best-seasons"
              class="block text-center text-xs text-slate-500 hover:text-teal-700 underline decoration-slate-300 transition-colors"
            >
              {{ t('weather.seasonGuideLink') }}
            </LocaleLink>
          </div>
        </aside>
      </section>

      <!-- 沿線所有氣候區段對比（手機版可獨立展開明細，桌機版 3 欄卡片） -->
      <section class="space-y-3" data-testid="weather-zone-cards">
        <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <h2 class="text-base sm:text-lg font-bold text-slate-900">
            {{ t('weather.corridorTitle', { month: getMonthLabel(selectedMonth) }) }}
          </h2>
          <span class="text-xs text-slate-500">{{ t('weather.corridorSubtitle') }}</span>
        </div>

        <!-- 手機版（< md）：每區段獨立可展開手風琴列表 -->
        <div class="md:hidden divide-y divide-slate-200/80 rounded-2xl bg-white border border-slate-200/90 overflow-hidden">
          <div
            v-for="zone in routeZones"
            :key="`mobile-${zone.id}`"
            :class="[activeZone?.id === zone.id ? 'bg-sky-50/40' : 'bg-white']"
          >
            <button
              type="button"
              @click="toggleMobileZone(zone.id)"
              :aria-expanded="expandedMobileZoneId === zone.id"
              class="w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50/80 cursor-pointer"
            >
              <div class="min-w-0">
                <div class="text-xs font-bold text-slate-900 truncate">
                  {{ isEn ? zone.zoneNameEn : zone.zoneName }}
                </div>
                <div class="text-[11px] text-slate-500 truncate mt-0.5">
                  {{ isEn ? zone.representativeTownsEn : zone.representativeTowns }}
                </div>
              </div>
              <div class="flex items-center gap-2.5 shrink-0">
                <div v-if="expandedMobileZoneId !== zone.id" class="text-right">
                  <div class="text-xs font-bold text-slate-900">
                    {{ getMonthStats(zone, selectedMonth).avgLowC }}°–{{ getMonthStats(zone, selectedMonth).avgHighC }}°C
                  </div>
                  <div class="inline-flex items-center justify-end gap-1 text-[11px] font-medium text-sky-700 mt-0.5">
                    <Umbrella class="w-3 h-3 shrink-0" />
                    <span>{{ getMonthStats(zone, selectedMonth).rainyDays }} {{ t('weather.daysUnit') }}</span>
                  </div>
                </div>
                <ChevronDown
                  :class="[
                    'w-4 h-4 text-slate-400 transition-transform duration-200',
                    expandedMobileZoneId === zone.id ? 'rotate-180' : '',
                  ]"
                />
              </div>
            </button>

            <!-- 展開後顯示該區段完整資訊 -->
            <div v-if="expandedMobileZoneId === zone.id" class="px-4 pb-3.5 pt-1 space-y-2.5 border-t border-slate-100">
              <div class="grid grid-cols-4 gap-1 rounded-xl bg-slate-50 px-1.5 py-2.5 text-center">
                <div>
                  <div class="text-[10px] text-slate-500">{{ t('weather.cardLowHigh') }}</div>
                  <div class="text-[11px] font-bold text-slate-900 mt-0.5 whitespace-nowrap">
                    {{ getMonthStats(zone, selectedMonth).avgLowC }}°–{{ getMonthStats(zone, selectedMonth).avgHighC }}°C
                  </div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-500">{{ t('weather.cardRainDays') }}</div>
                  <div class="text-[11px] font-bold text-sky-700 mt-0.5 whitespace-nowrap">
                    {{ getMonthStats(zone, selectedMonth).rainyDays }} {{ t('weather.daysUnit') }}
                  </div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-500">{{ t('weather.cardPrecip') }}</div>
                  <div class="text-[11px] font-bold text-slate-700 mt-0.5 whitespace-nowrap">
                    {{ getMonthStats(zone, selectedMonth).precipMm }} mm
                  </div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-500">{{ t('weather.elevationLabel') }}</div>
                  <div class="text-[11px] font-bold text-slate-700 mt-0.5 whitespace-nowrap">
                    {{ zone.trailElevationRangeM[0] }}–{{ zone.trailElevationRangeM[1] }}m
                  </div>
                </div>
              </div>

              <div
                v-if="getMonthStats(zone, selectedMonth).frostDays >= 1 || zone.isWindExposed || zone.hasHighAltitudeDrop"
                class="flex flex-wrap items-center justify-end gap-1.5 text-[11px]"
              >
                <span
                  v-if="getMonthStats(zone, selectedMonth).frostDays >= 1"
                  class="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 font-medium text-sky-700"
                >
                  {{ t('weather.frostTag', { days: getMonthStats(zone, selectedMonth).frostDays }) }}
                </span>
                <span
                  v-if="zone.isWindExposed"
                  class="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 font-medium text-teal-700"
                >
                  <Wind class="w-3 h-3" />
                  {{ t('weather.windTag') }}
                </span>
                <span
                  v-if="zone.hasHighAltitudeDrop"
                  class="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700"
                >
                  <Mountain class="w-3 h-3" />
                  {{ t('weather.altitudeTag') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 桌機與平板（>= md）：完整 3 欄對比卡片 -->
        <div class="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="zone in routeZones"
            :key="zone.id"
            type="button"
            :data-testid="`weather-zone-card-${zone.id}`"
            @click="activeZoneId = zone.id"
            :class="[
              'text-left rounded-2xl bg-white p-4 border transition-all cursor-pointer space-y-3',
              activeZone?.id === zone.id
                ? 'border-sky-400 ring-2 ring-sky-100 shadow-sm'
                : 'border-slate-200/90 hover:border-slate-300 shadow-2xs',
            ]"
          >
            <div>
              <h3 class="text-sm font-bold text-slate-900">
                {{ isEn ? zone.zoneNameEn : zone.zoneName }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ isEn ? zone.representativeTownsEn : zone.representativeTowns }}
              </p>
            </div>

            <div class="grid grid-cols-4 gap-1.5 rounded-xl bg-slate-50 p-2.5 text-center">
              <div>
                <div class="text-[11px] text-slate-500">{{ t('weather.cardLowHigh') }}</div>
                <div class="text-xs font-bold text-slate-900 mt-0.5 whitespace-nowrap">
                  {{ getMonthStats(zone, selectedMonth).avgLowC }}°–{{ getMonthStats(zone, selectedMonth).avgHighC }}°C
                </div>
              </div>
              <div>
                <div class="text-[11px] text-slate-500">{{ t('weather.cardRainDays') }}</div>
                <div class="text-xs font-bold text-sky-700 mt-0.5 whitespace-nowrap">
                  {{ getMonthStats(zone, selectedMonth).rainyDays }} {{ t('weather.daysUnit') }}
                </div>
              </div>
              <div>
                <div class="text-[11px] text-slate-500">{{ t('weather.cardPrecip') }}</div>
                <div class="text-xs font-bold text-slate-700 mt-0.5 whitespace-nowrap">
                  {{ getMonthStats(zone, selectedMonth).precipMm }} mm
                </div>
              </div>
              <div>
                <div class="text-[11px] text-slate-500">{{ t('weather.elevationLabel') }}</div>
                <div class="text-xs font-bold text-slate-700 mt-0.5 whitespace-nowrap">
                  {{ zone.trailElevationRangeM[0] }}–{{ zone.trailElevationRangeM[1] }}m
                </div>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-end gap-1.5 text-[11px]">
              <span
                v-if="getMonthStats(zone, selectedMonth).frostDays >= 1"
                class="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 font-medium text-sky-700"
              >
                {{ t('weather.frostTag', { days: getMonthStats(zone, selectedMonth).frostDays }) }}
              </span>
              <span
                v-if="zone.isWindExposed"
                class="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 font-medium text-teal-700"
              >
                <Wind class="w-3 h-3" />
                {{ t('weather.windTag') }}
              </span>
              <span
                v-if="zone.hasHighAltitudeDrop"
                class="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700"
              >
                <Mountain class="w-3 h-3" />
                {{ t('weather.altitudeTag') }}
              </span>
            </div>
          </button>
        </div>
      </section>

      <!-- 四季氣候特徵與路線穿衣裝備指南（提升頁面文字深度） -->
      <EditorialGuideSection i18n-prefix="editorial.weatherGuide" />
    </main>

    <AppFooter />
  </div>
</template>
