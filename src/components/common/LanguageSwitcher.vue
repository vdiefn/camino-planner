<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Menu as HeadlessMenu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { Globe, Check } from 'lucide-vue-next'
import { setAppLocale, type SupportedLocale } from '@/i18n'

interface Props {
  mode?: 'dropdown' | 'inline'
}

withDefaults(defineProps<Props>(), {
  mode: 'dropdown',
})

const { locale } = useI18n()

const currentLocale = computed(() => locale.value as SupportedLocale)

const languages: { code: SupportedLocale; label: string; shortLabel: string }[] = [
  { code: 'zh-TW', label: '繁體中文', shortLabel: '中文' },
  { code: 'en', label: 'English', shortLabel: 'EN' },
]

function switchLocale(target: SupportedLocale) {
  setAppLocale(target)
}
</script>

<template>
  <!-- 模式一：下拉選單（適合桌面版與導覽列） -->
  <HeadlessMenu v-if="mode === 'dropdown'" as="div" class="relative inline-block text-left">
    <MenuButton
      class="flex h-9 items-center gap-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-amber-600 hover:bg-slate-50 transition-colors cursor-pointer"
      :title="$t('language.select')"
      :aria-label="$t('language.select')"
    >
      <Globe class="w-4 h-4 text-slate-500" />
      <span class="hidden sm:inline">
        {{ currentLocale === 'zh-TW' ? '繁中' : 'EN' }}
      </span>
    </MenuButton>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        class="absolute right-0 mt-2 w-36 origin-top-right divide-y divide-slate-100 rounded-xl bg-white p-1 shadow-lg border border-slate-200/90 focus:outline-hidden z-50"
      >
        <MenuItem
          v-for="lang in languages"
          :key="lang.code"
          v-slot="{ active }"
        >
          <button
            type="button"
            @click="switchLocale(lang.code)"
            :class="[
              active ? 'bg-amber-50 text-amber-700' : 'text-slate-700',
              currentLocale === lang.code ? 'font-semibold text-amber-700 bg-amber-50/50' : '',
              'w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer',
            ]"
          >
            <span>{{ lang.label }}</span>
            <Check v-if="currentLocale === lang.code" class="w-3.5 h-3.5 text-amber-600" />
          </button>
        </MenuItem>
      </MenuItems>
    </transition>
  </HeadlessMenu>

  <!-- 模式二：平鋪切換鈕（適合手機版抽屜選單） -->
  <div v-else class="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
    <button
      v-for="lang in languages"
      :key="lang.code"
      type="button"
      @click="switchLocale(lang.code)"
      :class="[
        'flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all text-center cursor-pointer',
        currentLocale === lang.code
          ? 'bg-white text-slate-800 shadow-xs font-semibold'
          : 'text-slate-500 hover:text-slate-800',
      ]"
    >
      {{ lang.label }}
    </button>
  </div>
</template>
