<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  BookOpen,
  ArrowRight,
  Clock,
  Compass,
  Sparkles,
  HelpCircle,
  ChevronRight,
  Menu,
} from 'lucide-vue-next'
import AppFooter from '@/components/common/AppFooter.vue'
import MobileMenuDrawer from '@/components/common/MobileMenuDrawer.vue'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import {
  GUIDE_ARTICLES,
  GUIDE_CATEGORY_STYLES,
  type GuideCategoryFilter,
} from '@/data/guides'

const { t, locale } = useI18n()
const isEn = computed(() => locale.value.startsWith('en'))
const isMenuDrawerOpen = ref(false)
const activeCategory = ref<GuideCategoryFilter>('all')

const categories: GuideCategoryFilter[] = [
  'all',
  'route-strategy',
  'accommodation',
  'gear-budget',
]

const filteredArticles = computed(() => {
  if (activeCategory.value === 'all') return GUIDE_ARTICLES
  return GUIDE_ARTICLES.filter((a) => a.category === activeCategory.value)
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
    <!-- 頂部導覽列 -->
    <header class="sticky top-0 z-40 h-14 sm:h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div class="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6">
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
            to="/routes"
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
            <BookOpen class="w-4 h-4 text-violet-400" />
            <span>{{ t('nav.guides') }}</span>
          </LocaleLink>
          <LocaleLink
            to="/faq"
            active-class="!text-slate-800 bg-sky-50/80 font-semibold"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-sky-600 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <HelpCircle class="w-4 h-4 text-sky-600" />
            <span>{{ t('nav.faq') }}</span>
          </LocaleLink>
          <LanguageSwitcher />
          <LocaleLink
            to="/schedule/frances"
            class="text-xs sm:text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white px-3 sm:px-4 py-1.5 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <span>{{ t('landing.startPlanning') }}</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </LocaleLink>
        </div>

        <div class="flex lg:hidden items-center gap-1.5">
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
      <MobileMenuDrawer v-model:is-open="isMenuDrawerOpen" />
    </header>

    <!-- 主體內容 -->
    <main class="flex-1 py-8 sm:py-14 px-4 sm:px-6">
      <div class="mx-auto max-w-4xl space-y-8">
        <div class="text-center space-y-3">
          <h1 class="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            {{ t('guides.pageTitle') }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {{ t('guides.pageDescription') }}
          </p>
        </div>

        <!-- 分類篩選列 -->
        <div class="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <button
            v-for="cat in categories"
            :key="cat"
            type="button"
            @click="activeCategory = cat"
            class="px-3 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer border"
            :class="[
              activeCategory === cat
                ? GUIDE_CATEGORY_STYLES[cat].activeBtn
                : `bg-white text-slate-600 border-slate-200 ${GUIDE_CATEGORY_STYLES[cat].inactiveHover}`,
            ]"
          >
            {{ cat === 'all' ? t('guides.allCategories') : t(`guides.categories.${cat}`) }}
          </button>
        </div>

        <!-- 攻略文章卡片列表 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <article
            v-for="article in filteredArticles"
            :key="article.slug"
            class="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between gap-5 hover:border-amber-300 transition-colors"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between gap-2 text-xs">
                <span
                  class="px-2.5 py-0.5 rounded-full font-semibold"
                  :class="GUIDE_CATEGORY_STYLES[article.category].badge"
                >
                  {{ t(`guides.categories.${article.category}`) }}
                </span>
                <span class="inline-flex items-center gap-1 text-slate-400">
                  <Clock class="w-3.5 h-3.5" />
                  <span>{{ article.readingMinutes }}{{ t('guides.readingTimeSuffix') }}</span>
                </span>
              </div>

              <h2 class="text-lg font-bold text-slate-900 leading-snug">
                <LocaleLink
                  :to="`/guides/${article.slug}`"
                  class="hover:text-amber-600 transition-colors"
                >
                  {{ isEn ? article.titleEn : article.title }}
                </LocaleLink>
              </h2>

              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {{ isEn ? article.subtitleEn : article.subtitle }}
              </p>
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span class="text-[11px] text-slate-400">
                {{ t('guides.updatedLabel') }}{{ article.updatedAt }}
              </span>
              <LocaleLink
                :to="`/guides/${article.slug}`"
                class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-600 hover:text-amber-700"
              >
                <span>{{ t('guides.readArticle') }}</span>
                <ArrowRight class="w-4 h-4" />
              </LocaleLink>
            </div>
          </article>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
