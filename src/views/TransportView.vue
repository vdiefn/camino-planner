<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Train,
  Bus,
  Plane,
  Car,
  Footprints,
  ExternalLink,
  Clock,
  Euro,
  Calendar,
  AlertTriangle,
  Compass,
  ArrowRight,
} from 'lucide-vue-next'
import { transportRoutes } from '@/data/transportRoutes'
import type { OriginCity, TransportType } from '@/types/camino'
import GoogleAd from '@/components/common/GoogleAd.vue'

// 抵達城市選單選項設定
const cityOptions: { id: OriginCity; flag: string; name: string; summary: string }[] = [
  {
    id: 'PARIS',
    flag: '🇫🇷',
    name: '巴黎 (Paris CDG / 市區)',
    summary: 'TGV 高鐵 + TER 區間車 (約 6.5h)',
  },
  {
    id: 'MADRID',
    flag: '🇪🇸',
    name: '馬德里 (Madrid MAD)',
    summary: '國鐵至 Pamplona + 直達巴士 (約 6.0h)',
  },
  {
    id: 'BARCELONA',
    flag: '🇪🇸',
    name: '巴塞隆納 (Barcelona BCN)',
    summary: '鐵路至 Pamplona + 巴士/共乘 (約 7.0h)',
  },
]

// 官方購票平台快速連結設定
const bookingPlatforms = [
  { name: '法國國鐵 SNCF', url: 'https://www.sncf-connect.com/' },
  { name: '西班牙國鐵 Renfe', url: 'https://www.renfe.com/' },
  { name: 'ALSA 長途巴士', url: 'https://www.alsa.es/' },
  { name: 'Omio 跨國比價', url: 'https://www.omio.com/' },
]

// 當前選擇的出發城市
const selectedCity = ref<OriginCity>('PARIS')

// 當前選擇的交通路線資料
const currentRoute = computed(() => {
  return transportRoutes.find((r) => r.originCity === selectedCity.value) || transportRoutes[0]
})

// 交通工具圖示對應
function getTransportIcon(type: TransportType) {
  switch (type) {
    case 'TRAIN':
      return Train
    case 'BUS':
      return Bus
    case 'FLIGHT':
      return Plane
    case 'TAXI':
      return Car
    case 'WALK':
      return Footprints
    default:
      return Compass
  }
}

