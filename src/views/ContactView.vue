<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Mail, ArrowLeft, MessageSquare, CheckCircle2 } from 'lucide-vue-next'
import AppFooter from '@/components/common/AppFooter.vue'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
import { useFeedbackModal } from '@/composables/useFeedbackModal'

const { t } = useI18n()
const { openFeedback } = useFeedbackModal()
const CONTACT_EMAIL = 'contact@camino-plan.com'
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
    <!-- 頂部獨立標準導覽列 -->
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
          <div>
            <span class="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900">
              Camino Plan
            </span>
          </div>
        </LocaleLink>

        <div class="flex items-center gap-2">
          <LanguageSwitcher />
          <LocaleLink
            to="/"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>{{ t('contact.backToPlanner') }}</span>
          </LocaleLink>
        </div>
      </div>
    </header>

    <!-- 聯絡我們主體內容 -->
    <main class="flex-1 py-8 sm:py-12 px-4 sm:px-6">
      <article class="mx-auto max-w-3xl rounded-2xl bg-white p-6 sm:p-10 shadow-xs border border-slate-200/60 space-y-8">
        <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div class="p-2.5 rounded-xl bg-sky-50 text-sky-600">
            <Mail class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              {{ t('contact.title') }}
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              {{ t('contact.subtitle') }}
            </p>
          </div>
        </div>

        <section class="space-y-4">
          <h2 class="text-base sm:text-lg font-bold text-slate-800">
            {{ t('contact.channelsTitle') }}
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="rounded-xl bg-slate-50 border border-slate-200/80 p-5 flex flex-col justify-between gap-4">
              <div class="space-y-2">
                <h3 class="text-sm sm:text-base font-bold text-slate-800">
                  {{ t('contact.channelFeedbackTitle') }}
                </h3>
                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {{ t('contact.channelFeedbackDesc') }}
                </p>
              </div>
              <div>
                <button
                  type="button"
                  @click="openFeedback()"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <MessageSquare class="w-4 h-4" />
                  <span>{{ t('contact.channelFeedbackBtn') }}</span>
                </button>
              </div>
            </div>

            <div class="rounded-xl bg-slate-50 border border-slate-200/80 p-5 space-y-3">
              <h3 class="text-sm sm:text-base font-bold text-slate-800">
                {{ t('contact.channelEmailTitle') }}
              </h3>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {{ t('contact.channelEmailDesc') }}
              </p>
              <a
                :href="`mailto:${CONTACT_EMAIL}`"
                class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-sky-700 hover:underline break-all"
              >
                <Mail class="w-4 h-4 shrink-0" />
                <span>{{ CONTACT_EMAIL }}</span>
              </a>
            </div>
          </div>
        </section>

        <section class="space-y-3 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
          <h2 class="text-base sm:text-lg font-bold text-slate-800">
            {{ t('contact.channelScopeTitle') }}
          </h2>
          <ul class="space-y-2">
            <li class="flex items-start gap-2.5">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
              <span>{{ t('contact.scope1') }}</span>
            </li>
            <li class="flex items-start gap-2.5">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
              <span>{{ t('contact.scope2') }}</span>
            </li>
            <li class="flex items-start gap-2.5">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
              <span>{{ t('contact.scope3') }}</span>
            </li>
          </ul>
          <p class="text-xs sm:text-sm text-slate-500 pt-2">
            {{ t('contact.responseNote') }}
          </p>
        </section>
      </article>
    </main>

    <AppFooter />
  </div>
</template>
