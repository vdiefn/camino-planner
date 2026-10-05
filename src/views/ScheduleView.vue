<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useScheduleStore } from "@/stores/schedule";
import StageCard from "@/components/schedule/StageCard.vue";
import ChangeWaypointModal from "@/components/schedule/ChangeWaypointModal.vue";
import AlbergueModal from "@/components/schedule/AlbergueModal.vue";
import TipsModal from "@/components/common/TipsModal.vue";
import GoogleAd from "@/components/common/GoogleAd.vue";
import type { UserStage } from "@/types/camino";
import type { RouteId, FinisterreOption } from "@/types/route";
import { calculateRouteDistance } from "@/utils/scheduleCalculator";
import { finisterreOptionLabels } from "@/data/routes/finisterre";
import {
  AlertTriangle,
  Plus,
  Minus,
  RotateCcw,
  MessageCircleWarning,
  CheckCircle2,
  ChevronDown,
} from "lucide-vue-next";

const scheduleStore = useScheduleStore();

// 手機版折疊狀態（預設收合以釋放手機垂直空間）
const isMobileSettingsOpen = ref(false);
// 彈性排程小提醒 Modal 狀態（手機與平板點擊開啟）
const isScheduleTipsModalOpen = ref(false);

// 計算兩航點間的總距離（依據當前路線航點列表）
const calculateSelectedDistance = (startId: string, endId: string) => {
  return calculateRouteDistance(startId, endId, scheduleStore.currentMainWaypoints);
};

// 本地暫存設定，避免每次調整立即覆蓋現有行程
const draftConfig = ref({
  startWaypointId: scheduleStore.config.startWaypointId,
  endWaypointId: scheduleStore.config.endWaypointId,
  startDate: scheduleStore.config.startDate,
  targetDays: scheduleStore.config.targetDays,
  finisterreOption: scheduleStore.currentDraft.finisterreOption || "NONE",
  finisterreDays: scheduleStore.currentDraft.finisterreDays || 3,
  santiagoLayoverDays: scheduleStore.currentDraft.santiagoLayoverDays || 0,
});

// 航點選單文字格式化（起點明確標示 SJPP、終點英文標示 Santiago de Compostela）
const formatWaypointOption = (wp: any) => {
  if (wp.id === "SJPP") {
    return "SJPP - Saint-Jean-Pied-de-Port（聖讓皮耶德波爾）";
  }
  return `${wp.localName || wp.spanishName}（${wp.chineseName}）`;
};

// 當 store 外部或切換路線有更新時，同步回 draftConfig
watch(
  () => [
    scheduleStore.currentRouteId,
    scheduleStore.config.startWaypointId,
    scheduleStore.config.endWaypointId,
    scheduleStore.config.startDate,
    scheduleStore.config.targetDays,
    scheduleStore.currentDraft.finisterreOption,
    scheduleStore.currentDraft.finisterreDays,
    scheduleStore.currentDraft.santiagoLayoverDays,
  ],
  () => {
    draftConfig.value.startWaypointId = scheduleStore.config.startWaypointId;
    draftConfig.value.endWaypointId = scheduleStore.config.endWaypointId;
    draftConfig.value.startDate = scheduleStore.config.startDate;
    draftConfig.value.targetDays = scheduleStore.config.targetDays;
    draftConfig.value.finisterreOption =
      scheduleStore.currentDraft.finisterreOption || "NONE";
    draftConfig.value.finisterreDays =
      scheduleStore.currentDraft.finisterreDays || 3;
    draftConfig.value.santiagoLayoverDays =
      scheduleStore.currentDraft.santiagoLayoverDays || 0;
  },
  { immediate: true },
);

// 依據目前暫存起訖點、天數與目前休息天數，動態計算參考日均公里數
const draftDailyAvgKm = computed(() => {
  const dist = calculateSelectedDistance(
    draftConfig.value.startWaypointId,
    draftConfig.value.endWaypointId,
  );
  const walkingDays = Math.max(
    1,
    draftConfig.value.targetDays - scheduleStore.totalRestDays,
  );
  if (dist > 0 && walkingDays > 0) {
    return (dist / walkingDays).toFixed(1);
  }
  return "0.0";
});

