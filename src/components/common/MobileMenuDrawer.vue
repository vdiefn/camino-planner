<script setup lang="ts">
import { computed } from 'vue'
import {
  Dialog,
  DialogPanel,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'
import {
  X,
  Sparkles,
  Compass,
  HelpCircle,
  Share2,
  MessageSquarePlus,
  ShieldCheck,
  CalendarDays,
  Backpack,
  TrainFront,
  Coins,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useScheduleStore } from '@/stores/schedule'
import { useFeedbackModal } from '@/composables/useFeedbackModal'
import { useSyncBackup } from '@/composables/useSyncBackup'
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'

interface Props {
  isOpen: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const router = useRouter()
const scheduleStore = useScheduleStore()
const { openFeedback } = useFeedbackModal()
const { openSyncModal } = useSyncBackup()

const currentRouteSlug = computed(() => {
  const routeId = scheduleStore.currentRouteId || 'frances'
  const branchId = scheduleStore.currentDraft?.branchId
  if (routeId === 'portugues' && branchId === 'costa') {
    return `${routeId}/${branchId}`
  }
  return routeId
})

function close() {
  emit('update:isOpen', false)
}

function navigateTo(path: string) {
  close()
  router.push(path)
}

function handleOpenSync() {
  close()
  openSyncModal()
}

function handleOpenFeedback() {
  close()
  openFeedback({ category: 'feature_request' })
}
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50 md:hidden" @close="close">
      <!-- 背景暗化遮罩 -->
      <TransitionChild
        as="template"
        enter="transition-opacity ease-linear duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="transition-opacity ease-linear duration-300"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" />
      </TransitionChild>

      <div class="fixed inset-0 flex justify-end">
        <!-- 右側滑出抽屜主面板 -->
        <TransitionChild
          as="template"
          enter="transition ease-in-out duration-300 transform"
          enter-from="translate-x-full"
          enter-to="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leave-from="translate-x-0"
          leave-to="translate-x-full"
        >
          <DialogPanel class="relative flex w-full max-w-xs flex-col bg-white pb-4 pt-3 shadow-2xl">
            <!-- 抽屜頂部：品牌與關閉按鈕 -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <span class="text-lg font-bold tracking-tight text-slate-800">
                  {{ $t('nav.drawerTitle') }}
                </span>
              </div>
              <button
                type="button"
                @click="close"
                class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                :title="$t('nav.closeMenu')"
                :aria-label="$t('nav.closeMenu')"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- 選單內容區域 -->
            <div class="flex-1 overflow-y-auto px-3 py-4 space-y-4">
              <!-- 語系切換分組 -->
              <div class="space-y-1.5 px-1">
                <span class="text-xs font-medium tracking-wider text-slate-400 uppercase">
                  {{ $t('language.select') }}
                </span>
                <LanguageSwitcher mode="inline" />
              </div>

              <!-- 核心規劃工具分組 -->
              <div class="space-y-1 pt-1 border-t border-slate-100">
                <span class="p-2 text-sm tracking-wider text-slate-500 uppercase">
                  {{ $t('nav.coreTools') }}
                </span>
                <nav class="py-1">
                  <!-- 行程規劃 -->
                  <button
                    type="button"
                    @click="navigateTo(`/schedule/${currentRouteSlug}`)"
                    class="w-full flex items-center justify-between py-1 px-2.5 rounded-lg hover:bg-amber-50/70 text-slate-700 hover:text-amber-700 transition-colors text-left group cursor-pointer"
                  >
                    <div class="flex items-center gap-2.5">
                      <div class="p-1.5 rounded-md text-amber-600 shrink-0">
                        <CalendarDays class="w-4.5 h-4.5" />
                      </div>
                      <div class="text-sm text-slate-800 group-hover:text-amber-700">
                        {{ $t('nav.schedule') }}
                      </div>
                    </div>
                  </button>

                  <!-- 裝備負重 -->
                  <button
                    type="button"
                    @click="navigateTo('/packing')"
                    class="w-full flex items-center justify-between py-1 px-2.5 rounded-lg hover:bg-emerald-50/70 text-slate-700 hover:text-emerald-700 transition-colors text-left group cursor-pointer"
                  >
                    <div class="flex items-center gap-2.5">
                      <div class="p-1.5 rounded-md text-emerald-600 shrink-0">
                        <Backpack class="w-4.5 h-4.5" />
                      </div>
                      <div class="text-sm text-slate-800 group-hover:text-emerald-700">
                        {{ $t('nav.packingLong') }}
                      </div>
                    </div>
                  </button>

                  <!-- 起點交通 -->
                  <button
                    type="button"
                    @click="navigateTo(`/transport/${currentRouteSlug}`)"
                    class="w-full flex items-center justify-between py-1 px-2.5 rounded-lg hover:bg-sky-50/70 text-slate-700 hover:text-sky-700 transition-colors text-left group cursor-pointer"
                  >
                    <div class="flex items-center gap-2.5">
                      <div class="p-1.5 rounded-md text-sky-600 shrink-0">
                        <TrainFront class="w-4.5 h-4.5" />
                      </div>
                      <div class="text-sm text-slate-800 group-hover:text-sky-700">
                        {{ $t('nav.transportLong') }}
                      </div>
                    </div>
                  </button>

                  <!-- 花費預算 -->
                  <button
                    type="button"
                    @click="navigateTo('/budget')"
                    class="w-full flex items-center justify-between py-1 px-2.5 rounded-lg hover:bg-rose-50/70 text-slate-700 hover:text-rose-700 transition-colors text-left group cursor-pointer"
                  >
                    <div class="flex items-center gap-2.5">
                      <div class="p-1.5 rounded-md text-rose-600 shrink-0">
                        <Coins class="w-4.5 h-4.5" />
                      </div>
                      <div class="text-sm text-slate-800 group-hover:text-rose-700">
                        {{ $t('nav.budgetLong') }}
                      </div>
                    </div>
                  </button>
                </nav>
              </div>

              <!-- 第一分組：朝聖深度攻略與百科 -->
              <div class="space-y-1 pt-2 border-t border-slate-100">
                <span class="p-2 text-sm tracking-wider text-slate-500 uppercase">
                  {{ $t('nav.encyclopedia') }}
                </span>
                <nav class="py-1">
                  <!-- 歷史淵源 -->
                  <button
                    type="button"
                    @click="navigateTo('/history')"
                    class="w-full flex items-center justify-between py-1 px-2.5 rounded-lg hover:bg-amber-50/70 text-slate-700 hover:text-amber-700 transition-colors text-left group cursor-pointer"
                  >
                    <div class="flex items-center gap-2.5">
                      <div class="p-1.5 rounded-md text-amber-600 shrink-0">
                        <Sparkles class="w-4.5 h-4.5" />
                      </div>
                      <div class="text-sm text-slate-800 group-hover:text-amber-700">
                        {{ $t('nav.historyLong') }}
                      </div>
                    </div>
                  </button>

                  <!-- 路線攻略 -->
                  <button
                    type="button"
                    @click="navigateTo('/routes')"
                    class="w-full flex items-center justify-between py-1 px-2.5 rounded-lg hover:bg-emerald-50/70 text-slate-700 hover:text-emerald-700 transition-colors text-left group cursor-pointer"
                  >
                    <div class="flex items-center gap-2.5">
                      <div class="p-1.5 rounded-md text-emerald-600 shrink-0">
                        <Compass class="w-4.5 h-4.5" />
                      </div>
                      <div class="text-sm text-slate-800 group-hover:text-emerald-700">
                        {{ $t('nav.routesLongAlt') }}
                      </div>
                    </div>
                  </button>

                  <!-- 常見問題 -->
                  <button
                    type="button"
                    @click="navigateTo('/faq')"
                    class="w-full flex items-center justify-between py-1 px-2.5 rounded-lg hover:bg-sky-50/70 text-slate-700 hover:text-sky-700 transition-colors text-left group cursor-pointer"
                  >
                    <div class="flex items-center gap-2.5">
                      <div class="p-1.5 rounded-md text-sky-600 shrink-0">
                        <HelpCircle class="w-4.5 h-4.5" />
                      </div>
                      <div class="text-sm text-slate-800 group-hover:text-sky-700">
                        {{ $t('nav.faqLong') }}
                      </div>
                    </div>
                  </button>
                </nav>
              </div>

              <!-- 第二分組：規劃實用工具與支援 -->
              <div class="space-y-1 pt-2 border-t border-slate-100">
                <span class="p-2 text-sm tracking-wider text-slate-500 uppercase">
                  {{ $t('nav.utilities') }}
                </span>
                <nav class="py-1">
                  <!-- 跨裝置同步 -->
                  <button
                    type="button"
                    @click="handleOpenSync"
                    class="w-full flex items-center justify-between py-1 px-2.5 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors text-left group cursor-pointer"
                  >
                    <div class="flex items-center gap-2.5">
                      <div class="p-1.5 rounded-md text-slate-600 shrink-0">
                        <Share2 class="w-4.5 h-4.5" />
                      </div>
                      <div class="text-sm text-slate-800">
                        {{ $t('nav.sync') }}
                      </div>
                    </div>
                  </button>

                  <!-- 意見回饋與許願 -->
                  <button
                    type="button"
                    @click="handleOpenFeedback"
                    class="w-full flex items-center justify-between py-1 px-2.5 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors text-left group cursor-pointer"
                  >
                    <div class="flex items-center gap-2.5">
                      <div class="p-1.5 rounded-md text-slate-600 shrink-0">
                        <MessageSquarePlus class="w-4.5 h-4.5" />
                      </div>
                      <div class="text-sm text-slate-800">
                        {{ $t('nav.feedbackLong') }}
                      </div>
                    </div>
                  </button>
                </nav>
              </div>
            </div>

            <!-- 抽屜底部：隱私政策與版權 -->
            <div class="px-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                @click="navigateTo('/privacy')"
                class="inline-flex items-center gap-1.5 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <ShieldCheck class="w-3.5 h-3.5" />
                <span>{{ $t('nav.privacy') }}</span>
              </button>
              <span>v1.0</span>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
