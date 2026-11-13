<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
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
  Compass,
  MessageCircleWarning,
  Sparkles,
  ChevronDown,
} from "lucide-vue-next";
import { transportRoutes } from "@/data/transportRoutes";
import type { OriginCity, TransportType, TransportTargetRoute } from "@/types/camino";
import { useScheduleStore } from "@/stores/schedule";
import GoogleAd from "@/components/common/GoogleAd.vue";
import TipsModal from "@/components/common/TipsModal.vue";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const scheduleStore = useScheduleStore();

// 支援的三大朝聖起點路線定義 (響應式多國語系)
const targetRouteOptions = computed<{
  id: TransportTargetRoute;
  name: string;
  startTown: string;
  shortTown: string;
  flag: string;
}[]>(() => [
  {
    id: "frances",
    name: t("transport.routes.frances.name"),
    startTown: t("transport.routes.frances.startTown"),
    shortTown: t("transport.routes.frances.shortTown"),
    flag: "🇫🇷",
  },
  {
    id: "portugues",
    name: t("transport.routes.portugues.name"),
    startTown: t("transport.routes.portugues.startTown"),
    shortTown: t("transport.routes.portugues.shortTown"),
    flag: "🇵🇹",
  },
  {
    id: "norte",
    name: t("transport.routes.norte.name"),
    startTown: t("transport.routes.norte.startTown"),
    shortTown: t("transport.routes.norte.shortTown"),
    flag: "🌊",
  },
]);

// 依據 URL 參數或 store 預選對應起點
const getInitialTargetRoute = (): TransportTargetRoute => {
  const param = route.params.routeId as string;
  if (param && (param === "frances" || param === "portugues" || param === "norte")) {
    return param as TransportTargetRoute;
  }
  const current = scheduleStore.currentRouteId || "";
  if (current.startsWith("portugues")) return "portugues";
  if (current === "norte") return "norte";
  return "frances";
};

const selectedTargetRoute = ref<TransportTargetRoute>(getInitialTargetRoute());

// 監聽 URL 參數改變（支援上一頁/下一頁與外部長尾連結進入）
watch(
  () => route.params.routeId,
  (newParam) => {
    if (newParam && (newParam === "frances" || newParam === "portugues" || newParam === "norte")) {
      selectedTargetRoute.value = newParam as TransportTargetRoute;
    }
  }
);

// 處理起點路線切換（同步更新 URL 保持長尾網址獨立）
const handleSelectTargetRoute = (routeId: TransportTargetRoute) => {
  selectedTargetRoute.value = routeId;
  if (route.params.routeId !== routeId) {
    router.push(`/transport/${routeId}`);
  }
};

// 各路線專屬的出發城市定義字典 (響應式多國語系)
const routeCityMap = computed<
  Record<
    TransportTargetRoute,
    { id: OriginCity; flag: string; name: string; summary: string }[]
  >
>(() => ({
  frances: [
    {
      id: "PARIS",
      flag: "🇫🇷",
      name: t("transport.cities.frances.PARIS.name"),
      summary: t("transport.cities.frances.PARIS.summary"),
    },
    {
      id: "MADRID",
      flag: "🇪🇸",
      name: t("transport.cities.frances.MADRID.name"),
      summary: t("transport.cities.frances.MADRID.summary"),
    },
    {
      id: "BARCELONA",
      flag: "🇪🇸",
      name: t("transport.cities.frances.BARCELONA.name"),
      summary: t("transport.cities.frances.BARCELONA.summary"),
    },
  ],
  portugues: [
    {
      id: "PORTO_AIRPORT",
      flag: "🇵🇹",
      name: t("transport.cities.portugues.PORTO_AIRPORT.name"),
      summary: t("transport.cities.portugues.PORTO_AIRPORT.summary"),
    },
    {
      id: "LISBON",
      flag: "🇵🇹",
      name: t("transport.cities.portugues.LISBON.name"),
      summary: t("transport.cities.portugues.LISBON.summary"),
    },
    {
      id: "MADRID",
      flag: "🇪🇸",
      name: t("transport.cities.portugues.MADRID.name"),
      summary: t("transport.cities.portugues.MADRID.summary"),
    },
  ],
  norte: [
    {
      id: "PARIS",
      flag: "🇫🇷",
      name: t("transport.cities.norte.PARIS.name"),
      summary: t("transport.cities.norte.PARIS.summary"),
    },
    {
      id: "MADRID",
      flag: "🇪🇸",
      name: t("transport.cities.norte.MADRID.name"),
      summary: t("transport.cities.norte.MADRID.summary"),
    },
    {
      id: "SAN_SEBASTIAN_AIRPORT",
      flag: "🇪🇸",
      name: t("transport.cities.norte.SAN_SEBASTIAN_AIRPORT.name"),
      summary: t("transport.cities.norte.SAN_SEBASTIAN_AIRPORT.summary"),
    },
  ],
}));