// 交通工具中文標籤對應
function getTransportBadge(type: TransportType) {
  switch (type) {
    case 'TRAIN':
      return { label: '鐵路', bg: 'bg-blue-50 text-blue-700 border-blue-200' }
    case 'BUS':
      return { label: '巴士', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    case 'FLIGHT':
      return { label: '飛機', bg: 'bg-purple-50 text-purple-700 border-purple-200' }
    case 'TAXI':
      return { label: '計程車', bg: 'bg-amber-50 text-amber-700 border-amber-200' }
    case 'WALK':
      return { label: '步行', bg: 'bg-slate-50 text-slate-700 border-slate-200' }
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-6 max-w-7xl mt-2">
    <!-- 頂部標題區 -->
    <div class="mb-4 sm:mb-6">
      <h2 class="text-base sm:text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
        前往朝聖起點交通指南
      </h2>
    </div>

    <!-- 二欄式響應式佈局 (左:城市決策與實戰避坑 / 右:轉乘時間軸步驟) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- 左欄：出發城市切換、方案概況、實戰避坑與廣告 (lg: 4 欄) -->
      <div class="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
        <!-- 城市選擇卡片群 -->
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 class="text-md text-slate-900">
            選擇你的歐洲抵達城市
          </h3>
          <div class="mt-3 space-y-2">
            <button
              v-for="city in cityOptions"
              :key="city.id"
              type="button"
              :class="[
                'w-full flex items-center justify-between rounded-xl border p-3.5 text-left transition-all cursor-pointer',
                selectedCity === city.id
                  ? 'border-amber-300 bg-amber-50/70 shadow-xs ring-1 ring-amber-300'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
              ]"
              @click="selectedCity = city.id"
            >
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-base">{{ city.flag }}</span>
                  <span class="text-slate-900 text-sm">{{ city.name }}</span>
                </div>
                <p class="mt-0.5 text-xs text-slate-500">
                  {{ city.summary }}
                </p>
              </div>
              <div :class="selectedCity === city.id ? 'text-amber-500 font-bold' : 'text-slate-300'">
                ●
              </div>
            </button>
          </div>
          </div>

        <!-- 官方購票平台快速連結 -->
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 class="text-sm font-bold text-slate-900">
            官方購票平台快速傳送門
          </h3>
          <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
            <a
              v-for="platform in bookingPlatforms"
              :key="platform.name"
              :href="platform.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 font-medium text-slate-700 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-900 cursor-pointer"
            >
              <span>{{ platform.name }}</span>
              <ExternalLink class="h-3.5 w-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        <!-- 朝聖起點交通實戰避坑 -->
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 class="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span>💡</span>
            <span>貼心小提醒</span>
          </h3>
          <ul class="mt-3 space-y-2.5 text-xs text-slate-600 leading-relaxed">
            <li class="flex items-start gap-2">
              <span class="text-amber-500 font-bold">•</span>
              <span>提早搶高鐵早鳥票：巴黎至 Bayonne 的 TGV 於行前 3 個月開放預購，早鳥票常只要 €45（現場買動輒 €120+）。</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-amber-500 font-bold">•</span>
              <span>西班牙週日巴士減班：馬德里至 Pamplona 的客運週日班次大幅縮減，建議避開週日過境。</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-amber-500 font-bold">•</span>
              <span>Pamplona 共乘計程車：若搭不上下午直達巴士，在巴士總站找朝聖者共乘計程車至 SJPP（約 €90~110 / 車，4 人均分約 €25）。</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-amber-500 font-bold">•</span>
              <span>抵達 SJPP 第一件事: (39 Rue de la Citadelle) 領取 Credencial 護照與最新庇護所開門清單。</span>
            </li>
          </ul>
        </div>

        <!-- 側邊商業廣告欄位 -->
        <GoogleAd slot-id="transport-sidebar-ad" format="rectangle" />
      </div>

      <!-- 右欄：逐步轉乘時間軸步驟卡片 (lg: 8 欄) -->
      <div class="lg:col-span-8 space-y-4">
        <!-- 當前方案指標概況卡片 (上下兩行排版) -->
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <!-- 第一行：路線名稱 ＋ 耗時與票價 -->
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h3 class="text-sm text-slate-900">
              {{ currentRoute.title }}
            </h3>
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-1.5 text-slate-600">
                <Clock class="h-3.5 w-3.5 text-slate-400" />
                <span>耗時:</span>
                <span class="font-mono text-slate-900">約 {{ currentRoute.totalDurationHours }} 小時</span>
              </div>
              <div class="flex items-center gap-1.5 text-slate-600">
                <Euro class="h-3.5 w-3.5 text-slate-400" />
                <span>票價:</span>
                <span class="font-mono text-slate-900">
                  €{{ currentRoute.totalCostEur.min }} ~ €{{ currentRoute.totalCostEur.max }}
                </span>
              </div>
            </div>
          </div>

          <!-- 第二行：補充資料（開行季節與營運提示） -->
          <div class="flex items-center gap-1.5 text-xs text-slate-700 border-t border-slate-100 pt-2">
            <Calendar class="h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span>{{ currentRoute.operatingMonths }}</span>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <h3 class="text-base text-slate-900">
            轉乘步驟詳情 (共 {{ currentRoute.steps.length }} 步)
          </h3>
        </div>

        <div class="space-y-4">
          <div
            v-for="step in currentRoute.steps"
            :key="step.stepOrder"
            class="relative rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all"
          >
            <!-- 步驟標頭 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-amber-400 font-mono text-xs font-bold text-slate-700">
                  {{ step.stepOrder }}
                </span>
                <span :class="['inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium', getTransportBadge(step.type).bg]">
                  <component :is="getTransportIcon(step.type)" class="h-3.5 w-3.5" />
                  <span>{{ getTransportBadge(step.type).label }}</span>
                </span>
              </div>
              <span v-if="step.carrierName" class="text-xs font-normal text-slate-600">
                {{ step.carrierName }}
              </span>
            </div>

            <!-- 起訖路段 -->
            <div class="mt-4 flex items-center gap-3">
              <div class="flex-1">
                <div class="text-[11px] font-normal text-slate-500 uppercase">出發站點</div>
                <div class="mt-0.5 text-sm font-medium text-slate-900">{{ step.from }}</div>
              </div>
              <ArrowRight class="h-4 w-4 shrink-0 text-slate-400" />
              <div class="flex-1">
                <div class="text-[11px] font-normal text-slate-500 uppercase">抵達站點</div>
                <div class="mt-0.5 text-sm font-medium text-slate-900">{{ step.to }}</div>
              </div>
            </div>

            <!-- 耗時、票價與購票操作整合列 -->
            <div class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-sm">
              <div class="flex items-center gap-4 text-slate-600">
                <div class="flex items-center gap-1">
                  <Clock class="h-3.5 w-3.5 text-slate-400" />
                  <span>預估耗時: </span>
                  <span class="font-mono text-slate-900">{{ step.durationMinutes }} 分鐘</span>
                </div>
                <div class="flex items-center gap-1">
                  <Euro class="h-3.5 w-3.5 text-slate-400" />
                  <span>預估票價: </span>
                  <span class="font-mono text-slate-900">
                    €{{ step.estimatedCostEur.min }} ~ €{{ step.estimatedCostEur.max }}
                  </span>
                </div>
              </div>

              <!-- 輕巧購票連結，不再使用滿版大框 -->
              <a
                v-if="step.bookingUrl"
                :href="step.bookingUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
              >
                <span>前往購票 / 查班次</span>
                <ExternalLink class="h-3 w-3" />
              </a>
            </div>

            <!-- 換乘防呆提醒：自然無框文字備註 -->
            <p v-if="step.warningTip" class="mt-2.5 flex items-start gap-1.5 text-xs text-slate-500 leading-relaxed">
              <AlertTriangle class="h-3.5 w-3.5 shrink-0 text-amber-500 mt-0.5" />
              <span>{{ step.warningTip }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
