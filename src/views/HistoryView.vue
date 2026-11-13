<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Compass,
  Scroll,
  ChevronRight,
  Bookmark,
  HelpCircle,
  Menu,
} from 'lucide-vue-next'
import AppFooter from '@/components/common/AppFooter.vue'
import MobileMenuDrawer from '@/components/common/MobileMenuDrawer.vue'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import {
  HISTORY_CHAPTERS,
  CULTURAL_SYMBOLS,
  CREDENCIAL_INFO,
} from '@/data/history'

const { t, locale } = useI18n()
const isEn = computed(() => locale.value.startsWith('en'))

// 導覽目錄清單（收錄 01~06 歷史里程碑 + 07 四大核心文化象徵 + 08 護照與證書規範）
const navChapters = computed(() => [
  ...HISTORY_CHAPTERS.map((c, idx) => ({
    id: c.id,
    number: `0${idx + 1}`,
    title: isEn.value ? (c.titleEn || c.title) : c.title,
  })),
  {
    id: 'cultural-symbols',
    number: '07',
    title: t('history.chapter07.title'),
  },
  {
    id: 'credencial-rules',
    number: '08',
    title: isEn.value ? (CREDENCIAL_INFO.titleEn || CREDENCIAL_INFO.title) : CREDENCIAL_INFO.title,
  },
])

// 目前選取詳讀的歷史章節（預設為第一篇）
const selectedChapterId = ref<string>(HISTORY_CHAPTERS[0].id)
// 手機端頂部漢堡選單抽屜開關狀態
const isMenuDrawerOpen = ref<boolean>(false)
// 手動平滑跳轉鎖定旗標（避免平滑滾動過程中 Observer 頻繁觸發）
const isManualScrolling = ref<boolean>(false)
let fallbackTimer: number | null = null
let activeScrollEndHandler: (() => void) | null = null

// 點擊書籤平滑滾動至目標章節（透過 scrollend 精準解鎖）
function selectChapter(id: string) {
  selectedChapterId.value = id
  isManualScrolling.value = true

  // 若前一次滾動解鎖未觸發，先清理舊的監聽器與計時器
  if (activeScrollEndHandler) {
    window.removeEventListener('scrollend', activeScrollEndHandler)
    activeScrollEndHandler = null
  }
  if (fallbackTimer) {
    clearTimeout(fallbackTimer)
    fallbackTimer = null
  }

  const targetElement = document.getElementById(`chapter-${id}`)
  if (targetElement) {
    const yOffset = -90 // 避開頂部 Sticky 導覽列高度
    const y =
      targetElement.getBoundingClientRect().top + window.scrollY + yOffset

    const unlock = () => {
      isManualScrolling.value = false
      if (activeScrollEndHandler) {
        window.removeEventListener('scrollend', activeScrollEndHandler)
        activeScrollEndHandler = null
      }
      if (fallbackTimer) {
        clearTimeout(fallbackTimer)
        fallbackTimer = null
      }
    }

    activeScrollEndHandler = unlock

    // 現代瀏覽器原生支援 scrollend 精準解鎖
    if ('onscrollend' in window) {
      window.addEventListener('scrollend', unlock, { once: true })
    }
    // 舊環境以 1 秒兜底計時器確保解鎖
    fallbackTimer = window.setTimeout(unlock, 1000)

    window.scrollTo({ top: y, behavior: 'smooth' })
  } else {
    isManualScrolling.value = false
  }
}

// 建立 IntersectionObserver 實現 Scroll Spy 滾動監聽
let observer: IntersectionObserver | null = null

// 動態同步 Schema.org Article 結構化資料
function updateArticleSchema() {
  const existing = document.getElementById('history-article-schema')
  if (existing) {
    existing.remove()
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: t('history.pageTitle'),
    description: t('history.pageDescription'),
    inLanguage: locale.value,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://camino-plan.com/history',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Camino Plan',
      url: 'https://camino-plan.com/',
    },
  }

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = 'history-article-schema'
  script.text = JSON.stringify(articleSchema).replaceAll('<', '\\u003c')
  document.head.appendChild(script)
}

