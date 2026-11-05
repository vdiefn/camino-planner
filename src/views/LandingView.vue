<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowRight,
  Footprints,
  Backpack,
  Train,
  Coins,
  HelpCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Compass,
} from 'lucide-vue-next'
import AppFooter from '@/components/common/AppFooter.vue'
import { useScheduleStore } from '@/stores/schedule'
import type { RouteId } from '@/types/route'

const router = useRouter()
const scheduleStore = useScheduleStore()

// 依據目前 Store 中選定的路線決定「繼續規劃」的目的地
const currentRouteId = computed(() => scheduleStore.currentRouteId || 'frances')

interface FeaturedRoute {
  id: RouteId
  name: string
  spanishName: string
  startTown: string
  distanceKm: string
  recommendedDays: string
  badge: string | null
  desc: string
}

// 三大朝聖路線特點卡片（統一資料介面規格）
const featuredRoutes: FeaturedRoute[] = [
  {
    id: 'frances',
    name: '法國之路',
    spanishName: 'Camino Francés',
    startTown: 'SJPP (聖讓皮耶德波爾)',
    distanceKm: '約 779 km',
    recommendedDays: '33 - 35 天',
    badge: '經典路線',
    desc: '翻越庇里牛斯山、橫越梅塞塔麥田高原，穿越千年的黃金朝聖路線。庇護所密度最高、社交氛圍最豐富，首走朝聖者最佳首選。',
  },
  {
    id: 'portugues',
    name: '葡萄牙之路',
    spanishName: 'Camino Portugués',
    startTown: '波多 (Porto)',
    distanceKm: '約 242 - 271 km',
    recommendedDays: '11 - 14 天',
    badge: null,
    desc: '自世界遺產波多啟程，可自由選擇大西洋海景木棧道（海岸線）或古羅馬石橋森林小徑（中央線），地勢平緩舒適。',
  },
  {
    id: 'norte',
    name: '北方之路',
    spanishName: 'Camino del Norte',
    startTown: '伊倫 (Irún)',
    distanceKm: '約 820 km',
    recommendedDays: '35 - 38 天',
    badge: null,
    desc: '沿著西班牙北部比斯開灣懸崖海岸一路向西，海天一色、海鮮美食與古老渡船接駁，體能挑戰度高但風景絕美難忘。',
  },
]

// 四大核心規劃工具
const tools = [
  {
    title: '智慧動態分段排程',
    desc: '支援三大經典路線與世界盡頭延伸段，每日公里與爬升自動推算，自由調整落腳城鎮與休息日。',
    path: `/schedule/${currentRouteId.value}`,
    icon: Footprints,
    color: 'text-amber-500 bg-amber-50 border-amber-200',
  },
  {
    title: '10% 體重負重打包清單',
    desc: '嚴格守護 10% 體重負重黃金法則，內建九大分類必備裝備與避坑提示，支援 A4 紙本列印。',
    path: '/packing',
    icon: Backpack,
    color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
  },
  {
    title: '起點交通決策指南',
    desc: '收錄巴黎、馬德里、波多直達各朝聖起點的最佳大眾運輸攻略、高鐵轉乘與官方訂票連結。',
    path: `/transport/${currentRouteId.value}`,
    icon: Train,
    color: 'text-sky-500 bg-sky-50 border-sky-200',
  },
  {
    title: '全雙幣花費預算計算機',
    desc: '機票裝備、住宿飲食與緊急備用金全涵蓋，EUR / TWD 即時動態換算，輕鬆掌控朝聖預算。',
    path: '/budget',
    icon: Coins,
    color: 'text-rose-500 bg-rose-50 border-rose-200',
  },
]