// 目前選擇的起訖點名稱（向 Store 集中查找地名）
const currentStartName = computed(() => {
  const wp = scheduleStore.getWaypoint(draftConfig.value.startWaypointId);
  return wp ? wp.localName || wp.spanishName : "";
});

const currentEndName = computed(() => {
  const wp = scheduleStore.getWaypoint(draftConfig.value.endWaypointId);
  return wp ? wp.localName || wp.spanishName : "";
});

// 判斷是否有未套用的變更
const isDirty = computed(() => {
  return (
    draftConfig.value.startWaypointId !==
      scheduleStore.config.startWaypointId ||
    draftConfig.value.endWaypointId !== scheduleStore.config.endWaypointId ||
    draftConfig.value.startDate !== scheduleStore.config.startDate ||
    draftConfig.value.targetDays !== scheduleStore.config.targetDays ||
    draftConfig.value.finisterreOption !==
      (scheduleStore.currentDraft.finisterreOption || "NONE") ||
    draftConfig.value.finisterreDays !==
      (scheduleStore.currentDraft.finisterreDays || 3) ||
    draftConfig.value.santiagoLayoverDays !==
      (scheduleStore.currentDraft.santiagoLayoverDays || 0)
  );
});

// 世界盡頭延伸段相關計算屬性（依據 draftConfig 計算）
const currentFinisterreInfo = computed(() => {
  const opt = draftConfig.value.finisterreOption;
  return finisterreOptionLabels[opt] || { totalKm: 0, days: 0 };
});

const isFinisterreBoth = computed(() => {
  const opt = draftConfig.value.finisterreOption;
  return opt === "BOTH_FINISTERRE_FIRST" || opt === "BOTH_MUXIA_FIRST";
});

const minFinisterreDays = computed(() => (isFinisterreBoth.value ? 3 : 2));
const maxFinisterreDays = computed(() => (isFinisterreBoth.value ? 8 : 6));

const finisterreDailyAvgKm = computed(() => {
  const km = currentFinisterreInfo.value.totalKm;
  const days = draftConfig.value.finisterreDays;
  if (days > 0 && km > 0) {
    return (km / days).toFixed(1);
  }
  return "0.0";
});

// 處理路線切換
const handleSwitchRoute = (routeId: RouteId) => {
  scheduleStore.switchRoute(routeId);
};

// 處理起訖點變更時，若天數超出合理範圍進行保護
const handleWaypointChange = () => {
  const dist = calculateSelectedDistance(
    draftConfig.value.startWaypointId,
    draftConfig.value.endWaypointId,
  );
  if (dist > 0) {
    // 預設建議天數以約 23.5km 為基準
    draftConfig.value.targetDays = Math.max(1, Math.round(dist / 23.5));
  }
};

// 調整主線天數
const handleIncreaseDays = () => {
  if (draftConfig.value.targetDays < 60) {
    draftConfig.value.targetDays += 1;
  }
};

const handleDecreaseDays = () => {
  if (draftConfig.value.targetDays > 3) {
    draftConfig.value.targetDays -= 1;
  }
};

// 世界盡頭選項切換
const handleFinisterreOptionChange = (option: FinisterreOption) => {
  draftConfig.value.finisterreOption = option;
  if (option !== "NONE") {
    draftConfig.value.finisterreDays = finisterreOptionLabels[option]?.days || 3;
  }
};

// 調整延伸線徒步天數
const handleIncreaseFinisterreDays = () => {
  if (draftConfig.value.finisterreDays < maxFinisterreDays.value) {
    draftConfig.value.finisterreDays += 1;
  }
};

const handleDecreaseFinisterreDays = () => {
  if (draftConfig.value.finisterreDays > minFinisterreDays.value) {
    draftConfig.value.finisterreDays -= 1;
  }
};

// 調整聖地牙哥停留休整天數
const handleIncreaseLayoverDays = () => {
  if (draftConfig.value.santiagoLayoverDays < 3) {
    draftConfig.value.santiagoLayoverDays += 1;
  }
};

const handleDecreaseLayoverDays = () => {
  if (draftConfig.value.santiagoLayoverDays > 0) {
    draftConfig.value.santiagoLayoverDays -= 1;
  }
};

