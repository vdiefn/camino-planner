<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { AlertTriangle } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '確認操作',
  confirmText: '確定',
  cancelText: '取消',
  isDanger: true,
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'close'): void
}>()
</script>

<template>
  <Dialog :open="isOpen" class="relative z-50" @close="emit('close')">
    <!-- 毛玻璃遮罩背景 -->
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" aria-hidden="true" />

    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl space-y-4 border border-slate-100">
        <div class="flex items-start gap-3">
          <div class="p-2 text-amber-600 shrink-0">
            <AlertTriangle class="w-5 h-5" />
          </div>
          <div class="space-y-1.5 flex-1 min-w-0">
            <DialogTitle class="text-base font-boldtext-slate-900">
              {{ title }}
            </DialogTitle>
            <div class="text-sm text-slate-600 leading-relaxed">
              <!-- 優先渲染插槽，無插槽時回退渲染 message prop -->
              <slot>
                {{ message }}
              </slot>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            @click="emit('close')"
          >
            {{ cancelText }}
          </button>
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-orange-400 hover:bg-orange-50 hover:text-gray-700 transition-all cursor-pointer shadow-xs"
            @click="emit('confirm')"
          >
            {{ confirmText }}
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
