<script setup lang="ts">
import { ShieldCheck, ArrowLeft, ExternalLink, MessageSquare } from 'lucide-vue-next'
import { useFeedbackModal } from '@/composables/useFeedbackModal'

const { openFeedback } = useFeedbackModal()
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
    <!-- 頂部獨立標準導覽列（對齊主站統一規格） -->
    <header class="sticky top-0 z-40 h-14 sm:h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div class="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6">
        <!-- 品牌標誌 -->
        <router-link
          to="/"
          class="flex items-center gap-2.5 sm:gap-3 shrink-0 hover:opacity-85 transition-opacity"
        >
          <img
            src="/favicon.svg"
            alt="Camino Plan 標誌"
            width="36"
            height="36"
            class="h-8 w-8 sm:h-9 sm:w-9 shrink-0 drop-shadow-2xs"
          />
          <div>
            <span class="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900">
              Camino Plan
            </span>
          </div>
        </router-link>

        <!-- 右側返回規劃工具按鈕 -->
        <router-link
          to="/"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-2xs"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回規劃工具</span>
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
            <h1 class="text-xl sm:text-2xl font-bold text-slate-800">關於本站與隱私權政策</h1>
            <p class="text-xs text-slate-400 mt-0.5">最後更新日期：2026 年 11 月 5 日</p>
          </div>
        </div>

        <div class="mt-6 space-y-6 text-sm text-slate-600 leading-relaxed">
          <section class="space-y-2 rounded-xl bg-slate-50 ">
            <h2 class="text-base font-bold text-slate-800">關於 Camino Plan</h2>
            <p>
              Camino Plan 朝聖者規劃工具是專為「聖雅各朝聖之路（Camino de Santiago）」徒步者打造的免費規劃平台。有鑑於繁體中文朝聖資訊分散於各部落格，且徒步途中經常面臨「庇里牛斯山冬令封山改道、體力透支需臨時調整停留城鎮、背包超重、跨國轉乘資訊複雜」等問題，我們整合了官方地理里程、公立與私立庇護所清單及跨國鐵路巴士攻略，打造出這套可動態規劃的互動系統。
            </p>
            <p>
              本網站收錄法國之路（Camino Francés）、葡萄牙之路（中央線／海岸線／靈性變體）、北方之路（Camino del Norte）與世界盡頭延伸段（Finisterre &amp; Muxía），所有功能完全免費開放且免註冊即可使用。
            </p>
          </section>

          <section>
            <p>
              同時，本網站極度重視您的個人資料與隱私安全，特此制定以下隱私權政策，說明我們在資料保護、本機儲存與第三方廣告服務方面的運作方式。
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

          <section class="space-y-2.5">
            <h2 class="text-base font-bold text-slate-800">5. 聯絡與意見回饋</h2>
            <p>
              本站極度重視您的寶貴意見。若您對本隱私權政策有任何疑問、發現資訊有誤，或欲提出任何功能建議，歡迎直接透過線上聯絡系統與維護團隊聯繫：
            </p>
            <div class="pt-1 flex justify-end">
              <button
                type="button"
                @click="openFeedback({ category: 'general' })"
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200/80 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                <MessageSquare class="w-4 h-4" />
                <span>聯絡與回饋</span>
              </button>
            </div>
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
