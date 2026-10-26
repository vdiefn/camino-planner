<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
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
  ArrowRight,
  MessageCircleWarning,
  Sparkles,
  ChevronDown,
} from "lucide-vue-next";
import { transportRoutes } from "@/data/transportRoutes";
import type { OriginCity, TransportType, TransportTargetRoute } from "@/types/camino";
import { useScheduleStore } from "@/stores/schedule";
import GoogleAd from "@/components/common/GoogleAd.vue";
import TipsModal from "@/components/common/TipsModal.vue";

const scheduleStore = useScheduleStore();

// 支援的三大朝聖起點路線定義
const targetRouteOptions: {
  id: TransportTargetRoute;
  name: string;
  startTown: string;
  flag: string;
}[] = [
  { id: "frances", name: "法國之路", startTown: "SJPP (聖讓皮耶德波爾)", flag: "🇫🇷" },
  { id: "portugues", name: "葡萄牙之路", startTown: "波多 (Porto 大教堂)", flag: "🇵🇹" },
  { id: "norte", name: "北方之路", startTown: "伊倫 (Irún 邊界)", flag: "🌊" },
];

// 依據使用者在行程規劃中正在檢視的路線，自動預選對應起點
const getInitialTargetRoute = (): TransportTargetRoute => {
  const current = scheduleStore.currentRouteId || "";
  if (current.startsWith("portugues")) return "portugues";
  if (current === "norte") return "norte";
  return "frances";
};

const selectedTargetRoute = ref<TransportTargetRoute>(getInitialTargetRoute());

// 各路線專屬的出發城市定義字典
const routeCityMap: Record<
  TransportTargetRoute,
  { id: OriginCity; flag: string; name: string; summary: string }[]
> = {
  frances: [
    {
      id: "PARIS",
      flag: "🇫🇷",
      name: "巴黎 (Paris CDG / 市區)",
      summary: "TGV 高鐵 + TER 景觀區間車 (約 6.5h)",
    },
    {
      id: "MADRID",
      flag: "🇪🇸",
      name: "馬德里 (Madrid MAD)",
      summary: "國鐵至 Pamplona + 直達季節巴士 (約 6.0h)",
    },
    {
      id: "BARCELONA",
      flag: "🇪🇸",
      name: "巴塞隆納 (Barcelona BCN)",
      summary: "鐵路至 Pamplona + 巴士/共乘 (約 7.0h)",
    },
  ],
  portugues: [
    {
      id: "PORTO_AIRPORT",
      flag: "🇵🇹",
      name: "波多機場直達 (Porto OPO)",
      summary: "市區輕軌 E 線 28 分鐘直達主教座堂 (約 0.5h)",
    },
    {
      id: "LISBON",
      flag: "🇵🇹",
      name: "里斯本 (Lisboa Oriente)",
      summary: "CP 國鐵 Alfa Pendular 高鐵直達波多 (約 3.5h)",
    },
    {
      id: "MADRID",
      flag: "🇪🇸",
      name: "馬德里 (Madrid MAD)",
      summary: "跨國直飛 75 分鐘 / ALSA 長途客運 (約 2.0h~8.5h)",
    },
  ],
  norte: [
    {
      id: "PARIS",
      flag: "🇫🇷",
      name: "巴黎 (Paris Montparnasse)",
      summary: "TGV 直達邊境 Hendaye + 4分鐘輕軌 (約 5.0h)",
    },
    {
      id: "MADRID",
      flag: "🇪🇸",
      name: "馬德里 (Madrid Chamartín)",
      summary: "Renfe Alvia 特快列車 / 客運直達 Irún (約 5.5h)",
    },
    {
      id: "SAN_SEBASTIAN_AIRPORT",
      flag: "🇪🇸",
      name: "聖塞巴斯提安 / 畢爾包 (EAS/BIO)",
      summary: "機場市郊巴士 15 分鐘直達庇護所 (約 0.5h)",
    },
  ],
};

// 當前路線可用的出發城市列表
const currentCityOptions = computed(() => {
  return routeCityMap[selectedTargetRoute.value] || routeCityMap.frances;
});

// 當前選擇的出發城市
const selectedCity = ref<OriginCity>(currentCityOptions.value[0].id);

// 當路線切換時，自動將出發城市重設為該路線的第一個推薦城市
watch(selectedTargetRoute, (newRoute) => {
  const cities = routeCityMap[newRoute];
  if (cities && cities.length > 0) {
    selectedCity.value = cities[0].id;
  }
});

