<script setup lang="ts">
import { Switch } from '@headlessui/vue'
import { Lightbulb, Trash2, Plus, Minus } from 'lucide-vue-next'
import type { PackingItem } from '@/types/camino'

interface Props {
  item: PackingItem
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'toggleCheck', id: string): void
  (e: 'toggleWorn', id: string): void
  (e: 'updateWeight', id: string, weight: number): void
  (e: 'updateQuantity', id: string, quantity: number): void
  (e: 'removeCustom', id: string): void
  (e: 'showTips', item: PackingItem): void
}>()
</script>

<template>
  <div
    :class="[
      'rounded-xl border p-3 transition-all',
      item.isChecked
        ? 'border-slate-200 bg-white shadow-xs hover:border-amber-300'
        : 'border-slate-100 bg-slate-50/60 opacity-60',
    ]"
  >
    <!-- 上方：勾選、品名、Tips 與自訂刪除 -->
    <div class="flex items-start justify-between gap-2">
      <label class="flex flex-1 items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          :checked="item.isChecked"
          class="mt-1 h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
          @change="emit('toggleCheck', item.id)"
        />
        <div>
          <div class="flex flex-wrap items-center gap-1.5">
            <span :class="['text-sm font-bold', item.isChecked ? 'text-slate-900' : 'text-slate-400 line-through']">
              {{ item.chineseName }}
            </span>
            <span
              v-if="item.priority === 'ESSENTIAL'"
              class="rounded bg-rose-100 px-1.5 py-0.2 text-[10px] font-bold text-rose-700"
            >
              必備
            </span>
          </div>
          <div class="mt-0.5 text-[11px] text-slate-500">
            <span>{{ item.englishName }}</span>
            <span v-if="item.spanishName" class="text-slate-400"> · {{ item.spanishName }}</span>
          </div>
        </div>
      </label>

      <!-- 避坑 Tips 按鈕與自訂刪除按鈕 -->
      <div class="flex items-center gap-1">
        <button
          v-if="item.proTips"
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
          title="查看台灣實戰避坑建議"
          @click="emit('showTips', item)"
        >
          <Lightbulb class="h-4 w-4" />
        </button>

        <button
          v-if="item.isCustom"
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          title="刪除此自訂裝備"
          @click="emit('removeCustom', item.id)"
        >
          <Trash2 class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <!-- 下方：參考重量、實測克數、數量、穿在身上開關 -->
    <div class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs">
      <!-- 參考重量與實測輸入框 -->
      <div class="flex items-center gap-2">
        <span class="text-[11px] text-slate-400">參考: {{ item.referenceRangeText }}</span>
        <div class="flex items-center gap-1">
          <span class="text-slate-500">實測:</span>
          <input
            type="number"
            min="0"
            step="5"
            :value="item.unitWeightGrams"
            class="w-16 rounded-md border border-slate-200 px-1.5 py-0.5 text-right font-mono font-bold text-slate-900 focus:border-amber-400 focus:outline-hidden"
            @input="emit('updateWeight', item.id, Number(($event.target as HTMLInputElement).value))"
          />
          <span class="text-slate-400">g</span>
        </div>
      </div>

      <!-- 數量步進器與穿在身上 Switch -->
      <div class="flex items-center gap-3">
        <!-- 數量步進器 -->
        <div class="flex items-center rounded-md border border-slate-200 bg-slate-50">
          <button
            type="button"
            class="px-1.5 py-0.5 text-slate-500 hover:bg-slate-200 rounded-l-md"
            :disabled="item.quantity <= 1"
            @click="emit('updateQuantity', item.id, item.quantity - 1)"
          >
            <Minus class="h-3 w-3" />
          </button>
          <span class="w-6 text-center font-mono font-bold text-slate-800">{{ item.quantity }}</span>
          <button
            type="button"
            class="px-1.5 py-0.5 text-slate-500 hover:bg-slate-200 rounded-r-md"
            @click="emit('updateQuantity', item.id, item.quantity + 1)"
          >
            <Plus class="h-3 w-3" />
          </button>
        </div>

        <!-- 穿在身上開關 -->
        <div class="flex items-center gap-1.5" :title="item.isWornOnBody ? '穿在身上，不計入背包負重' : '裝在背包裡，計入背包負重'">
          <Switch
            :model-value="item.isWornOnBody"
            :class="[
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden',
              item.isWornOnBody ? 'bg-emerald-300' : 'bg-slate-200',
            ]"
            @update:model-value="emit('toggleWorn', item.id)"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out',
                item.isWornOnBody ? 'translate-x-4' : 'translate-x-0',
              ]"
            />
          </Switch>
          <span :class="['text-[11px] font-medium', item.isWornOnBody ? 'text-emerald-700 font-bold' : 'text-slate-400']">
            {{ item.isWornOnBody ? '穿身上' : '背著' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
