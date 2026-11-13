<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Dialog, DialogPanel, DialogTitle, Switch } from '@headlessui/vue'
import { X } from 'lucide-vue-next'
import type { PackingCategory, PackingPriority } from '@/types/camino'

interface Props {
  isOpen: boolean
  customCategories?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  customCategories: () => [],
})

const { t, locale } = useI18n()

const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'add',
    item: {
      chineseName: string
      englishName: string
      spanishName?: string
      category: PackingCategory
      priority: PackingPriority
      referenceRangeText: string
      isChecked: boolean
      unitWeightGrams: number
      quantity: number
      isWornOnBody: boolean
    },
  ): void
}>()

const formName = ref('')
const selectedCategoryOption = ref<string>('OTHER')
const customCategoryInput = ref('')
const formWeightGrams = ref<number>(100)
const formQuantity = ref<number>(1)
const formIsWornOnBody = ref(false)

const officialCategoryOptions = computed(() => [
  { label: t('packing.categories.PACK'), value: 'PACK' as PackingCategory },
  { label: t('packing.categories.CLOTHING'), value: 'CLOTHING' as PackingCategory },
  { label: t('packing.categories.FOOTWEAR'), value: 'FOOTWEAR' as PackingCategory },
  { label: t('packing.categories.SLEEP'), value: 'SLEEP' as PackingCategory },
  { label: t('packing.categories.HYGIENE'), value: 'HYGIENE' as PackingCategory },
  { label: t('packing.categories.MEDICAL'), value: 'MEDICAL' as PackingCategory },
  { label: t('packing.categories.ELECTRONICS'), value: 'ELECTRONICS' as PackingCategory },
  { label: t('packing.categories.DOCS'), value: 'DOCS' as PackingCategory },
  { label: t('packing.categories.GEAR'), value: 'GEAR' as PackingCategory },
  { label: t('packing.categories.OTHER'), value: 'OTHER' as PackingCategory },
])

function handleSubmit() {
  if (!formName.value.trim()) return

  let resolvedCategory: PackingCategory = selectedCategoryOption.value as PackingCategory

  if (selectedCategoryOption.value === '__NEW_CATEGORY__') {
    const trimmed = customCategoryInput.value.trim()
    if (!trimmed) {
      resolvedCategory = 'OTHER'
    } else {
      // 正規化：若使用者手動輸入官方分類標籤或代碼，自動對齊為官方代碼
      const matched = officialCategoryOptions.value.find(
        (opt) => opt.label === trimmed || opt.value.toUpperCase() === trimmed.toUpperCase(),
      )
      resolvedCategory = matched ? matched.value : trimmed
    }
  }

  const nameVal = formName.value.trim()

  emit('add', {
    chineseName: nameVal,
    englishName: nameVal,
    spanishName: undefined,
    category: resolvedCategory,
    priority: 'OPTIONAL',
    referenceRangeText: '',
    isChecked: true,
    unitWeightGrams: Math.max(0, formWeightGrams.value),
    quantity: Math.max(1, formQuantity.value),
    isWornOnBody: formIsWornOnBody.value,
  })

  // 重設表單
  formName.value = ''
  selectedCategoryOption.value = 'OTHER'
  customCategoryInput.value = ''
  formWeightGrams.value = 100
  formQuantity.value = 1
  formIsWornOnBody.value = false
  emit('close')
}
</script>

<template>
  <Dialog :open="isOpen" class="relative z-50" @close="emit('close')">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" aria-hidden="true" />

    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-amber-600">
            <DialogTitle class="text-lg text-slate-900">
              {{ t('packing.addCustomModal.title') }}
            </DialogTitle>
          </div>
          <button
            type="button"
            class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            @click="emit('close')"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <form class="space-y-3.5 text-xs" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-slate-700">{{ t('packing.addCustomModal.name') }}</label>
            <input
              v-model="formName"
              type="text"
              :placeholder="t('packing.addCustomModal.namePlaceholder')"
              required
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label class="block text-slate-700">{{ t('packing.addCustomModal.category') }}</label>
            <select
              v-model="selectedCategoryOption"
              class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-hidden"
            >
              <optgroup :label="locale === 'en' ? 'Official Categories' : '官方分類'">
                <option v-for="cat in officialCategoryOptions" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
              </optgroup>
              <optgroup v-if="props.customCategories.length > 0" :label="locale === 'en' ? 'Custom Categories' : '已建立的自訂分類'">
                <option v-for="cat in props.customCategories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </optgroup>
              <option value="__NEW_CATEGORY__">{{ t('packing.addCustomModal.newCategory') }}</option>
            </select>

            <input
              v-if="selectedCategoryOption === '__NEW_CATEGORY__'"
              v-model="customCategoryInput"
              type="text"
              :placeholder="t('packing.addCustomModal.newCategoryPlaceholder')"
              required
              class="mt-2 w-full rounded-xl border border-amber-300 bg-amber-50/50 px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700">{{ t('packing.addCustomModal.weight') }}</label>
              <input
                v-model.number="formWeightGrams"
                type="number"
                min="0"
                step="1"
                required
                class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label class="block text-slate-700">{{ t('packing.addCustomModal.quantity') }}</label>
              <input
                v-model.number="formQuantity"
                type="number"
                min="1"
                required
                class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div class="flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <div>
              <div class="text-slate-800">{{ t('packing.addCustomModal.wornOption') }}</div>
              <div class="text-[11px] text-slate-500">
                {{ locale === 'en' ? 'Excluded from pack net weight' : '勾選後將不計入背包淨負重' }}
              </div>
            </div>
            <Switch
              v-model="formIsWornOnBody"
              :class="[
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden',
                formIsWornOnBody ? 'bg-emerald-500' : 'bg-slate-300',
              ]"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                  formIsWornOnBody ? 'translate-x-5' : 'translate-x-0',
                ]"
              />
            </Switch>
          </div>

          <div class="mt-4 flex justify-end gap-2 pt-2">
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              @click="emit('close')"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="rounded-xl bg-orange-400 hover:bg-orange-100 text-white hover:text-gray-900 px-4 py-2 text-sm shadow-xs transition-all cursor-pointer"
            >
              {{ t('packing.addCustomModal.confirm') }}
            </button>
          </div>
        </form>
      </DialogPanel>
    </div>
  </Dialog>
</template>