// 套用變更並重新計算（依照使用者調整的日期、主線與延伸段全體設定）
const handleApplyChanges = () => {
  scheduleStore.updateDraftConfig({
    startWaypointId: draftConfig.value.startWaypointId,
    endWaypointId: draftConfig.value.endWaypointId,
    startDate: draftConfig.value.startDate,
    targetDays: draftConfig.value.targetDays,
    finisterreOption: draftConfig.value.finisterreOption,
    finisterreDays: draftConfig.value.finisterreDays,
    santiagoLayoverDays: draftConfig.value.santiagoLayoverDays,
  });
};

// 點擊重設按鈕：還原回當前路線之官方預設設定
const handleResetToOfficial = () => {
  scheduleStore.resetToDefaults();
};

// 放棄變更，還原為當前排程設定
const handleDiscardDraft = () => {
  draftConfig.value.startWaypointId = scheduleStore.config.startWaypointId;
  draftConfig.value.endWaypointId = scheduleStore.config.endWaypointId;
  draftConfig.value.startDate = scheduleStore.config.startDate;
  draftConfig.value.targetDays = scheduleStore.config.targetDays;
  draftConfig.value.finisterreOption =
    scheduleStore.currentDraft.finisterreOption || "NONE";
  draftConfig.value.finisterreDays =
    scheduleStore.currentDraft.finisterreDays || 3;
  draftConfig.value.santiagoLayoverDays =
    scheduleStore.currentDraft.santiagoLayoverDays || 0;
};

// 彈窗狀態
const isChangeModalOpen = ref(false);
const isAlbergueModalOpen = ref(false);
const activeStage = ref<UserStage | null>(null);

// 處理開啟庇護所彈窗
const handleOpenAlbergue = (stage: UserStage) => {
  activeStage.value = stage;
  isAlbergueModalOpen.value = true;
};

// 處理開啟更換結束點彈窗
const handleChangeWaypoint = (stage: UserStage) => {
  activeStage.value = stage;
  isChangeModalOpen.value = true;
};

// 確認更換結束城鎮
const handleConfirmChange = (dayIndex: number, newWaypointId: string) => {
  scheduleStore.updateEndWaypoint(dayIndex, newWaypointId);
};

// 切換休息日（若當天為休息日則移除，反之則在該日之後插入）
const handleToggleRest = (dayIndex: number) => {
  const targetStage = scheduleStore.stages.find((s) => s.dayIndex === dayIndex);
  if (targetStage?.isRestDay) {
    scheduleStore.removeRestDay(dayIndex);
  } else {
    scheduleStore.insertRestDay(dayIndex);
  }
};

// 計算日均公里
const dailyAverageKm = computed(() => {
  const walkingDays = scheduleStore.totalWalkingDays;
  if (walkingDays === 0) return 0;
  return Number((scheduleStore.totalDistanceKm / walkingDays).toFixed(1));
});
</script>