// 當前路線可用的出發城市列表
const currentCityOptions = computed(() => {
  return routeCityMap.value[selectedTargetRoute.value] || routeCityMap.value.frances;
});

// 當前選擇的出發城市
const selectedCity = ref<OriginCity>(currentCityOptions.value[0].id);

// 當路線切換時，自動將出發城市重設為該路線的第一個推薦城市
watch(selectedTargetRoute, (newRoute) => {
  const cities = routeCityMap.value[newRoute];
  if (cities && cities.length > 0) {
    selectedCity.value = cities[0].id;
  }
});

// 各路線專屬貼心小提醒避坑攻略 (響應式多國語系)
const routeTipsMap = computed<Record<TransportTargetRoute, string[]>>(() => ({
  frances: [
    t("transport.tips.frances.0"),
    t("transport.tips.frances.1"),
    t("transport.tips.frances.2"),
    t("transport.tips.frances.3"),
  ],
  portugues: [
    t("transport.tips.portugues.0"),
    t("transport.tips.portugues.1"),
    t("transport.tips.portugues.2"),
    t("transport.tips.portugues.3"),
  ],
  norte: [
    t("transport.tips.norte.0"),
    t("transport.tips.norte.1"),
    t("transport.tips.norte.2"),
    t("transport.tips.norte.3"),
  ],
}));

const currentTravelTips = computed(() => {
  return routeTipsMap.value[selectedTargetRoute.value] || routeTipsMap.value.frances;
});

// 手機模式步驟卡片收合狀態管理
const collapsedSteps = ref<Record<number, boolean>>({});

function toggleStep(stepOrder: number) {
  collapsedSteps.value[stepOrder] = !collapsedSteps.value[stepOrder];
}

function isStepExpanded(stepOrder: number) {
  return !collapsedSteps.value[stepOrder];
}

const isAllCollapsed = computed(() => {
  return currentRoute.value.steps.every(
    (s) => collapsedSteps.value[s.stepOrder],
  );
});

function toggleAllSteps() {
  const target = !isAllCollapsed.value;
  currentRoute.value.steps.forEach((s) => {
    collapsedSteps.value[s.stepOrder] = target;
  });
}

// 手機與平板模式下的貼心小提醒 Modal 展開狀態
const isTipsModalOpen = ref(false);

// 官方購票平台快速連結設定 (響應式多國語系)
const bookingPlatforms = computed(() => [
  { name: t("transport.platforms.sncf"), url: "https://www.sncf-connect.com/" },
  { name: t("transport.platforms.renfe"), url: "https://www.renfe.com/" },
  { name: t("transport.platforms.cp"), url: "https://www.cp.pt/" },
  { name: t("transport.platforms.alsa"), url: "https://www.alsa.es/" },
  { name: t("transport.platforms.euskotren"), url: "https://www.euskotren.eus/" },
  { name: t("transport.platforms.omio"), url: "https://www.omio.com/" },
]);

// 當前選擇的交通路線資料
const currentRoute = computed(() => {
  const matched = transportRoutes.find(
    (r) =>
      r.targetRoute === selectedTargetRoute.value &&
      r.originCity === selectedCity.value,
  );
  if (matched) return matched;
  // 安全備選：該路線的第一個方案
  const fallback = transportRoutes.find(
    (r) => r.targetRoute === selectedTargetRoute.value,
  );
  return fallback || transportRoutes[0];
});

