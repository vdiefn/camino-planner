<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, DialogPanel, DialogTitle, Switch } from '@headlessui/vue'
import { PlusCircle, X } from 'lucide-vue-next'
import type { PackingCategory, PackingPriority } from '@/types/camino'

interface Props {
  isOpen: boolean
}

defineProps<Props>()
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
const formEnglishName = ref('')
const formSpanishName = ref('')
const formCategory = ref<PackingCategory>('OTHER')
const formWeightGrams = ref<number>(100)
const formQuantity = ref<number>(1)
const formIsWornOnBody = ref(false)

const categoryOptions: { label: string; value: PackingCategory }[] = [
  { label: '背包系統', value: 'PACK' },
  { label: '服飾穿搭', value: 'CLOTHING' },
  { label: '鞋襪足部', value: 'FOOTWEAR' },
  { label: '睡眠防護', value: 'SLEEP' },
  { label: '衛浴清潔', value: 'HYGIENE' },
  { label: '醫藥防蟲', value: 'MEDICAL' },
  { label: '電子用品', value: 'ELECTRONICS' },
  { label: '證件', value: 'DOCS' },
  { label: '其他', value: 'OTHER' },
]

function handleSubmit() {
  if (!formName.value.trim()) return

  emit('add', {
    chineseName: formName.value.trim(),
    englishName: formEnglishName.value.trim() || formName.value.trim(),
    spanishName: formSpanishName.value.trim() || undefined,
    category: formCategory.value,
    priority: 'OPTIONAL',
    referenceRangeText: `${formWeightGrams.value}g`,
    isChecked: true,
    unitWeightGrams: Math.max(0, formWeightGrams.value),
    quantity: Math.max(1, formQuantity.value),
    isWornOnBody: formIsWornOnBody.value,
  })

  // 重設表單
  formName.value = ''
  formEnglishName.value = ''
  formSpanishName.value = ''
  formCategory.value = 'OTHER'
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
            <PlusCircle class="h-5 w-5" />
            <DialogTitle class="text-base text-slate-900">
              新增自訂裝備
            </DialogTitle>
          </div>
          <button
            type="button"
            class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            @click="emit('close')"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <form class="space-y-3.5 text-xs" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-slate-700">裝備名稱 (中文必填)</label>
            <input
              v-model="formName"
              type="text"
              placeholder="例如：相機腳架、超輕折疊傘"
              required
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label class="block text-slate-700">英文品名 (選填)</label>
            <input
              v-model="formEnglishName"
              type="text"
              placeholder="例如：Camera Tripod"
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label class="block text-slate-700">西班牙文品名 (選填)</label>
            <input
              v-model="formSpanishName"
              type="text"
              placeholder="例如：Trípode"
              class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label class="block text-slate-700">所屬裝備分類</label>
            <select
              v-model="formCategory"
              class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:outline-hidden"
            >
              <option v-for="cat in categoryOptions" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-700">單件實測重量 (克)</label>
              <input
                v-model.number="formWeightGrams"
                type="number"
                min="0"
                step="5"
                required
                class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label class="block text-slate-700">數量</label>
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
              <div class="text-slate-800">當天穿戴在身上？</div>
              <div class="text-[11px] text-slate-500">勾選後將不計入背包淨負重</div>
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
              取消
            </button>
            <button
              type="submit"
              class="rounded-xl bg-orange-400 hover:bg-orange-100 text-white hover:text-gray-900 px-4 py-2 text-sm shadow-xs transition-all cursor-pointer"
            >
              確認加入
            </button>
          </div>
        </form>
      </DialogPanel>
    </div>
  </Dialog>
</template>
