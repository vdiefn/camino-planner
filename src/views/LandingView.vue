<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ArrowRight,
  Footprints,
  Backpack,
  Train,
  Coins,
  HelpCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Compass,
  Menu,
} from 'lucide-vue-next'
import AppFooter from '@/components/common/AppFooter.vue'
import MobileMenuDrawer from '@/components/common/MobileMenuDrawer.vue'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import { useScheduleStore } from '@/stores/schedule'
import type { RouteId } from '@/types/route'

const { t } = useI18n()
const router = useRouter()
const scheduleStore = useScheduleStore()
const isMenuDrawerOpen = ref(false)

// 依據目前 Store 中選定的路線決定「繼續規劃」的目的地
const currentRouteId = computed(() => scheduleStore.currentRouteId || 'frances')

interface FeaturedRoute {
  id: RouteId
  name: string
  spanishName: string
  startTown: string
  distanceKm: string
  recommendedDays: string
  desc: string
}

// 三大朝聖路線特點卡片（支援雙語動態計算）
const featuredRoutes = computed<FeaturedRoute[]>(() => [
  {
    id: 'frances',
    name: t('landing.featuredRoutes.frances.name'),
    spanishName: t('landing.featuredRoutes.frances.spanishName'),
    startTown: t('landing.featuredRoutes.frances.startTown'),
    distanceKm: t('landing.featuredRoutes.frances.distanceKm'),
    recommendedDays: t('landing.featuredRoutes.frances.recommendedDays'),
    desc: t('landing.featuredRoutes.frances.desc'),
  },
  {
    id: 'portugues',
    name: t('landing.featuredRoutes.portugues.name'),
    spanishName: t('landing.featuredRoutes.portugues.spanishName'),
    startTown: t('landing.featuredRoutes.portugues.startTown'),
    distanceKm: t('landing.featuredRoutes.portugues.distanceKm'),
    recommendedDays: t('landing.featuredRoutes.portugues.recommendedDays'),
    desc: t('landing.featuredRoutes.portugues.desc'),
  },
  {
    id: 'norte',
    name: t('landing.featuredRoutes.norte.name'),
    spanishName: t('landing.featuredRoutes.norte.spanishName'),
    startTown: t('landing.featuredRoutes.norte.startTown'),
    distanceKm: t('landing.featuredRoutes.norte.distanceKm'),
    recommendedDays: t('landing.featuredRoutes.norte.recommendedDays'),
    desc: t('landing.featuredRoutes.norte.desc'),
  },
])

// 四大核心規劃工具（支援雙語動態計算）
const tools = computed(() => [
  {
    title: t('landing.tools.schedule.title'),
    desc: t('landing.tools.schedule.desc'),
    path: `/schedule/${currentRouteId.value}`,
    icon: Footprints,
    color: 'text-amber-500 bg-amber-50 border-amber-200',
  },
  {
    title: t('landing.tools.packing.title'),
    desc: t('landing.tools.packing.desc'),
    path: '/packing',
    icon: Backpack,
    color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
  },
  {
    title: t('landing.tools.transport.title'),
    desc: t('landing.tools.transport.desc'),
    path: `/transport/${currentRouteId.value}`,
    icon: Train,
    color: 'text-sky-500 bg-sky-50 border-sky-200',
  },
  {
    title: t('landing.tools.budget.title'),
    desc: t('landing.tools.budget.desc'),
    path: '/budget',
    icon: Coins,
    color: 'text-rose-500 bg-rose-50 border-rose-200',
  },
])

