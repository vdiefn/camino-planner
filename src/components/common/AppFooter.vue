<script setup lang="ts">
import { ShieldCheck } from 'lucide-vue-next'
</script>

<template>
  <footer class="mt-auto border-t border-slate-200/60 bg-slate-50/80 pt-2.5 pb-20 md:pb-2.5 px-4 text-center">
    <div class="mx-auto max-w-[1440px] flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-slate-400">
      <ShieldCheck class="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <p class="leading-normal">
        <span class="inline-block">里程、海拔與住宿僅供規劃參考，</span>
        <span class="inline-block">路況與營業請以官方公告為準。</span>
      </p>
    </div>
  </footer>
</template>
