<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useScheduleStore } from "@/stores/schedule";
import StageCard from "@/components/schedule/StageCard.vue";
import ChangeWaypointModal from "@/components/schedule/ChangeWaypointModal.vue";
import WaypointSelect from "@/components/schedule/WaypointSelect.vue";
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
  Sparkles,
  CheckCircle2,
  ChevronDown,
  MessageCircleWarning,
  Coffee,
} from "lucide-vue-next";

const scheduleStore = useScheduleStore();
const router = useRouter();

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
});

// 分支選單文字格式化（包含冬季封山與里程天數資訊，避免在 option 內使用 template 標籤）
const formatBranchOption = (branch: any) => {
  let note = "";
  if (scheduleStore.isWinterLocked && branch.id === "napoleon") {
    note = "（❄️ 11/1~3/31 封山禁行）";
  } else if (scheduleStore.isWinterLocked && branch.id === "valcarlos") {
    note = "（冬季官方建議通行）";
  }
  const distInfo = `（約${Math.round(branch.totalDistanceKm || 0)}km • ${branch.recommendedDays} 天）`;
  return `${branch.chineseName}${note ? " " + note : ""} ${distInfo}`;
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
    draftConfig.value.targetDays - (scheduleStore.config.restDays || 0),
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
      (scheduleStore.currentDraft.finisterreDays || 3)
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
const maxFinisterreDays = computed(() => (isFinisterreBoth.value ? 15 : 8));

const finisterreDailyAvgKm = computed(() => {
  const km = currentFinisterreInfo.value.totalKm;
  const days = draftConfig.value.finisterreDays;
  if (days > 0 && km > 0) {
    return (km / days).toFixed(1);
  }
  return "0.0";
});

// 處理路線切換（同步更新 URL 路由，確保長尾網址與瀏覽器歷程一致）
const handleSwitchRoute = (routeId: RouteId) => {
  scheduleStore.switchRoute(routeId);
  const branchId = scheduleStore.currentDraft?.branchId;
  if (routeId === "portugues" && branchId === "costa") {
    router.push(`/schedule/portugues/costa`);
  } else {
    router.push(`/schedule/${routeId}`);
  }
};

// 處理分支切換（葡萄牙中央線 vs 海岸線等長尾路徑連動）
const handleSwitchBranch = (branchId: string) => {
  scheduleStore.switchBranch(branchId);
  if (scheduleStore.currentRouteId === "portugues") {
    if (branchId === "costa") {
      router.push(`/schedule/portugues/costa`);
    } else {
      router.push(`/schedule/portugues/central`);
    }
  }
};

// 處理起訖點變更時，若天數超出合理範圍進行保護
const handleWaypointChange = () => {
  const wps = scheduleStore.currentMainWaypoints;
  const startWp = wps.find((w) => w.id === draftConfig.value.startWaypointId);
  const endWp = wps.find((w) => w.id === draftConfig.value.endWaypointId);
  if (wps.length >= 2 && startWp && endWp && startWp.cumulativeKm >= endWp.cumulativeKm) {
    if (startWp.id === wps[wps.length - 1].id) {
      draftConfig.value.startWaypointId = wps[0].id;
    }
    draftConfig.value.endWaypointId = wps[wps.length - 1].id;
  }
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

// 套用變更並重新計算（依照使用者調整的日期、主線與延伸段全體設定）
const handleApplyChanges = () => {
  scheduleStore.updateDraftConfig({
    startWaypointId: draftConfig.value.startWaypointId,
    endWaypointId: draftConfig.value.endWaypointId,
    startDate: draftConfig.value.startDate,
    targetDays: draftConfig.value.targetDays,
    finisterreOption: draftConfig.value.finisterreOption,
    finisterreDays: draftConfig.value.finisterreDays,
  });
};

// 點擊重設按鈕：還原回當前路線之官方預設設定
const handleResetToOfficial = () => {
  scheduleStore.resetToDefaults();
  draftConfig.value.startWaypointId = scheduleStore.config.startWaypointId;
  draftConfig.value.endWaypointId = scheduleStore.config.endWaypointId;
  draftConfig.value.startDate = scheduleStore.config.startDate;
  draftConfig.value.targetDays = scheduleStore.config.targetDays;
  draftConfig.value.finisterreOption =
    scheduleStore.currentDraft.finisterreOption || "NONE";
  draftConfig.value.finisterreDays =
    scheduleStore.currentDraft.finisterreDays || 3;
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

// 一鍵追加一天主線抵達聖地牙哥大教堂
const handleAppendMainDay = () => {
  scheduleStore.appendMainDayToSantiago();
  draftConfig.value.targetDays = scheduleStore.config.targetDays;
};

// 一鍵追加一天世界盡頭抵達海角終點
const handleAppendFinisterreDay = () => {
  scheduleStore.appendFinisterreDayToDestination();
  draftConfig.value.finisterreDays = scheduleStore.currentDraft.finisterreDays || 3;
};

// 計算日均公里
const dailyAverageKm = computed(() => {
  const walkingDays = scheduleStore.totalWalkingDays;
  if (walkingDays === 0) return 0;
  return Number((scheduleStore.totalDistanceKm / walkingDays).toFixed(1));
});

// 主線是否成功抵達聖地牙哥大教堂
const isMainReachedSantiago = computed(() => {
  const stages = scheduleStore.stages;
  if (!stages || stages.length === 0) return true;
  const mainStagesList = stages.filter((s) => !s.isExtensionStage);
  if (mainStagesList.length === 0) return true;
  const lastMain = mainStagesList[mainStagesList.length - 1];
  return (
    lastMain.endWaypointId === "SANTIAGO_DE_COMPOSTELA" ||
    lastMain.endWaypointId.endsWith(":santiago")
  );
});

// 主線最後落腳城鎮名稱
const lastMainWaypointName = computed(() => {
  const mainStagesList = scheduleStore.stages.filter((s) => !s.isExtensionStage);
  if (mainStagesList.length === 0) return "";
  const lastMain = mainStagesList[mainStagesList.length - 1];
  const wp = scheduleStore.getWaypoint(lastMain.endWaypointId);
  return wp ? wp.localName || wp.chineseName : lastMain.endWaypointId;
});

// 主線最後一天分段（用於精準定位「未達聖地牙哥提醒」在該天卡片之後）
const lastMainStage = computed(() => {
  const mainStagesList = scheduleStore.stages.filter((s) => !s.isExtensionStage);
  if (mainStagesList.length === 0) return null;
  return mainStagesList[mainStagesList.length - 1];
});

const isLastMainStage = (stage: UserStage) => {
  return lastMainStage.value?.dayIndex === stage.dayIndex && !stage.isExtensionStage;
};

// 世界盡頭目標終點航點 ID
const targetFinisterreEndWaypointId = computed(() => {
  const opt = scheduleStore.currentDraft.finisterreOption;
  if (opt === "FINISTERRE_ONLY" || opt === "BOTH_MUXIA_FIRST") {
    return "finisterre:fisterra";
  }
  if (opt === "MUXIA_ONLY" || opt === "BOTH_FINISTERRE_FIRST") {
    return "finisterre:muxia";
  }
  return null;
});

// 世界盡頭最後一天落腳城鎮名稱
const lastExtensionWaypointName = computed(() => {
  const extStages = scheduleStore.stages.filter((s) => s.isExtensionStage);
  if (extStages.length === 0) return "";
  const lastExt = extStages[extStages.length - 1];
  const wp = scheduleStore.getWaypoint(lastExt.endWaypointId);
  return wp ? wp.localName || wp.chineseName : lastExt.endWaypointId;
});

// 世界盡頭是否成功抵達目標海角
const isExtensionReachedDestination = computed(() => {
  const opt = scheduleStore.currentDraft.finisterreOption;
  if (opt === "NONE") return true;
  const targetId = targetFinisterreEndWaypointId.value;
  if (!targetId) return true;
  const extStages = scheduleStore.stages.filter((s) => s.isExtensionStage);
  if (extStages.length === 0) return true;
  const lastExt = extStages[extStages.length - 1];
  return lastExt.endWaypointId === targetId;
});

// 目標海角中文名稱
const targetDestinationName = computed(() => {
  const opt = scheduleStore.currentDraft.finisterreOption;
  if (opt === "FINISTERRE_ONLY" || opt === "BOTH_MUXIA_FIRST") {
    return "菲尼斯特雷大西洋燈塔 (Finisterre)";
  }
  if (opt === "MUXIA_ONLY" || opt === "BOTH_FINISTERRE_FIRST") {
    return "穆希亞聖船聖母聖殿 (Muxía)";
  }
  return "";
});

// 判斷某個 stage 是否為延伸段之最後一天
const isLastExtensionStage = (stage: UserStage) => {
  const extStages = scheduleStore.stages.filter((s) => s.isExtensionStage);
  if (extStages.length === 0) return false;
  return (
    extStages[extStages.length - 1].dayIndex === stage.dayIndex &&
    stage.isExtensionStage
  );
};

// 手機/平板折疊摘要列計算：總天數（主線 + 世界盡頭）
const mobileDisplayTotalDays = computed(() => {
  const mainDays = draftConfig.value.targetDays;
  if (draftConfig.value.finisterreOption === "NONE") {
    return mainDays;
  }
  const extDays = draftConfig.value.finisterreDays || 3;
  return mainDays + extDays;
});

// 行程全體總天數（包含主線與世界盡頭延伸段）
const totalTripDays = computed(() => {
  return scheduleStore.stages.length;
});

// 手機/平板折疊摘要列計算：完整起訖停靠站序列 (以箭頭一貫串聯：例如 SJPP → Santiago → Fisterra → Muxía)
const collapsedRouteFlow = computed(() => {
  const stops: string[] = [
    currentStartName.value || "SJPP",
    currentEndName.value || "Santiago",
  ];
  const opt = draftConfig.value.finisterreOption;
  if (opt === "FINISTERRE_ONLY") {
    stops.push("Fisterra");
  } else if (opt === "MUXIA_ONLY") {
    stops.push("Muxía");
  } else if (opt === "BOTH_FINISTERRE_FIRST") {
    stops.push("Fisterra", "Muxía");
  } else if (opt === "BOTH_MUXIA_FIRST") {
    stops.push("Muxía", "Fisterra");
  }
  return stops;
});

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
    <!-- 頂部吸頂列：左側大標題 ＋ 右側數據看板（Sticky 黏性吸頂，零位移、無底線、無陰影，滾動時純毛玻璃） -->
    <div
      :class="[
        'sticky top-14 sm:top-16 z-30 -mx-4 px-4 py-2 sm:py-2.5 mb-1.5 sm:mb-3 transition-[background-color,backdrop-filter] duration-200',
        isScrolled
          ? 'bg-slate-50/75 backdrop-blur-md'
          : 'bg-transparent',
      ]"
    >
      <div class="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-4">
        <h2
          class="text-base sm:text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2 shrink-0"
        >
          徒步行程規劃
        </h2>

        <!-- 右側：數據看板條（說明在上、數字在下，手機版採四等分均勻網格，杜絕貼邊過度往外） -->
        <div
          class="px-4 sm:px-6 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs grid grid-cols-4 sm:flex sm:items-center sm:justify-around text-xs gap-1 sm:gap-6 shrink-0 w-full md:w-auto"
        >
          <!-- 總徒步里程 -->
          <div class="flex flex-col items-center justify-center">
            <span class="text-slate-400 text-[10px] sm:text-xs whitespace-nowrap">總里程</span>
            <div class="flex items-baseline gap-0.5 whitespace-nowrap">
              <span class="font-bold text-slate-900 font-mono text-xs sm:text-sm">{{
                scheduleStore.totalDistanceKm.toFixed(1)
              }}</span>
              <span class="text-[10px] sm:text-[11px] text-slate-400 font-normal">km</span>
            </div>
          </div>

          <!-- 日均徒步 -->
          <div class="flex flex-col items-center justify-center">
            <span class="text-slate-400 text-[10px] sm:text-xs whitespace-nowrap">日均</span>
            <div class="flex items-baseline gap-0.5 whitespace-nowrap">
              <span class="font-bold text-slate-900 font-mono text-xs sm:text-sm">{{
                dailyAverageKm.toFixed(1)
              }}</span>
              <span class="text-[10px] sm:text-[11px] text-slate-400 font-normal">km/日</span>
            </div>
          </div>

          <!-- 總天數 -->
          <div class="flex flex-col items-center justify-center">
            <span class="text-slate-400 text-[10px] sm:text-xs whitespace-nowrap">總天數</span>
            <div class="flex items-baseline gap-0.5 whitespace-nowrap">
              <span class="font-bold text-slate-900 font-mono text-xs sm:text-sm">{{
                totalTripDays
              }}</span>
              <span class="text-[10px] sm:text-[11px] text-slate-400 font-normal">天</span>
              <span
                v-if="scheduleStore.currentDraft.finisterreOption !== 'NONE' && isMainReachedSantiago"
                class="hidden sm:inline text-[10px] text-slate-400 font-mono ml-0.5"
              >
                ({{ scheduleStore.config.targetDays }}+{{ scheduleStore.currentDraft.finisterreDays || 3 }})
              </span>
            </div>
          </div>

          <!-- 休息停留 -->
          <div class="flex flex-col items-center justify-center">
            <span class="text-slate-400 text-[10px] sm:text-xs whitespace-nowrap">休息</span>
            <div class="flex items-baseline gap-0.5 whitespace-nowrap">
              <span class="font-bold text-slate-900 font-mono text-xs sm:text-sm">{{
                scheduleStore.totalRestDays
              }}</span>
              <span class="text-[10px] sm:text-[11px] text-slate-400 font-normal">天</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 三欄響應式佈局 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-4 lg:gap-6 items-start">
      <!-- 左欄：Sticky 排程設定控制台 (lg: 4 欄，具備獨立自適應高度與平滑滾動，防止超出或被導覽列遮擋) -->
      <div class="lg:col-span-4 space-y-3 sm:space-y-4 lg:sticky lg:top-32 lg:max-h-[calc(100vh-8.5rem)] lg:overflow-y-auto lg:overscroll-contain pr-1">
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
              <div class="inline-flex items-center lg:hidden" @click.stop>
                <button
                  type="button"
                  @click.stop="isScheduleTipsModalOpen = true"
                  class="text-amber-500 hover:text-amber-600 p-1 rounded-lg hover:bg-amber-50 transition cursor-pointer flex items-center"
                  title="彈性排程小提醒"
                  aria-label="查看彈性排程小提醒"
                >
                  <MessageCircleWarning class="w-4 h-4" />
                </button>
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

          <!-- 手機版收合時呈現的精簡摘要列（桌機版隱藏，完整呈現主線與世界盡頭資訊） -->
          <div
            v-if="!isMobileSettingsOpen"
            @click="isMobileSettingsOpen = true"
            class="lg:hidden mt-2.5 pt-2.5 border-t border-slate-100 flex flex-col gap-1.5 cursor-pointer"
          >
            <!-- 第一行：起訖走向（獨佔一整行，地名獲得完整伸展空間，杜絕因空間擠壓導致過度截斷） -->
            <div class="flex items-center gap-1.5 min-w-0 text-xs text-slate-700">
              <template v-for="(stop, idx) in collapsedRouteFlow" :key="idx">
                <span class="font-medium text-slate-800 truncate">{{ stop }}</span>
                <span
                  v-if="idx < collapsedRouteFlow.length - 1"
                  class="text-slate-400 shrink-0 text-[11px]"
                  >→</span
                >
              </template>
            </div>

            <!-- 第二行：路線中文名稱、天數明細與狀態標籤 -->
            <div class="flex items-center justify-between text-xs text-slate-500">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-[11px] font-medium text-slate-600 truncate">
                  {{ scheduleStore.currentRouteMetadata?.chineseName }}
                </span>
                <span class="text-slate-300">·</span>
                <span class="font-bold text-slate-800 font-mono text-xs">
                  {{ mobileDisplayTotalDays }} 天
                  <span
                    v-if="draftConfig.finisterreOption !== 'NONE'"
                    class="text-[10px] text-slate-400 font-normal font-sans ml-0.5"
                  >
                    ({{ draftConfig.targetDays }}+{{ draftConfig.finisterreDays }})
                  </span>
                </span>
              </div>
              <span
                v-if="isDirty"
                class="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium shrink-0"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>待套用
              </span>
            </div>
          </div>

          <!-- 可折疊內容區塊：手機版依 isMobileSettingsOpen 顯示/隱藏，桌機版永遠顯示（lg:block） -->
          <div
            class="space-y-4 mt-4"
            :class="isMobileSettingsOpen ? 'block' : 'hidden lg:block'"
          >
            <!-- 主路線切換：手機版下拉選單 (sm:hidden) / 電腦平板網格按鈕 (hidden sm:grid) -->
            <div>
              <label class="text-xs text-slate-700 mb-1.5 flex items-center gap-1.5">
                <span>選擇朝聖主路線</span>
              </label>

              <!-- 手機版：單行精簡下拉選單（省空間且支援多路線無縫擴充） -->
              <div class="sm:hidden">
                <select
                  :value="scheduleStore.currentRouteId"
                  @change="handleSwitchRoute(($event.target as HTMLSelectElement).value as RouteId)"
                  class="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                >
                  <option
                    v-for="route in scheduleStore.availableRoutes"
                    :key="route.id"
                    :value="route.id"
                  >
                    {{ route.chineseName }}（約 {{ scheduleStore.getRouteDisplayDistance(route.id) }}km）
                  </option>
                </select>
              </div>

              <!-- 平板與桌機版：保留一鍵點選的網格按鈕 -->
              <div class="hidden sm:grid sm:grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
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
                @change="handleSwitchBranch(($event.target as HTMLSelectElement).value)"
                class="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-slate-300 outline-hidden"
              >
                <option
                  v-for="branch in scheduleStore.currentRouteMetadata.branches"
                  :key="branch.id"
                  :value="branch.id"
                  :disabled="scheduleStore.isWinterLocked && branch.id === 'napoleon'"
                >
                  {{ formatBranchOption(branch) }}
                </option>
              </select>
            </div>

            <!-- 起點（獨立佔一行，支援搜尋與自訂防反彈下拉） -->
            <WaypointSelect
              v-model="draftConfig.startWaypointId"
              label="起點"
              :waypoints="scheduleStore.currentMainWaypoints"
              @change="handleWaypointChange"
            />

            <!-- 終點（獨立佔一行，支援搜尋與自訂防反彈下拉） -->
            <WaypointSelect
              v-model="draftConfig.endWaypointId"
              label="終點"
              :waypoints="scheduleStore.currentMainWaypoints"
              @change="handleWaypointChange"
            />

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

            <!-- 世界盡頭全域延伸段 (Finisterre & Muxía Extension，選單與天數並排同一列) -->
            <div class="pt-2 border-t border-slate-100">
              <div
                class="grid gap-2 items-end"
                :class="draftConfig.finisterreOption !== 'NONE' ? 'grid-cols-1 sm:grid-cols-12' : 'grid-cols-1'"
              >
                <!-- 延伸路線下拉選單 -->
                <div :class="draftConfig.finisterreOption !== 'NONE' ? 'sm:col-span-7' : 'w-full'">
                  <label class="text-xs text-slate-800 block mb-1">
                    世界盡頭延伸旅程
                  </label>
                  <select
                    :value="draftConfig.finisterreOption"
                    @change="handleFinisterreOptionChange(($event.target as HTMLSelectElement).value as FinisterreOption)"
                    class="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:ring-slate-300 outline-hidden truncate"
                  >
                    <option
                      v-for="(info, key) in finisterreOptionLabels"
                      :key="key"
                      :value="key"
                    >
                      {{ info.title }}
                    </option>
                  </select>
                </div>

                <!-- 延伸徒步天數 Stepper（並排於同一列右側） -->
                <div
                  v-if="draftConfig.finisterreOption !== 'NONE'"
                  class="sm:col-span-5"
                >
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-xs text-slate-600">
                      延伸天數
                    </label>
                    <span class="text-[10px] text-slate-400 font-mono">
                      約 {{ finisterreDailyAvgKm }}km/日
                    </span>
                  </div>
                  <div
                    class="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden h-9"
                  >
                    <button
                      type="button"
                      @click="handleDecreaseFinisterreDays"
                      :disabled="draftConfig.finisterreDays <= minFinisterreDays"
                      class="px-2 h-full text-slate-600 hover:bg-slate-200 transition cursor-pointer flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
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
                      class="px-2 h-full text-slate-600 hover:bg-slate-200 transition cursor-pointer flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
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

        <!-- 彈性排程小提醒（電腦模式：常駐於行程規劃設定卡片下方） -->
        <div
          class="hidden lg:flex items-start gap-3 p-4 rounded-xl border border-slate-200 text-xs bg-white p-5 shadow-xs"
        >
          <div class="space-y-1">
            <h3 class="flex items-center gap-2 text-sm text-slate-900 font-bold">
              <Sparkles class="h-4 w-4 text-amber-500" />
              <span class="text-base">彈性排程小提醒</span>
            </h3>
            <p class="leading-relaxed text-slate-600">
              朝聖之路不需要完全照表操課。路上若遇體力不支或愛上某座小鎮，隨時點擊卡片上的「更換結束點」或「設為休息日」，系統會為您自動重新計算後續天數！
            </p>
          </div>
        </div>

        <!-- 側邊商業廣告欄位 -->
        <GoogleAd slot-id="schedule-sidebar-ad" format="rectangle" />
      </div>

      <!-- 中欄：每日分段時間軸清單 (lg: 8 欄) -->
      <div class="lg:col-span-8 space-y-3 sm:space-y-4">
        <!-- 每日分段卡片清單與那一天之精準提醒 -->
        <template
          v-for="(stage, index) in scheduleStore.stages"
          :key="`${stage.dayIndex}-${stage.startWaypointId}-${stage.endWaypointId}`"
        >
          <StageCard
            :stage="stage"
            :is-first="index === 0"
            :is-last="index === scheduleStore.stages.length - 1"
            @open-albergue="handleOpenAlbergue"
            @change-waypoint="handleChangeWaypoint"
            @toggle-rest="handleToggleRest"
          />

          <!-- 主線未抵達聖地牙哥時之提醒橫條：精準置於「主線最後一天（那一天）」下方，一眼即可看見 -->
          <div
            v-if="isLastMainStage(stage) && !isMainReachedSantiago"
            class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-xs"
          >
            <AlertTriangle class="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div class="flex-1">
              <div class="font-bold text-sm text-amber-950">
                朝聖主線尚未抵達聖地牙哥大教堂（Day {{ stage.dayIndex }} 落腳於「{{ lastMainWaypointName }}」）
              </div>
              <div class="mt-1 text-slate-700 leading-relaxed">
                主線行程於今日停靠在 {{ lastMainWaypointName }}。下方世界盡頭旅程預設由聖地牙哥大教堂接續啟程，若欲無縫接軌，可直接點擊下方快捷鍵自動補齊：
              </div>
              <div class="mt-2.5 flex items-center gap-2 flex-wrap">
                <button
                  v-if="stage.isRestDay"
                  type="button"
                  @click="handleToggleRest(stage.dayIndex)"
                  class="px-2.5 py-1 rounded-lg text-xs font-medium bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Coffee class="w-3.5 h-3.5 text-amber-600" />
                  取消此日休息（恢復直達聖地牙哥）
                </button>
                <button
                  type="button"
                  @click="handleAppendMainDay"
                  class="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white transition cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Plus class="w-3.5 h-3.5" />
                  追加 1 天直達大教堂（保留前段規劃）
                </button>
              </div>
            </div>
          </div>

          <!-- 世界盡頭未抵達終點時之提醒橫條：精準置於「世界盡頭最後一天（那一天）」下方，一眼即可看見 -->
          <div
            v-if="isLastExtensionStage(stage) && !isExtensionReachedDestination"
            class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-xs"
          >
            <AlertTriangle class="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div class="flex-1">
              <div class="font-bold text-sm text-amber-950">
                世界盡頭行程尚未抵達{{ targetDestinationName }}（Day {{ stage.dayIndex }} 落腳於「{{ lastExtensionWaypointName }}」）
              </div>
              <div class="mt-1 text-slate-700 leading-relaxed">
                延伸行程因設定休息停留日或城鎮調整，於最後一天停靠在 {{ lastExtensionWaypointName }}，未能抵達預定之海角終點。您可直接點擊下方快捷鍵補齊：
              </div>
              <div class="mt-2.5 flex items-center gap-2 flex-wrap">
                <button
                  v-if="stage.isRestDay"
                  type="button"
                  @click="handleToggleRest(stage.dayIndex)"
                  class="px-2.5 py-1 rounded-lg text-xs font-medium bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Coffee class="w-3.5 h-3.5 text-amber-600" />
                  取消此日休息（恢復直達海角）
                </button>
                <button
                  v-if="(scheduleStore.currentDraft.finisterreDays || 3) < maxFinisterreDays"
                  type="button"
                  @click="handleAppendFinisterreDay"
                  class="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white transition cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Plus class="w-3.5 h-3.5" />
                  追加 1 天直達海角（保留前段規劃）
                </button>
              </div>
            </div>
          </div>
        </template>
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