function navigateToRoute(routeId: RouteId) {
  scheduleStore.switchRoute(routeId)
  router.push(`/schedule/${routeId}`)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
    <!-- 頂部獨立精簡導覽列 -->
    <header class="sticky top-0 z-40 h-14 sm:h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div class="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6">
        <!-- 品牌標誌 -->
        <router-link to="/" class="flex items-center gap-2.5 sm:gap-3 shrink-0 hover:opacity-85 transition-opacity">
          <img
            src="/favicon.svg"
            alt="Camino Plan 標誌"
            width="36"
            height="36"
            class="h-8 w-8 sm:h-9 sm:w-9 shrink-0 drop-shadow-2xs"
          />
          <div>
            <span class="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900">
              Camino Plan
            </span>
          </div>
        </router-link>

        <!-- 右側快速傳送門 -->
        <div class="flex items-center gap-1 sm:gap-2">
          <router-link
            to="/history"
            class="hidden sm:inline-flex text-xs sm:text-sm font-medium text-slate-600 hover:text-amber-600 px-2.5 py-1.5 rounded-lg transition-colors items-center gap-1"
          >
            <Sparkles class="w-4 h-4 text-amber-500" />
            <span>歷史淵源</span>
          </router-link>
          <router-link
            to="/routes"
            class="hidden sm:inline-flex text-xs sm:text-sm font-medium text-slate-600 hover:text-amber-600 px-2.5 py-1.5 rounded-lg transition-colors items-center gap-1"
          >
            <Compass class="w-4 h-4 text-amber-500" />
            <span>路線攻略</span>
          </router-link>
          <router-link
            to="/faq"
            class="text-xs sm:text-sm font-medium text-slate-600 hover:text-amber-600 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
          >
            <HelpCircle class="w-4 h-4 text-emerald-600" />
            <span>常見問題</span>
          </router-link>
          <router-link
            :to="`/schedule/${currentRouteId}`"
            class="text-xs sm:text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white px-3 sm:px-4 py-1.5 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <span>開始規劃</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>
      </div>
    </header>

    <!-- 主體內容區塊 -->
    <main class="flex-1 py-8 sm:py-16 px-4 sm:px-6">
      <div class="mx-auto max-w-5xl space-y-12 sm:space-y-16">
        <!-- 1. Hero 核心主視覺區塊 -->
        <section class="text-center space-y-5 sm:space-y-6 pt-2 sm:pt-4">
          <h1 class="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            每一步，都是屬於你的朝聖之旅
          </h1>

          <p class="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            專為華語徒步者打造的免費極簡規劃工具。涵蓋每日里程分段試算、10% 體重負重裝備清單、起點交通決策與雙幣花費預算。免登入即可離線使用與跨裝置同步。
          </p>

          <!-- 動作按鈕群（小螢幕與電腦版均維持左右並排） -->
          <div class="flex flex-row items-center justify-center gap-2 sm:gap-3.5 pt-2 max-w-lg mx-auto">
            <router-link
              :to="`/schedule/${currentRouteId}`"
              class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-base font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <span>立即開始規劃行程</span>
              <ArrowRight class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </router-link>

            <router-link
              to="/faq"
              class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-base font-semibold border border-slate-200 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
            >
              <HelpCircle class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              <span>朝聖歷史與新手攻略</span>
            </router-link>
          </div>

          <!-- 貼心特色小標籤 -->
          <div class="flex items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 pt-3 flex-wrap">
            <span class="inline-flex items-center gap-1">
              <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
              完全免費・免註冊登入
            </span>
            <span class="inline-flex items-center gap-1">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
              支援離線使用與本機隱私保護
            </span>
            <span class="inline-flex items-center gap-1">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
              跨裝置免帳號 QR Code 同步
            </span>
          </div>
        </section>

        <!-- 2. 三大熱門路線探索專區 -->
        <section class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 text-center sm:text-left">
            <div class="space-y-1">
              <h3 class="text-lg sm:text-xl font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                <span>探索熱門朝聖主路線</span>
              </h3>
              <p class="text-xs sm:text-sm text-slate-500">
                點擊任一路線，即可直接帶入專屬每日里程試算與官方建議分段
              </p>
            </div>
            <router-link
              to="/routes"
              class="text-xs font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center justify-center gap-1 transition-colors self-center sm:self-end"
            >
              <span>查看路線深度對比攻略</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </router-link>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <div
              v-for="route in featuredRoutes"
              :key="route.id"
              @click="navigateToRoute(route.id)"
              class="group relative rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-slate-300 hover:bg-slate-50/40 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div class="space-y-3">
                <div class="flex items-center justify-between min-h-[24px]">
                  <span
                    v-if="route.badge"
                    class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200"
                  >
                    {{ route.badge }}
                  </span>
                  <div v-else class="h-0" />
                  <span class="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock class="w-3.5 h-3.5" />
                    {{ route.recommendedDays }}
                  </span>
                </div>

                <div>
                  <h4 class="text-base sm:text-lg font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                    {{ route.name }}
                  </h4>
                  <div class="text-xs text-slate-400 font-mono mt-0.5">
                    {{ route.spanishName }}
                  </div>
                </div>

                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {{ route.desc }}
                </p>
              </div>

              <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
                <span class="text-slate-600 font-mono">{{ route.distanceKm }}</span>
                <span class="inline-flex items-center gap-1 text-slate-500 group-hover:text-slate-800 transition-colors">
                  踏出第一步 <ArrowRight class="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. 四大核心規劃工具矩陣 -->
        <section class="space-y-6">
          <div class="text-center sm:text-left space-y-1">
            <h3 class="text-lg sm:text-xl font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
              <span>全方位的徒步規劃工具箱</span>
            </h3>
            <p class="text-xs sm:text-sm text-slate-500">
              整合行程、裝備、交通與預算，消除行前的所有未知焦慮
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <router-link
              v-for="tool in tools"
              :key="tool.title"
              :to="tool.path"
              class="group rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex items-start gap-4 cursor-pointer"
            >
              <div class="p-3 rounded-xl border shrink-0" :class="tool.color">
                <component :is="tool.icon" class="w-6 h-6" />
              </div>
              <div class="space-y-1">
                <div class="text-base font-bold text-slate-900 transition-colors flex items-center gap-1">
                  <span>{{ tool.title }}</span>
                </div>
                <p class="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {{ tool.desc }}
                </p>
              </div>
            </router-link>
          </div>
        </section>

        <!-- 4. 底部知識庫導航橫幅 -->
        <section class="rounded-2xl border border-slate-200 bg-linear-to-r from-amber-50/70 via-white to-emerald-50/60 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div class="space-y-1 text-center sm:text-left">
            <h3 class="text-base sm:text-lg font-bold text-slate-900">
              第一次走朝聖之路？先看看行前避坑指南
            </h3>
            <p class="text-xs sm:text-sm text-slate-600">
              收錄西元 9 世紀朝聖起源歷史、官方證書申請規則、公私立庇護所入住技巧與背包減重法則。
            </p>
          </div>
          <router-link
            to="/faq"
            class="shrink-0 px-5 py-2.5 rounded-xl bg-white text-slate-800 border border-slate-200 hover:border-slate-300 text-xs sm:text-sm font-bold shadow-2xs hover:bg-slate-50 transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>閱讀常見問題 FAQ</span>
            <ArrowRight class="w-3.5 h-3.5 text-amber-500" />
          </router-link>
        </section>
      </div>
    </main>

    <!-- 全域頁尾 -->
    <AppFooter />
  </div>
</template>
