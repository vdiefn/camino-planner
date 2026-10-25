<script setup lang="ts">
import { Compass } from 'lucide-vue-next'

type TabType = 'schedule' | 'packing' | 'transport'

interface Props {
  currentTab: TabType
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:currentTab', tab: TabType): void
}>()
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
    <div class="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6">
      <!-- 品牌標誌與標題 -->
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs shrink-0">
          <Compass class="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div>
          <div class="flex items-center gap-1.5 sm:gap-2">
            <h1 class="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900">
              Camino Planner
            </h1>
          </div>
        </div>
      </div>

      <!-- 電腦版頂部 Tab 導覽列 -->
      <nav class="hidden md:flex items-center gap-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-normal transition-all cursor-pointer',
            currentTab === 'schedule'
              ? 'bg-white text-slate-800 font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-500',
          ]"
          @click="emit('update:currentTab', 'schedule')"
        >
          行程規劃
        </button>

        <button
          type="button"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-normal transition-all cursor-pointer',
            currentTab === 'packing'
              ? 'bg-white text-slate-800 font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-500',
          ]"
          @click="emit('update:currentTab', 'packing')"
        >
          裝備負重
        </button>

        <button
          type="button"
          :class="[
            'rounded-lg px-4 py-2 text-sm font-normal transition-all cursor-pointer',
            currentTab === 'transport'
              ? 'bg-white text-slate-800 font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-500',
          ]"
          @click="emit('update:currentTab', 'transport')"
        >
          起點交通
        </button>
      </nav>
    </div>
  </header>
</template>
