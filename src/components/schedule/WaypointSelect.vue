<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from '@headlessui/vue'
import { ChevronsUpDown, Check, MapPin, X } from 'lucide-vue-next'
import type { Waypoint } from '@/types/camino'

interface Props {
  modelValue: string
  label?: string
  waypoints: Waypoint[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const query = ref('')
const inputRef = ref<any>(null)

// 當前選中的航點物件
const selectedWaypoint = computed(() => {
  return props.waypoints.find((w) => w.id === props.modelValue) || null
})

// 格式化顯示名稱
const formatWaypoint = (wp: Waypoint | null) => {
  if (!wp) return ''
  if (wp.id === 'SJPP') {
    return 'SJPP - Saint-Jean-Pied-de-Port（聖讓皮耶德波爾）'
  }
  return `${wp.localName || wp.spanishName}（${wp.chineseName}）`
}

// 搜尋過濾：同時支援西/葡原文、中文名稱與代碼
const filteredWaypoints = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.waypoints

  return props.waypoints.filter((wp) => {
    const local = (wp.localName || '').toLowerCase()
    const spanish = (wp.spanishName || '').toLowerCase()
    const chinese = (wp.chineseName || '').toLowerCase()
    const id = (wp.id || '').toLowerCase()
    return local.includes(q) || spanish.includes(q) || chinese.includes(q) || id.includes(q)
  })
})

function handleSelect(wp: Waypoint | null) {
  if (!wp) return
  emit('update:modelValue', wp.id)
  emit('change', wp.id)
}

// 聚焦時自動全選現有內容（使用者只要直接打字即可取代，省去逐字刪除的繁瑣操作）
function handleFocus(event: FocusEvent) {
  const target = event.target as HTMLInputElement
  if (target && target.select) {
    setTimeout(() => {
      target.select()
    }, 10)
  }
  query.value = ''
}

// 點擊輸入框時若未全選，自動觸發全選
function handleClick(event: MouseEvent) {
  const target = event.target as HTMLInputElement
  if (target && target.select) {
    target.select()
  }
}

// 一鍵清空輸入文字，立即重新打字
function handleClearInput() {
  query.value = ''
  const el = inputRef.value?.$el || inputRef.value
  if (el) {
    el.value = ''
    el.focus()
  }
}
</script>

<template>
  <div class="relative">
    <label v-if="label" class="block text-xs text-slate-600 mb-1">
      {{ label }}
    </label>

    <Combobox
      :modelValue="selectedWaypoint"
      @update:modelValue="handleSelect"
      by="id"
      as="div"
      class="relative"
    >
      <div
        class="relative w-full cursor-default rounded-lg border border-slate-200 bg-slate-50 text-left transition-colors focus-within:border-slate-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-slate-300"
      >
        <!-- 左側圖釘圖示（絕對定位垂直置中，不破壞排版流） -->
        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
          <MapPin class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </div>

        <ComboboxInput
          ref="inputRef"
          class="w-full border-none py-2 pl-8 pr-14 text-sm leading-5 text-slate-900 bg-transparent outline-hidden truncate"
          :displayValue="(item) => formatWaypoint(item as Waypoint)"
          @input="query = ($event.target as HTMLInputElement).value"
          @focus="handleFocus"
          @click="handleClick"
          placeholder="搜尋城鎮或中文名稱..."
        />

        <!-- 右側控制區：一鍵快速清空 (X) 與下拉展開箭頭 -->
        <div class="absolute inset-y-0 right-0 flex items-center pr-1.5 gap-0.5">
          <button
            type="button"
            tabindex="-1"
            @click.stop="handleClearInput"
            class="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
            title="一鍵清空並重新輸入"
            aria-label="一鍵清空並重新輸入"
          >
            <X class="h-3.5 w-3.5" />
          </button>

          <ComboboxButton class="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
            <ChevronsUpDown class="h-4 w-4" aria-hidden="true" />
          </ComboboxButton>
        </div>
      </div>

      <!-- 下拉浮層：永遠向下展開 (top-full mt-1)、限定 max-h-64 (約 256px) 並帶有獨立捲軸 -->
      <TransitionRoot
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        @after-leave="query = ''"
      >
        <ComboboxOptions
          class="absolute left-0 top-full z-50 mt-1 max-h-64 w-full overflow-auto rounded-xl bg-white py-1.5 text-sm shadow-xl ring-1 ring-black/5 border border-slate-200 outline-hidden focus:outline-hidden"
        >
          <!-- 查無結果提示 -->
          <div
            v-if="filteredWaypoints.length === 0 && query !== ''"
            class="relative cursor-default select-none px-4 py-3 text-center text-xs text-slate-500"
          >
            查無符合「{{ query }}」的航點或城鎮
          </div>

          <!-- 航點項目列表 -->
          <ComboboxOption
            v-for="wp in filteredWaypoints"
            :key="wp.id"
            :value="wp"
            as="template"
            v-slot="{ selected, active }"
          >
            <li
              :class="[
                'relative cursor-pointer select-none py-2.5 pl-3 pr-4 transition-colors flex items-center justify-between',
                active ? 'bg-amber-50 text-amber-900' : 'text-slate-900',
                selected ? 'font-medium bg-amber-50/50' : 'font-normal',
              ]"
            >
              <div class="flex items-center gap-2 min-w-0 pr-2">
                <Check
                  v-if="selected"
                  class="h-4 w-4 shrink-0 text-amber-600"
                  aria-hidden="true"
                />
                <span v-else class="w-4 shrink-0" />

                <div class="truncate">
                  <div class="flex items-center gap-1.5 truncate">
                    <span class="font-medium text-slate-900 truncate">
                      {{ wp.id === 'SJPP' ? 'SJPP (聖讓皮耶德波爾)' : (wp.localName || wp.spanishName) }}
                    </span>
                    <span
                      v-if="wp.hasAlbergue"
                      class="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded font-normal shrink-0"
                    >
                      庇護所
                    </span>
                  </div>
                  <div class="text-xs text-slate-500 truncate">
                    {{ wp.chineseName }}
                  </div>
                </div>
              </div>

              <!-- 右側：累計里程標籤 -->
              <span
                :class="[
                  'text-xs font-mono shrink-0',
                  active ? 'text-amber-700' : 'text-slate-500',
                ]"
              >
                {{ wp.cumulativeKm }} km
              </span>
            </li>
          </ComboboxOption>
        </ComboboxOptions>
      </TransitionRoot>
    </Combobox>
  </div>
</template>
