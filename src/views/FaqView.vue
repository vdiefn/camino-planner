<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  ArrowLeft,
  Sparkles,
  Compass,
  ShieldAlert,
  Menu,
} from 'lucide-vue-next'
import AppFooter from '@/components/common/AppFooter.vue'
import MobileMenuDrawer from '@/components/common/MobileMenuDrawer.vue'
import { FAQ_CATEGORIES, getAllFaqs, type FaqCategoryId } from '@/data/faqs'

// 全站手機版漢堡選單抽屜開關狀態
const isMenuDrawerOpen = ref(false)

// 常見問題之分類篩選狀態（預設為全部 'all'）
const selectedCategoryId = ref<FaqCategoryId>('all')

// 總題目數量
const totalFaqCount = computed(() => getAllFaqs().length)

// 依選定之分類計算欲展示之常見問題分組
const displayedCategories = computed(() => {
  if (selectedCategoryId.value === 'all') {
    return FAQ_CATEGORIES
  }
  return FAQ_CATEGORIES.filter((category) => category.id === selectedCategoryId.value)
})

// 動態注入 FAQPage Schema.org 結構化資料
onMounted(() => {
  if (typeof document === 'undefined') return
  const existingScript = document.head.querySelector('#faq-schema-jsonld')
  if (existingScript) existingScript.remove()

  const allFaqs = getAllFaqs()
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.paragraphs.join(' '),
      },
    })),
  }

  const script = document.createElement('script')
  script.id = 'faq-schema-jsonld'
  script.type = 'application/ld+json'
  // 安全轉義：將 < 替換為 \u003c，杜絕腳本提前閉合破口（使用 replaceAll 避免 SFC parser 誤判標籤）
  script.text = JSON.stringify(schemaData).replaceAll('<', '\\u003c')
  document.head.appendChild(script)
})

