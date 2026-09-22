<script setup lang="ts">
import { ref } from 'vue'
import { Lightbulb, Trash2, Plus, Minus, ChevronDown } from 'lucide-vue-next'
import type { PackingItem } from '@/types/camino'

const isExpanded = ref(false)

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
      <div
        class="flex flex-1 items-start cursor-pointer select-none"
        @click="emit('toggleCheck', item.id)"
      >
        <div>
          <div class="flex flex-wrap items-center gap-1.5">
            <span
              :class="[
                'text-sm font-medium transition-colors',
                item.isChecked ? 'text-slate-900' : 'text-slate-400 line-through'
              ]"
            >
              {{ item.chineseName }}
            </span>
            <span
              v-if="item.priority === 'ESSENTIAL'"
              class="rounded bg-rose-50 px-1 py-0.5 text-[10px] text-rose-600 hover:bg-rose-100"
            >
              必備
            </span>

            <!-- 穿在身上行內膠囊按鈕（防冒泡避免觸發 Checkbox） -->
            <button
              type="button"
              class="rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
              :class="[
                item.isWornOnBody
                  ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                  : 'border border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600 bg-white'
              ]"
              :title="item.isWornOnBody ? '點擊改為放入背包（計入背包負重）' : '點擊標記為穿在身上（不計入背包負重）'"
              @click.stop.prevent="emit('toggleWorn', item.id)"
            >
              <span>{{ item.isWornOnBody ? '✓ 穿在身上' : '+ 穿在身上' }}</span>
            </button>
          </div>
          <div v-if="isExpanded" class="mt-0.5 text-[11px] space-y-0.5">
            <div class="text-slate-500">{{ item.englishName }}</div>
            <div v-if="item.spanishName" class="text-slate-400">{{ item.spanishName }}</div>
          </div>
        </div>
      </div>

      <!-- 避坑 Tips 按鈕、自訂刪除按鈕與展開收合 -->
      <div class="flex items-center gap-1.5 shrink-0">
        <!-- 收合時顯示的總重量小摘要 -->
        <span
          v-if="!isExpanded"
          :class="[
            'text-[11px] font-mono font-medium transition-colors',
            item.isChecked ? 'text-slate-500' : 'text-slate-400 line-through opacity-60'
          ]"
          title="目前總重量"
        >
          {{ item.unitWeightGrams * item.quantity }}g
          <span v-if="item.quantity > 1" class="text-[10px] text-slate-400">({{ item.quantity }}件)</span>
        </span>

        <button
          v-if="item.proTips"
          type="button"
          class="flex h-7 w-7 items-center justify-center text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
          @click="emit('showTips', item)"
        >
          <Lightbulb class="h-4 w-4" />
        </button>

        <button
          v-if="item.isCustom"
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
          @click="emit('removeCustom', item.id)"
        >
          <Trash2 class="h-3.5 w-3.5" />
        </button>

        <!-- 展開/收合按鈕 -->
        <button
          type="button"
          class="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          :title="isExpanded ? '收合詳細資訊' : '展開外文與數值編輯'"
          @click.stop="isExpanded = !isExpanded"
        >
          <ChevronDown
            class="h-4 w-4 transition-transform duration-200"
            :class="{ 'rotate-180': isExpanded }"
          />
        </button>
      </div>
    </div>

    <!-- 下方：展開時才顯示重量與數量微調 -->
    <div
      v-if="isExpanded"
      class="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs"
    >
      <!-- 參考重量與實測輸入框 -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1">
          <span class="text-slate-500">實際重量:</span>
          <input
            type="number"
            min="0"
            step="5"
            :value="item.unitWeightGrams"
            class="w-16 rounded-md border border-slate-200 px-1.5 py-0.5 text-right font-mono text-slate-900 focus:border-amber-400 focus:outline-hidden"
            @input="emit('updateWeight', item.id, Number(($event.target as HTMLInputElement).value))"
          />
          <span class="text-slate-400">g</span>
        </div>
      </div>

      <!-- 數量步進器 -->
      <div class="flex items-center rounded-md border border-slate-200 bg-slate-50">
        <button
          type="button"
          class="px-1.5 py-0.5 text-slate-500 hover:bg-slate-200 rounded-l-md cursor-pointer"
          :disabled="item.quantity <= 1"
          @click="emit('updateQuantity', item.id, item.quantity - 1)"
        >
          <Minus class="h-3 w-3" />
        </button>
        <span class="w-6 text-center font-mono text-slate-800">{{ item.quantity }}</span>
        <button
          type="button"
          class="px-1.5 py-0.5 text-slate-500 hover:bg-slate-200 rounded-r-md cursor-pointer"
          @click="emit('updateQuantity', item.id, item.quantity + 1)"
        >
          <Plus class="h-3 w-3" />
        </button>
      </div>
    </div>
  </div>
</template>
