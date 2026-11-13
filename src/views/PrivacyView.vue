<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ShieldCheck, ArrowLeft, ExternalLink, MessageSquare } from 'lucide-vue-next'
import { useFeedbackModal } from '@/composables/useFeedbackModal'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'

const { t } = useI18n()
const { openFeedback } = useFeedbackModal()
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
    <!-- 頂部獨立標準導覽列（對齊主站統一規格） -->
    <header class="sticky top-0 z-40 h-14 sm:h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div class="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6">
        <!-- 品牌標誌 -->
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

        <!-- 右側控制組：語言切換 ＋ 返回規劃工具按鈕 -->
        <div class="flex items-center gap-2">
          <LanguageSwitcher />
          <router-link
            to="/"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>{{ t('privacy.backToPlanner') }}</span>
          </router-link>
        </div>
      </div>
    </header>

    <!-- 隱私權政策主體內容 -->
    <main class="flex-1 py-8 sm:py-12 px-4 sm:px-6">
      <article class="mx-auto max-w-3xl rounded-2xl bg-white p-6 sm:p-10 shadow-xs border border-slate-200/60">
        <div class="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div class="p-2 rounded-xl text-emerald-600">
            <ShieldCheck class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              {{ t('privacy.title') }}
            </h1>
            <p class="text-xs text-slate-400 mt-0.5">{{ t('privacy.lastUpdated') }}</p>
          </div>
        </div>

        <div class="mt-6 space-y-6 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
          <section class="space-y-2 rounded-xl bg-slate-50/80 p-4 sm:p-5 border border-slate-200/60">
            <h2 class="text-base sm:text-lg font-bold text-slate-800">{{ t('privacy.about.title') }}</h2>
            <p>
              {{ t('privacy.about.p1') }}
            </p>
            <p>
              {{ t('privacy.about.p2') }}
            </p>
          </section>

          <section>
            <p>
              {{ t('privacy.intro') }}
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-base sm:text-lg font-bold text-slate-800">{{ t('privacy.section1.title') }}</h2>
            <p>
              {{ t('privacy.section1.lead') }}
            </p>
            <ul class="list-disc pl-5 space-y-1.5">
              <li>{{ t('privacy.section1.item1') }}</li>
              <li>{{ t('privacy.section1.item2') }}</li>
              <li>{{ t('privacy.section1.item3') }}</li>
            </ul>
          </section>

          <section class="space-y-2">
            <h2 class="text-base sm:text-lg font-bold text-slate-800">{{ t('privacy.section2.title') }}</h2>
            <p>
              {{ t('privacy.section2.lead') }}
            </p>
            <ul class="list-disc pl-5 space-y-1.5">
              <li>{{ t('privacy.section2.item1') }}</li>
              <li>{{ t('privacy.section2.item2') }}</li>
              <li>
                {{ t('privacy.section2.item3Prefix') }}
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-emerald-600 hover:underline inline-flex items-center gap-0.5"
                >
                  {{ t('privacy.section2.item3Link') }}
                  <ExternalLink class="w-3.5 h-3.5" />
                </a>
                {{ t('privacy.section2.item3Suffix') }}
              </li>
              <li>
                {{ t('privacy.section2.item4Prefix') }}
                <a
                  href="https://www.aboutads.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-emerald-600 hover:underline inline-flex items-center gap-0.5"
                >
                  {{ t('privacy.section2.item4Link') }}
                  <ExternalLink class="w-3.5 h-3.5" />
                </a>
                {{ t('privacy.section2.item4Suffix') }}
              </li>
            </ul>
          </section>

          <section class="space-y-2">
            <h2 class="text-base sm:text-lg font-bold text-slate-800">{{ t('privacy.section3.title') }}</h2>
            <p>
              {{ t('privacy.section3.content') }}
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-base sm:text-lg font-bold text-slate-800">{{ t('privacy.section4.title') }}</h2>
            <p>
              {{ t('privacy.section4.content') }}
            </p>
          </section>

          <section class="space-y-2.5">
            <h2 class="text-base sm:text-lg font-bold text-slate-800">{{ t('privacy.section5.title') }}</h2>
            <p>
              {{ t('privacy.section5.content') }}
            </p>
            <div class="pt-1 flex justify-end">
              <button
                type="button"
                @click="openFeedback({ category: 'general' })"
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200/80 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                <MessageSquare class="w-4 h-4" />
                <span>{{ t('privacy.section5.btn') }}</span>
              </button>
            </div>
          </section>
        </div>
      </article>
    </main>

    <!-- 底部精簡版權資訊 -->
    <footer class="border-t border-slate-200/60 bg-white/50 py-4 text-center text-xs text-slate-400">
      <p>© {{ new Date().getFullYear() }} Camino Plan. All rights reserved.</p>
    </footer>
  </div>
</template>
