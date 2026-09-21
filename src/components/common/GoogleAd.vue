<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  slotId?: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical'
  isSidebar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  slotId: '',
  format: 'auto',
  isSidebar: false,
})

// 讀取環境變數中的 Google AdSense Client ID
const adClientId = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID || ''
const defaultSlotId = import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_ID || props.slotId

// 若未配置 Client ID 則完全隱形，不佔據任何版面空間
const isVisible = ref(Boolean(adClientId))

onMounted(() => {
  if (!isVisible.value) return
  try {
    // 呼叫 Google AdSense 渲染
    // @ts-expect-error window.adsbygoogle 是外部注入的全域物件
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
  } catch {
    // 離線斷網或被 AdBlock 阻擋時安靜降級隱藏
    isVisible.value = false
  }
})
</script>

<template>
  <aside
    v-if="isVisible"
    :class="[
      'overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/80 text-center transition-all',
      isSidebar ? 'min-h-[250px] p-3' : 'my-6 min-h-[100px] p-4',
    ]"
    aria-label="贊助商廣告"
  >
    <div class="mb-1.5 flex items-center justify-center gap-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
      <span>贊助商廣告</span>
    </div>
    <ins
      class="adsbygoogle block"
      :data-ad-client="adClientId"
      :data-ad-slot="defaultSlotId"
      :data-ad-format="format"
      data-full-width-responsive="true"
    />
  </aside>
</template>
