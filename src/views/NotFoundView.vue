<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ArrowRight, Home } from 'lucide-vue-next'
import AppFooter from '@/components/common/AppFooter.vue'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
    <!-- 頂部簡約導覽列 -->
    <header class="h-14 sm:h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      <router-link to="/" class="flex items-center gap-2.5 sm:gap-3 shrink-0 hover:opacity-85 transition-opacity">
        <img
          src="/favicon.svg"
          alt="Camino Plan 標誌"
          width="36"
          height="36"
          class="h-8 w-8 sm:h-9 sm:w-9 shrink-0 drop-shadow-2xs"
        />
        <span class="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900">
          Camino Plan
        </span>
      </router-link>

      <LanguageSwitcher />
    </header>

    <!-- 404 核心提示區塊 -->
    <main class="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
      <div class="max-w-3xl w-full text-center space-y-6">
        <div class="space-y-3">
          <!-- 品牌徽標與 404 代碼同一排並列（左邊品牌 icon，右邊文字，無底色） -->
          <div class="flex items-center justify-center gap-2">
            <img
              src="/favicon.svg"
              alt="Camino Plan"
              width="20"
              height="20"
              class="h-5 w-5 shrink-0 drop-shadow-2xs"
            />
            <span class="text-xs sm:text-sm font-mono font-bold tracking-widest text-amber-600 uppercase">
              {{ t('notFound.badge') }}
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight sm:whitespace-nowrap">
            {{ t('notFound.title') }}
          </h1>

          <!-- 說明內文依語意分為兩行 -->
          <div class="text-xs sm:text-sm md:text-base text-slate-500 leading-relaxed pt-1 space-y-1">
            <p class="sm:whitespace-nowrap">{{ t('notFound.descLine1') }}</p>
            <p class="sm:whitespace-nowrap">{{ t('notFound.descLine2') }}</p>
          </div>
        </div>

        <!-- 導覽引導按鈕群 -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-20 pt-2">
          <router-link
            to="/"
            class="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs sm:text-sm font-medium transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home class="w-4 h-4 text-slate-500" />
            <span>{{ t('notFound.backToHome') }}</span>
          </router-link>
          <router-link
            to="/schedule/frances"
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{{ t('notFound.backToSchedule') }}</span>
            <ArrowRight class="w-4 h-4" />
          </router-link>
        </div>
      </div>
    </main>

    <!-- 頁尾 -->
    <AppFooter />
  </div>
</template>
