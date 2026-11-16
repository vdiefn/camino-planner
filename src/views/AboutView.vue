<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Compass, ArrowLeft, CheckCircle2, BookOpen, Mail } from 'lucide-vue-next'
import AppFooter from '@/components/common/AppFooter.vue'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
    <!-- 頂部獨立標準導覽列 -->
    <header class="sticky top-0 z-40 h-14 sm:h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div class="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6">
        <router-link
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
          <div>
            <span class="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900">
              Camino Plan
            </span>
          </div>
        </router-link>

        <div class="flex items-center gap-2">
          <LanguageSwitcher />
          <router-link
            to="/"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>{{ t('about.backToPlanner') }}</span>
          </router-link>
        </div>
      </div>
    </header>

    <!-- 關於我們主體內容 -->
    <main class="flex-1 py-8 sm:py-12 px-4 sm:px-6">
      <article class="mx-auto max-w-3xl rounded-2xl bg-white p-6 sm:p-10 shadow-xs border border-slate-200/60 space-y-8">
        <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div class="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Compass class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              {{ t('about.title') }}
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              {{ t('about.subtitle') }}
            </p>
          </div>
        </div>

        <section class="space-y-3 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
          <h2 class="text-base sm:text-lg font-bold text-slate-800">
            {{ t('about.missionTitle') }}
          </h2>
          <p>{{ t('about.missionP1') }}</p>
          <p>{{ t('about.missionP2') }}</p>
        </section>

        <section class="space-y-3 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
          <h2 class="text-base sm:text-lg font-bold text-slate-800">
            {{ t('about.standardsTitle') }}
          </h2>
          <ul class="space-y-2.5">
            <li class="flex items-start gap-2.5">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
              <span>{{ t('about.standardsItem1') }}</span>
            </li>
            <li class="flex items-start gap-2.5">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
              <span>{{ t('about.standardsItem2') }}</span>
            </li>
            <li class="flex items-start gap-2.5">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
              <span>{{ t('about.standardsItem3') }}</span>
            </li>
          </ul>
        </section>

        <section class="rounded-xl bg-slate-50 p-4 sm:p-5 border border-slate-200/70 space-y-2">
          <h2 class="text-sm sm:text-base font-bold text-slate-800">
            {{ t('about.disclaimerTitle') }}
          </h2>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {{ t('about.disclaimerText') }}
          </p>
        </section>

        <div class="flex flex-wrap items-center gap-3 pt-2">
          <router-link
            to="/routes"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <BookOpen class="w-4 h-4" />
            <span>{{ t('about.ctaRoutes') }}</span>
          </router-link>
          <router-link
            to="/contact"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors"
          >
            <Mail class="w-4 h-4" />
            <span>{{ t('about.ctaContact') }}</span>
          </router-link>
        </div>
      </article>
    </main>

    <AppFooter />
  </div>
</template>
