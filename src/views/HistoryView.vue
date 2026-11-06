<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import {
  Compass,
  Scroll,
  ChevronRight,
  ArrowUp,
  Bookmark,
  List,
  X,
  HelpCircle,
  Menu,
} from 'lucide-vue-next'
import AppFooter from '@/components/common/AppFooter.vue'
import MobileMenuDrawer from '@/components/common/MobileMenuDrawer.vue'
import {
  HISTORY_CHAPTERS,
  CULTURAL_SYMBOLS,
  CREDENCIAL_INFO,
} from '@/data/history'

// 導覽目錄清單（收錄 01~06 歷史里程碑 + 07 四大核心文化象徵 + 08 護照與證書規範）
const NAV_CHAPTERS = [
  ...HISTORY_CHAPTERS.map((c, idx) => ({
    id: c.id,
    number: `0${idx + 1}`,
    title: c.title,
  })),
  {
    id: 'cultural-symbols',
    number: '07',
    title: '朝聖文化的四大核心象徵',
  },
  {
    id: 'credencial-rules',
    number: '08',
    title: '朝聖護照與完步證書規範',
  },
]

// 目前選取詳讀的歷史章節（預設為第一篇）
const selectedChapterId = ref<string>(NAV_CHAPTERS[0].id)
// 回到頂端按鈕之顯示狀態
const showBackToTop = ref<boolean>(false)
// 手機端底部目錄抽屜（Drawer / Bottom Sheet）開關狀態
const isDrawerOpen = ref<boolean>(false)
// 手機端頂部漢堡選單抽屜開關狀態
const isMenuDrawerOpen = ref<boolean>(false)
// 手動平滑跳轉鎖定旗標（避免平滑滾動過程中 Observer 頻繁觸發）
const isManualScrolling = ref<boolean>(false)
let fallbackTimer: number | null = null
let activeScrollEndHandler: (() => void) | null = null

