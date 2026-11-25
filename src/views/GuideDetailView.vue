<script setup lang="ts">
import { ref, computed, watchEffect, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  AlertTriangle,
  Sparkles,
  Compass,
  BookOpen,
  CloudSun,
  HelpCircle,
  Menu,
} from 'lucide-vue-next'
import AppFooter from '@/components/common/AppFooter.vue'
import MobileMenuDrawer from '@/components/common/MobileMenuDrawer.vue'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import { GUIDE_ARTICLES, GUIDE_CATEGORY_STYLES, getGuideBySlug } from '@/data/guides'
import { localizePath } from '@/utils/localeRoute'

const route = useRoute()
const { t, locale } = useI18n()
const isEn = computed(() => locale.value.startsWith('en'))
const isMenuDrawerOpen = ref(false)

const article = computed(() => {
  const slug = String(route.params.slug || '')
  return getGuideBySlug(slug)
})

const adjacentArticles = computed(() => {
  if (!article.value) return { prev: null, next: null }
  const idx = GUIDE_ARTICLES.findIndex((a) => a.slug === article.value?.slug)
  return {
    prev: idx > 0 ? GUIDE_ARTICLES[idx - 1] : null,
    next: idx >= 0 && idx < GUIDE_ARTICLES.length - 1 ? GUIDE_ARTICLES[idx + 1] : null,
  }
})

watchEffect(() => {
  if (typeof document === 'undefined') return
  const existing = document.head.querySelector('#guide-article-schema')
  if (existing) existing.remove()

  if (!article.value) {
    let robotsEl = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!robotsEl) {
      robotsEl = document.createElement('meta')
      robotsEl.setAttribute('name', 'robots')
      document.head.appendChild(robotsEl)
    }
    robotsEl.setAttribute('content', 'noindex, nofollow')
    document.head.querySelector('link[rel="canonical"]')?.remove()
    document.head
      .querySelectorAll('link[rel="alternate"][hreflang]')
      .forEach((el) => el.remove())
    document.title = `${t('guides.notFoundTitle')} | Camino Plan`
    return
  }
  const item = article.value
  const currentLocale = isEn.value ? 'en' : 'zh-TW'
  const articleUrl = `https://camino-plan.com${localizePath(`/guides/${item.slug}`, currentLocale)}`
  const homeUrl = `https://camino-plan.com${localizePath('/', currentLocale)}`
  const guidesUrl = `https://camino-plan.com${localizePath('/guides', currentLocale)}`
  const ogImageUrl = `https://camino-plan.com/${isEn.value ? 'og-cover-en.png' : 'og-cover.png'}`
  const articleTitle = isEn.value ? item.titleEn : item.title
  const schemaData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: articleTitle,
        description: isEn.value ? item.seoDescriptionEn : item.seoDescription,
        image: [ogImageUrl],
        datePublished: item.updatedAt,
        dateModified: item.updatedAt,
        inLanguage: currentLocale,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': articleUrl,
        },
        author: [
          {
            '@type': 'Organization',
            name: 'Camino Plan',
            url: homeUrl,
          },
        ],
        publisher: {
          '@type': 'Organization',
          name: 'Camino Plan',
          url: homeUrl,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Camino Plan',
            item: homeUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: isEn.value ? 'Guides' : '實戰攻略',
            item: guidesUrl,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: articleTitle,
            item: articleUrl,
          },
        ],
      },
    ],
  }

  const script = document.createElement('script')
  script.id = 'guide-article-schema'
  script.type = 'application/ld+json'
  script.text = JSON.stringify(schemaData).replaceAll('<', '\\u003c')
  document.head.appendChild(script)
})

onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.head.querySelector('#guide-article-schema')?.remove()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
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
            <BookOpen class="w-4 h-4 text-violet-400" />
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
          <LanguageSwitcher />
          <LocaleLink
            to="/guides"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>{{ t('guides.backToList') }}</span>
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

    <main class="flex-1 py-8 sm:py-12 px-4 sm:px-6">
      <div v-if="article" class="mx-auto max-w-3xl space-y-6">
        <article class="rounded-2xl bg-white p-6 sm:p-10 shadow-xs border border-slate-200/70 space-y-8">
          <!-- 文章標頭 -->
          <header class="space-y-4 pb-6 border-b border-slate-100">
            <div class="flex flex-wrap items-center gap-2 text-xs">
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
              <span class="text-slate-400">
                · {{ t('guides.updatedLabel') }}{{ article.updatedAt }}
              </span>
            </div>

            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
              {{ isEn ? article.titleEn : article.title }}
            </h1>
            <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
              {{ isEn ? article.subtitleEn : article.subtitle }}
            </p>
          </header>

          <!-- 各小節正文 -->
          <section
            v-for="(section, sIdx) in article.sections"
            :key="sIdx"
            class="space-y-3"
          >
            <h2 class="text-lg sm:text-xl font-bold text-slate-900">
              {{ isEn ? section.headingEn : section.heading }}
            </h2>
            <p
              v-for="(para, pIdx) in (isEn ? section.paragraphsEn : section.paragraphs)"
              :key="pIdx"
              class="text-sm sm:text-base text-slate-700 leading-relaxed"
            >
              {{ para }}
            </p>
          </section>

          <!-- 實戰避坑提醒 -->
          <section class="rounded-xl bg-amber-50/60 border border-amber-200/80 p-5 space-y-3">
            <h2 class="text-sm sm:text-base font-bold text-amber-900 flex items-center gap-2">
              <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0" />
              <span>{{ isEn ? article.pitfallTitleEn : article.pitfallTitle }}</span>
            </h2>
            <ul class="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <li
                v-for="(pt, idx) in (isEn ? article.pitfallPointsEn : article.pitfallPoints)"
                :key="idx"
              >
                {{ pt }}
              </li>
            </ul>
          </section>

          <!-- 關聯工具導流區 -->
          <section class="rounded-xl bg-slate-50 border border-slate-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                <Sparkles class="w-3.5 h-3.5" />
                <span>{{ t('guides.relatedToolHeading') }}</span>
              </div>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {{ isEn ? article.relatedTool.descriptionEn : article.relatedTool.description }}
              </p>
            </div>
            <LocaleLink
              :to="article.relatedTool.path"
              class="shrink-0 self-start sm:self-center whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <span>{{ isEn ? article.relatedTool.labelEn : article.relatedTool.label }}</span>
              <ArrowRight class="w-3.5 h-3.5 shrink-0" />
            </LocaleLink>
          </section>
        </article>

        <!-- 上下篇閱讀導覽 -->
        <nav class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LocaleLink
            v-if="adjacentArticles.prev"
            :to="`/guides/${adjacentArticles.prev.slug}`"
            class="rounded-xl bg-white border border-slate-200/80 p-4 hover:border-amber-300 transition-colors space-y-1"
          >
            <span class="text-xs text-slate-400">← {{ t('guides.prevArticle') }}</span>
            <p class="text-sm font-semibold text-slate-800 line-clamp-1">
              {{ isEn ? adjacentArticles.prev.titleEn : adjacentArticles.prev.title }}
            </p>
          </LocaleLink>
          <div v-else class="hidden sm:block" />

          <LocaleLink
            v-if="adjacentArticles.next"
            :to="`/guides/${adjacentArticles.next.slug}`"
            class="rounded-xl bg-white border border-slate-200/80 p-4 hover:border-amber-300 transition-colors space-y-1 sm:text-right"
          >
            <span class="text-xs text-slate-400">{{ t('guides.nextArticle') }} →</span>
            <p class="text-sm font-semibold text-slate-800 line-clamp-1">
              {{ isEn ? adjacentArticles.next.titleEn : adjacentArticles.next.title }}
            </p>
          </LocaleLink>
        </nav>
      </div>

      <!-- 找不到文章 -->
      <div
        v-else
        class="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-xs border border-slate-200/70 space-y-4"
      >
        <h1 class="text-xl font-bold text-slate-900">{{ t('guides.notFoundTitle') }}</h1>
        <p class="text-sm text-slate-600">{{ t('guides.notFoundDesc') }}</p>
        <LocaleLink
          to="/guides"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>{{ t('guides.backToList') }}</span>
        </LocaleLink>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
