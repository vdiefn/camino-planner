<script setup lang="ts">
import { computed } from 'vue'
import { CalendarDays, Backpack, TrainFront } from 'lucide-vue-next'
import { useScheduleStore } from '@/stores/schedule'

type TabType = 'schedule' | 'packing' | 'transport'

interface Props {
  currentTab: TabType
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:currentTab', tab: TabType): void
}>()

const scheduleStore = useScheduleStore()
const currentRouteSlug = computed(() => {
  const routeId = scheduleStore.currentRouteId || 'frances'
  const branchId = scheduleStore.currentDraft?.branchId
  if (routeId === 'portugues' && branchId === 'costa') {
    return `${routeId}/${branchId}`
  }
  return routeId
})

// 點擊分頁：若已在該分頁則自動平滑回到頂端，反之切換分頁
function handleTabClick(tab: TabType) {
  if (props.currentTab === tab) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    emit('update:currentTab', tab)
  }
}
</script>

<template>
  <nav aria-label="行動端功能導覽" class="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 pb-safe backdrop-blur-md md:hidden">
    <div class="grid h-16 grid-cols-3 items-center">
      <a
        :href="`/schedule/${currentRouteSlug}`"
        :class="[
          'flex h-full flex-col items-center justify-center gap-1 transition-colors cursor-pointer',
          currentTab === 'schedule' ? 'text-amber-600 font-medium' : 'text-slate-500 hover:text-slate-800',
        ]"
        @click.prevent="handleTabClick('schedule')"
      >
        <CalendarDays class="h-5 w-5" />
        <span class="text-[11px]">行程規劃</span>
      </a>

      <a
        href="/packing"
        :class="[
          'flex h-full flex-col items-center justify-center gap-1 transition-colors cursor-pointer',
          currentTab === 'packing' ? 'text-amber-600 font-medium' : 'text-slate-500 hover:text-slate-800',
        ]"
        @click.prevent="handleTabClick('packing')"
      >
        <Backpack class="h-5 w-5" />
        <span class="text-[11px]">裝備負重</span>
      </a>

      <a
        :href="`/transport/${currentRouteSlug}`"
        :class="[
          'flex h-full flex-col items-center justify-center gap-1 transition-colors cursor-pointer',
          currentTab === 'transport' ? 'text-amber-600 font-medium' : 'text-slate-500 hover:text-slate-800',
        ]"
        @click.prevent="handleTabClick('transport')"
      >
        <TrainFront class="h-5 w-5" />
        <span class="text-[11px]">起點交通</span>
      </a>
    </div>
  </nav>
</template>
