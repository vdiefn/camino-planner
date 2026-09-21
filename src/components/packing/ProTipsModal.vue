<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { Lightbulb, X, Languages } from 'lucide-vue-next'
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
      <DialogPanel class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2 text-amber-600">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Lightbulb class="h-5 w-5" />
            </div>
            <DialogTitle class="text-base font-bold text-slate-900">
              台灣實戰避坑建議
            </DialogTitle>
          </div>
          <button
            type="button"
            class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            @click="emit('close')"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <div v-if="item" class="space-y-3 text-xs leading-relaxed">
          <!-- 裝備品名與多語系對照 -->
          <div class="rounded-xl bg-slate-50 p-3">
            <div class="text-sm font-bold text-slate-900">{{ item.chineseName }}</div>
            <div class="mt-1 flex items-center gap-1.5 text-slate-500">
              <Languages class="h-3.5 w-3.5 text-slate-400" />
              <span>英文: {{ item.englishName }}</span>
              <span v-if="item.spanishName" class="text-amber-700 font-medium">｜ 西文: {{ item.spanishName }}</span>
            </div>
          </div>

          <!-- 實戰 Tips 內容 -->
          <div class="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 text-slate-700 space-y-2">
            <div class="font-bold text-amber-900">💡 朝聖前輩避坑心得：</div>
            <p>{{ item.proTips }}</p>
          </div>
        </div>

        <div class="pt-2 flex justify-end">
          <button
            type="button"
            class="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
            @click="emit('close')"
          >
            我知道了
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
