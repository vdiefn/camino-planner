<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";
import { X, Sparkles } from "lucide-vue-next";

interface Props {
  isOpen: boolean;
  title: string;
  tips?: string[];
}

defineProps<Props>();
const emit = defineEmits<{
  (e: "close"): void;
}>();
</script>

<template>
  <Dialog :open="isOpen" class="relative z-50" @close="emit('close')">
    <!-- 毛玻璃遮罩背景 -->
    <div
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      aria-hidden="true"
    />

    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel
        class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl space-y-4 border border-slate-100"
      >
        <!-- 標頭：圖示、標題與關閉按鈕 -->
        <div
          class="flex items-center justify-between border-b border-slate-100 pb-3"
        >
          <div class="flex items-center gap-2 text-slate-900">
            <Sparkles class="w-4 h-4 text-amber-500 shrink-0" />
            <DialogTitle class="text-sm font-bold text-slate-900">
              {{ title }}
            </DialogTitle>
          </div>
          <button
            type="button"
            class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            @click="emit('close')"
            aria-label="關閉視窗"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- 內容區：條列清單或自訂插槽 -->
        <div class="text-xs text-slate-600 leading-relaxed space-y-2.5">
          <slot>
            <ul v-if="tips && tips.length > 0" class="space-y-2">
              <li
                v-for="(tip, idx) in tips"
                :key="idx"
                class="flex items-start gap-2"
              >
                <span class="text-amber-500 font-bold shrink-0">•</span>
                <span>{{ tip }}</span>
              </li>
            </ul>
          </slot>
        </div>

        <!-- 底部快速關閉按鈕（行動端單手舒適點擊） -->
        <div class="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            class="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            @click="emit('close')"
          >
            我知道了
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>
