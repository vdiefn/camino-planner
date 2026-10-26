<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ArrowUp } from 'lucide-vue-next'

const isVisible = ref(false)

const handleScroll = () => {
  isVisible.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-3 scale-90"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-3 scale-90"
  >
    <!-- 電腦與平板螢幕專用極簡懸浮圓鈕（手機螢幕隱藏，改由底部導覽列 Tab 點擊置頂） -->
    <button
      v-if="isVisible"
      type="button"
      @click="scrollToTop"
      class="hidden md:flex fixed bottom-8 right-8 z-30 h-11 w-11 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-600 shadow-md backdrop-blur-xs transition-all duration-200 hover:border-amber-400 hover:text-amber-600 hover:shadow-lg active:scale-95 cursor-pointer group"
      title="回到頂部"
      aria-label="回到頂部"
    >
      <ArrowUp class="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  </Transition>
</template>