function navigateToRoute(routeId: RouteId) {
  scheduleStore.switchRoute(routeId)
  router.push(`/schedule/${routeId}`)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
    <!-- 頂部獨立精簡導覽列 -->
    <header class="sticky top-0 z-40 h-14 sm:h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div class="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6">
        <!-- 品牌標誌 -->
        <router-link to="/" class="flex items-center gap-2.5 sm:gap-3 shrink-0 hover:opacity-85 transition-opacity">
          <img
            src="/favicon.svg"
            :alt="$t('app.logoAlt')"
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

        <!-- 右側快速傳送門（電腦版完整展示） -->
        <div class="hidden md:flex items-center gap-1 sm:gap-2">
          <router-link
            to="/history"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-amber-600 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
          >
            <Sparkles class="w-4 h-4 text-amber-500" />
            <span>{{ $t('nav.history') }}</span>
          </router-link>
          <router-link
            to="/routes"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-amber-600 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
          >
            <Compass class="w-4 h-4 text-amber-500" />
            <span>{{ $t('nav.routes') }}</span>
          </router-link>
          <router-link
            to="/faq"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-amber-600 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
          >
            <HelpCircle class="w-4 h-4 text-emerald-600" />
            <span>{{ $t('nav.faq') }}</span>
          </router-link>

          <LanguageSwitcher mode="dropdown" />

          <router-link
            :to="`/schedule/${currentRouteId}`"
            class="text-xs sm:text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white px-3 sm:px-4 py-1.5 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 ml-1"
          >
            <span>{{ $t('landing.startPlanning') }}</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>

        <!-- 右側快速傳送門（手機版：開始規劃 ＋ 語言切換 ＋ 漢堡選單） -->
        <div class="flex md:hidden items-center gap-1">
          <LanguageSwitcher mode="dropdown" />

          <router-link
            :to="`/schedule/${currentRouteId}`"
            class="text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 rounded-lg shadow-xs transition-colors inline-flex items-center gap-1"
          >
            <span>{{ $t('landing.startPlanning') }}</span>
            <ArrowRight class="w-3 h-3" />
          </router-link>
          <button
            type="button"
            @click="isMenuDrawerOpen = true"
            class="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            :title="$t('nav.openMenu')"
            :aria-label="$t('nav.openMenu')"
          >
            <Menu class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- 全站手機版漢堡選單抽屜 -->
      <MobileMenuDrawer v-model:is-open="isMenuDrawerOpen" />
    </header>

    <!-- 主體內容區塊 -->
    <main class="flex-1 py-8 sm:py-16 px-4 sm:px-6">
      <div class="mx-auto max-w-5xl space-y-12 sm:space-y-16">
        <!-- 1. Hero 核心主視覺區塊 -->
        <section class="text-center space-y-5 sm:space-y-6 pt-2 sm:pt-4">
          <h1 class="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {{ $t('landing.hero.title') }}
          </h1>

          <p class="text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {{ $t('landing.hero.desc') }}
          </p>

          <!-- 動作按鈕群（小螢幕與電腦版均維持左右並排） -->
          <div class="flex flex-row items-center justify-center gap-2 sm:gap-3.5 pt-2 max-w-lg mx-auto">
            <router-link
              :to="`/schedule/${currentRouteId}`"
              class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-base font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <span>{{ $t('landing.hero.startBtn') }}</span>
              <ArrowRight class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </router-link>

            <router-link
              to="/faq"
              class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-base font-semibold border border-slate-200 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
            >
              <HelpCircle class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              <span>{{ $t('landing.hero.faqBtn') }}</span>
            </router-link>
          </div>

          <!-- 貼心特色小標籤 -->
          <div class="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-400 pt-3 flex-wrap">
            <span class="inline-flex items-center gap-1">
              <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
              {{ $t('landing.hero.featureFree') }}
            </span>
            <span class="inline-flex items-center gap-1">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
              {{ $t('landing.hero.featureOffline') }}
            </span>
            <span class="inline-flex items-center gap-1">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
              {{ $t('landing.hero.featureSync') }}
            </span>
          </div>
        </section>

        <!-- 2. 三大熱門路線探索專區 -->
        <section class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 text-center sm:text-left">
            <div class="space-y-1">
              <h3 class="text-lg sm:text-xl font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                <span>{{ $t('landing.featuredRoutes.title') }}</span>
              </h3>
              <p class="text-xs sm:text-sm text-slate-500">
                {{ $t('landing.featuredRoutes.subtitle') }}
              </p>
            </div>
            <router-link
              to="/routes"
              class="text-xs sm:text-sm font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center justify-center gap-1 transition-colors self-center sm:self-end"
            >
              <span>{{ $t('landing.featuredRoutes.guideLink') }}</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </router-link>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <div
              v-for="route in featuredRoutes"
              :key="route.id"
              @click="navigateToRoute(route.id)"
              class="group relative rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-slate-300 hover:bg-slate-50/40 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div class="space-y-3">
                <div>
                  <div class="flex items-center justify-between gap-2">
                    <h4 class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-slate-800 transition-colors whitespace-nowrap">
                      {{ route.name }}
                    </h4>
                    <span class="text-xs text-slate-400 font-mono shrink-0 flex items-center gap-1 whitespace-nowrap">
                      <Clock class="w-3.5 h-3.5" />
                      {{ route.recommendedDays }}
                    </span>
                  </div>
                  <div class="text-xs text-slate-400 font-mono mt-0.5">
                    {{ route.spanishName }}
                  </div>
                </div>

                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {{ route.desc }}
                </p>
              </div>

              <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-700">
                <span class="text-slate-600 font-mono">{{ route.distanceKm }}</span>
                <span class="inline-flex items-center gap-1 text-slate-500 group-hover:text-slate-800 transition-colors">
                  {{ $t('landing.featuredRoutes.takeFirstStep') }} <ArrowRight class="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. 四大核心規劃工具矩陣 -->
        <section class="space-y-6">
          <div class="text-center sm:text-left space-y-1">
            <h3 class="text-lg sm:text-xl font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
              <span>{{ $t('landing.tools.title') }}</span>
            </h3>
            <p class="text-xs sm:text-sm text-slate-500">
              {{ $t('landing.tools.subtitle') }}
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <router-link
              v-for="tool in tools"
              :key="tool.title"
              :to="tool.path"
              class="group rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex items-start gap-4 cursor-pointer"
            >
              <div class="p-3 rounded-xl border shrink-0" :class="tool.color">
                <component :is="tool.icon" class="w-6 h-6" />
              </div>
              <div class="space-y-1">
                <div class="text-base font-bold text-slate-900 transition-colors flex items-center gap-1">
                  <span>{{ tool.title }}</span>
                </div>
                <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {{ tool.desc }}
                </p>
              </div>
            </router-link>
          </div>
        </section>

        <!-- 4. 底部知識庫導航橫幅 -->
        <section class="rounded-2xl border border-slate-200 bg-linear-to-r from-amber-50/70 via-white to-emerald-50/60 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div class="space-y-1 text-center sm:text-left">
            <h3 class="text-base sm:text-lg font-bold text-slate-900">
              {{ $t('landing.bottomCta.title') }}
            </h3>
            <p class="text-xs sm:text-sm text-slate-600">
              {{ $t('landing.bottomCta.desc') }}
            </p>
          </div>
          <router-link
            to="/faq"
            class="shrink-0 px-5 py-2.5 rounded-xl bg-white text-slate-800 border border-slate-200 hover:border-slate-300 text-xs sm:text-sm font-bold shadow-2xs hover:bg-slate-50 transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>{{ $t('landing.bottomCta.btn') }}</span>
            <ArrowRight class="w-3.5 h-3.5 text-amber-500" />
          </router-link>
        </section>
      </div>
    </main>

    <!-- 全域頁尾 -->
    <AppFooter />
  </div>
</template>
