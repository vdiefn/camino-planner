<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Wifi, WifiOff, Compass } from 'lucide-vue-next'

type TabType = 'schedule' | 'packing' | 'transport'

interface Props {
  currentTab: TabType
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:currentTab', tab: TabType): void
}>()

// 離線 / 連線狀態偵測
const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

function handleOnlineStatus() {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', handleOnlineStatus)
  window.addEventListener('offline', handleOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnlineStatus)
  window.removeEventListener('offline', handleOnlineStatus)
})
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
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
            <span class="rounded-full bg-amber-100 px-1.5 py-0.5 sm:px-2 text-[10px] font-bold text-amber-800 shrink-0">
              🇪🇸 法國之路
            </span>
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

      <!-- 離線可用狀態指示器 -->
      <div class="flex items-center gap-2">
        <div
          :class="[
            'inline-flex items-center gap-1.5 rounded-full p-1.5 sm:px-2.5 sm:py-1 text-xs font-medium transition-colors',
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              : 'bg-amber-50 text-amber-700 border border-amber-200/60',
          ]"
          :title="isOnline ? '連線正常' : '離線模式'"
        >
          <Wifi v-if="isOnline" class="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
          <WifiOff v-else class="h-3.5 w-3.5 text-amber-600" />
          <span class="hidden sm:inline font-mono">{{ isOnline ? '連線正常' : '離線模式' }}</span>
        </div>
      </div>
    </div>
  </header>
</template>