// 元件卸載時主動清理動態注入的 Schema 標籤，杜絕全域 Head 污染
onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.head.querySelector('#faq-schema-jsonld')?.remove()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
    <!-- 頂部獨立標準導覽列 -->
    <header class="sticky top-0 z-40 h-14 sm:h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div class="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6">
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

        <!-- 右側快速傳送門（電腦版完整展示） -->
        <div class="hidden md:flex items-center gap-2">
          <router-link
            to="/history"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-amber-600 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
          >
            <Sparkles class="w-4 h-4 text-amber-500" />
            <span>歷史淵源</span>
          </router-link>
          <router-link
            to="/routes"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-amber-600 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
          >
            <Compass class="w-4 h-4 text-emerald-600" />
            <span>路線攻略</span>
          </router-link>
          <router-link
            to="/"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>返回規劃工具</span>
          </router-link>
        </div>

        <!-- 右側快速傳送門（手機版：返回按鈕 ＋ 漢堡選單） -->
        <div class="flex md:hidden items-center gap-1.5">
          <router-link
            to="/"
            class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200/90 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
            <span>返回</span>
          </router-link>
          <button
            type="button"
            @click="isMenuDrawerOpen = true"
            class="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="開啟全站選單"
          >
            <Menu class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- 全站手機版漢堡選單抽屜 -->
      <MobileMenuDrawer v-model:is-open="isMenuDrawerOpen" />
    </header>

    <!-- 主體內容 -->
    <main class="flex-1 py-8 sm:py-12 px-4 sm:px-6">
      <div class="mx-auto max-w-4xl space-y-8">
        <!-- 頁面標題區 -->
        <div class="text-center space-y-3">
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            朝聖之路常見問題百科 (FAQ)
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed px-2">
            專為聖雅各朝聖徒步者整理的行前問答，涵蓋公私立庇護所入住技巧、朝聖證書與印章規範、背包負重減法法則以及跨國交通轉乘。
          </p>
        </div>

        <!-- 常見問題 FAQ 面板 -->
        <div class="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-8 shadow-xs space-y-6">
          <!-- 分類篩選膠囊標籤列（手機端自然雙排折行，一覽無遺） -->
          <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-3 border-b border-slate-100">
            <button
              type="button"
              @click="selectedCategoryId = 'all'"
              class="inline-flex shrink-0 items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs transition-all cursor-pointer border"
              :class="[
                selectedCategoryId === 'all'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-medium'
                  : 'bg-slate-100/90 text-slate-600 border-slate-200/80 hover:bg-slate-200/80 hover:text-slate-900',
              ]"
            >
              <span>全部</span>
              <span
                class="px-1.5 py-0.2 rounded-full text-[10px]"
                :class="selectedCategoryId === 'all' ? 'bg-emerald-700/90 text-white' : 'bg-slate-200 text-slate-600'"
              >
                {{ totalFaqCount }}
              </span>
            </button>

            <button
              v-for="cat in FAQ_CATEGORIES"
              :key="cat.id"
              type="button"
              @click="selectedCategoryId = cat.id"
              class="inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs transition-all cursor-pointer border"
              :class="[
                selectedCategoryId === cat.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-medium'
                  : 'bg-slate-100/90 text-slate-600 border-slate-200/80 hover:bg-slate-200/80 hover:text-slate-900',
              ]"
            >
              <span>{{ cat.name }}</span>
              <span
                class="px-1.5 py-0.2 rounded-full text-[10px]"
                :class="selectedCategoryId === cat.id ? 'bg-emerald-700/90 text-white' : 'bg-slate-200 text-slate-600'"
              >
                {{ cat.faqs.length }}
              </span>
            </button>
          </div>

          <!-- 分類問題列表 -->
          <div class="space-y-8 pt-2">
            <section
              v-for="(cat, cIdx) in displayedCategories"
              :key="cat.id"
              :class="[cIdx > 0 ? 'pt-6 border-t border-slate-100' : '']"
              class="space-y-3.5"
            >
              <!-- 分類小標題 -->
              <div class="flex items-center gap-2 text-slate-900">
                <component :is="cat.icon" class="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <h2 class="text-base sm:text-lg font-bold">{{ cat.name }}</h2>
                <span
                  v-if="cat.badge"
                  class="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800"
                >
                  {{ cat.badge }}
                </span>
              </div>

              <!-- 問題列表手風琴 -->
              <div class="space-y-2.5">
                <details
                  v-for="faq in cat.faqs"
                  :key="faq.id"
                  class="group rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50/80"
                >
                  <summary class="flex cursor-pointer list-none items-start justify-between gap-3 text-xs sm:text-sm font-bold text-slate-800 select-none">
                    <span class="leading-snug">{{ faq.question }}</span>
                    <span class="mt-0.5 shrink-0 rounded-md bg-white border border-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-500 group-open:bg-emerald-50 group-open:text-emerald-700 group-open:border-emerald-200">
                      展開
                    </span>
                  </summary>

                  <!-- 解答段落 -->
                  <div class="mt-3 pt-3 border-t border-slate-200/60 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
                    <p v-for="(para, pIdx) in faq.paragraphs" :key="pIdx">
                      {{ para }}
                    </p>
                  </div>
                </details>
              </div>
            </section>
          </div>

          <!-- 底部查核提醒（收納於白色主卡片底部） -->
          <div class="pt-6 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed">
            <ShieldAlert class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong class="font-semibold text-slate-700">資訊查核提示：</strong>
              本站整理之問答與相關資訊，將持續參考聖地牙哥朝聖者辦公室及各地官方機構公告進行更新。由於沿途住宿、交通、路線及相關規定可能因季節、天候或營運狀況而有所變動，實際資訊請以官方最新公告及現場規定為準。
              祝您旅途平安順利，一路順風！ ¡Buen Camino!
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- 全站標準頁尾 -->
    <AppFooter />
  </div>
</template>
