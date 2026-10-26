<script setup lang="ts">
import { ShieldCheck } from 'lucide-vue-next'
</script>

<template>
  <footer class="mt-auto border-t border-slate-200/60 bg-slate-50/80 pt-2.5 pb-20 md:pb-2.5 px-4 text-center">
    <div class="mx-auto max-w-[1440px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-[10px] sm:text-xs text-slate-400">
      <div class="flex items-center justify-center gap-1.5">
        <ShieldCheck class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <p class="leading-normal">
          <span>里程、海拔與住宿僅供規劃參考，</span>
          <span>路況與營業請以官方公告為準。</span>
        </p>
      </div>
      <span class="text-slate-300 hidden sm:inline">|</span>
      <router-link
        to="/privacy"
        target="_blank"
        class="text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors cursor-pointer shrink-0"
      >
        隱私權政策
      </router-link>
    </div>
  </footer>
</template>