<template>
  <div class="container mx-auto px-4 py-6 max-w-7xl mt-2">
    <!-- 頂部標題區 -->
    <div class="mb-4 sm:mb-6">
      <h2
        class="text-base sm:text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2"
      >
        徒步行程規劃
      </h2>
    </div>

    <!-- 三欄響應式佈局 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- 左欄：Sticky 排程設定控制台 (lg: 4 欄) -->
      <div class="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
        <!-- 控制台卡片 -->
        <div
          class="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs"
        >
          <!-- 標題列：手機版支援點擊整列切換折疊 -->
          <div
            @click="isMobileSettingsOpen = !isMobileSettingsOpen"
            class="flex items-center justify-between cursor-pointer lg:cursor-default select-none"
          >
            <div class="flex items-center gap-1.5">
              <h2 class="text-base font-bold text-slate-900">行程規劃設定</h2>
              <div class="relative group inline-flex items-center" @click.stop>
                <button
                  type="button"
                  @click.stop="isScheduleTipsModalOpen = true"
                  class="text-amber-500 hover:text-amber-600 p-1 rounded-lg hover:bg-amber-50 transition cursor-pointer flex items-center"
                  title="彈性排程小提醒"
                  aria-label="查看彈性排程小提醒"
                >
                  <MessageCircleWarning class="w-4 h-4" />
                </button>

                <!-- 滑鼠懸停即時浮現氣泡（僅在 lg 以上桌機 hover 時渲染，手機與平板點擊開啟 Modal） -->
                <div
                  class="hidden lg:group-hover:block pointer-events-none lg:group-hover:pointer-events-auto transition-all duration-200 absolute left-0 top-full z-30 mt-1.5 w-72 rounded-xl bg-white p-3.5 shadow-lg border border-slate-200 text-xs text-slate-700"
                >
                  <div
                    class="flex items-center gap-1.5 font-medium text-slate-900 mb-1.5"
                  >
                    <span>彈性排程小提醒</span>
                  </div>
                  <p class="leading-relaxed">
                    朝聖之路不需要完全照表操課。路上若遇體力不支或愛上某座小鎮，隨時點擊卡片上的「更換結束點」或「設為休息日」，系統會為您自動重新計算後續天數！
                  </p>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click.stop="handleResetToOfficial"
                class="text-xs text-slate-400 hover:text-rose-500 items-center gap-1 transition cursor-pointer"
                :class="isMobileSettingsOpen ? 'flex' : 'hidden lg:flex'"
              >
                <RotateCcw class="w-3.5 h-3.5" /> 重設
              </button>

              <!-- 手機版折疊按鈕 -->
              <button
                type="button"
                class="lg:hidden p-1 text-slate-500 hover:text-slate-700 transition"
                :aria-expanded="isMobileSettingsOpen"
                aria-label="切換行程設定展開收合"
              >
                <ChevronDown
                  class="w-4 h-4 transition-transform duration-200"
                  :class="{ 'rotate-180': isMobileSettingsOpen }"
                />
              </button>
            </div>
          </div>

          <!-- 手機版收合時呈現的精簡摘要列（桌機版隱藏） -->
          <div
            v-if="!isMobileSettingsOpen"
            @click="isMobileSettingsOpen = true"
            class="lg:hidden mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 cursor-pointer gap-2"
          >
            <div class="flex items-center gap-1.5 min-w-0 truncate">
              <span class="font-medium text-slate-800 truncate">{{
                currentStartName
              }}</span>
              <span class="text-slate-400 shrink-0">→</span>
              <span class="font-medium text-slate-800 truncate">{{
                currentEndName
              }}</span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="font-medium text-slate-700"
                >{{ draftConfig.targetDays }} 天</span
              >
              <span
                v-if="isDirty"
                class="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span
                >待套用
              </span>
            </div>
          </div>

          <!-- 可折疊內容區塊：手機版依 isMobileSettingsOpen 顯示/隱藏，桌機版永遠顯示（lg:block） -->
          <div
            class="space-y-4 mt-4"
            :class="isMobileSettingsOpen ? 'block' : 'hidden lg:block'"
          >
            <!-- 主路線切換標籤頁 (法國之路 / 葡萄牙之路 / 北方之路) -->
            <div>
              <label class="text-xs text-slate-700 mb-1.5 flex items-center gap-1.5">
                <span>選擇朝聖主路線</span>
              </label>
              <div class="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  v-for="route in scheduleStore.availableRoutes"
                  :key="route.id"
                  type="button"
                  @click="handleSwitchRoute(route.id)"
                  class="py-2 px-1 text-center rounded-lg text-xs transition cursor-pointer"
                  :class="[
                    scheduleStore.currentRouteId === route.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  ]"
                >
                  <div class="truncate text-slate-900 font-semibold">{{ route.chineseName }}</div>
                  <div class="text-xs text-slate-400 mt-0.5 truncate">
                    {{ scheduleStore.getRouteDisplayDistance(route.id) }}km
                  </div>
                </button>
              </div>
            </div>

            <!-- 路線專屬：分支切換（資料驅動，統一配色下拉選單） -->
            <div v-if="scheduleStore.currentRouteMetadata?.branches?.length">
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs text-slate-600">
                  {{ scheduleStore.currentRouteMetadata.chineseName }}走法／分支
                </label>
                <span class="text-[10px] text-slate-400">
                  {{ scheduleStore.currentRouteId === 'frances' ? '於 Roncesvalles 匯合' : '於 Redondela 匯合' }}
                </span>
              </div>
              <select
                :value="scheduleStore.currentDraft.branchId"
                @change="scheduleStore.switchBranch(($event.target as HTMLSelectElement).value)"
                class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-slate-300 outline-hidden"
              >
                <option
                  v-for="branch in scheduleStore.currentRouteMetadata.branches"
                  :key="branch.id"
                  :value="branch.id"
                  :disabled="scheduleStore.isWinterLocked && branch.id === 'napoleon'"
                >
                  {{ branch.chineseName }}
                  <template v-if="scheduleStore.isWinterLocked && branch.id === 'napoleon'">
                    （❄️ 11/1~3/31 封山禁行）
                  </template>
                  <template v-else-if="scheduleStore.isWinterLocked && branch.id === 'valcarlos'">
                    （冬季官方建議通行）
                  </template>
                  <template>
                    （約{{ Math.round(branch.totalDistanceKm || 0) }}km • {{ branch.recommendedDays }} 天）
                  </template>
                </option>
              </select>
            </div>

            <!-- 起點（獨立佔一行） -->
            <div>
              <label class="block text-xs text-slate-600 mb-1"> 起點 </label>
              <select
                v-model="draftConfig.startWaypointId"
                @change="handleWaypointChange"
                class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-slate-300 outline-hidden"
              >
                <option v-for="wp in scheduleStore.currentMainWaypoints" :key="wp.id" :value="wp.id">
                  {{ formatWaypointOption(wp) }}
                </option>
              </select>
            </div>

            <!-- 終點（獨立佔一行） -->
            <div>
              <label class="block text-xs text-slate-600 mb-1"> 終點 </label>
              <select
                v-model="draftConfig.endWaypointId"
                @change="handleWaypointChange"
                class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-slate-300 outline-hidden"
              >
                <option v-for="wp in scheduleStore.currentMainWaypoints" :key="wp.id" :value="wp.id">
                  {{ formatWaypointOption(wp) }}
                </option>
              </select>
            </div>

            <!-- 出發日期與預計總天數（各佔一半） -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-slate-600 mb-1">
                  出發日期
                </label>
                <input
                  type="date"
                  v-model="draftConfig.startDate"
                  class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-slate-300 outline-hidden"
                />
              </div>

              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs text-slate-600">
                    {{
                      draftConfig.finisterreOption !== 'NONE'
                        ? '主線天數'
                        : '預計天數'
                    }}
                  </label>
                  <span class="text-[11px] text-slate-500 font-mono">
                    約 {{ draftDailyAvgKm }} km/日
                  </span>
                </div>
                <div
                  class="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden h-9.5"
                >
                  <button
                    type="button"
                    @click="handleDecreaseDays"
                    class="px-2.5 h-full text-slate-600 hover:bg-slate-200 transition cursor-pointer flex items-center justify-center"
                  >
                    <Minus class="w-3.5 h-3.5" />
                  </button>
                  <span
                    class="flex-1 text-center text-xs font-bold text-slate-900 font-mono"
                  >
                    {{ draftConfig.targetDays }} 天
                  </span>
                  <button
                    type="button"
                    @click="handleIncreaseDays"
                    class="px-2.5 h-full text-slate-600 hover:bg-slate-200 transition cursor-pointer flex items-center justify-center"
                  >
                    <Plus class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- 世界盡頭全域延伸段 (Finisterre & Muxía Extension) -->
            <div class="pt-2 border-t border-slate-100 space-y-2.5">
              <div class="flex items-center justify-between">
                <label class="text-xs text-slate-800 flex items-center gap-1.5">
                  <span>世界盡頭延伸旅程</span>
                </label>
              </div>

              <select
                :value="draftConfig.finisterreOption"
                @change="handleFinisterreOptionChange(($event.target as HTMLSelectElement).value as FinisterreOption)"
                class="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-slate-300 outline-hidden"
              >
                <option
                  v-for="(info, key) in finisterreOptionLabels"
                  :key="key"
                  :value="key"
                >
                  {{ info.title }}
                </option>
              </select>

              <!-- 延伸段設定（兩欄極簡灰階風格，統一視覺階層） -->
              <div
                v-if="draftConfig.finisterreOption !== 'NONE'"
                class="grid grid-cols-2 gap-3 pt-0.5"
              >
                <!-- 延伸線徒步天數 -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-xs text-slate-600">
                      延伸徒步天數
                    </label>
                    <span class="text-[11px] text-slate-500 font-mono">
                      約 {{ finisterreDailyAvgKm }} km/日
                    </span>
                  </div>
                  <div
                    class="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden h-9.5"
                  >
                    <button
                      type="button"
                      @click="handleDecreaseFinisterreDays"
                      :disabled="draftConfig.finisterreDays <= minFinisterreDays"
                      class="px-2.5 h-full text-slate-600 hover:bg-slate-200 transition cursor-pointer flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus class="w-3.5 h-3.5" />
                    </button>
                    <span
                      class="flex-1 text-center text-xs font-bold text-slate-900 font-mono"
                    >
                      {{ draftConfig.finisterreDays }} 天
                    </span>
                    <button
                      type="button"
                      @click="handleIncreaseFinisterreDays"
                      :disabled="draftConfig.finisterreDays >= maxFinisterreDays"
                      class="px-2.5 h-full text-slate-600 hover:bg-slate-200 transition cursor-pointer flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <!-- 聖地牙哥停留休整天數 -->
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-xs text-slate-600">
                      聖地牙哥休整
                    </label>
                    <span class="text-[11px] text-slate-500 font-mono">
                      停留天數
                    </span>
                  </div>
                  <div
                    class="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden h-9.5"
                  >
                    <button
                      type="button"
                      @click="handleDecreaseLayoverDays"
                      :disabled="draftConfig.santiagoLayoverDays <= 0"
                      class="px-2.5 h-full text-slate-600 hover:bg-slate-200 transition cursor-pointer flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus class="w-3.5 h-3.5" />
                    </button>
                    <span
                      class="flex-1 text-center text-xs font-bold text-slate-900 font-mono"
                    >
                      {{ draftConfig.santiagoLayoverDays }} 天
                    </span>
                    <button
                      type="button"
                      @click="handleIncreaseLayoverDays"
                      :disabled="draftConfig.santiagoLayoverDays >= 3"
                      class="px-2.5 h-full text-slate-600 hover:bg-slate-200 transition cursor-pointer flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 確認按照變更重新規劃按鈕 -->
            <div class="pt-1">
              <button
                type="button"
                @click="handleApplyChanges"
                :disabled="!isDirty"
                class="w-full py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                :class="[
                  isDirty
                    ? 'bg-orange-400 text-white hover:bg-orange-500 shadow-xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed',
                ]"
              >
                <CheckCircle2 class="w-4 h-4" />
                確認按照變更重新規劃
              </button>
              <div
                v-if="isDirty"
                class="mt-2 flex items-center justify-between text-xs text-slate-700 px-2.5 py-1.5 rounded-lg bg-stone-100 border border-stone-200"
              >
                <span class="flex items-center gap-1"
                  >設定已變更，請點擊確認</span
                >
                <button
                  type="button"
                  @click="handleDiscardDraft"
                  class="text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  放棄修改
                </button>
              </div>
            </div>
            <!-- 冬季庇里牛斯山安全提醒 -->
            <div
              v-if="scheduleStore.isWinterLocked"
              class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-slate-800 flex items-start gap-2"
            >
              <AlertTriangle class="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>冬季庇里牛斯山安全提醒（強制封山）</strong>
                <p class="mt-0.5 opacity-90">
                  11/1 ~ 3/31
                  法國官方強制封閉高空拿破崙之路（違者面臨罰款且需自負搜救費用），系統已自動為您鎖定安全之谷道路線（經
                  Valcarlos）。
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 側邊商業廣告欄位 -->
        <GoogleAd slot-id="schedule-sidebar-ad" format="rectangle" />
      </div>

      <!-- 中欄：每日分段時間軸清單 (lg: 8 欄) -->
      <div class="lg:col-span-8 space-y-4">
        <!-- 頂部數據總覽看板 (移至每日行程上方) -->
        <!-- 手機版：單行水平極簡資訊條 (sm:hidden) -->
        <div
          class="sm:hidden px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs"
        >
          <div class="flex items-center gap-1">
            <span class="text-slate-400">總長</span>
            <span class="font-bold text-slate-900 font-mono">{{
              scheduleStore.totalDistanceKm.toFixed(1)
            }}</span>
            <span class="text-[10px] text-slate-500">km</span>
          </div>
          <div class="w-px h-3.5 bg-slate-200"></div>
          <div class="flex items-center gap-1">
            <span class="text-slate-400">日均</span>
            <span class="font-bold text-slate-900 font-mono">{{
              dailyAverageKm.toFixed(1)
            }}</span>
            <span class="text-[10px] text-slate-500">km</span>
          </div>
          <div class="w-px h-3.5 bg-slate-200"></div>
          <div class="flex items-center gap-1 text-slate-700">
            <span class="font-bold text-slate-900 font-mono">{{
              scheduleStore.totalWalkingDays
            }}</span>
            <span class="text-[10px] text-slate-500">走</span>
            <span class="text-slate-300">/</span>
            <span class="font-bold text-slate-900 font-mono">{{
              scheduleStore.totalRestDays
            }}</span>
            <span class="text-[10px] text-slate-500">休</span>
          </div>
        </div>

        <!-- 桌機版：四欄數據看板 (hidden sm:grid) -->
        <div
          class="hidden sm:grid sm:grid-cols-4 gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-xs"
        >
          <div class="p-3 bg-slate-50 rounded-xl text-center">
            <div class="text-xs text-slate-500">總徒步里程</div>
            <div class="text-xl font-black text-slate-900 font-mono mt-0.5">
              {{ scheduleStore.totalDistanceKm.toFixed(1) }}
              <span class="text-xs font-normal">km</span>
            </div>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl text-center">
            <div class="text-xs text-slate-500">日均徒步</div>
            <div class="text-xl font-black text-slate-900 font-mono mt-0.5">
              {{ dailyAverageKm.toFixed(1) }}
              <span class="text-xs font-normal">km/日</span>
            </div>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl text-center">
            <div class="text-xs text-slate-500">徒步天數</div>
            <div class="text-xl font-black text-slate-900 font-mono mt-0.5">
              {{ scheduleStore.totalWalkingDays }}
              <span class="text-xs font-normal">天</span>
            </div>
            <div
              v-if="scheduleStore.currentDraft.finisterreOption !== 'NONE'"
              class="text-[10px] text-slate-500 mt-0.5"
            >
              主線 {{ scheduleStore.config.targetDays }} + 延伸 {{ scheduleStore.currentDraft.finisterreDays || 3 }}
            </div>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl text-center">
            <div class="text-xs text-slate-500">休息停留</div>
            <div class="text-xl font-black text-slate-900 font-mono mt-0.5">
              {{ scheduleStore.totalRestDays }}
              <span class="text-xs font-normal">天</span>
            </div>
          </div>
        </div>

        <!-- 每日分段卡片清單 -->
        <StageCard
          v-for="(stage, index) in scheduleStore.stages"
          :key="`${stage.dayIndex}-${stage.startWaypointId}-${stage.endWaypointId}`"
          :stage="stage"
          :is-first="index === 0"
          :is-last="index === scheduleStore.stages.length - 1"
          @open-albergue="handleOpenAlbergue"
          @change-waypoint="handleChangeWaypoint"
          @toggle-rest="handleToggleRest"
        />
      </div>
    </div>

    <!-- 彈窗群 -->
    <ChangeWaypointModal
      :is-open="isChangeModalOpen"
      :stage="activeStage"
      @close="isChangeModalOpen = false"
      @confirm="handleConfirmChange"
    />

    <AlbergueModal
      :is-open="isAlbergueModalOpen"
      :stage="activeStage"
      @close="isAlbergueModalOpen = false"
    />

    <!-- 彈性排程小提醒對話框 (手機與平板) -->
    <TipsModal
      :is-open="isScheduleTipsModalOpen"
      title="彈性排程小提醒"
      @close="isScheduleTipsModalOpen = false"
    >
      <p class="leading-relaxed">
        朝聖之路不需要完全照表操課。路上若遇體力不支或愛上某座小鎮，隨時點擊卡片上的「更換結束點」或「設為休息日」，系統會為您自動重新計算後續天數！
      </p>
    </TipsModal>
  </div>
</template>