// 監聽手機抽屜開關，防止底層背景滾動穿透
watch(isDrawerOpen, (isOpen) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

function toggleDrawer() {
  isDrawerOpen.value = !isDrawerOpen.value
}

function closeDrawer() {
  isDrawerOpen.value = false
}

function handleMobileSelect(id: string) {
  closeDrawer()
  selectChapter(id)
}

// 滾動監聽：控制 Back to Top 按鈕
function handleWindowScroll() {
  showBackToTop.value = window.scrollY > 300
}

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

// 一鍵回到頂端
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 建立 IntersectionObserver 實現 Scroll Spy 滾動監聽
let observer: IntersectionObserver | null = null

// Schema.org Article 結構化資料
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '聖雅各朝聖之路：千年歷史與文化淵源',
  description:
    '從 9 世紀繁星原野的聖骨發現，到中世紀百萬信徒的跨國遠征，再到現代全球旅人的心靈淬鍊。完整解析朝聖歷史、文化象徵與證書規範。',
  inLanguage: 'zh-TW',
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

onMounted(() => {
  // 動態注入 Article 結構化資料（經字串安全跳脫防範 XSS）
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = 'history-article-schema'
  script.text = JSON.stringify(articleSchema).replaceAll('<', '\\u003c')
  document.head.appendChild(script)

  window.addEventListener('scroll', handleWindowScroll, { passive: true })

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

  NAV_CHAPTERS.forEach((chapter) => {
    const el = document.getElementById(`chapter-${chapter.id}`)
    if (el) observer?.observe(el)
  })
})

onUnmounted(() => {
  document.getElementById('history-article-schema')?.remove()
  window.removeEventListener('scroll', handleWindowScroll)
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
        <div class="hidden md:flex items-center gap-1.5 sm:gap-2">
          <router-link
            to="/routes"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-amber-600 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Compass class="w-4 h-4 text-amber-500" />
            <span>路線攻略</span>
          </router-link>
          <router-link
            to="/faq"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-amber-600 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <HelpCircle class="w-4 h-4 text-emerald-600" />
            <span>常見問題</span>
          </router-link>
          <router-link
            to="/schedule/frances"
            class="text-xs sm:text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white px-3 sm:px-4 py-1.5 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <span>開始規劃</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </router-link>
        </div>

        <!-- 右側快速傳送門（手機版：開始規劃按鈕 ＋ 漢堡選單） -->
        <div class="flex md:hidden items-center gap-1.5">
          <router-link
            to="/schedule/frances"
            class="text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 rounded-lg shadow-xs transition-colors inline-flex items-center gap-1"
          >
            <span>開始規劃</span>
            <ChevronRight class="w-3 h-3" />
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

    <!-- 主體內容區塊（手機端已徹底移除頂部吸頂橫向膠囊條，滿版舒適閱讀） -->
    <main class="flex-1 py-8 sm:py-12 px-4 sm:px-6">
      <div class="mx-auto max-w-[1200px] space-y-10">
        <!-- 頁面大標題與導讀區 -->
        <div class="text-center space-y-3 max-w-3xl mx-auto">
          <h1 class="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            聖雅各朝聖之路：千年歷史與文化淵源
          </h1>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed px-2">
            從 9 世紀繁星原野的聖骨發現，到中世紀百萬信徒的跨國遠征，再到現代全球旅人的心靈淬鍊。理解這條古道的故事，每一步都將踏在歷史的迴響中。
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
                  章節目錄
                </h2>
              </div>

              <nav class="space-y-1.5" aria-label="歷史章節側邊書籤">
                <button
                  v-for="chap in NAV_CHAPTERS"
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
            <article class="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-xs divide-y divide-slate-100">
              <section
                v-for="(chapter, idx) in HISTORY_CHAPTERS"
                :id="`chapter-${chapter.id}`"
                :key="chapter.id"
                class="first:pt-0 pt-8 first:mt-0 mt-8 space-y-4 scroll-mt-24"
              >
                <!-- 章節標題與年代 -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-slate-100/80 pb-3">
                  <div class="space-y-0.5">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                      章節 0{{ idx + 1 }} ・ {{ chapter.period }}
                    </span>
                    <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                      {{ chapter.title }}
                    </h2>
                  </div>
                  <span class="text-xs text-slate-400 font-medium self-start sm:self-center">
                    {{ chapter.subtitle }}
                  </span>
                </div>

                <!-- 章節摘要引言 -->
                <p class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed bg-amber-50/60 border-l-4 border-amber-400 px-3.5 py-2.5 rounded-r-xl">
                  {{ chapter.summary }}
                </p>

                <!-- 深度文字細節段落 -->
                <div class="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p v-for="(para, pIdx) in chapter.details" :key="pIdx">
                    {{ para }}
                  </p>
                </div>

                <!-- 經典引言小卡 -->
                <div
                  v-if="chapter.quote"
                  class="mt-3 pt-3 border-t border-slate-100/80 flex items-start gap-2.5 text-xs text-slate-500 italic"
                >
                  <Scroll class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p class="text-slate-700">「{{ chapter.quote.text }}」</p>
                    <p class="text-[11px] text-slate-400 not-italic mt-0.5">— {{ chapter.quote.author }}</p>
                  </div>
                </div>
              </section>
            </article>

            <!-- 章節 07：朝聖文化的四大核心象徵（維持好看的四個框框網格） -->
            <article
              id="chapter-cultural-symbols"
              class="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6 scroll-mt-24"
            >
              <!-- 章節標頭 -->
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-slate-100/80 pb-3">
                <div class="space-y-0.5">
                  <span class="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                    章節 07 ・ 符號與精神傳承
                  </span>
                  <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                    朝聖文化的四大核心象徵
                  </h2>
                </div>
                <span class="text-xs text-slate-400 font-medium self-start sm:self-center">
                  庇護・指引・印記・極簡
                </span>
              </div>

              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                每一件佩掛在背包上的物品、沿途偶遇的每個印記，背後都蘊含著數百年的文化默契與庇護意涵。
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
                        {{ sym.name }}
                      </h3>
                      <span class="text-xs text-amber-600 italic font-serif">
                        {{ sym.spanishName }}
                      </span>
                    </div>
                    <div class="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                      象徵意義：{{ sym.meaning }}
                    </div>
                    <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {{ sym.origin }}
                    </p>
                  </div>

                  <div class="py-2 border-t border-b border-slate-200/60 text-[11px] sm:text-xs text-slate-500 flex items-start gap-1.5">
                    <span><strong class="text-slate-700 font-semibold">Tips：</strong>{{ sym.practicalTip }}</span>
                  </div>
                </div>
              </div>
            </article>

            <!-- 章節 08：朝聖護照與完步證書規範 -->
            <article
              id="chapter-credencial-rules"
              class="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-5 scroll-mt-24"
            >
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-slate-100/80 pb-3">
                <div class="space-y-0.5">
                  <span class="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                    章節 08 ・ 認證與官方規定
                  </span>
                  <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                    {{ CREDENCIAL_INFO.title }}
                  </h2>
                </div>
                <span class="text-xs text-slate-400 font-medium self-start sm:self-center">
                  Credencial & Compostela
                </span>
              </div>

              <div class="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p v-for="(p, pIdx) in CREDENCIAL_INFO.paragraphs" :key="pIdx">
                  {{ p }}
                </p>
              </div>

              <div class="rounded-xl bg-slate-50 border border-slate-200/80 p-4 sm:p-5 space-y-2.5">
                <h3 class="text-xs sm:text-sm font-bold text-slate-800">
                  官方證書核發必備條件：
                </h3>
                <ul class="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li
                    v-for="(rule, rIdx) in CREDENCIAL_INFO.rules"
                    :key="rIdx"
                    class="flex items-start gap-2"
                  >
                    <div class="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></div>
                    <span>{{ rule }}</span>
                  </li>
                </ul>
              </div>
            </article>

            <!-- 底部行動召喚卡片 -->
            <div class="rounded-2xl bg-slate-100/90 border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="space-y-1 text-center sm:text-left">
                <h3 class="text-lg sm:text-xl font-bold text-slate-900">
                  準備好寫下屬於您自己的朝聖故事了嗎？
                </h3>
                <p class="text-xs sm:text-sm text-slate-600">
                  前往路線攻略深入了解各路線難度，或直接開啟每日排程計算工具。
                </p>
              </div>
              <div class="flex items-center gap-2.5 shrink-0">
                <router-link
                  to="/routes"
                  class="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-colors border border-slate-200 shadow-2xs cursor-pointer"
                >
                  瀏覽路線攻略
                </router-link>
                <router-link
                  to="/schedule/frances"
                  class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs cursor-pointer"
                >
                  開始行程規劃
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 右下角浮動操作按鈕區（回到頂端 + 手機專屬目錄抽屜按鈕） -->
    <div class="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
      <!-- 回到頂端懸浮圓鈕 -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-3 scale-90"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-3 scale-90"
      >
        <button
          v-if="showBackToTop"
          type="button"
          @click="scrollToTop"
          class="h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-600 shadow-md backdrop-blur-xs transition-all duration-200 hover:border-amber-400 hover:text-amber-600 hover:shadow-lg active:scale-95 cursor-pointer"
          title="回到頂端"
          aria-label="回到頂端"
        >
          <ArrowUp class="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </Transition>

      <!-- 手機專屬目錄浮動鈕（只在手機 < 768px 顯示） -->
      <button
        type="button"
        @click="toggleDrawer"
        class="md:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-md backdrop-blur-xs transition-all hover:border-amber-400 hover:text-amber-600 active:scale-95 cursor-pointer text-xs font-semibold"
        aria-label="開啟章節目錄"
      >
        <List class="w-4 h-4 text-amber-500" />
        <span>目錄</span>
      </button>
    </div>

    <!-- 手機端專屬底部目錄抽屜 (Bottom Sheet) -->
    <Teleport to="body">
      <!-- 暗色半透明遮罩 -->
      <Transition
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isDrawerOpen"
          class="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs"
          @click="closeDrawer"
        />
      </Transition>

      <!-- 底部平滑向上滑出面板 -->
      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="translate-y-full"
        enter-to-class="translate-y-0"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-from-class="translate-y-0"
        leave-to-class="translate-y-full"
      >
        <div
          v-if="isDrawerOpen"
          class="md:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[75vh] flex flex-col rounded-t-3xl bg-white shadow-2xl border-t border-slate-200"
        >
          <!-- 頂部標題列與關閉鈕 -->
          <div class="px-5 pt-3.5 pb-2.5 flex items-center justify-between border-b border-slate-100">
            <div class="flex items-center gap-2">
              <Bookmark class="w-4 h-4 text-amber-500" />
              <h3 class="text-sm font-bold text-slate-900">章節目錄</h3>
            </div>
            <button
              type="button"
              @click="closeDrawer"
              class="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="關閉目錄"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- 01 至 08 直立條列清單 -->
          <div class="overflow-y-auto p-4 space-y-1">
            <button
              v-for="chap in NAV_CHAPTERS"
              :key="chap.id"
              type="button"
              @click="handleMobileSelect(chap.id)"
              class="w-full text-left py-2.5 px-3 rounded-xl text-xs transition-colors flex items-start gap-3 cursor-pointer"
              :class="[
                selectedChapterId === chap.id
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-normal',
              ]"
            >
              <span
                class="font-mono text-xs shrink-0"
                :class="selectedChapterId === chap.id ? 'font-bold text-slate-900' : 'text-slate-400 font-normal'"
              >
                {{ chap.number }}
              </span>
              <span class="leading-relaxed">{{ chap.title }}</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 全站頁尾 -->
    <AppFooter />
  </div>
</template>