onMounted(() => {
  updateArticleSchema()

  // 監聽各章節是否進入視窗上半部中央
  observer = new IntersectionObserver(
    (entries) => {
      if (isManualScrolling.value) return // 手動跳轉過程中忽略中間過渡章節
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace('chapter-', '')
          selectedChapterId.value = id
        }
      }
    },
    {
      rootMargin: '-10% 0px -65% 0px',
      threshold: 0,
    }
  )

  navChapters.value.forEach((chapter) => {
    const el = document.getElementById(`chapter-${chapter.id}`)
    if (el) observer?.observe(el)
  })
})

watch(locale, () => {
  updateArticleSchema()
})

onUnmounted(() => {
  document.getElementById('history-article-schema')?.remove()
  if (activeScrollEndHandler) {
    window.removeEventListener('scrollend', activeScrollEndHandler)
    activeScrollEndHandler = null
  }
  if (fallbackTimer) {
    clearTimeout(fallbackTimer)
    fallbackTimer = null
  }
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
  if (observer) {
    observer.disconnect()
    observer = null
  }
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
        <div class="hidden md:flex items-center gap-1.5 sm:gap-2">
          <router-link
            to="/routes"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-amber-600 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Compass class="w-4 h-4 text-amber-500" />
            <span>{{ t('history.routesLink') }}</span>
          </router-link>
          <router-link
            to="/faq"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-amber-600 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <HelpCircle class="w-4 h-4 text-emerald-600" />
            <span>{{ t('history.faqLink') }}</span>
          </router-link>
          <LanguageSwitcher />
          <router-link
            to="/schedule/frances"
            class="text-xs sm:text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white px-3 sm:px-4 py-1.5 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <span>{{ t('history.startPlanning') }}</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </router-link>
        </div>

        <!-- 右側快速傳送門（手機版：語言切換 ＋ 開始規劃 ＋ 漢堡選單） -->
        <div class="flex md:hidden items-center gap-1.5">
          <LanguageSwitcher />
          <router-link
            to="/schedule/frances"
            class="text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 rounded-lg shadow-xs transition-colors inline-flex items-center gap-1"
          >
            <span>{{ t('history.startPlanning') }}</span>
            <ChevronRight class="w-3 h-3" />
          </router-link>
          <button
            type="button"
            @click="isMenuDrawerOpen = true"
            class="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            :aria-label="t('history.openMenu')"
          >
            <Menu class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- 全站手機版漢堡選單抽屜 -->
      <MobileMenuDrawer v-model:is-open="isMenuDrawerOpen" />
    </header>

    <!-- 主體內容區塊（手機端已徹底移除頂部吸頂橫向膠囊條，滿版舒適閱讀） -->
    <main class="flex-1 py-8 sm:py-12 px-4 sm:px-6">
      <div class="mx-auto max-w-[1200px] space-y-10">
        <!-- 頁面大標題與導讀區 -->
        <div class="text-center space-y-3 max-w-3xl mx-auto">
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {{ t('history.pageTitle') }}
          </h1>
          <p class="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed px-2">
            {{ t('history.heroSubtitle') }}
          </p>
        </div>

        <!-- 雙欄佈局：平板與電腦（>= 768px）側邊書籤導覽 + 右側主文內容 -->
        <div class="md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr] md:gap-8 lg:gap-10 items-start">
          <!-- 平板與電腦專用（>= 768px）：左側 Sticky 書籤目錄（徹底移除外框 border 與陰影） -->
          <aside class="hidden md:block sticky top-24 z-20 space-y-2">
            <div class="p-3 space-y-3">
              <div class="flex items-center gap-2 pb-2 text-slate-400">
                <Bookmark class="w-4 h-4 text-slate-400" />
                <h2 class="text-md uppercase tracking-wider text-slate-500">
                  {{ t('history.tocTitle') }}
                </h2>
              </div>

              <nav class="space-y-1.5" aria-label="歷史章節側邊書籤">
                <button
                  v-for="chap in navChapters"
                  :key="chap.id"
                  type="button"
                  @click="selectChapter(chap.id)"
                  class="w-full text-left py-1.5 px-1 text-sm transition-colors flex items-start gap-2.5 cursor-pointer bg-transparent border-0"
                  :class="[
                    selectedChapterId === chap.id
                      ? 'text-slate-800'
                      : 'text-slate-400 hover:text-slate-600',
                  ]"
                >
                  <span
                    class="font-mono text-[11px] shrink-0 transition-colors"
                    :class="[
                      selectedChapterId === chap.id
                        ? 'text-slate-800'
                        : 'text-slate-400',
                    ]"
                  >
                    {{ chap.number }}
                  </span>
                  <span
                    class="line-clamp-2 leading-snug"
                    :class="[
                      selectedChapterId === chap.id
                        ? 'text-slate-900'
                        : 'text-slate-400',
                    ]"
                  >
                    {{ chap.title }}
                  </span>
                </button>
              </nav>
            </div>
          </aside>

          <!-- 右側主文內容列表 -->
          <div class="space-y-8 min-w-0">
            <!-- 歷史六大里程碑（統一整合於單一完整大卡片中） -->
            <article class="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-xs divide-y divide-slate-200">
              <section
                v-for="(chapter, idx) in HISTORY_CHAPTERS"
                :id="`chapter-${chapter.id}`"
                :key="chapter.id"
                class="py-8 first:pt-0 last:pb-0 space-y-4 scroll-mt-24"
              >
                <!-- 章節標題與年代 -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-slate-100/80 pb-3">
                  <div class="space-y-0.5">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                      {{ t('history.chapterTag', { num: idx + 1, period: isEn ? (chapter.periodEn || chapter.period) : chapter.period }) }}
                    </span>
                    <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                      {{ isEn ? (chapter.titleEn || chapter.title) : chapter.title }}
                    </h2>
                  </div>
                  <span class="text-xs text-slate-400 font-medium self-start sm:self-center">
                    {{ isEn ? (chapter.subtitleEn || chapter.subtitle) : chapter.subtitle }}
                  </span>
                </div>

                <!-- 章節摘要引言 -->
                <p class="text-xs sm:text-sm md:text-base text-slate-700 italic leading-relaxed bg-amber-50/60 border-l-4 border-amber-400 px-3.5 py-2.5 rounded-r-xl">
                  {{ isEn ? (chapter.summaryEn || chapter.summary) : chapter.summary }}
                </p>

                <!-- 深度文字細節段落 -->
                <div class="space-y-2.5 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                  <p v-for="(para, pIdx) in (isEn ? (chapter.detailsEn || chapter.details) : chapter.details)" :key="pIdx">
                    {{ para }}
                  </p>
                </div>

                <!-- 經典引言小卡（已移除上方橫線，保留自然間距） -->
                <div
                  v-if="chapter.quote"
                  class="mt-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-slate-500 italic"
                >
                  <Scroll class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p class="text-slate-700">「{{ isEn ? (chapter.quote.textEn || chapter.quote.text) : chapter.quote.text }}」</p>
                    <p class="text-[11px] sm:text-xs text-slate-400 not-italic mt-0.5">— {{ isEn ? (chapter.quote.authorEn || chapter.quote.author) : chapter.quote.author }}</p>
                  </div>
                </div>
              </section>

              <!-- 章節 07：朝聖文化的四大核心象徵（維持好看的四個框框網格） -->
              <section
                id="chapter-cultural-symbols"
                class="py-8 space-y-6 scroll-mt-24"
              >
                <!-- 章節標頭 -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-slate-100/80 pb-3">
                  <div class="space-y-0.5">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                      {{ t('history.chapter07.tag') }}
                    </span>
                    <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                      {{ t('history.chapter07.title') }}
                    </h2>
                  </div>
                  <span class="text-xs text-slate-400 font-medium self-start sm:self-center">
                    {{ t('history.chapter07.subtitle') }}
                  </span>
                </div>

                <p class="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                  {{ t('history.chapter07.lead') }}
                </p>

                <!-- 四大象徵：四個造型框框排版 -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    v-for="sym in CULTURAL_SYMBOLS"
                    :key="sym.id"
                    class="rounded-xl bg-slate-50/70 border border-slate-200/80 p-5 flex flex-col justify-between space-y-3"
                  >
                    <div class="space-y-2">
                      <div class="flex flex-wrap items-baseline justify-between gap-1.5">
                        <h3 class="text-base font-bold text-slate-900">
                          {{ isEn ? (sym.nameEn || sym.name) : sym.name }}
                        </h3>
                        <span class="text-xs text-amber-600 italic font-serif">
                          {{ sym.spanishName }}
                        </span>
                      </div>
                      <div class="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                        {{ t('history.chapter07.symbolMeaning') }}{{ isEn ? (sym.meaningEn || sym.meaning) : sym.meaning }}
                      </div>
                      <p class="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                        {{ isEn ? (sym.originEn || sym.origin) : sym.origin }}
                      </p>
                    </div>

                    <div class="py-2 border-t border-b border-slate-200/60 text-[11px] sm:text-xs text-slate-500 flex items-start gap-1.5">
                      <span><strong class="text-slate-700 font-semibold">{{ t('history.chapter07.tipsLabel') }}</strong>{{ isEn ? (sym.practicalTipEn || sym.practicalTip) : sym.practicalTip }}</span>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 章節 08：朝聖護照與完步證書規範 -->
              <section
                id="chapter-credencial-rules"
                class="pt-8 space-y-5 scroll-mt-24"
              >
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-slate-100/80 pb-3">
                  <div class="space-y-0.5">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                      {{ t('history.chapter08.tag') }}
                    </span>
                    <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                      {{ isEn ? (CREDENCIAL_INFO.titleEn || CREDENCIAL_INFO.title) : CREDENCIAL_INFO.title }}
                    </h2>
                  </div>
                  <span class="text-xs text-slate-400 font-medium self-start sm:self-center">
                    {{ t('history.chapter08.subtitle') }}
                  </span>
                </div>

                <div class="space-y-2.5 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                  <p v-for="(p, pIdx) in (isEn ? (CREDENCIAL_INFO.paragraphsEn || CREDENCIAL_INFO.paragraphs) : CREDENCIAL_INFO.paragraphs)" :key="pIdx">
                    {{ p }}
                  </p>
                </div>

                <div class="rounded-xl bg-slate-50 border border-slate-200/80 p-4 sm:p-5 space-y-2.5">
                  <h3 class="text-xs sm:text-sm md:text-base font-bold text-slate-800">
                    {{ t('history.chapter08.rulesTitle') }}
                  </h3>
                  <ul class="space-y-2 text-xs sm:text-sm md:text-base text-slate-600">
                    <li
                      v-for="(rule, rIdx) in (isEn ? (CREDENCIAL_INFO.rulesEn || CREDENCIAL_INFO.rules) : CREDENCIAL_INFO.rules)"
                      :key="rIdx"
                      class="flex items-start gap-2"
                    >
                      <div class="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></div>
                      <span>{{ rule }}</span>
                    </li>
                  </ul>
                </div>
              </section>
            </article>

            <!-- 底部行動召喚卡片 -->
            <div class="rounded-2xl border border-slate-200 bg-linear-to-r from-amber-50/70 via-white to-emerald-50/60 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="space-y-1 text-center sm:text-left">
                <h3 class="text-lg sm:text-xl font-bold text-slate-900">
                  {{ t('history.cta.title') }}
                </h3>
                <p class="text-xs sm:text-sm md:text-base text-slate-600">
                  {{ t('history.cta.desc') }}
                </p>
              </div>
              <div class="flex items-center gap-2.5 shrink-0">
                <router-link
                  to="/routes"
                  class="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-colors border border-slate-200 shadow-2xs cursor-pointer"
                >
                  {{ t('history.cta.browseRoutes') }}
                </router-link>
                <router-link
                  to="/schedule/frances"
                  class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
                >
                  {{ t('history.cta.startPlan') }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 全站頁尾 -->
    <AppFooter />
  </div>
</template>
