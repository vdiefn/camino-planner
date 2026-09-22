<script setup lang="ts">
import { computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import { X, BedDouble, ExternalLink, Phone, MessageSquare } from 'lucide-vue-next'
import type { UserStage, Waypoint } from '@/types/camino'
import { waypoints } from '@/data/waypoints'
import { accommodations } from '@/data/accommodations'

const props = defineProps<{
  isOpen: boolean
  stage: UserStage | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// 取得該分段結束城鎮
const endWaypoint = computed<Waypoint | undefined>(() => {
  if (!props.stage) return undefined
  return waypoints.find(w => w.id === props.stage!.endWaypointId)
})

// 取得該分段結束城鎮的所有庇護所
const localAlbergues = computed(() => {
  if (!props.stage) return []
  return accommodations.filter(a => a.waypointId === props.stage!.endWaypointId)
})

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
            <DialogPanel class="w-full max-w-lg transform overflow-hidden rounded-xl bg-white p-6 shadow-2xl transition-all border border-slate-200">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <DialogTitle as="h3" class="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BedDouble class="w-5 h-5 text-slate-900" />
                    {{ endWaypoint?.localName || endWaypoint?.spanishName || stage?.endWaypointId }}
                  </DialogTitle>
                </div>
                <button
                  type="button"
                  @click="emit('close')"
                  class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <!-- 全城外部即時資料入口 -->
              <div class="mt-3 space-y-2">
                <div class="flex items-center gap-2 flex-wrap text-xs">
                  <a
                    :href="`https://www.google.com/maps/search/alojamiento+hotel+albergue+${endWaypoint?.spanishName || ''}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition flex items-center gap-1 font-normal"
                  >
                    <ExternalLink class="w-3 h-3" />
                    Google 地圖搜尋該地區住宿
                  </a>
                </div>
              </div>
              <!-- 庇護所清單 -->
              <div class="mt-3 space-y-3 max-h-96 overflow-y-auto pr-1">
                <div
                  v-if="localAlbergues.length === 0"
                  class="py-6 px-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3 my-2"
                >
                  <p class="text-xs text-slate-600 font-normal">
                    該站點為小型鄉村聚落或目前無常設公立庇護所
                  </p>
                  <div class="flex items-center justify-center gap-2 flex-wrap text-xs">
                    <a
                      :href="`https://www.google.com/maps/search/alojamiento+hotel+albergue+${endWaypoint?.spanishName || ''}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="px-3 py-1.5 rounded-lg bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 transition shadow-xs flex items-center gap-1.5"
                    >
                      <ExternalLink class="w-3.5 h-3.5 text-amber-600" />
                      開啟 Google 地圖搜尋
                    </a>
                  </div>
                </div>

                <div
                  v-for="albergue in localAlbergues"
                  :key="albergue.id"
                  class="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1">
                      <div class="text-slate-900 font-bold">
                        {{ albergue.name }}
                      </div>
                      <div v-if="albergue.chineseName" class="text-xs text-slate-500">
                        {{ albergue.chineseName }}
                      </div>
                      <div class="text-xs text-slate-500 mt-1.5 flex items-center gap-3">
                        <span v-if="albergue.bedCount">床位數：{{ albergue.bedCount }} 床</span>
                        <span v-if="albergue.priceEur" class="text-slate-700">約 €{{ albergue.priceEur }}</span>
                      </div>
                    </div>

                    <span
                      class="px-2 py-0.5 rounded text-[11px] font-medium shrink-0"
                      :class="[
                        albergue.type === 'MUNICIPAL'
                          ? 'bg-emerald-100 text-emerald-800'
                          : albergue.type === 'PAROCHIAL'
                          ? 'bg-purple-100 text-purple-800'
                          : albergue.type === 'HOTEL'
                          ? 'bg-indigo-100 text-indigo-800'
                          : albergue.type === 'HOSTEL'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      ]"
                    >
                      {{
                        albergue.type === 'MUNICIPAL'
                          ? '公立'
                          : albergue.type === 'PAROCHIAL'
                          ? '教會'
                          : albergue.type === 'HOTEL'
                          ? '飯店'
                          : albergue.type === 'HOSTEL'
                          ? '青旅'
                          : '私立'
                      }}
                    </span>
                  </div>

                  <div v-if="albergue.notes" class="text-xs text-slate-600 leading-relaxed">
                    {{ albergue.notes }}
                  </div>

                  <!-- 預訂管道連結按鈕 -->
                  <div class="pt-2 flex items-center gap-2 flex-wrap border-t border-slate-200/60">
                    <a
                      v-if="albergue.bookingChannels.bookingComUrl"
                      :href="albergue.bookingChannels.bookingComUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="px-2.5 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1"
                      title="前往 Booking.com 專屬預訂頁面"
                    >
                      <ExternalLink class="w-3 h-3" />
                      Booking.com
                    </a>

                    <a
                      v-if="albergue.bookingChannels.officialWebsiteUrl"
                      :href="albergue.bookingChannels.officialWebsiteUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="px-2.5 py-1 rounded text-xs font-medium bg-slate-200 text-slate-800 hover:bg-slate-300 transition flex items-center gap-1"
                    >
                      <ExternalLink class="w-3 h-3" />
                      官方網站
                    </a>

                    <a
                      v-if="albergue.bookingChannels.whatsapp"
                      :href="`https://wa.me/${albergue.bookingChannels.whatsapp.replace(/[^0-9]/g, '')}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="px-2.5 py-1 rounded text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1"
                    >
                      <MessageSquare class="w-3 h-3" />
                      WhatsApp
                    </a>

                    <a
                      v-if="albergue.bookingChannels.phone"
                      :href="`tel:${albergue.bookingChannels.phone}`"
                      class="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition flex items-center gap-1"
                    >
                      <Phone class="w-3 h-3" />
                      {{ albergue.bookingChannels.phone }}
                    </a>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex justify-end">
                <button
                  type="button"
                  @click="emit('close')"
                  class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  關閉
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
