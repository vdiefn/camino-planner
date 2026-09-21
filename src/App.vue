<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import ScheduleView from '@/views/ScheduleView.vue'
import PackingView from '@/views/PackingView.vue'
import TransportView from '@/views/TransportView.vue'
import { usePackingStore } from '@/stores/packing'

// 當前啟用的分頁標籤：'schedule' | 'packing' | 'transport'
const currentTab = ref<'schedule' | 'packing' | 'transport'>('schedule')

// 初始化裝備資料（若版本更新則非破壞性自動合併）
const packingStore = usePackingStore()
onMounted(() => {
  packingStore.syncWithLatestDefaults()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans transition-colors duration-200">
    <!-- 頂部通用導覽列 -->
    <AppHeader v-model:current-tab="currentTab" />

    <!-- 主內容呈現區 -->
    <main class="flex-1 pb-20 md:pb-12">
      <!-- 智慧動態排程 -->
      <ScheduleView v-if="currentTab === 'schedule'" />
      
      <!-- 科學化裝備負重試算 -->
      <PackingView v-else-if="currentTab === 'packing'" />
      
      <!-- 起點交通轉乘決策 -->
      <TransportView v-else-if="currentTab === 'transport'" />
    </main>

    <!-- 手機端底部固定導覽列 -->
    <BottomNav v-model:current-tab="currentTab" />
  </div>
</template>
