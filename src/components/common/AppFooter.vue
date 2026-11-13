<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ShieldCheck } from 'lucide-vue-next'
import { useFeedbackModal } from '@/composables/useFeedbackModal'
import { useSyncBackup } from '@/composables/useSyncBackup'

const { t } = useI18n()
const { openFeedback } = useFeedbackModal()
const { openSyncModal } = useSyncBackup()
</script>

<template>
  <footer class="mt-auto border-t border-slate-200/60 bg-slate-50/80 pt-3 pb-3 sm:pt-2.5 sm:pb-2.5 px-4 text-center">
    <div class="mx-auto max-w-[1440px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-[10px] sm:text-xs text-slate-400">
      <div class="flex items-center justify-center gap-1.5">
        <ShieldCheck class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <p class="leading-normal">
          <span>{{ t('footer.disclaimer1') }}</span>
          <span>{{ t('footer.disclaimer2') }}</span>
        </p>
      </div>
      <span class="text-slate-300 hidden sm:inline">|</span>
      <router-link
        to="/privacy"
        target="_blank"
        rel="noopener"
        class="text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors cursor-pointer shrink-0"
      >
        {{ t('footer.privacy') }}
      </router-link>
      <span class="text-slate-300 hidden sm:inline">|</span>
      <button
        type="button"
        @click="openSyncModal()"
        class="text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors cursor-pointer shrink-0"
      >
        {{ t('footer.sync') }}
      </button>
      <span class="text-slate-300 hidden sm:inline">|</span>
      <button
        type="button"
        @click="openFeedback()"
        class="text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors cursor-pointer shrink-0"
      >
        {{ t('footer.feedback') }}
      </button>
    </div>
  </footer>
</template>