// 各路線專屬貼心小提醒避坑攻略
const routeTipsMap: Record<TransportTargetRoute, string[]> = {
  frances: [
    "提早搶高鐵早鳥票：巴黎至 Bayonne 的 TGV 於行前 3 個月開放預購，早鳥票常只要 €45（現場買動輒 €120+）。",
    "西班牙週日巴士減班：馬德里至 Pamplona 的客運週日班次大幅縮減，建議避開週日過境。",
    "Pamplona 共乘計程車：若搭不上下午直達巴士，在巴士總站找朝聖者共乘計程車至 SJPP（約 €90~110 / 車，4 人均分約 €25）。",
    "抵達 SJPP 第一件事：至朝聖者辦公室 (39 Rue de la Citadelle) 領取 Credencial 護照與最新庇護所開門清單。",
  ],
  portugues: [
    "波多地鐵直達起點：從 OPO 機場搭乘輕軌 E 線（Violeta）直達市中心 Trindade 站，只要約 28 分鐘（票價約 €2.15，需在黃色驗票機感應打票）。",
    "大教堂領憑證：抵達波多後前往主教座堂 (Sé do Porto)，在教堂辦公室領取 Credencial 朝聖者護照並蓋下第 1 枚官方起點章。",
    "出城避坑技巧：波多市區至郊區前段石板路硬且市郊車流多，海岸線朝聖者可搭乘地鐵至 Matosinhos 站，從大西洋濱海木棧道起步；中央線亦可搭乘地鐵避開市區外圍工商業區。",
    "時區提醒：葡萄牙採用西歐時間（UTC+0），比西班牙慢 1 個小時，跨國搭車請特別注意手錶與車票時區。",
  ],
  norte: [
    "巴黎 TGV 直通法西邊界：巴黎蒙帕納斯有直達 TGV 直抵法國邊境 Hendaye（約 4 小時 40 分鐘），出站轉乘 Euskotren 輕軌 4 分鐘即可跨國抵達 Irún。",
    "Euskotren 跨國電車（Topo）：Hendaye 與 Irún 之間的輕軌每 15~30 分鐘一班（票價約 €1.90），車程僅 4 分鐘，班次密集且免驗護照過境。",
    "Irún 庇護所開門時間：Irún 公立庇護所 (Albergue de Peregrinos) 通常於下午 16:00 開門，不接受提前預約，建議於開門前抵達排隊領號。",
    "Day 1 體力防範：北方之路第一天需翻越 Jaizkibel 山海路段或高海拔山徑，起伏較大，出發前請於 Irún 市區超市備足至少 1.5L 飲水與行動乾糧。",
  ],
};

