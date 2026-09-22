<script setup lang="ts">
import { Dialog, DialogPanel } from '@headlessui/vue'
import { X, Sparkles } from 'lucide-vue-next'
import type { PackingItem } from '@/types/camino'

interface Props {
  isOpen: boolean
  item: PackingItem | null
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Dialog :open="isOpen" class="relative z-50" @close="emit('close')">
    <!-- 遮罩背景 -->
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" aria-hidden="true" />

    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div v-if="item" class="space-y-3.5 text-xs">
          <!-- 頂部標題列：品名、必備標籤與關閉按鈕水平對齊 -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-slate-900">{{ item.chineseName }}</h3>
              <span
                v-if="item.priority === 'ESSENTIAL'"
                class="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-600"
              >
                必備
              </span>
            </div>
            <button
              type="button"
              class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              @click="emit('close')"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- 裝備外文對照（結構化上下排列） -->
          <div class="space-y-1 text-xs text-slate-600">
            <div class="flex items-center gap-2">
              <span class="px-1.5 py-0.5 rounded bg-slate-200/80 text-[10px] font-mono font-medium text-slate-600">EN</span>
              <span class="text-slate-800">{{ item.englishName }}</span>
            </div>
            <div v-if="item.spanishName" class="flex items-center gap-2">
              <span class="px-1.5 py-0.5 rounded bg-slate-200/80 text-[10px] font-mono font-medium text-slate-600">ES</span>
              <span class="text-slate-800">{{ item.spanishName }}</span>
            </div>
          </div>

          <!-- 避坑 Tips 卡片 -->
          <div class="rounded-xl border border-amber-400 p-3.5 text-xs space-y-1.5">
            <div class="flex items-center gap-1.5 text-slate-800">
              <Sparkles class="h-4 w-4 text-orange-400 shrink-0" />
              <span class="text-sm">裝備避坑建議</span>
            </div>
            <p class="leading-relaxed text-slate-700 pl-5.5 text-sm">{{ item.proTips }}</p>
          </div>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
