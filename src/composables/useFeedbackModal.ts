import { ref } from 'vue'

export type FeedbackCategory = 'feature_request' | 'data_correction' | 'bug_report' | 'general'

export interface FeedbackOpenOptions {
  category?: FeedbackCategory
  target?: string
}

const isOpen = ref(false)
const initialCategory = ref<FeedbackCategory>('feature_request')
const initialTarget = ref('')

export function useFeedbackModal() {
  const openFeedback = (options?: FeedbackOpenOptions) => {
    initialCategory.value = options?.category || 'feature_request'
    initialTarget.value = options?.target || ''
    isOpen.value = true
  }

  const closeFeedback = () => {
    isOpen.value = false
  }

  return {
    isOpen,
    initialCategory,
    initialTarget,
    openFeedback,
    closeFeedback
  }
}
