<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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

// 讀取環境變數中的 Google AdSense Client ID 與啟用開關
const adClientId = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID || ''
const defaultSlotId = import.meta.env.VITE_GOOGLE_ADSENSE_SLOT_ID || props.slotId
const isAdEnabled = import.meta.env.VITE_GOOGLE_ADSENSE_ENABLED === 'true'

// 驗證 Slot ID 是否為純數字，防止空白佔位
const isValidSlot = /^\d+$/.test(defaultSlotId)
if (import.meta.env.DEV && isAdEnabled && !isValidSlot) {
  console.warn(`[GoogleAd] 略過渲染：Slot ID "${defaultSlotId}" 非純數字，請填入 AdSense 正式單元 ID。`)
}

// 審查期間預設隱藏手動佔位框，待 AdSense 核准且具備有效數字 Slot ID 後再啟用，杜絕空白廣告框扣分
const isVisible = ref(Boolean(isAdEnabled && adClientId && isValidSlot))

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
    :aria-label="t('common.sponsoredAd')"
  >
    <div class="mb-1.5 flex items-center justify-center gap-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
      <span>{{ t('common.sponsoredAd') }}</span>
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
