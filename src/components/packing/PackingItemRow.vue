<script setup lang="ts">
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

            <!-- 穿在身上行內膠囊按鈕（防冒泡避免觸發 Checkbox，未勾選時無外框） -->
            <button
              type="button"
              class="rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
              :class="[
                item.isWornOnBody
                  ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              ]"
              :title="item.isWornOnBody ? '點擊改為放入背包（計入背包負重）' : '點擊標記為穿在身上（不計入背包負重）'"
              @click.stop.prevent="emit('toggleWorn', item.id)"
            >
              <span>{{ item.isWornOnBody ? '✓ 穿在身上' : '+ 穿在身上' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 右側：避坑 Tips 與自訂刪除按鈕 -->
      <div class="flex items-center gap-1.5 shrink-0">
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
      </div>
    </div>

    <!-- 下方：常駐緊湊重量與數量控制列（無分隔線） -->
    <div class="mt-2 flex items-center justify-between gap-2 text-xs">
      <!-- 實際重量 -->
      <div class="flex items-center gap-1.5">
        <span class="text-slate-500">實際重量:</span>
        <input
          type="number"
          min="0"
          step="1"
          :value="item.unitWeightGrams"
          class="w-16 rounded-md border border-slate-200 px-1.5 py-0.5 text-right font-mono text-slate-900 focus:border-amber-400 focus:outline-hidden"
          @input="emit('updateWeight', item.id, Number(($event.target as HTMLInputElement).value))"
        />
        <span class="text-slate-400">g</span>
      </div>

      <!-- 數量步進器與多件小計 -->
      <div class="flex items-center gap-2">
        <span
          v-if="item.quantity > 1"
          class="text-[11px] font-mono text-slate-400"
          title="總重量"
        >
          計 {{ item.unitWeightGrams * item.quantity }}g
        </span>

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
  </div>
</template>
