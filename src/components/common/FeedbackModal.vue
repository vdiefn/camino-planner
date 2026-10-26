<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild
} from '@headlessui/vue'
import {
  X,
  Sparkles,
  Home,
  Bug,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-vue-next'
import { useFeedbackModal, type FeedbackCategory } from '@/composables/useFeedbackModal'

const { isOpen, initialCategory, initialTarget, closeFeedback } = useFeedbackModal()

const category = ref<FeedbackCategory>('feature_request')
const target = ref('')
const content = ref('')
const botField = ref('') // 蜜罐欄位 (隱形)

const isSubmitting = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')

// 當彈窗打開時同步初始參數
watch(isOpen, (newVal) => {
  if (newVal) {
    category.value = initialCategory.value
    target.value = initialTarget.value
    content.value = ''
    botField.value = ''
    isSubmitting.value = false
    isSuccess.value = false
    errorMessage.value = ''
  }
})

const categories: { id: FeedbackCategory; label: string; icon: any; placeholder: string }[] = [
  {
    id: 'feature_request',
    label: '功能許願',
    icon: Sparkles,
    placeholder: '希望新增哪些路線、行程功能或裝備工具？歡迎告訴我們您的想法！'
  },
  {
    id: 'data_correction',
    label: '資料勘誤',
    icon: Home,
    placeholder: '庇護所歇業、電話或價格異動、發現遺漏的庇護所、或交通班次變更...'
  },
  {
    id: 'bug_report',
    label: '問題回報',
    icon: Bug,
    placeholder: '遇到了什麼異常狀況或排版錯誤？請描述發生情境，我們會盡快修復！'
  },
  {
    id: 'general',
    label: '其他回饋',
    icon: MessageCircle,
    placeholder: '朝聖心得分享、給開發者的鼓勵，或任何想說的話...'
  }
]

async function handleSubmit() {
  if (!content.value.trim()) {
    errorMessage.value = '請輸入回饋內容'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: category.value,
        target: target.value.trim(),
        content: content.value.trim(),
        botField: botField.value
      })
    })

    const data = await res.json().catch(() => ({}))

    if (res.ok && data.success) {
      isSuccess.value = true
    } else {
      errorMessage.value = data.error || '傳送失敗，請稍後再試'
    }
  } catch (err) {
    console.error('送出回饋失敗:', err)
    errorMessage.value = '網路連線異常，請稍後再試'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeFeedback" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-150 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-200">
              <!-- 頂部標題與關閉按鈕 -->
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <DialogTitle as="h3" class="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageCircle class="w-5 h-5 text-amber-500" />
                  意見回饋與許願池
                </DialogTitle>
                <button
                  type="button"
                  @click="closeFeedback"
                  class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <!-- 成功狀態畫面 -->
              <div v-if="isSuccess" class="py-8 text-center space-y-3">
                <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 class="w-7 h-7" />
                </div>
                <h4 class="text-base font-bold text-slate-900">
                  非常感謝您的回饋！
                </h4>
                <p class="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  您的寶貴建議與情報已送達，這能讓所有朝聖者的規劃旅程更加踏實順利。¡Buen Camino!
                </p>
                <div class="pt-3">
                  <button
                    type="button"
                    @click="closeFeedback"
                    class="px-5 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                  >
                    完成
                  </button>
                </div>
              </div>

              <!-- 表單填寫區 -->
              <form v-else @submit.prevent="handleSubmit" class="mt-4 space-y-4">
                <!-- 蜜罐防爬蟲隱藏欄位 -->
                <input
                  v-model="botField"
                  type="text"
                  name="user_note_extra"
                  tabindex="-1"
                  autocomplete="off"
                  class="hidden"
                />

                <!-- 分類切換標籤 -->
                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1.5">
                    回饋類別
                  </label>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      v-for="cat in categories"
                      :key="cat.id"
                      type="button"
                      :class="[
                        'flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer border',
                        category === cat.id
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      ]"
                      @click="category = cat.id"
                    >
                      <component :is="cat.icon" class="w-3.5 h-3.5 shrink-0" />
                      <span>{{ cat.label }}</span>
                    </button>
                  </div>
                </div>

                <!-- 相關城鎮/庇護所/對象 -->
                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1">
                    主旨
                  </label>
                  <input
                    v-model="target"
                    type="text"
                    placeholder="例如：Zubiri 公立庇護所、北方之路、裝備試算..."
                    class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <!-- 詳細內容 -->
                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1">
                    內容說明 <span class="text-rose-500">*</span>
                  </label>
                  <textarea
                    v-model="content"
                    rows="4"
                    required
                    :placeholder="categories.find(c => c.id === category)?.placeholder || '請輸入詳細內容...'"
                    class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none leading-relaxed"
                  />
                </div>

                <!-- 感謝回饋提示 -->
                <p class="text-sm text-slate-700 leading-relaxed">
                  感謝您的寶貴回饋與建議！
                </p>

                <!-- 錯誤訊息提示 -->
                <div v-if="errorMessage" class="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  <AlertCircle class="w-4 h-4 shrink-0" />
                  <span>{{ errorMessage }}</span>
                </div>

                <!-- 底部操作列 -->
                <div class="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    @click="closeFeedback"
                    class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="px-4 py-2 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
                    <span>{{ isSubmitting ? '傳送中...' : '送出' }}</span>
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
