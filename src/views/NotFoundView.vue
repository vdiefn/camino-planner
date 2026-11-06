<script setup lang="ts">
import { Compass, ArrowRight, Home } from 'lucide-vue-next'
import AppFooter from '@/components/common/AppFooter.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-800">
    <!-- 頂部簡約導覽列 -->
    <header class="h-14 sm:h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center">
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
    </header>

    <!-- 404 核心提示區塊 -->
    <main class="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
      <div class="max-w-md w-full text-center space-y-6">
        <!-- 象徵標記：羅盤圖示 -->
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200/80 text-amber-500 shadow-xs">
          <Compass class="w-10 h-10 stroke-[1.75]" />
        </div>

        <div class="space-y-2">
          <span class="text-xs font-mono font-bold tracking-widest text-amber-600 uppercase">
            Error 404 · Page Not Found
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            走出了黃色箭頭指引的路線
          </h1>
          <p class="text-sm text-slate-500 leading-relaxed pt-1">
            您所尋找的頁面不存在、已被移動或網址輸入有誤。別擔心，請點擊下方按鈕重新回到規劃正軌。
          </p>
        </div>

        <!-- 導覽引導按鈕群 -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <router-link
            to="/schedule/frances"
            class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>返回行程規劃</span>
            <ArrowRight class="w-4 h-4" />
          </router-link>
          <router-link
            to="/"
            class="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs sm:text-sm font-medium transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home class="w-4 h-4 text-slate-500" />
            <span>返回網站首頁</span>
          </router-link>
        </div>
      </div>
    </main>

    <!-- 頁尾 -->
    <AppFooter />
  </div>
</template>
