<script setup lang="ts">
import { Compass, MessageSquarePlus, Share2 } from 'lucide-vue-next'
import { useFeedbackModal } from '@/composables/useFeedbackModal'
import { useSyncBackup } from '@/composables/useSyncBackup'

type TabType = 'schedule' | 'packing' | 'transport'

interface Props {
  currentTab: TabType
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:currentTab', tab: TabType): void
}>()

const { openFeedback } = useFeedbackModal()
const { openSyncModal } = useSyncBackup()

// 點擊分頁：若已在該分頁則平滑回到頂端，反之切換分頁
function handleTabClick(tab: TabType) {
  if (props.currentTab === tab) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    emit('update:currentTab', tab)
  }
}
</script>

<template>
  <header class="sticky top-0 z-40 h-14 sm:h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
    <div class="relative mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6">
      <!-- 左側：品牌標誌與標題 -->
      <div class="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <div class="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs shrink-0">
          <Compass class="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div>
          <div class="flex items-center gap-1.5 sm:gap-2">
            <h1 class="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900">
              Camino Planner
            </h1>
          </div>
        </div>
      </div>

      <!-- 中間：電腦版頂部 Tab 導覽列（居中對齊） -->
      <nav class="hidden md:flex items-center gap-1 rounded-xl bg-slate-100 p-1 absolute left-1/2 -translate-x-1/2">
        <button
          type="button"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-normal transition-all cursor-pointer',
            currentTab === 'schedule'
              ? 'bg-white text-slate-800 font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-500',
          ]"
          @click="handleTabClick('schedule')"
        >
          行程規劃
        </button>

        <button
          type="button"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-normal transition-all cursor-pointer',
            currentTab === 'packing'
              ? 'bg-white text-slate-800 font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-500',
          ]"
          @click="handleTabClick('packing')"
        >
          裝備負重
        </button>

        <button
          type="button"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-normal transition-all cursor-pointer',
            currentTab === 'transport'
              ? 'bg-white text-slate-800 font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-500',
          ]"
          @click="handleTabClick('transport')"
        >
          起點交通
        </button>
      </nav>

      <!-- 右側：功能動作區（跨裝置同步備份 ＆ 許願與回饋） -->
      <div class="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <button
          type="button"
          @click="openSyncModal"
          class="flex h-9 w-9 items-center justify-center text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
          title="跨裝置同步與備份"
          aria-label="跨裝置同步與備份"
        >
          <Share2 class="h-5 w-5" />
        </button>

        <button
          type="button"
          @click="openFeedback({ category: 'feature_request' })"
          class="flex h-9 w-9 items-center justify-center text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
          title="意見回饋與許願"
          aria-label="意見回饋與許願"
        >
          <MessageSquarePlus class="h-5 w-5" />
        </button>
      </div>
    </div>
  </header>
</template>
