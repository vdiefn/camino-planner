<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import FeedbackModal from '@/components/common/FeedbackModal.vue'
import SyncBackupModal from '@/components/common/SyncBackupModal.vue'
import BackToTop from '@/components/common/BackToTop.vue'
import ScheduleView from '@/views/ScheduleView.vue'
import PackingView from '@/views/PackingView.vue'
import TransportView from '@/views/TransportView.vue'
import { useSyncBackup } from '@/composables/useSyncBackup'
import { usePackingStore } from '@/stores/packing'

const route = useRoute()
const router = useRouter()

// 依據當前 URL Path 初始化分頁狀態
const getTabFromRoute = (path: string): 'schedule' | 'packing' | 'transport' => {
  if (path.startsWith('/packing')) return 'packing'
  if (path.startsWith('/transport')) return 'transport'
  return 'schedule'
}

// 當前啟用的分頁標籤：'schedule' | 'packing' | 'transport'
const currentTab = ref<'schedule' | 'packing' | 'transport'>(getTabFromRoute(route.path))

// 監聽路由變化同步更新 currentTab（例如上一頁/下一頁）
watch(
  () => route.path,
  (newPath) => {
    currentTab.value = getTabFromRoute(newPath)
  }
)

// 當使用者點擊分頁頁籤時，同步更新網址路徑（搶佔長尾網址權重）
watch(currentTab, (newTab) => {
  const targetPath = `/${newTab}`
  if (route.path !== targetPath) {
    router.push(targetPath)
  }
})

// 初始化裝備資料與檢查網址是否帶有 #sync=... 外部同步資料
const packingStore = usePackingStore()
const { checkUrlHashOnMount } = useSyncBackup()
onMounted(() => {
  packingStore.syncWithLatestDefaults()
  checkUrlHashOnMount()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans transition-colors duration-200">
    <!-- 頂部通用導覽列 -->
    <AppHeader v-model:current-tab="currentTab" />

    <!-- 主內容呈現區 -->
    <main class="flex-1">
      <!-- 智慧動態排程 -->
      <ScheduleView v-if="currentTab === 'schedule'" />

      <!-- 科學化裝備負重試算 -->
      <PackingView v-else-if="currentTab === 'packing'" />

      <!-- 起點交通轉乘決策 -->
      <TransportView v-else-if="currentTab === 'transport'" />
    </main>

    <!-- 全域通用頁尾 -->
    <AppFooter />

    <!-- 全域回饋與許願彈窗 -->
    <FeedbackModal />

    <!-- 全域跨裝置同步與備份彈窗 -->
    <SyncBackupModal />

    <!-- 全站回到頂部極簡懸浮圓鈕 -->
    <BackToTop />

    <!-- 手機端底部固定導覽列 -->
    <BottomNav v-model:current-tab="currentTab" />
  </div>
</template>
