<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { BookOpen, ArrowRight } from 'lucide-vue-next'

interface EditorialBlock {
  heading: string
  paragraphs: string[]
}

interface EditorialLink {
  to: string
  label: string
}

interface Props {
  /** i18n 鍵值前綴，例如 "editorial.packingGuide" */
  i18nPrefix: string
}

const props = defineProps<Props>()
const { t, tm } = useI18n()

const blocks = computed<EditorialBlock[]>(() => {
  const raw = tm(`${props.i18nPrefix}.blocks`)
  return Array.isArray(raw) ? (raw as EditorialBlock[]) : []
})

const links = computed<EditorialLink[]>(() => {
  const raw = tm(`${props.i18nPrefix}.links`)
  return Array.isArray(raw) ? (raw as EditorialLink[]) : []
})
</script>

<template>
  <article
    class="mt-8 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-xs space-y-6"
  >
    <header class="space-y-1.5 border-b border-slate-100 pb-4">
      <h2 class="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-2">
        <BookOpen class="w-5 h-5 text-amber-500 shrink-0" />
        <span>{{ t(`${i18nPrefix}.title`) }}</span>
      </h2>
      <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
        {{ t(`${i18nPrefix}.subtitle`) }}
      </p>
    </header>

    <div class="space-y-6">
      <section
        v-for="block in blocks"
        :key="block.heading"
        class="space-y-2.5"
      >
        <h3 class="text-sm sm:text-base font-bold text-slate-800">
          {{ block.heading }}
        </h3>
        <p
          v-for="(paragraph, pIdx) in block.paragraphs"
          :key="pIdx"
          class="text-xs sm:text-sm text-slate-600 leading-relaxed"
        >
          {{ paragraph }}
        </p>
      </section>
    </div>

    <div
      v-if="links.length > 0"
      class="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2.5"
    >
      <LocaleLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 transition-colors"
      >
        <span>{{ link.label }}</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </LocaleLink>
    </div>
  </article>
</template>
