<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ArrowRight,
  Footprints,
  Train,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  MapPin,
  CheckCircle2,
  HelpCircle,
  Menu,
} from 'lucide-vue-next'
import AppFooter from '@/components/common/AppFooter.vue'
import MobileMenuDrawer from '@/components/common/MobileMenuDrawer.vue'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import {
  ROUTES_GUIDE_LIST,
  FINISTERRE_GUIDE,
  type RouteGuideItem,
} from '@/data/routesGuide'
import type { RouteId } from '@/types/route'
import { useScheduleStore } from '@/stores/schedule'

const { t, locale } = useI18n()
const router = useRouter()
const scheduleStore = useScheduleStore()

// 當前選取之路線（預設為法國之路 'frances'）
const activeRouteId = ref<RouteId>('frances')
// 手機版全站漢堡選單抽屜開關狀態
const isMenuDrawerOpen = ref(false)

const currentRoute = computed<RouteGuideItem>(() => {
  return (
    ROUTES_GUIDE_LIST.find((r) => r.id === activeRouteId.value) ||
    ROUTES_GUIDE_LIST[0]
  )
})

function selectRoute(id: RouteId) {
  activeRouteId.value = id
}

// 點擊「開始此路線規劃」跳轉至排程頁並切換 Store 路線
function startSchedule(routeId: RouteId) {
  scheduleStore.switchRoute(routeId)
  router.push(`/schedule/${routeId}`)
}

