<script setup lang="ts">
import { ref, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { X, MapPin } from 'lucide-vue-next'
import type { UserStage, Waypoint } from '@/types/camino'
import { waypoints } from '@/data/waypoints'
import { calculateSegmentStats } from '@/utils/scheduleCalculator'

const props = defineProps<{
  isOpen: boolean
  stage: UserStage | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', dayIndex: number, newWaypointId: string): void
}>()

const selectedWaypointId = ref<string>('')

// 取得起始點之後的有效推薦城鎮清單（避免選取起點之前的城鎮）
const candidateWaypoints = computed(() => {
  if (!props.stage) return []
  const startIdx = waypoints.findIndex(w => w.id === props.stage!.startWaypointId)
  if (startIdx === -1) return []

  // 顯示起始點之後的城鎮（最多後續 8 個城鎮供現場調配）
  return waypoints.slice(startIdx + 1, Math.min(startIdx + 9, waypoints.length))
})

const startWaypoint = computed<Waypoint | undefined>(() => {
  if (!props.stage) return undefined
  return waypoints.find(w => w.id === props.stage!.startWaypointId)
})

// 計算從今日起點至該候選地點的當日行走公里數
const getStageDistance = (wp: Waypoint): string => {
  if (!props.stage) return '0.0'
  const stats = calculateSegmentStats(
    props.stage.startWaypointId,
    wp.id,
    props.stage.routeVariant,
    waypoints
  )
  return stats.distanceKm.toFixed(1)
}

const handleConfirm = () => {
  if (props.stage && selectedWaypointId.value) {
    emit('confirm', props.stage.dayIndex, selectedWaypointId.value)
    emit('close')
  }
}
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="emit('close')" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-150 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 shadow-2xl transition-all border border-slate-200">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <DialogTitle as="h3" class="text-base font-bold text-slate-900">
                  Day {{ stage?.dayIndex }}
                </DialogTitle>
                <button
                  type="button"
                  @click="emit('close')"
                  class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <div class="mt-4 space-y-4">
                <div class="space-y-2">
                  <label class="block text-xs font-semibold text-slate-700">
                    選擇新結束城鎮（出發地：{{ startWaypoint?.localName || startWaypoint?.spanishName }} / {{ startWaypoint?.chineseName }}）
                  </label>
                  <div class="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                    <button
                      v-for="wp in candidateWaypoints"
                      :key="wp.id"
                      type="button"
                      @click="selectedWaypointId = wp.id"
                      class="w-full p-3 rounded-lg border text-left transition flex items-center justify-between text-sm cursor-pointer"
                      :class="[
                        selectedWaypointId === wp.id
                          ? 'border-orange-50 bg-orange-50 text-slate-800 font-medium'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      ]"
                    >
                      <div class="flex items-center gap-2">
                        <MapPin class="w-4 h-4 text-amber-500 shrink-0" />
                        <div>
                          <div class="flex items-center gap-1.5">
                            <span class="font-medium text-slate-900">{{ wp.localName || wp.spanishName }}</span>
                            <span
                              v-if="wp.hasAlbergue"
                              class="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded font-normal"
                            >
                              有庇護所
                            </span>
                          </div>
                          <div class="text-xs font-normal text-slate-500">{{ wp.chineseName }}</div>
                        </div>
                      </div>
                      <div class="text-xs font-mono text-slate-600">
                        {{ getStageDistance(wp) }} km
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  @click="emit('close')"
                  class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  @click="handleConfirm"
                  class="px-4 py-2 text-sm font-normal text-white bg-orange-400 hover:bg-orange-100 rounded-lg hover:text-gray-700 transition shadow-xs cursor-pointer"
                >
                  確認變更
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
