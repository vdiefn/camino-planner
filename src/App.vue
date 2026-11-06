<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 全站共用彈窗以非同步方式載入（Code Splitting），降低首屏主執行緒負擔
const FeedbackModal = defineAsyncComponent(() => import('@/components/common/FeedbackModal.vue'))
</script>

<template>
  <router-view />
  <FeedbackModal />
</template>
