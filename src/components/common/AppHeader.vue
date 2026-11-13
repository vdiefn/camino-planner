<script setup lang="ts">
import { ref, computed } from 'vue'
import { Menu as HeadlessMenu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import {
  MessageSquarePlus,
  Share2,
  HelpCircle,
  Compass,
  Sparkles,
  BookOpen,
  ChevronDown,
  Menu,
} from 'lucide-vue-next'
import { useFeedbackModal } from '@/composables/useFeedbackModal'
import { useSyncBackup } from '@/composables/useSyncBackup'
import { useScheduleStore } from '@/stores/schedule'
import MobileMenuDrawer from '@/components/common/MobileMenuDrawer.vue'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'

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
          :alt="$t('app.logoAlt')"
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

      <!-- 中間：電腦與平板頂部 Tab 導覽列（平板緊湊自適應，居中對齊） -->
      <nav aria-label="主要功能導覽" class="hidden md:flex items-center gap-0.5 lg:gap-1 rounded-xl bg-slate-100 p-0.5 lg:p-1 absolute left-1/2 -translate-x-1/2">
        <a
          :href="`/schedule/${currentRouteSlug}`"
          :class="[
            'rounded-lg px-2.5 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm font-normal transition-all cursor-pointer',
            currentTab === 'schedule'
              ? 'bg-white text-slate-800 font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-500',
          ]"
          @click.prevent="handleTabClick('schedule')"
        >
          {{ $t('nav.schedule') }}
        </a>

        <a
          href="/packing"
          :class="[
            'rounded-lg px-2.5 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm font-normal transition-all cursor-pointer',
            currentTab === 'packing'
              ? 'bg-white text-slate-800 font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-500',
          ]"
          @click.prevent="handleTabClick('packing')"
        >
          {{ $t('nav.packing') }}
        </a>

        <a
          :href="`/transport/${currentRouteSlug}`"
          :class="[
            'rounded-lg px-2.5 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm font-normal transition-all cursor-pointer',
            currentTab === 'transport'
              ? 'bg-white text-slate-800 font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-500',
          ]"
          @click.prevent="handleTabClick('transport')"
        >
          {{ $t('nav.transport') }}
        </a>

        <a
          href="/budget"
          :class="[
            'rounded-lg px-2.5 py-1.5 text-xs lg:px-4 lg:py-2 lg:text-sm font-normal transition-all cursor-pointer',
            currentTab === 'budget'
              ? 'bg-white text-slate-800 font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-500',
          ]"
          @click.prevent="handleTabClick('budget')"
        >
          {{ $t('nav.budget') }}
        </a>
      </nav>

      <!-- 右側：電腦與平板完整功能導覽群組 -->
      <div class="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0">
        <!-- 平板專用（768px ~ 1199px）：智慧收合為「朝聖指南 ▾」下拉選單 -->
        <HeadlessMenu as="div" class="relative inline-block text-left xl:hidden">
          <MenuButton
            class="text-xs text-slate-700 hover:text-amber-600 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen class="w-4 h-4 text-amber-500" />
            <span>{{ $t('nav.guide') }}</span>
            <ChevronDown class="w-3.5 h-3.5 text-slate-400" />
          </MenuButton>

          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems
              class="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-slate-100 rounded-xl bg-white p-1.5 shadow-lg border border-slate-200/90 focus:outline-hidden z-50"
            >
              <MenuItem v-slot="{ active }">
                <router-link
                  to="/history"
                  :class="[
                    active ? 'bg-amber-50 text-amber-700' : 'text-slate-700',
                    'flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer',
                  ]"
                >
                  <Sparkles class="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{{ $t('nav.historyLong') }}</span>
                </router-link>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <router-link
                  to="/routes"
                  :class="[
                    active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700',
                    'flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer',
                  ]"
                >
                  <Compass class="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{{ $t('nav.routesLong') }}</span>
                </router-link>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <router-link
                  to="/faq"
                  :class="[
                    active ? 'bg-sky-50 text-sky-700' : 'text-slate-700',
                    'flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer',
                  ]"
                >
                  <HelpCircle class="w-4 h-4 text-sky-600 shrink-0" />
                  <span>{{ $t('nav.faqLong') }}</span>
                </router-link>
              </MenuItem>
            </MenuItems>
          </transition>
        </HeadlessMenu>

        <!-- 寬螢幕桌面（>= 1280px / xl）：完整展開圖示與文字 -->
        <div class="hidden xl:flex items-center gap-1 lg:gap-1.5">
          <router-link
            to="/history"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-amber-600 px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles class="w-4 h-4 text-amber-500" />
            <span>{{ $t('nav.history') }}</span>
          </router-link>

          <router-link
            to="/routes"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-emerald-600 px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Compass class="w-4 h-4 text-emerald-600" />
            <span>{{ $t('nav.routes') }}</span>
          </router-link>

          <router-link
            to="/faq"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-sky-600 px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle class="w-4 h-4 text-sky-600" />
            <span>{{ $t('nav.faq') }}</span>
          </router-link>
        </div>

        <!-- 垂直細分隔線 -->
        <div class="h-4 w-px bg-slate-200 mx-1"></div>

        <!-- 工具動作（同步 ＆ 回饋 ＆ 語言切換） -->
        <button
          type="button"
          @click="openSyncModal"
          class="flex h-9 w-9 items-center justify-center text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
          :title="$t('nav.sync')"
          :aria-label="$t('nav.sync')"
        >
          <Share2 class="h-4 w-4" />
        </button>

        <button
          type="button"
          @click="openFeedback({ category: 'feature_request' })"
          class="flex h-9 w-9 items-center justify-center text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
          :title="$t('nav.feedback')"
          :aria-label="$t('nav.feedback')"
        >
          <MessageSquarePlus class="h-4 w-4" />
        </button>

        <LanguageSwitcher mode="dropdown" />
      </div>

      <!-- 右側：手機版漢堡選單觸發按鈕（極致乾淨俐落） -->
      <div class="flex md:hidden items-center shrink-0">
        <button
          type="button"
          @click="isMobileMenuOpen = true"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          :title="$t('nav.openMenu')"
          :aria-label="$t('nav.openMenu')"
        >
          <Menu class="h-5.5 w-5.5" />
        </button>
      </div>
    </div>

    <!-- 手機版右側滑出抽屜導覽選單 -->
    <MobileMenuDrawer v-model:is-open="isMobileMenuOpen" />
  </header>
</template>
