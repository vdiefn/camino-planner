<script setup lang="ts">
import { computed } from 'vue'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import {
  ChevronDown,
  MapPin,
  Coffee,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-vue-next'
import type { UserStage, Waypoint } from '@/types/camino'
import { waypoints } from '@/data/waypoints'

const props = defineProps<{
  stage: UserStage
  isFirst: boolean
  isLast: boolean
}>()

const emit = defineEmits<{
  (e: 'open-albergue', stage: UserStage): void
  (e: 'change-waypoint', stage: UserStage): void
  (e: 'toggle-rest', dayIndex: number): void
}>()

// 航點查找
const startWaypoint = computed<Waypoint | undefined>(() => {
  return waypoints.find(w => w.id === props.stage.startWaypointId)
})

const endWaypoint = computed<Waypoint | undefined>(() => {
  return waypoints.find(w => w.id === props.stage.endWaypointId)
})

// 日期格式化 (MM/DD 星期幾)
const formattedDate = computed(() => {
  const d = new Date(props.stage.date)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getMonth() + 1}/${d.getDate()} (週${weekdays[d.getDay()]})`
})

// 移除括號備註的精簡中文名稱
const cleanChineseName = (name?: string) => {
  return name ? name.replace(/\s*\([^)]*\)/g, '').trim() : ''
}

// Google 地圖外連搜尋
const openGoogleMapSearch = (queryType: 'supermarket' | 'pharmacy' | 'city') => {
  const townName = endWaypoint.value?.spanishName || endWaypoint.value?.chineseName || ''
  if (!townName) return

  let keyword = townName
  if (queryType === 'supermarket') {
    keyword = `${townName} Supermercado`
  } else if (queryType === 'pharmacy') {
    keyword = `${townName} Farmacia`
  }

  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(keyword)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div
    class="rounded-xl border transition-all duration-200 overflow-hidden bg-white"
    :class="[
      stage.isRestDay
        ? 'border-purple-300'
        : 'border-slate-200 hover:border-slate-400'
    ]"
  >
    <!-- 電腦版視圖 (md 及以上：直接完整展開) -->
    <div class="hidden md:block p-5">
      <div class="flex items-start justify-between gap-4">
        <!-- 左側：天數標籤與路線 -->
        <div class="flex items-start gap-4">
          <div
            class="flex flex-col items-center justify-center w-14 h-14 rounded-xl text-center shrink-0 bg-white shadow-xs"
            :class="[
              stage.isRestDay
                ? 'border-2 border-purple-300'
                : 'border-2 border-orange-300'
            ]"
          >
            <span class="text-xs font-normal text-slate-700">DAY</span>
            <span class="text-lg leading-tight font-medium text-slate-900">{{ stage.dayIndex }}</span>
          </div>

          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs text-slate-700 font-normal">
                {{ formattedDate }}
              </span>
              <span
                v-if="stage.isRestDay"
                class="px-2 py-0.5 rounded-full text-xs font-normal bg-purple-100 text-purple-800"
              >
                休息停留日
              </span>
            </div>

            <!-- 起訖城鎮 (西文/當地名稱為主，中文為輔) -->
            <div class="text-base font-medium text-slate-900 mt-1 flex items-center gap-2">
              <span>{{ startWaypoint?.localName || startWaypoint?.spanishName || stage.startWaypointId }}</span>
              <span class="text-slate-600 font-normal">→</span>
              <button
                type="button"
                @click.stop="emit('change-waypoint', stage)"
                class="text-slate-900 hover:text-slate-400 cursor-pointer text-left transition-colors font-medium"
              >
                {{ endWaypoint?.localName || endWaypoint?.spanishName || stage.endWaypointId }}
              </button>
              <span
                v-if="endWaypoint?.isMajorCity"
                class="px-1.5 py-0.5 rounded text-[10px] font-normal bg-amber-100 text-amber-800"
              >
                大城
              </span>
            </div>
            <div class="text-xs text-slate-600 font-normal">
              {{ startWaypoint?.chineseName }} → {{ endWaypoint?.chineseName }}
            </div>
          </div>
        </div>

        <!-- 右側：數據統計 (里程、爬升、下降) -->
        <div class="flex items-center gap-6 text-right shrink-0">
          <div>
            <div class="text-xl font-medium text-slate-900 font-mono">
              {{ stage.distanceKm.toFixed(1) }} <span class="text-sm font-normal text-slate-700">km</span>
            </div>
            <div class="text-xs text-slate-700 font-normal flex items-center justify-end gap-3 mt-1 font-mono">
              <span class="flex items-center text-rose-600 gap-0.5">
                <TrendingUp class="w-3.5 h-3.5" /> +{{ stage.elevationGainM }}m
              </span>
              <span class="flex items-center text-emerald-600 gap-0.5">
                <TrendingDown class="w-3.5 h-3.5" /> -{{ stage.elevationLossM }}m
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 無住宿提醒橫條 -->
      <div
        v-if="!stage.isRestDay && !endWaypoint?.hasAlbergue"
        class="mt-3 p-2.5 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-800 flex items-center gap-2 font-normal"
      >
        <AlertTriangle class="w-4 h-4 shrink-0 text-orange-600" />
        <span>住宿提醒：該落腳點無常設朝聖者庇護所，建議提前確認私立旅館或考慮前後城鎮。</span>
      </div>

      <!-- 中段：機能標籤與操作按鈕 -->
      <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-4">
        <div class="flex items-center gap-2 flex-wrap text-xs font-normal">
          <MapPin class="w-4 h-4 text-amber-500 shrink-0" />
          <button
            v-if="endWaypoint?.hasAlbergue"
            type="button"
            @click.stop="emit('open-albergue', stage)"
            class="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs cursor-pointer hover:bg-emerald-100 transition"
          >
            庇護所
          </button>
          <button
            v-if="endWaypoint?.hasSupermarket"
            type="button"
            @click.stop="openGoogleMapSearch('supermarket')"
            class="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-xs cursor-pointer hover:bg-blue-100 transition"
          >
            超市
          </button>
          <button
            v-if="endWaypoint?.hasPharmacy"
            type="button"
            @click.stop="openGoogleMapSearch('pharmacy')"
            class="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-xs cursor-pointer hover:bg-rose-100 transition"
          >
            藥局
          </button>
        </div>

        <div class="flex items-center gap-2">
          <!-- 休息日切換按鈕 -->
          <button
            type="button"
            @click.stop="emit('toggle-rest', stage.dayIndex)"
            class="px-2.5 py-1 text-xs font-medium rounded-lg border transition cursor-pointer flex items-center gap-1"
            :class="[
              stage.isRestDay
                ? 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            ]"
          >
            <Coffee class="w-3.5 h-3.5" />
            <span>{{ stage.isRestDay ? '取消休息' : '設為休息日' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 手機版視圖 (md 以下：手風琴折疊模式) -->
    <div class="md:hidden">
      <Disclosure v-slot="{ open }">
        <DisclosureButton class="w-full p-4 flex items-center justify-between text-left cursor-pointer">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div
              class="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 text-xs bg-white text-slate-900"
              :class="[
                stage.isRestDay
                  ? 'border-2 border-purple-300'
                  : 'border-2 border-orange-300'
              ]"
            >
              <span class="font-medium">D{{ stage.dayIndex }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-xs text-slate-700 font-normal">
                  {{ formattedDate }}
                </span>
                <span
                  v-if="endWaypoint?.isMajorCity"
                  class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800"
                >
                  大城
                </span>
                <span
                  v-if="stage.isRestDay"
                  class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800"
                >
                  休息停留
                </span>
              </div>
              <div class="font-medium text-slate-900 text-sm flex items-center gap-x-1.5 gap-y-0.5 flex-wrap leading-tight mt-0.5">
                <span>{{ startWaypoint?.localName || startWaypoint?.spanishName || stage.startWaypointId }}</span>
                <span class="text-slate-600 text-xs font-normal">→</span>
                <button
                  type="button"
                  @click.stop="emit('change-waypoint', stage)"
                  class="text-slate-900 hover:text-slate-400 active:text-slate-500 cursor-pointer text-left font-medium transition-colors"
                >
                  {{ endWaypoint?.localName || endWaypoint?.spanishName || stage.endWaypointId }}
                </button>
              </div>
              <div class="text-[11px] text-slate-500 font-normal mt-0.5 truncate">
                {{ cleanChineseName(startWaypoint?.chineseName) }} → {{ cleanChineseName(endWaypoint?.chineseName) }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <div class="text-right">
              <div class="font-medium text-slate-900 font-mono text-sm whitespace-nowrap">
                {{ stage.distanceKm.toFixed(1) }} km
              </div>
            </div>
            <ChevronDown
              class="w-4 h-4 text-slate-600 transition-transform duration-200"
              :class="{ 'rotate-180': open }"
            />
          </div>
        </DisclosureButton>

        <DisclosurePanel class="px-4 pb-4 pt-1 border-t border-slate-200">
          <div class="space-y-3">
            <div
              v-if="!stage.isRestDay && !endWaypoint?.hasAlbergue"
              class="p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-900 font-normal flex items-center gap-1.5"
            >
              <AlertTriangle class="w-3.5 h-3.5 shrink-0 text-orange-600" />
              <span>該城鎮無常設庇護所，請提前規劃！</span>
            </div>

            <div class="flex items-center justify-between text-xs text-slate-700 pt-1 font-normal font-mono">
              <span>爬升：<strong class="text-rose-600 font-normal">+{{ stage.elevationGainM }}m</strong></span>
              <span>下降：<strong class="text-emerald-600 font-normal">-{{ stage.elevationLossM }}m</strong></span>
            </div>

            <!-- 機能標籤與操作按鈕：與電腦版樣式與佈局完全一致 -->
            <div class="mt-2 pt-2.5 border-t border-slate-200 flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5 flex-wrap text-xs font-normal">
                <MapPin class="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <button
                  v-if="endWaypoint?.hasAlbergue"
                  type="button"
                  @click.stop="emit('open-albergue', stage)"
                  class="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs cursor-pointer hover:bg-emerald-100 transition"
                >
                  庇護所
                </button>
                <button
                  v-if="endWaypoint?.hasSupermarket"
                  type="button"
                  @click.stop="openGoogleMapSearch('supermarket')"
                  class="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-xs cursor-pointer hover:bg-blue-100 transition"
                >
                  超市
                </button>
                <button
                  v-if="endWaypoint?.hasPharmacy"
                  type="button"
                  @click.stop="openGoogleMapSearch('pharmacy')"
                  class="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-xs cursor-pointer hover:bg-rose-100 transition"
                >
                  藥局
                </button>
              </div>

              <!-- 休息日切換按鈕：與電腦版完全一致 -->
              <button
                type="button"
                @click.stop="emit('toggle-rest', stage.dayIndex)"
                class="px-2.5 py-1 text-xs font-medium rounded-lg border transition cursor-pointer flex items-center gap-1 shrink-0"
                :class="[
                  stage.isRestDay
                    ? 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                ]"
              >
                <Coffee class="w-3.5 h-3.5" />
                <span>{{ stage.isRestDay ? '取消休息' : '設為休息日' }}</span>
              </button>
            </div>
          </div>
        </DisclosurePanel>
      </Disclosure>
    </div>
  </div>
</template>