// 點擊「前往交通指南」跳轉至對應起點交通頁
function goToTransport(routeId: RouteId) {
  scheduleStore.switchRoute(routeId)
  router.push(`/transport/${routeId}`)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
    <!-- 頂部獨立標準導覽列 -->
    <header class="sticky top-0 z-40 h-14 sm:h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div class="mx-auto flex h-full max-w-360 items-center justify-between px-4 sm:px-6">
        <!-- 品牌標誌 -->
        <router-link to="/" class="flex items-center gap-2.5 sm:gap-3 shrink-0 hover:opacity-85 transition-opacity">
          <img
            src="/favicon.svg"
            alt="Camino Plan 標誌"
            width="36"
            height="36"
            class="h-8 w-8 sm:h-9 sm:w-9 shrink-0 drop-shadow-2xs"
          />
          <div>
            <span class="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900">
              Camino Plan
            </span>
          </div>
        </router-link>

        <!-- 右側傳送門（電腦版完整展示） -->
        <div class="hidden md:flex items-center gap-1.5 sm:gap-2">
          <router-link
            to="/history"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-amber-600 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles class="w-4 h-4 text-amber-500" />
            <span>{{ t('routesGuide.historyLink') }}</span>
          </router-link>
          <router-link
            to="/faq"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-amber-600 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <HelpCircle class="w-4 h-4 text-emerald-600" />
            <span>{{ t('routesGuide.faqLink') }}</span>
          </router-link>
          <button
            type="button"
            @click="startSchedule(activeRouteId)"
            class="text-xs sm:text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white px-3 sm:px-4 py-1.5 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>{{ t('routesGuide.startPlanning') }}</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
          <LanguageSwitcher />
        </div>

        <!-- 右側傳送門（手機版：開始規劃 ＋ 語言切換 ＋ 漢堡選單） -->
        <div class="flex md:hidden items-center gap-1.5">
          <LanguageSwitcher />
          <button
            type="button"
            @click="startSchedule(activeRouteId)"
            class="text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 rounded-lg shadow-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{{ t('routesGuide.startPlanning') }}</span>
            <ChevronRight class="w-3 h-3" />
          </button>
          <button
            type="button"
            @click="isMenuDrawerOpen = true"
            class="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            :aria-label="t('nav.openMenu')"
          >
            <Menu class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- 全站手機版漢堡選單抽屜 -->
      <MobileMenuDrawer v-model:is-open="isMenuDrawerOpen" />
    </header>

    <!-- 主體內容 -->
    <main class="flex-1 py-8 sm:py-14 px-4 sm:px-6">
      <div class="mx-auto max-w-4xl space-y-10">
        <!-- 頁面標題區 -->
        <div class="text-center space-y-3">
          <h1 class="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            {{ t('routesGuide.pageTitle') }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {{ t('routesGuide.pageDescription') }}
          </p>
        </div>

        <!-- 路線切換標籤列 -->
        <div class="flex items-center justify-center">
          <div class="inline-flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl text-xs sm:text-sm font-medium shadow-2xs">
            <button
              v-for="route in ROUTES_GUIDE_LIST"
              :key="route.id"
              type="button"
              @click="selectRoute(route.id)"
              class="px-4 sm:px-6 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2"
              :class="[
                activeRouteId === route.id
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900',
              ]"
            >
              <span>{{ locale === 'en' && route.nameEn ? route.nameEn : route.name }}</span>
            </button>
          </div>
        </div>

        <!-- 當前選定路線之核心詳情全攻略（整合成單一白色大卡片） -->
        <article class="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-8">
          <!-- 1. 路線概況總覽與指標面板 -->
          <div class="space-y-6">
            <!-- 標題與西班牙文名 -->
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-slate-100">
              <div class="space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h2 class="text-xl sm:text-2xl font-bold text-slate-900">
                    {{ locale === 'en' && currentRoute.nameEn ? currentRoute.nameEn : currentRoute.name }}
                  </h2>
                  <span
                    v-if="currentRoute.badge || (locale === 'en' && currentRoute.badgeEn)"
                    class="text-xs text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full font-medium shrink-0 whitespace-nowrap"
                  >
                    {{ locale === 'en' && currentRoute.badgeEn ? currentRoute.badgeEn : currentRoute.badge }}
                  </span>
                </div>
                <p class="text-xs sm:text-sm text-slate-400 italic font-serif">
                  {{ currentRoute.spanishName }}
                </p>
              </div>

              <!-- 起點標籤 -->
              <div class="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl self-start md:self-center shrink-0">
                <MapPin class="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{{ t('routesGuide.metrics.startTownCountry') }} {{ locale === 'en' && currentRoute.startTownEn ? currentRoute.startTownEn : currentRoute.startTown }} · {{ locale === 'en' && currentRoute.startTownCountryEn ? currentRoute.startTownCountryEn : currentRoute.startTownCountry }}</span>
              </div>
            </div>

            <!-- 四大關鍵指標方塊（統一兩行結構） -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div class="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/70 space-y-0.5 min-w-0">
                <span class="text-xs text-slate-400">{{ t('routesGuide.metrics.totalDistance') }}</span>
                <p class="text-base sm:text-lg font-bold text-slate-900">
                  {{ currentRoute.totalDistanceKm }} <span class="text-xs font-normal text-slate-500">km</span>
                </p>
              </div>

              <div class="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/70 space-y-0.5 min-w-0">
                <span class="text-xs text-slate-400">{{ t('routesGuide.metrics.recommendedDays') }}</span>
                <p class="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {{ locale === 'en' && currentRoute.recommendedDaysEn ? currentRoute.recommendedDaysEn : currentRoute.recommendedDays }}
                </p>
              </div>

              <div class="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/70 space-y-0.5 min-w-0">
                <span class="text-xs text-slate-400">{{ t('routesGuide.metrics.difficulty') }}</span>
                <p class="text-sm sm:text-base font-bold text-amber-500 tracking-wider">
                  {{ '★'.repeat(currentRoute.difficultyStars) }}{{ '☆'.repeat(5 - currentRoute.difficultyStars) }}
                </p>
              </div>

              <div class="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/70 space-y-0.5 min-w-0">
                <span class="text-xs text-slate-400">{{ t('routesGuide.metrics.bestMonths') }}</span>
                <p class="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-snug break-words">
                  {{ locale === 'en' && currentRoute.bestMonthsEn ? currentRoute.bestMonthsEn : currentRoute.bestMonths }}
                </p>
              </div>
            </div>

            <!-- 路面鋪裝材質長條比例圖 -->
            <div class="space-y-2 pt-2">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs sm:text-sm text-slate-500">
                <span class="font-medium text-slate-600">{{ t('routesGuide.pavement.title') }}</span>
                <div class="flex items-center gap-2 text-xs flex-wrap">
                  <span class="inline-flex items-center gap-1 font-semibold text-emerald-700 whitespace-nowrap">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span>{{ t('routesGuide.pavement.trail') }} {{ currentRoute.pavementRatio.trail }}%</span>
                  </span>
                  <span class="text-slate-300">/</span>
                  <span class="inline-flex items-center gap-1 font-semibold text-amber-700 whitespace-nowrap">
                    <span class="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                    <span>{{ t('routesGuide.pavement.boardwalkOrCobble') }} {{ currentRoute.pavementRatio.boardwalkOrCobble }}%</span>
                  </span>
                  <span class="text-slate-300">/</span>
                  <span class="inline-flex items-center gap-1 font-semibold text-slate-600 whitespace-nowrap">
                    <span class="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                    <span>{{ t('routesGuide.pavement.asphalt') }} {{ currentRoute.pavementRatio.asphalt }}%</span>
                  </span>
                </div>
              </div>
              <div class="h-3.5 w-full rounded-full bg-slate-100 flex overflow-hidden p-0.5">
                <div
                  :style="{ width: `${currentRoute.pavementRatio.trail}%` }"
                  class="bg-emerald-500 rounded-l-full h-full"
                  :title="t('routesGuide.pavement.trail')"
                ></div>
                <div
                  :style="{ width: `${currentRoute.pavementRatio.boardwalkOrCobble}%` }"
                  class="bg-amber-400 h-full"
                  :title="t('routesGuide.pavement.boardwalkOrCobble')"
                ></div>
                <div
                  :style="{ width: `${currentRoute.pavementRatio.asphalt}%` }"
                  class="bg-slate-400 rounded-r-full h-full"
                  :title="t('routesGuide.pavement.asphalt')"
                ></div>
              </div>
              <p class="text-xs text-slate-500 leading-normal">
                * {{ locale === 'en' ? 'Calculated via OpenStreetMap (OSM) geographic data, GIS spatial analysis, and trail network topology. Actual conditions, terrain, and distances may vary depending on weather, route variants, and path maintenance.' : '數據依據 OpenStreetMap（OSM）開放地理資料及路網標籤，結合 GIS 空間分析與地形演算法計算得出，僅供參考。實際路況、地形及步行距離可能因路線變體、天候與道路狀況而有所差異。' }}
              </p>
            </div>

            <!-- 路線摘要與適合對象 -->
            <div class="space-y-2.5 pt-2">
              <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {{ locale === 'en' && currentRoute.summaryEn ? currentRoute.summaryEn : currentRoute.summary }}
              </p>
              <div class="rounded-xl bg-emerald-50/80 border border-emerald-200/70 p-3.5 text-xs sm:text-sm text-emerald-900">
                <strong class="font-bold">{{ t('routesGuide.sections.targetAudience') }}</strong> {{ locale === 'en' && currentRoute.targetAudienceEn ? currentRoute.targetAudienceEn : currentRoute.targetAudience }}
              </div>
            </div>

            <!-- 兩大快捷動作按鈕（品牌琥珀黃自適應按鈕） -->
            <div class="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                @click="startSchedule(currentRoute.id)"
                class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                <Footprints class="w-4 h-4" />
                <span>{{ t('routesGuide.startPlanning') }}</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                @click="goToTransport(currentRoute.id)"
                class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
              >
                <Train class="w-4 h-4 text-sky-700" />
                <span>{{ t('routesGuide.viewTransport') }}</span>
              </button>
            </div>
          </div>

          <!-- 分隔線 1 -->
          <hr class="border-t border-slate-200/80" />

          <!-- 2. 三大核心特色與實戰亮點（自然欄位排版，無獨立小卡片） -->
          <div class="space-y-4">
            <h3 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles class="w-4.5 h-4.5 text-amber-500" />
              <span>{{ locale === 'en' && currentRoute.nameEn ? currentRoute.nameEn : currentRoute.name }} · {{ t('routesGuide.sections.keyFeatures') }}</span>
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
              <div
                v-for="(feature, fIdx) in currentRoute.keyFeatures"
                :key="fIdx"
                class="space-y-1.5"
              >
                <h4 class="font-bold text-xs sm:text-sm text-slate-900">
                  {{ locale === 'en' && feature.titleEn ? feature.titleEn : feature.title }}
                </h4>
                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {{ locale === 'en' && feature.descriptionEn ? feature.descriptionEn : feature.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- 分隔線 2 -->
          <hr class="border-t border-slate-200/80" />

          <!-- 3. 行前注意事項（自然條列清單，無任何小卡片框） -->
          <div class="space-y-3">
            <h3 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle class="w-4.5 h-4.5 text-amber-500" />
              <span>{{ t('routesGuide.sections.pitfalls') }}</span>
            </h3>

            <ul class="space-y-2.5 pt-1">
              <li
                v-for="(warning, wIdx) in (locale === 'en' && currentRoute.pitfallWarningsEn?.length ? currentRoute.pitfallWarningsEn : currentRoute.pitfallWarnings)"
                :key="wIdx"
                class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2"></span>
                <span>{{ warning }}</span>
              </li>
            </ul>
          </div>

          <!-- 分隔線 3：行前注意事項與交通銜接指南之間的 Separator -->
          <hr class="border-t border-slate-200/80" />

          <!-- 4. 起點交通銜接指南（乾淨文字，無獨立內層框） -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Train class="w-4.5 h-4.5 text-sky-600" />
                <span>{{ t('routesGuide.sections.recommendedStart') }} {{ locale === 'en' && currentRoute.startTownEn ? currentRoute.startTownEn : currentRoute.startTown }}</span>
              </h3>
              <button
                type="button"
                @click="goToTransport(currentRoute.id)"
                class="text-xs sm:text-sm text-slate-600 hover:text-slate-900 underline-offset-2 cursor-pointer"
              >
                {{ t('routesGuide.viewTransport') }} ➔
              </button>
            </div>

            <div class="space-y-1 text-xs sm:text-sm text-slate-700 pt-1 leading-relaxed">
              <p>
                <strong class="font-semibold text-slate-900">{{ t('routesGuide.sections.hubCityLabel') }}</strong>{{ locale === 'en' && currentRoute.recommendedStartGuide.hubCityEn ? currentRoute.recommendedStartGuide.hubCityEn : currentRoute.recommendedStartGuide.hubCity }}
              </p>
              <p>
                {{ locale === 'en' && currentRoute.recommendedStartGuide.transferTipsEn ? currentRoute.recommendedStartGuide.transferTipsEn : currentRoute.recommendedStartGuide.transferTips }}
              </p>
            </div>
          </div>

          <!-- 分隔線 4 -->
          <hr class="border-t border-slate-200/80" />

          <!-- 5. 終點之後的朝聖之路：世界盡頭與穆希亞延伸線（統一納入大卡片底部） -->
          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-amber-600">
                  {{ t('routesGuide.finisterre.badge') }}
                </span>
                <h3 class="text-lg font-bold text-slate-900">
                  {{ locale === 'en' ? FINISTERRE_GUIDE.nameEn : FINISTERRE_GUIDE.name }}
                </h3>
              </div>
              <span class="text-xs text-slate-500 font-medium">
                {{ locale === 'en' ? FINISTERRE_GUIDE.totalDistanceKmEn : FINISTERRE_GUIDE.totalDistanceKm }} ・ {{ locale === 'en' ? FINISTERRE_GUIDE.recommendedDaysEn : FINISTERRE_GUIDE.recommendedDays }}
              </span>
            </div>

            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {{ locale === 'en' ? FINISTERRE_GUIDE.summaryEn : FINISTERRE_GUIDE.summary }}
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div
                v-for="(hl, hIdx) in (locale === 'en' && FINISTERRE_GUIDE.highlightsEn?.length ? FINISTERRE_GUIDE.highlightsEn : FINISTERRE_GUIDE.highlights)"
                :key="hIdx"
                class="text-xs sm:text-sm text-slate-700 leading-relaxed flex items-start gap-2"
              >
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{{ hl }}</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>

    <!-- 全站頁尾 -->
    <AppFooter />
  </div>
</template>
