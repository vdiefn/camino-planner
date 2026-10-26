<script setup lang="ts">
import { ShieldCheck, ArrowLeft, ExternalLink } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
    <!-- 頂部精簡導覽列 -->
    <header class="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div class="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
        <router-link
          to="/"
          class="flex items-center gap-2 text-slate-800 transition-colors"
        >
          <img src="/favicon.svg" alt="Logo" class="w-6 h-6" />
          <span class="font-bold text-sm sm:text-base">Camino Plan</span>
        </router-link>
        <router-link
          to="/"
          class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          返回規劃工具
        </router-link>
      </div>
    </header>

    <!-- 隱私權政策主體內容 -->
    <main class="flex-1 py-8 sm:py-12 px-4 sm:px-6">
      <article class="mx-auto max-w-3xl rounded-2xl bg-white p-6 sm:p-10 shadow-xs border border-slate-200/60">
        <div class="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div class="p-2 rounded-xl text-emerald-600">
            <ShieldCheck class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-800">隱私權政策</h1>
            <p class="text-xs text-slate-400 mt-0.5">最後更新日期：2026 年 10 月 26 日</p>
          </div>
        </div>

        <div class="mt-6 space-y-6 text-sm text-slate-600 leading-relaxed">
          <section>
            <p>
              歡迎使用 <strong>Camino Plan 朝聖者智慧規劃工具</strong>（以下簡稱「本網站」）。本網站極度重視您的隱私，特此制定本政策，說明我們在資料隱私、本地儲存與第三方廣告方面的運作方式。
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-base font-bold text-slate-800">1. 本機資料儲存與隱私保護</h2>
            <p>
              本網站為現代化純前端應用工具：
            </p>
            <ul class="list-disc pl-5 space-y-1">
              <li>本網站不會在伺服器端收集或儲存您的任何敏感個人資料（如姓名、電子郵件、密碼或定位紀錄）。</li>
              <li>您所規劃的朝聖路線、自訂停留城鎮、每日公里數以及裝備清單的勾選進度，均僅儲存在您所使用的裝置瀏覽器（Local Storage）中。</li>
              <li>若您使用「跨裝置同步與備份」功能，資料會經由 URL Hash 加密編碼，僅在您主動分享或開啟該專屬連結時進行本機解碼還原。</li>
            </ul>
          </section>

          <section class="space-y-2">
            <h2 class="text-base font-bold text-slate-800">2. Google AdSense 與廣告 Cookie 規範</h2>
            <p>
              為維持本網站伺服器與網域名稱之維護營運，本網站整合了 Google AdSense 廣告服務。在瀏覽過程中，第三方供應商會使用 Cookie：
            </p>
            <ul class="list-disc pl-5 space-y-1.5">
              <li>第三方供應商（包括 Google）會根據使用者造訪本網站或網路上其他網站的歷史瀏覽紀錄，使用 Cookie 投放相關廣告。</li>
              <li>Google 使用廣告 Cookie 的機制，使 Google 及其合作夥伴能依據使用者造訪本網站及/或網路上其他網站的資訊，向使用者放送符合興趣的廣告內容。</li>
              <li>
                使用者可隨時前往
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-emerald-600 hover:underline inline-flex items-center gap-0.5"
                >
                  Google 廣告設定 (Google Ads Settings)
                  <ExternalLink class="w-3.5 h-3.5" />
                </a>
                ，隨時停用個人化廣告功能。
              </li>
              <li>
                您亦可造訪
                <a
                  href="https://www.aboutads.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-emerald-600 hover:underline inline-flex items-center gap-0.5"
                >
                  www.aboutads.info
                  <ExternalLink class="w-3.5 h-3.5" />
                </a>
                ，選擇停用部分第三方廠商為提供個人化廣告所使用的 Cookie。
              </li>
            </ul>
          </section>

          <section class="space-y-2">
            <h2 class="text-base font-bold text-slate-800">3. 第三方連結與免責聲明</h2>
            <p>
              本網站內可能包含連往第三方交通公司（如 Renfe、ALSA）、朝聖住宿（如 Gronze、Booking.com）或官方朝聖者辦公室的外部超連結。本網站無法對該等外部網站之隱私政策與內容承擔責任，請在造訪外部網站時詳閱其專屬條款。
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-base font-bold text-slate-800">4. 政策修訂與生效</h2>
            <p>
              本隱私權政策得因應法規變動或網站服務內容調整而不定期修正。任何條款更新均會直接發布於此網頁並更新生效日期。
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="text-base font-bold text-slate-800">5. 聯絡與意見回饋</h2>
            <p>
              若您對本隱私權政策有任何疑問，或欲回報任何隱私相關問題，歡迎透過本工具頁首之「意見回饋」系統與開發團隊聯繫。
            </p>
          </section>
        </div>
      </article>
    </main>

    <!-- 底部精簡版權資訊 -->
    <footer class="border-t border-slate-200/60 bg-white/50 py-4 text-center text-xs text-slate-400">
      <p>© {{ new Date().getFullYear() }} Camino Plan. All rights reserved.</p>
    </footer>
  </div>
</template>
