<script setup lang="ts">
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
  ChevronRight,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useFeedbackModal } from '@/composables/useFeedbackModal'
import { useSyncBackup } from '@/composables/useSyncBackup'

interface Props {
  isOpen: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const router = useRouter()
const { openFeedback } = useFeedbackModal()
const { openSyncModal } = useSyncBackup()

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
          <DialogPanel class="relative flex w-full max-w-xs flex-col bg-white pb-6 pt-5 shadow-2xl">
            <!-- 抽屜頂部：品牌與關閉按鈕 -->
            <div class="flex items-center justify-between px-5 pb-4 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <span class="text-base font-bold tracking-tight text-slate-900">Camino Plan 導覽</span>
              </div>
              <button
                type="button"
                @click="close"
                class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="關閉選單"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- 選單內容區域 -->
            <div class="flex-1 overflow-y-auto px-4 py-5 space-y-6">
              <!-- 第一分組：朝聖深度攻略與百科 -->
              <div class="space-y-2">
                <span class="px-2 text-sm tracking-wider text-slate-500 uppercase">
                  朝聖百科與攻略
                </span>
                <nav class="space-y-1">
                  <!-- 歷史淵源 -->
                  <button
                    type="button"
                    @click="navigateTo('/history')"
                    class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-amber-50/70 text-slate-700 hover:text-amber-700 transition-colors text-left group cursor-pointer"
                  >
                    <div class="flex items-center gap-3">
                      <div class="p-2 rounded-lg text-amber-600 shrink-0">
                        <Sparkles class="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div class="text-sm text-slate-800 group-hover:text-amber-700">
                          歷史淵源與文化
                        </div>
                        <div class="text-[12px] text-slate-500">千年傳奇、象徵與證書規範</div>
                      </div>
                    </div>
                    <ChevronRight class="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                  </button>

                  <!-- 路線攻略 -->
                  <button
                    type="button"
                    @click="navigateTo('/routes')"
                    class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/70 text-slate-700 hover:text-emerald-700 transition-colors text-left group cursor-pointer"
                  >
                    <div class="flex items-center gap-3">
                      <div class="p-2 rounded-lg  text-emerald-600 shrink-0">
                        <Compass class="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div class="text-sm text-slate-800 group-hover:text-emerald-700">三大經典路線攻略</div>
                        <div class="text-[12px] text-slate-500">客觀指標、地形與鋪裝比例</div>
                      </div>
                    </div>
                    <ChevronRight class="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </button>

                  <!-- 常見問題 -->
                  <button
                    type="button"
                    @click="navigateTo('/faq')"
                    class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-sky-50/70 text-slate-700 hover:text-sky-700 transition-colors text-left group cursor-pointer"
                  >
                    <div class="flex items-center gap-3">
                      <div class="p-2 rounded-lg  text-sky-600 shrink-0">
                        <HelpCircle class="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div class="text-sm text-slate-800 group-hover:text-sky-700">常見問題百科 (FAQ)</div>
                        <div class="text-[12px] text-slate-500">庇護所、證書印章與行前須知</div>
                      </div>
                    </div>
                    <ChevronRight class="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors" />
                  </button>
                </nav>
              </div>

              <!-- 第二分組：規劃實用工具與支援 -->
              <div class="space-y-2 pt-2 border-t border-slate-100">
                <span class="px-2 text-sm tracking-wider text-slate-500 uppercase">
                  實用工具與支援
                </span>
                <nav class="space-y-1">
                  <!-- 跨裝置同步 -->
                  <button
                    type="button"
                    @click="handleOpenSync"
                    class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors text-left group cursor-pointer"
                  >
                    <div class="flex items-center gap-3">
                      <div class="p-2 rounded-lg  text-slate-600 shrink-0">
                        <Share2 class="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div class="text-sm text-slate-800">跨裝置同步與備份</div>
                        <div class="text-[12px] text-slate-500">以網址編碼分享或復原排程</div>
                      </div>
                    </div>
                  </button>

                  <!-- 意見回饋與許願 -->
                  <button
                    type="button"
                    @click="handleOpenFeedback"
                    class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors text-left group cursor-pointer"
                  >
                    <div class="flex items-center gap-3">
                      <div class="p-2 rounded-lg  text-slate-600 shrink-0">
                        <MessageSquarePlus class="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div class="text-sm text-slate-800">問題回報與功能許願</div>
                        <div class="text-[12px] text-slate-500">勘誤回報或向開發者提議</div>
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
                <span>關於本站與隱私權</span>
              </button>
              <span>v1.0</span>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