const currentTravelTips = computed(() => {
  return routeTipsMap[selectedTargetRoute.value] || routeTipsMap.frances;
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

// 官方購票平台快速連結設定
const bookingPlatforms = [
  { name: "法鐵 SNCF", url: "https://www.sncf-connect.com/" },
  { name: "西鐵 Renfe", url: "https://www.renfe.com/" },
  { name: "葡鐵 CP", url: "https://www.cp.pt/" },
  { name: "ALSA 巴士", url: "https://www.alsa.es/" },
  { name: "Euskotren 輕軌", url: "https://www.euskotren.eus/" },
  { name: "Omio 比價", url: "https://www.omio.com/" },
];

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

// 交通工具中文標籤對應
function getTransportBadge(type: TransportType) {
  switch (type) {
    case "TRAIN":
      return { label: "鐵路", bg: "bg-blue-50 text-blue-700 border-blue-200" };
    case "BUS":
      return {
        label: "巴士",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "FLIGHT":
      return {
        label: "飛機",
        bg: "bg-purple-50 text-purple-700 border-purple-200",
      };
    case "TAXI":
      return {
        label: "計程車",
        bg: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "WALK":
      return {
        label: "步行",
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
        'sticky top-14 sm:top-16 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 py-2 sm:py-2.5 mb-1.5 sm:mb-3 transition-[background-color,backdrop-filter] duration-200',
        isScrolled
          ? 'bg-slate-50/75 backdrop-blur-md'
          : 'bg-transparent',
      ]"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2
          class="text-base sm:text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2 shrink-0"
        >
          前往朝聖起點交通指南
        </h2>

        <!-- 路線起點切換標籤膠囊列 -->
        <div class="flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar py-0.5">
          <div class="inline-flex rounded-xl bg-slate-100 p-1 gap-1">
            <button
              v-for="route in targetRouteOptions"
              :key="route.id"
              type="button"
              :class="[
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all cursor-pointer font-medium',
                selectedTargetRoute === route.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800',
              ]"
              @click="selectedTargetRoute = route.id"
            >
              <span>{{ route.name }}</span>
              <span class="text-[11px] opacity-75 hidden sm:inline">（{{ route.startTown.split(' ')[0] }}）</span>
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
              class="text-sm sm:text-md font-bold md:font-normal text-slate-900"
            >
              選擇你的歐洲抵達城市
            </h3>

            <!-- 貼心小提醒按鈕 (僅在手機模式顯示，點擊開啟 Modal) -->
            <button
              type="button"
              @click.stop="isTipsModalOpen = true"
              class="md:hidden p-1 rounded-full text-amber-500 hover:bg-amber-50 hover:text-amber-600 transition cursor-pointer flex items-center"
              title="起點交通貼心小提醒"
              aria-label="查看起點交通貼心小提醒"
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
                aria-label="選擇抵達歐洲城市"
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
            <p class="text-xs text-slate-500 px-1 flex items-center gap-1.5">
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
                  <span class="text-slate-900 text-sm">{{ city.name }}</span>
                </div>
                <p class="mt-0.5 text-xs text-slate-500">
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
            class="text-xs font-bold text-slate-900 mb-2.5 flex items-center gap-1.5"
          >
            <span>官方購票平台快速傳送門</span>
          </h3>
          <div class="grid grid-cols-2 gap-2 text-xs">
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
          <h3 class="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Sparkles class="w-4 h-4 text-amber-500" />
            <span>{{ targetRouteOptions.find(r => r.id === selectedTargetRoute)?.name }}起點避坑提醒</span>
          </h3>
          <ul class="mt-3 space-y-2.5 text-xs text-slate-600 leading-relaxed">
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
            <h3 class="text-sm font-bold text-slate-900">
              {{ currentRoute.title }}
            </h3>
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-1.5 text-slate-600">
                <Clock class="h-3.5 w-3.5 text-slate-400" />
                <span>耗時:</span>
                <span class="font-mono text-slate-900"
                  >約 {{ currentRoute.totalDurationHours }} 小時</span
                >
              </div>
              <div class="flex items-center gap-1.5 text-slate-600">
                <Euro class="h-3.5 w-3.5 text-slate-400" />
                <span>票價:</span>
                <span class="font-mono text-slate-900">
                  €{{ currentRoute.totalCostEur.min }} ~ €{{
                    currentRoute.totalCostEur.max
                  }}
                </span>
              </div>
            </div>
          </div>

          <!-- 第二行：補充資料（開行季節與營運提示） -->
          <div
            class="flex items-center gap-1.5 text-xs text-slate-700 border-t border-slate-100 pt-2"
          >
            <Calendar class="h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span>{{ currentRoute.operatingMonths }}</span>
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
          <h3 class="text-base font-bold text-slate-900">
            轉乘步驟詳情 (共 {{ currentRoute.steps.length }} 步)
          </h3>
          <!-- 手機模式專屬：一鍵全部收合/展開切換按鈕 -->
          <button
            type="button"
            @click="toggleAllSteps"
            class="md:hidden text-xs text-slate-700 hover:text-slate-800 font-medium cursor-pointer"
          >
            {{ isAllCollapsed ? "全部展開" : "全部收合" }}
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
              class="flex items-center justify-between cursor-pointer md:cursor-default select-none"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span
                  class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-amber-400 font-mono text-xs font-bold text-slate-700 shrink-0"
                >
                  {{ step.stepOrder }}
                </span>
                <div class="flex items-center gap-2 flex-wrap min-w-0">
                  <span
                    :class="[
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border font-medium shrink-0',
                      getTransportBadge(step.type)?.bg,
                    ]"
                  >
                    <component
                      :is="getTransportIcon(step.type)"
                      class="h-3.5 w-3.5"
                    />
                    {{ getTransportBadge(step.type)?.label }}
                  </span>
                  <span class="text-xs text-slate-600 truncate font-medium">
                    {{ step.carrierName }}
                  </span>
                </div>
              </div>

              <!-- 右側折疊控制 Chevron（md:hidden） -->
              <button
                type="button"
                class="md:hidden p-1 text-slate-400 hover:text-slate-600 transition shrink-0"
                :aria-expanded="isStepExpanded(step.stepOrder)"
                aria-label="切換此步驟展開收合"
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
              <!-- 起訖點標示 -->
              <div
                class="flex flex-col sm:flex-row sm:items-center gap-2 text-sm"
              >
                <div class="flex items-center gap-1.5 font-medium text-slate-900">
                  <span class="text-slate-700">起:</span>
                  <span>{{ step.from }}</span>
                </div>
                <div class="hidden sm:block text-slate-300">
                  <ArrowRight class="h-4 w-4" />
                </div>
                <div class="flex items-center gap-1.5 font-medium text-slate-900">
                  <span class="text-slate-700">迄:</span>
                  <span>{{ step.to }}</span>
                </div>
              </div>

              <!-- 步驟詳細資訊（預估車程、票價、避坑提示統一以點條列） -->
              <div class="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-1.5"></span>
                  <span>預估車程：{{ step.durationMinutes }} 分鐘</span>
                </div>
                <div class="flex items-start gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-1.5"></span>
                  <span>
                    票價：€{{ step.estimatedCostEur.min }} ~ €{{
                      step.estimatedCostEur.max
                    }}
                  </span>
                </div>
                <div
                  v-if="step.warningTip"
                  class="flex items-start gap-2 leading-relaxed"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-1.5"></span>
                  <span>
                    避坑提示：{{ step.warningTip }}
                  </span>
                </div>
              </div>

              <!-- 官方訂票按鈕 -->
              <div v-if="step.bookingUrl" class="pt-1 flex justify-end">
                <a
                  :href="step.bookingUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition shadow-2xs cursor-pointer"
                >
                  <span>前往官方預訂</span>
                  <ExternalLink class="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 貼心小提醒對話框 (手機與平板) -->
    <TipsModal
      :is-open="isTipsModalOpen"
      :title="`${targetRouteOptions.find(r => r.id === selectedTargetRoute)?.name}起點避坑提醒`"
      :tips="currentTravelTips"
      @close="isTipsModalOpen = false"
    />
  </div>
</template>
