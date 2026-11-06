<script setup lang="ts">
import { ref, computed } from 'vue'
import { MessageSquarePlus, Share2, HelpCircle, Compass, Sparkles, Menu } from 'lucide-vue-next'
import { useFeedbackModal } from '@/composables/useFeedbackModal'
import { useSyncBackup } from '@/composables/useSyncBackup'
import { useScheduleStore } from '@/stores/schedule'
import MobileMenuDrawer from '@/components/common/MobileMenuDrawer.vue'

type TabType = 'schedule' | 'packing' | 'transport' | 'budget'

interface Props {
  currentTab: TabType
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:currentTab', tab: TabType): void
}>()

const isMobileMenuOpen = ref(false)

const { openFeedback } = useFeedbackModal()
const { openSyncModal } = useSyncBackup()
const scheduleStore = useScheduleStore()
const currentRouteSlug = computed(() => {
  const routeId = scheduleStore.currentRouteId || 'frances'
  const branchId = scheduleStore.currentDraft?.branchId
  if (routeId === 'portugues' && branchId === 'costa') {
    return `${routeId}/${branchId}`
  }
  return routeId
})

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
  <header class="sticky top-0 z-40 h-14 sm:h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md print:hidden">
    <div class="relative mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6">
      <!-- 左側：品牌標誌與標題（點選返回首頁） -->
      <router-link
        to="/"
        class="flex items-center gap-2.5 sm:gap-3 shrink-0 hover:opacity-85 transition-opacity cursor-pointer"
      >
        <img
          src="/favicon.svg"
          alt="Camino Plan 標誌"
          width="36"
          height="36"
          class="h-8 w-8 sm:h-9 sm:w-9 shrink-0 drop-shadow-2xs"
        />
        <div>
          <div class="flex items-center gap-1.5 sm:gap-2">
            <span class="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900">
              Camino Plan
            </span>
          </div>
        </div>
      </router-link>

      <!-- 中間：電腦版頂部 Tab 導覽列（居中對齊，使用動態長尾 <a href> 錨點供搜尋引擎檢索） -->
      <nav aria-label="主要功能導覽" class="hidden md:flex items-center gap-1 rounded-xl bg-slate-100 p-1 absolute left-1/2 -translate-x-1/2">
        <a
          :href="`/schedule/${currentRouteSlug}`"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-normal transition-all cursor-pointer',
            currentTab === 'schedule'
              ? 'bg-white text-slate-800 font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-500',
          ]"
          @click.prevent="handleTabClick('schedule')"
        >
          行程規劃
        </a>

        <a
          href="/packing"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-normal transition-all cursor-pointer',
            currentTab === 'packing'
              ? 'bg-white text-slate-800 font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-500',
          ]"
          @click.prevent="handleTabClick('packing')"
        >
          裝備負重
        </a>

        <a
          :href="`/transport/${currentRouteSlug}`"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-normal transition-all cursor-pointer',
            currentTab === 'transport'
              ? 'bg-white text-slate-800 font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-500',
          ]"
          @click.prevent="handleTabClick('transport')"
        >
          起點交通
        </a>

        <a
          href="/budget"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-normal transition-all cursor-pointer',
            currentTab === 'budget'
              ? 'bg-white text-slate-800 font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-500',
          ]"
          @click.prevent="handleTabClick('budget')"
        >
          花費預算
        </a>
      </nav>

      <!-- 右側：電腦版完整功能圖示群組（歷史 ＆ 路線 ＆ FAQ ＆ 同步 ＆ 回饋） -->
      <div class="hidden md:flex items-center gap-1 sm:gap-1.5 shrink-0">
        <router-link
          to="/history"
          class="flex h-9 w-9 items-center justify-center text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
          title="歷史淵源與文化"
          aria-label="歷史淵源與文化"
        >
          <Sparkles class="h-5 w-5" />
        </router-link>

        <router-link
          to="/routes"
          class="flex h-9 w-9 items-center justify-center text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
          title="路線攻略與深度評估"
          aria-label="路線攻略與深度評估"
        >
          <Compass class="h-5 w-5" />
        </router-link>

        <router-link
          to="/faq"
          class="flex h-9 w-9 items-center justify-center text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
          title="常見問題百科"
          aria-label="常見問題百科"
        >
          <HelpCircle class="h-5 w-5" />
        </router-link>

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

      <!-- 右側：手機版漢堡選單觸發按鈕（極致乾淨俐落） -->
      <div class="flex md:hidden items-center shrink-0">
        <button
          type="button"
          @click="isMobileMenuOpen = true"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          title="開啟選單"
          aria-label="開啟選單"
        >
          <Menu class="h-5.5 w-5.5" />
        </button>
      </div>
    </div>

    <!-- 手機版右側滑出抽屜導覽選單 -->
    <MobileMenuDrawer v-model:is-open="isMobileMenuOpen" />
  </header>
</template>