// 交通工具圖示對應
function getTransportIcon(type: TransportType) {
  switch (type) {
    case "TRAIN":
      return Train;
    case "BUS":
      return Bus;
    case "FLIGHT":
      return Plane;
    case "TAXI":
      return Car;
    case "WALK":
      return Footprints;
    default:
      return Compass;
  }
}

// 交通工具標籤對應 (多國語系)
function getTransportBadge(type: TransportType) {
  switch (type) {
    case "TRAIN":
      return { label: t("transport.badges.TRAIN"), bg: "bg-blue-50 text-blue-700 border-blue-200" };
    case "BUS":
      return {
        label: t("transport.badges.BUS"),
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "FLIGHT":
      return {
        label: t("transport.badges.FLIGHT"),
        bg: "bg-purple-50 text-purple-700 border-purple-200",
      };
    case "TAXI":
      return {
        label: t("transport.badges.TAXI"),
        bg: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "WALK":
      return {
        label: t("transport.badges.WALK"),
        bg: "bg-slate-50 text-slate-700 border-slate-200",
      };
  }
}

// 頁面滾動監聽：判斷下方卡片資料是否已滾入吸頂列下方
const isScrolled = ref(false);
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <div class="container mx-auto px-4 pt-0 pb-6 max-w-[1440px]">
    <!-- 頂部吸頂列：標題 ＋ 路線起點切換（Sticky 零位移、無底線、無陰影，滾動純毛玻璃） -->
    <div
      :class="[
        'sticky top-14 sm:top-16 z-30 -mx-4 px-4 py-2 sm:py-2.5 mb-1.5 sm:mb-3 transition-[background-color,backdrop-filter] duration-200',
        isScrolled
          ? 'bg-slate-50/75 backdrop-blur-md'
          : 'bg-transparent',
      ]"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2
          class="text-base sm:text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2 shrink-0"
        >
          {{ t('transport.title') }}
        </h2>

        <!-- 路線起點切換標籤膠囊列 -->
        <div class="flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar py-0.5">
          <div class="inline-flex rounded-xl bg-slate-100 p-1 gap-1">
            <button
              v-for="route in targetRouteOptions"
              :key="route.id"
              type="button"
              :class="[
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs sm:text-sm transition-all cursor-pointer font-medium',
                selectedTargetRoute === route.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800',
              ]"
              @click="handleSelectTargetRoute(route.id)"
            >
              <span>{{ route.name }}</span>
              <span class="text-xs opacity-75 hidden sm:inline">（{{ route.shortTown }}）</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 二欄式響應式佈局 (左:城市決策與實戰避坑 / 右:轉乘時間軸步驟) -->
    <div
      class="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-4 lg:gap-6 items-start"
    >
      <!-- 左欄：出發城市切換、方案概況、實戰避坑與廣告 (md: 5 欄, lg: 4 欄) -->
      <div class="md:col-span-5 lg:col-span-4 space-y-3 sm:space-y-4 md:sticky md:top-28">
        <!-- 城市選擇卡片群 -->
        <div
          class="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs"
        >
          <div
            class="flex items-center justify-between md:justify-start md:gap-1.5 mb-3"
          >
            <h3
              class="text-sm sm:text-sm md:font-normal text-slate-800"
            >
              {{ t('transport.selectOriginCity') }}
            </h3>

            <!-- 貼心小提醒按鈕 (僅在手機模式顯示，點擊開啟 Modal) -->
            <button
              type="button"
              @click.stop="isTipsModalOpen = true"
              class="md:hidden p-1 rounded-full text-amber-500 hover:bg-amber-50 hover:text-amber-600 transition cursor-pointer flex items-center"
              :title="t('transport.mobileTipsTitle')"
              :aria-label="t('transport.mobileTipsAria')"
            >
              <MessageCircleWarning class="w-4 h-4" />
            </button>
          </div>

          <!-- 手機模式：下拉式選單 (md:hidden) -->
          <div class="md:hidden space-y-2">
            <div class="relative">
              <select
                v-model="selectedCity"
                class="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-hidden font-medium cursor-pointer transition-all"
                :aria-label="t('transport.selectOriginCity')"
              >
                <option
                  v-for="city in currentCityOptions"
                  :key="city.id"
                  :value="city.id"
                >
                  {{ city.flag }} {{ city.name }}
                </option>
              </select>
            </div>
            <!-- 當前選擇城市之交通概況摘要微標籤 -->
            <p class="text-xs md:text-sm text-slate-500 px-1 flex items-center gap-1.5">
              {{ currentCityOptions.find((c) => c.id === selectedCity)?.summary }}
            </p>
          </div>

          <!-- 平板與桌機版：維持大卡片按鈕群 (hidden md:block) -->
          <div class="hidden md:block space-y-2">
            <button
              v-for="city in currentCityOptions"
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
                  <span class="text-slate-900 text-sm md:text-base font-medium">{{ city.name }}</span>
                </div>
                <p class="mt-0.5 text-xs md:text-sm text-slate-500">
                  {{ city.summary }}
                </p>
              </div>
              <div
                :class="
                  selectedCity === city.id
                    ? 'text-amber-500 font-bold'
                    : 'text-slate-300'
                "
              >
                ●
              </div>
            </button>
          </div>
        </div>

        <!-- 平板與桌機：雙欄緊湊卡片（hidden md:block） -->
        <div
          class="hidden md:block rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
        >
          <h3
            class="text-sm md:text-base font-medium text-slate-800 mb-2.5 flex items-center gap-1.5"
          >
            <span>{{ t('transport.bookingPlatformsTitle') }}</span>
          </h3>
          <div class="grid grid-cols-2 gap-2 text-xs md:text-sm">
            <a
              v-for="platform in bookingPlatforms"
              :key="platform.name"
              :href="platform.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-between rounded-lg border border-slate-200 p-2 font-medium text-slate-700 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-900 cursor-pointer transition-all"
            >
              <span class="truncate">{{ platform.name }}</span>
              <ExternalLink class="h-3.5 w-3.5 text-slate-400 shrink-0" />
            </a>
          </div>
        </div>

        <!-- 朝聖起點交通實戰避坑（平板與桌機雙欄展開） -->
        <div
          class="hidden md:block rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <h3 class="flex items-center gap-2 text-sm md:text-base font-medium text-slate-800">
            <Sparkles class="w-4 h-4 text-amber-500" />
            <span>{{ t('transport.tipsSectionTitle', { route: targetRouteOptions.find(r => r.id === selectedTargetRoute)?.name }) }}</span>
          </h3>
          <ul class="mt-3 space-y-2.5 text-xs md:text-sm text-slate-600 leading-relaxed">
            <li
              v-for="(tip, index) in currentTravelTips"
              :key="index"
              class="flex items-start gap-2"
            >
              <span class="text-amber-500 font-bold">•</span>
              <span>{{ tip }}</span>
            </li>
          </ul>
        </div>

        <!-- 側邊商業廣告欄位 -->
        <GoogleAd slot-id="transport-sidebar-ad" format="rectangle" />
      </div>

      <!-- 右欄：逐步轉乘時間軸步驟卡片 (md: 7 欄, lg: 8 欄) -->
      <div class="md:col-span-7 lg:col-span-8 space-y-3 sm:space-y-4">
        <!-- 當前方案指標概況卡片 (上下兩行排版) -->
        <div
          class="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2"
        >
          <!-- 第一行：路線名稱 ＋ 耗時與票價 -->
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h3 class="text-sm sm:text-base md:text-lg font-bold text-slate-900">
              {{ locale === 'en' && currentRoute.titleEn ? currentRoute.titleEn : currentRoute.title }}
            </h3>
            <div class="flex items-center gap-4 text-sm sm:text-base">
              <div class="flex items-center gap-1.5 text-slate-600">
                <Clock class="h-3.5 w-3.5 text-slate-400" />
                <span>{{ t('transport.durationLabel') }}</span>
                <span class="font-mono text-slate-900">
                  {{ t('transport.durationValue', { hours: currentRoute.totalDurationHours }) }}
                </span>
              </div>
              <div class="flex items-center gap-1.5 text-slate-600">
                <Euro class="h-3.5 w-3.5 text-slate-400" />
                <span>{{ t('transport.costLabel') }}</span>
                <span class="font-mono text-slate-900">
                  {{ t('transport.costRange', { min: currentRoute.totalCostEur.min, max: currentRoute.totalCostEur.max }) }}
                </span>
              </div>
            </div>
          </div>

          <!-- 第二行：補充資料（開行季節與營運提示） -->
          <div
            class="flex items-center gap-1.5 text-xs sm:text-sm text-slate-700 border-t border-slate-100 pt-2"
          >
            <Calendar class="h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span>{{ locale === 'en' && currentRoute.operatingMonthsEn ? currentRoute.operatingMonthsEn : currentRoute.operatingMonths }}</span>
          </div>

          <!-- 第三行：官方購票快速傳送門（僅在手機模式 md:hidden 內嵌展示） -->
          <div
            class="md:hidden flex items-center gap-2 overflow-x-auto border-t border-slate-100 pt-2.5 text-xs"
          >
            <div class="flex items-center gap-1.5">
              <a
                v-for="platform in bookingPlatforms"
                :key="platform.name"
                :href="platform.url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900 transition-all shrink-0 font-medium cursor-pointer"
              >
                <span>{{ platform.name }}</span>
                <ExternalLink class="h-3 w-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <h3 class="text-base sm:text-lg font-bold text-slate-900">
            {{ t('transport.stepsCount', { count: currentRoute.steps.length }) }}
          </h3>
          <!-- 手機模式專屬：一鍵全部收合/展開切換按鈕 -->
          <button
            type="button"
            @click="toggleAllSteps"
            class="md:hidden text-xs sm:text-sm text-slate-700 hover:text-slate-800 font-medium cursor-pointer"
          >
            {{ isAllCollapsed ? t('transport.expandAll') : t('transport.collapseAll') }}
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="step in currentRoute.steps"
            :key="step.stepOrder"
            class="relative rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-all"
          >
            <!-- 步驟標頭（手機模式支援點擊切換折疊） -->
            <div
              @click="toggleStep(step.stepOrder)"
              class="flex items-center justify-between cursor-pointer md:cursor-default select-none gap-2"
            >
              <div class="flex items-center gap-2.5 min-w-0 flex-1">
                <span
                  class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-amber-400 font-mono text-xs sm:text-sm font-bold text-slate-700 shrink-0"
                >
                  {{ step.stepOrder }}
                </span>
                <div class="flex items-center gap-2 flex-wrap min-w-0">
                  <span
                    :class="[
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs sm:text-sm border font-medium shrink-0',
                      getTransportBadge(step.type)?.bg,
                    ]"
                  >
                    <component
                      :is="getTransportIcon(step.type)"
                      class="h-3.5 w-3.5"
                    />
                    {{ getTransportBadge(step.type)?.label }}
                  </span>
                  <span class="text-xs sm:text-sm text-slate-700 truncate font-medium">
                    {{ locale === 'en' && step.carrierNameEn ? step.carrierNameEn : step.carrierName }}
                  </span>
                </div>
              </div>

              <!-- 右側折疊控制 Chevron（md:hidden） -->
              <button
                type="button"
                class="md:hidden p-1 text-slate-400 hover:text-slate-600 transition shrink-0"
                :aria-expanded="isStepExpanded(step.stepOrder)"
                :aria-label="t('transport.toggleStepAria')"
              >
                <ChevronDown
                  class="w-4 h-4 transition-transform duration-200"
                  :class="[isStepExpanded(step.stepOrder) ? 'rotate-180' : '']"
                />
              </button>
            </div>

            <!-- 步驟內容區（手機版受折疊狀態控制，桌機版 md:block 強制展開） -->
            <div
              :class="[
                'mt-3.5 space-y-3',
                isStepExpanded(step.stepOrder) ? 'block' : 'hidden md:block',
              ]"
            >
              <!-- 起訖點標示（垂直置中對齊，車站名稱採精緻小字級 text-xs sm:text-sm） -->
              <div class="space-y-2 text-sm sm:text-base">
                <div class="flex items-center gap-2">
                  <span
                    class="px-1.5 py-0.5 rounded text-xs font-normal bg-slate-100 text-slate-600 border border-slate-200 shrink-0"
                  >
                    {{ t('transport.badgeFrom') }}
                  </span>
                  <span class="font-medium text-slate-800 leading-snug flex-1">
                    {{ locale === 'en' && step.fromEn ? step.fromEn : step.from }}
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <span
                    class="px-1.5 py-0.5 rounded text-xs font-normal bg-slate-100 text-slate-600 border border-slate-200 shrink-0"
                  >
                    {{ t('transport.badgeTo') }}
                  </span>
                  <span class="font-medium text-slate-800 leading-snug flex-1">
                    {{ locale === 'en' && step.toEn ? step.toEn : step.to }}
                  </span>
                </div>
              </div>

              <!-- 步驟詳細資訊（預估車程、票價、避坑提示統一以點條列） -->
              <div class="space-y-1.5 text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-100">
                <div class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-1.5"></span>
                  <span>{{ t('transport.stepDuration', { minutes: step.durationMinutes }) }}</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-1.5"></span>
                  <span>
                    {{ t('transport.stepCost', { min: step.estimatedCostEur.min, max: step.estimatedCostEur.max }) }}
                  </span>
                </div>
                <div
                  v-if="step.warningTip"
                  class="flex items-start gap-2 leading-relaxed"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-1.5"></span>
                  <span>
                    {{ t('transport.stepWarning', { tip: locale === 'en' && step.warningTipEn ? step.warningTipEn : step.warningTip }) }}
                  </span>
                </div>
              </div>

              <!-- 官方訂票按鈕 -->
              <div v-if="step.bookingUrl" class="pt-1 flex justify-end">
                <a
                  :href="step.bookingUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs sm:text-sm font-medium hover:bg-amber-600 transition shadow-2xs cursor-pointer"
                >
                  <span>{{ t('transport.bookOfficial') }}</span>
                  <ExternalLink class="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          <!-- 葡萄牙海岸線 (Camino de la Costa) 專屬起點接駁與跨境渡輪避坑專區 -->
          <div
            v-if="selectedTargetRoute === 'portugues'"
            class="rounded-xl border border-sky-200 bg-sky-50/60 p-4 sm:p-5 shadow-xs space-y-3"
          >
            <div class="flex items-center gap-2 text-sm sm:text-base font-bold text-sky-950">
              <span class="text-base">🌊</span>
              <span>{{ t('transport.coastalTips.title') }}</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm leading-relaxed text-slate-700">
              <!-- 錦囊 1：波多出城地鐵接駁 -->
              <div class="bg-white/90 p-3.5 rounded-lg border border-sky-100 space-y-1.5">
                <div class="font-bold text-sky-900 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Train class="w-3.5 h-3.5 text-sky-600" />
                  <span>{{ t('transport.coastalTips.tip1Title') }}</span>
                </div>
                <p class="text-slate-600">
                  {{ t('transport.coastalTips.tip1Desc') }}
                </p>
              </div>

              <!-- 錦囊 2：Caminha 跨國渡輪與計程快艇 -->
              <div class="bg-white/90 p-3.5 rounded-lg border border-sky-100 space-y-1.5">
                <div class="font-bold text-sky-900 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Compass class="w-3.5 h-3.5 text-sky-600" />
                  <span>{{ t('transport.coastalTips.tip2Title') }}</span>
                </div>
                <p class="text-slate-600">
                  {{ t('transport.coastalTips.tip2Desc') }}
                </p>
                <p class="text-xs sm:text-sm text-amber-700 font-medium">
                  {{ t('transport.coastalTips.tip2TimeNotice') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 貼心小提醒對話框 (手機與平板) -->
    <TipsModal
      :is-open="isTipsModalOpen"
      :title="t('transport.tipsSectionTitle', { route: targetRouteOptions.find(r => r.id === selectedTargetRoute)?.name })"
      :tips="currentTravelTips"
      @close="isTipsModalOpen = false"
    />
  </div>
</template>
