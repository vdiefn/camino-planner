<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'
import {
  X,
  Sparkles,
  Home,
  Bug,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-vue-next'
import { useFeedbackModal, type FeedbackCategory } from '@/composables/useFeedbackModal'

const { t } = useI18n()
const { isOpen, initialCategory, initialTarget, closeFeedback } = useFeedbackModal()

const category = ref<FeedbackCategory>('feature_request')
const target = ref('')
const content = ref('')
const botField = ref('') // 蜜罐欄位 (隱形)

const isSubmitting = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')
let submitController: AbortController | null = null

// 當彈窗關閉時中止未完成請求，開啟時同步初始參數
watch(isOpen, (newVal) => {
  if (!newVal) {
    submitController?.abort()
    submitController = null
    return
  }
  category.value = initialCategory.value
  target.value = initialTarget.value
  content.value = ''
  botField.value = ''
  isSubmitting.value = false
  isSuccess.value = false
  errorMessage.value = ''
})

onUnmounted(() => {
  submitController?.abort()
  submitController = null
})

const categories = computed<
  { id: FeedbackCategory; label: string; icon: any; placeholder: string }[]
>(() => [
  {
    id: 'feature_request',
    label: t('feedback.categories.featureRequest'),
    icon: Sparkles,
    placeholder: t('feedback.placeholders.featureRequest'),
  },
  {
    id: 'data_correction',
    label: t('feedback.categories.dataCorrection'),
    icon: Home,
    placeholder: t('feedback.placeholders.dataCorrection'),
  },
  {
    id: 'bug_report',
    label: t('feedback.categories.bugReport'),
    icon: Bug,
    placeholder: t('feedback.placeholders.bugReport'),
  },
  {
    id: 'general',
    label: t('feedback.categories.general'),
    icon: MessageCircle,
    placeholder: t('feedback.placeholders.general'),
  },
])

async function handleSubmit() {
  if (!content.value.trim()) {
    errorMessage.value = t('feedback.requiredError')
    return
  }

  submitController?.abort()
  const controller = new AbortController()
  submitController = controller

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        category: category.value,
        target: target.value.trim(),
        content: content.value.trim(),
        botField: botField.value,
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (res.ok && data.success) {
      isSuccess.value = true
    } else {
      errorMessage.value = data.error || t('feedback.failedError')
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return
    console.error('送出回饋失敗:', err)
    errorMessage.value = t('feedback.networkError')
  } finally {
    if (submitController === controller) {
      submitController = null
      isSubmitting.value = false
    }
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
                <DialogTitle as="h3" class="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <MessageCircle class="w-5 h-5 text-amber-500" />
                  <span>{{ t('feedback.title') }}</span>
                </DialogTitle>
                <button
                  type="button"
                  @click="closeFeedback"
                  class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                  aria-label="Close"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <!-- 成功狀態畫面 -->
              <div v-if="isSuccess" class="py-4 space-y-4">
                <div class="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div class="flex items-center gap-2.5">
                    <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
                    <h4 class="text-sm sm:text-base font-bold text-slate-900">
                      {{ t('feedback.successTitle') }}
                    </h4>
                  </div>
                  <p class="text-xs sm:text-sm text-slate-600 leading-relaxed pl-7.5">
                    {{ t('feedback.successDesc') }}
                  </p>
                </div>

                <!-- 底部操作列：與表單送出按鈕位置一致，視覺更和諧 -->
                <div class="pt-2 flex items-center justify-end border-t border-slate-100">
                  <button
                    type="button"
                    @click="closeFeedback"
                    class="px-5 py-2 text-xs sm:text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    {{ t('feedback.finishBtn') }}
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
                  <label class="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    {{ t('feedback.categoryLabel') }}
                  </label>
                  <div class="grid grid-cols-2 gap-2.5">
                    <button
                      v-for="cat in categories"
                      :key="cat.id"
                      type="button"
                      :class="[
                        'flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer border',
                        category === cat.id
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
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
                  <label class="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                    {{ t('feedback.targetLabel') }}
                  </label>
                  <input
                    v-model="target"
                    type="text"
                    :placeholder="t('feedback.targetPlaceholder')"
                    class="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <!-- 詳細內容 -->
                <div>
                  <label class="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                    {{ t('feedback.contentLabel') }} <span class="text-rose-500">*</span>
                  </label>
                  <textarea
                    v-model="content"
                    rows="4"
                    required
                    :placeholder="categories.find((c) => c.id === category)?.placeholder || t('feedback.placeholders.default')"
                    class="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none leading-relaxed"
                  />
                </div>

                <!-- 感謝回饋提示 -->
                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {{ t('feedback.thankYou') }}
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
                    class="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    {{ t('feedback.cancelBtn') }}
                  </button>
                  <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
                    <span>{{ isSubmitting ? t('feedback.submittingBtn') : t('feedback.submitBtn') }}</span>
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
