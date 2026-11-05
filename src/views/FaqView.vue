<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  HelpCircle,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Milestone,
} from 'lucide-vue-next'
import type { RouteId } from '@/types/route'
import { FAQ_CATEGORIES, getAllFaqs, type FaqCategoryId } from '@/data/faqs'

// 主頁籤：'faq' (常見問題) | 'routes' (歷史與路線攻略)
const activeFaqTab = ref<'faq' | 'routes'>('faq')

// 常見問題之分類篩選狀態（預設為全部 'all'）
const selectedCategoryId = ref<FaqCategoryId>('all')

// 總題目數量
const totalFaqCount = computed(() => getAllFaqs().length)

// 依選定之分類計算欲展示之常見問題分組
const displayedCategories = computed(() => {
  if (selectedCategoryId.value === 'all') {
    return FAQ_CATEGORIES
  }
  return FAQ_CATEGORIES.filter((category) => category.id === selectedCategoryId.value)
})

// 路線分頁標籤（法國之路、葡萄牙之路、北方之路）
const activeRouteTab = ref<RouteId>('frances')

const routesData = [
  { id: 'frances' as RouteId, name: '法國之路 (Camino Francés)', flag: '🇫🇷' },
  { id: 'portugues' as RouteId, name: '葡萄牙之路 (Camino Portugués)', flag: '🇵🇹' },
  { id: 'norte' as RouteId, name: '北方之路 (Camino del Norte)', flag: '🌊' },
]

const routeGuide = computed(() => {
  if (activeRouteTab.value === 'portugues') {
    return {
      title: '葡萄牙之路（Camino Portugués）：中央線與大西洋海岸線實戰指南',
      summary:
        '葡萄牙之路是熱門度僅次於法國之路的經典路線。自世界文化遺產波多（Porto）出發，徒步者可選擇綠意盎然的「內陸中央線（約 242.7km）」或緊鄰大西洋海浪與木棧道的「海岸線（約 270.9km）」，兩線於西班牙雷東德拉（Redondela）匯合後北上聖地牙哥。',
      points: [
        {
          title: '波多出城地鐵接駁建議',
          paragraphs: [
            '波多主教座堂出城前 10 公里多為高車流量工業區與硬石板路，對膝關節與腳掌衝擊較大。',
            '推薦自市中心搭乘波多輕軌藍線（Metro A）至 Matosinhos Sul 站作為實質起點，出站即可無縫銜接平坦開闊的大西洋濱海木棧道。',
          ],
        },
        {
          title: '中央線 vs. 海岸線特色比較',
          paragraphs: [
            '中央線途經巴塞盧什（Barcelos）與蓬特迪利馬（Ponte de Lima），古羅馬石橋與葡萄園景觀豐富、庇護所密度高，文化氛圍濃厚。',
            '海岸線則海風涼爽、坡度平緩，需在 Caminha 搭乘跨國渡輪或計程快艇橫渡米尼奧河進入西班牙。',
          ],
        },
        {
          title: '跨國時差注意提醒',
          paragraphs: [
            '從葡萄牙跨入西班牙加利西亞自治區時，務必將手錶與手機時間「調快 1 小時」（葡萄牙為 UTC+0，西班牙為 UTC+1）。',
            '提前調整時間可避免錯過公立庇護所下午的開門登記時間或沿途餐廳供餐時段。',
          ],
        },
      ],
    }
  }

  if (activeRouteTab.value === 'norte') {
    return {
      title: '北方之路（Camino del Norte）：坎塔布里亞海懸崖與山海長征指南',
      summary:
        '北方之路自法西邊境伊倫（Irún）出發，沿著比斯開灣蜿蜒向西，途經聖塞巴斯提安、畢爾包、桑坦德等名城，全長超過 820 公里，是沿途景觀最壯闊但也最考驗體能的長征路線。',
      points: [
        {
          title: '巴斯克海岸的地形考驗',
          paragraphs: [
            '北方之路前段地形宛如鋸齒，每日需翻越濱海山丘與陡降坡道，累計爬升顯著高於法國之路。',
            '建議出發前一週將日均公里數壓在 18 至 22 公里內，並務必攜帶雙登山杖輔助下坡減震。',
          ],
        },
        {
          title: '古老渡船接駁點',
          paragraphs: [
            '沿途保留了 Pasaia 海灣接駁小艇、Portugalete 世界遺產運河吊橋及 Somo 至桑坦德渡輪等傳統航線。',
            '規劃每日分段時應預先查詢末班船營運時間與天候潮汐限制。',
          ],
        },
        {
          title: '夏季旺季住宿提前規劃',
          paragraphs: [
            '7 至 8 月為西班牙北部海濱度假熱潮，濱海小鎮私立旅宿極易客滿且房價偏高。',
            '旺季徒步建議提前 1 至 2 天確認床位，或考慮彈性入住內陸小鎮。',
          ],
        },
      ],
    }
  }

  return {
    title: '法國之路（Camino Francés）：橫跨庇里牛斯山至聖地牙哥千年經典指南',
    summary:
      '法國之路自法國境內的聖讓皮耶德波爾（SJPP）啟程，翻越高山進入納瓦拉、拉里奧哈酒鄉、梅塞塔高原與加利西亞森林，全長約 779 公里（官方建議 33 至 35 天）。若時間有限，亦可自最後 114 公里的薩里亞（Sarria）起步。',
    points: [
      {
        title: '第一天的拿破崙越嶺線安全守則',
        paragraphs: [
          '首日自 SJPP 至 Roncesvalles 需翻越 1,250 公尺爬升，體力消耗極大。',
          '每年 11/1 至隔年 3/31 法國官方強制封閉高空拿破崙之路（防範暴風雪失溫），冬季請務必改走低海拔的 Valcarlos 谷道路線。',
        ],
      },
      {
        title: '三大地貌轉換的心態調適',
        paragraphs: [
          '前段山林起伏、中段梅塞塔高原（Meseta）長達 200 公里考驗防曬補水與耐力、後段加利西亞綠蔭如畫。',
          '合理分配體能與每日配速，不急於趕路，是笑著走完全程的核心心法。',
        ],
      },
      {
        title: '世界盡頭（Finisterre & Muxía）延伸線',
        paragraphs: [
          '抵達聖地牙哥大教堂後，可繼續向西步行 3 至 4 天（約 89 至 118 公里）抵達古羅馬世界的盡頭菲尼斯特雷燈塔與穆希亞聖殿。',
          '在兩地可分別領取專屬的 Fisterrana 與 Muxiana 朝聖雙證書。',
        ],
      },
    ],
  }
})

// 動態注入 FAQPage Schema.org 結構化資料
onMounted(() => {
  if (typeof document === 'undefined') return
  const existingScript = document.head.querySelector('#faq-schema-jsonld')
  if (existingScript) existingScript.remove()

  const allFaqs = getAllFaqs()
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.paragraphs.join(' '),
      },
    })),
  }

  const script = document.createElement('script')
  script.id = 'faq-schema-jsonld'
  script.type = 'application/ld+json'
  script.text = JSON.stringify(schemaData)
  document.head.appendChild(script)
})

// 元件卸載時主動清理動態注入的 Schema 標籤，杜絕全域 Head 污染
onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.head.querySelector('#faq-schema-jsonld')?.remove()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
    <!-- 頂部獨立標準導覽列（對齊主站統一規格） -->
    <header class="sticky top-0 z-40 h-14 sm:h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div class="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6">
        <!-- 品牌標誌 -->
        <router-link to="/" class="flex items-center gap-2.5 sm:gap-3 shrink-0 hover:opacity-85 transition-opacity">
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

    <!-- 主體內容 -->
    <main class="flex-1 py-8 sm:py-12 px-4 sm:px-6">
      <div class="mx-auto max-w-4xl space-y-8">
        <!-- 頁面標題與主分類切換區 -->
        <div class="text-center space-y-3">
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            朝聖之路指南與常見問題 (FAQ)
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 max-w-3xl mx-auto leading-relaxed px-2">
            專為聖雅各朝聖之路（Camino de Santiago）徒步者整理的知識指南，涵蓋歷史淵源、三大經典路線深度攻略與各項行前實戰問答。
          </p>

          <!-- 頂部大分頁切換：徹底分開「常見問題」與「歷史與路線」 -->
          <div class="inline-flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl text-xs sm:text-sm font-medium mt-1 shadow-2xs">
            <button
              type="button"
              @click="activeFaqTab = 'faq'"
              class="px-4 sm:px-6 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              :class="[
                activeFaqTab === 'faq'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900',
              ]"
            >
              <HelpCircle class="w-4 h-4 text-emerald-600" />
              <span>常見問題 FAQ</span>
            </button>
            <button
              type="button"
              @click="activeFaqTab = 'routes'"
              class="px-4 sm:px-6 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              :class="[
                activeFaqTab === 'routes'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900',
              ]"
            >
              <BookOpen class="w-4 h-4 text-amber-500" />
              <span>歷史背景與路線攻略</span>
            </button>
          </div>
        </div>

        <!-- 區塊 A：常見問題 FAQ（單一清爽面板呈現，支援分類快速篩選） -->
        <div v-if="activeFaqTab === 'faq'" class="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-8 shadow-xs space-y-6">
          <!-- 分類篩選膠囊標籤列（消滅灰色捲軸、電腦版自動折行、字數精簡） -->
          <div class="flex items-center gap-1.5 overflow-x-auto sm:flex-wrap pb-1.5 -mx-1 px-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-slate-100">
            <button
              type="button"
              @click="selectedCategoryId = 'all'"
              class="inline-flex shrink-0 items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs transition-all cursor-pointer border"
              :class="[
                selectedCategoryId === 'all'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-medium'
                  : 'bg-slate-100/90 text-slate-600 border-slate-200/80 hover:bg-slate-200/80 hover:text-slate-900',
              ]"
            >
              <span>全部</span>
              <span
                class="px-1.5 py-0.2 rounded-full text-[10px]"
                :class="selectedCategoryId === 'all' ? 'bg-emerald-700/90 text-white' : 'bg-slate-200 text-slate-600'"
              >
                {{ totalFaqCount }}
              </span>
            </button>

            <button
              v-for="cat in FAQ_CATEGORIES"
              :key="cat.id"
              type="button"
              @click="selectedCategoryId = cat.id"
              class="inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs transition-all cursor-pointer border"
              :class="[
                selectedCategoryId === cat.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-medium'
                  : 'bg-slate-100/90 text-slate-600 border-slate-200/80 hover:bg-slate-200/80 hover:text-slate-900',
              ]"
            >
              <span>{{ cat.name }}</span>
              <span
                class="px-1.5 py-0.2 rounded-full text-[10px]"
                :class="selectedCategoryId === cat.id ? 'bg-emerald-700/90 text-white' : 'bg-slate-200 text-slate-600'"
              >
                {{ cat.faqs.length }}
              </span>
            </button>
          </div>

          <!-- 分類問題列表 -->
          <div class="space-y-8 pt-2">
            <section
              v-for="(cat, cIdx) in displayedCategories"
              :key="cat.id"
              :class="[cIdx > 0 ? 'pt-6 border-t border-slate-100' : '']"
              class="space-y-3.5"
            >
              <!-- 簡潔分類小標題 -->
              <div class="flex items-center gap-2 text-slate-900">
                <component :is="cat.icon" class="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <h2 class="text-base sm:text-lg font-bold">{{ cat.name }}</h2>
                <span
                  v-if="cat.badge"
                  class="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800"
                >
                  {{ cat.badge }}
                </span>
              </div>

              <!-- 問題列表手風琴 -->
              <div class="space-y-2.5">
                <details
                  v-for="faq in cat.faqs"
                  :key="faq.id"
                  class="group rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50/80"
                >
                  <summary class="flex cursor-pointer list-none items-start justify-between gap-3 text-xs sm:text-sm font-bold text-slate-800 select-none">
                    <span class="leading-snug">{{ faq.question }}</span>
                    <span class="mt-0.5 shrink-0 rounded-md bg-white border border-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-500 group-open:bg-emerald-50 group-open:text-emerald-700 group-open:border-emerald-200">
                      展開
                    </span>
                  </summary>

                  <!-- 解答內容依照重點獨立分段 -->
                  <div class="mt-3 pt-3 border-t border-slate-200/60 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
                    <p v-for="(para, pIdx) in faq.paragraphs" :key="pIdx">
                      {{ para }}
                    </p>
                  </div>
                </details>
              </div>
            </section>
          </div>
        </div>

        <!-- 區塊 B：朝聖之路歷史淵源與三大路線深度攻略 -->
        <div v-else class="space-y-8">
          <!-- 1. 朝聖之路的由來與歷史背景 -->
          <article class="rounded-2xl bg-white border border-slate-200 p-5 sm:p-8 shadow-xs space-y-5">
            <div class="flex items-center gap-2 text-amber-700">
              <Sparkles class="w-5 h-5 text-amber-500" />
              <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                朝聖之路的由來與歷史背景
              </h2>
            </div>

            <p class="text-sm text-slate-600 leading-relaxed">
              聖雅各朝聖之路（Camino de Santiago）是歐洲最具歷史與文化意涵的千年古道。它並非單一道路，而是一張由歐洲各地向西班牙西北端「聖地牙哥德孔波斯特拉（Santiago de Compostela）」匯聚的龐大步行網絡。
            </p>

            <!-- 歷史小卡片：字體放大、適度分段、移除 icon -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div class="rounded-xl bg-slate-50/80 border border-slate-200/70 p-5 space-y-2.5">
                <h3 class="font-bold text-base text-slate-900">
                  繁星原野與聖骨發現（西元 9 世紀）
                </h3>
                <div class="text-sm text-slate-600 leading-relaxed space-y-2">
                  <p>
                    相傳耶穌十二門徒之一的聖雅各（Saint James / Santiago）曾遠赴伊比利半島傳教，殉道後遺體由弟子以石船運回加利西亞安葬。
                  </p>
                  <p>
                    西元 814 年，隱士裴拉約（Pelayo）受天空中奇異繁星指引，在森林深處發現了被遺忘的聖骸。該地隨即被稱為「Campus Stellae（繁星原野）」，演化為今日著名的聖城地名 Compostela。
                  </p>
                </div>
              </div>

              <div class="rounded-xl bg-slate-50/80 border border-slate-200/70 p-5 space-y-2.5">
                <h3 class="font-bold text-base text-slate-900">
                  第一位朝聖者與原始之路
                </h3>
                <div class="text-sm text-slate-600 leading-relaxed space-y-2">
                  <p>
                    當時的阿斯圖里亞斯國王阿方索二世（Alfonso II）獲知神蹟後，親自率隊自首都奧維耶多（Oviedo）徒步翻山越嶺前往確認，成為歷史記載中的「第一位朝聖者」。
                  </p>
                  <p>
                    阿方索二世下令在墓地上建造第一座聖堂，他當年所開闢出的險峻山徑，就是現今保存最古老、難度極高的「原始之路（Camino Primitivo）」。
                  </p>
                </div>
              </div>

              <div class="rounded-xl bg-slate-50/80 border border-slate-200/70 p-5 space-y-2.5">
                <h3 class="font-bold text-base text-slate-900">
                  中世紀的歐洲信仰高潮
                </h3>
                <div class="text-sm text-slate-600 leading-relaxed space-y-2">
                  <p>
                    11 至 13 世紀，朝聖之路與羅馬、耶路撒冷並列中世紀三大天主教朝聖地。來自法國、英國、德國與義大利的數百萬徒步者穿越庇里牛斯山來到大教堂祈求赦罪與心靈淨化。
                  </p>
                  <p>
                    教宗卡利克斯特二世頒布的聖年特權，以及史上第一本旅行指南《加理斯都聖書（Codex Calixtinus）》，更奠定了法國之路的黃金地位。
                  </p>
                </div>
              </div>

              <div class="rounded-xl bg-slate-50/80 border border-slate-200/70 p-5 space-y-2.5">
                <h3 class="font-bold text-base text-slate-900">
                  現代轉型：世界遺產與跨文化追尋
                </h3>
                <div class="text-sm text-slate-600 leading-relaxed space-y-2">
                  <p>
                    1987 年，歐洲理事會將朝聖之路指定為首條「歐洲文化路線」；1993 年正式登錄 UNESCO 世界文化遺產。
                  </p>
                  <p>
                    現代徒步者已不僅為了宗教信仰而行，更多是為了放下日常的焦慮繁忙，透過每日純粹的雙腳前行，在漫長的沉思時光中重整身心、尋找人生方向。
                  </p>
                </div>
              </div>
            </div>
          </article>

          <!-- 2. 三大經典路線深度指南 -->
          <section class="rounded-2xl bg-white border border-slate-200 p-5 sm:p-8 shadow-xs space-y-5">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Milestone class="w-5 h-5 text-amber-500" />
                <span>三大熱門路線深度剖析</span>
              </h2>

              <!-- 路線切換分頁標籤 -->
              <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  v-for="r in routesData"
                  :key="r.id"
                  type="button"
                  @click="activeRouteTab = r.id"
                  class="px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium"
                  :class="[
                    activeRouteTab === r.id
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800',
                  ]"
                >
                  <span>{{ r.flag }} {{ r.name.split(' ')[0] }}</span>
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <h3 class="text-base font-bold text-slate-800">{{ routeGuide.title }}</h3>
              <p class="text-sm text-slate-600 leading-relaxed">{{ routeGuide.summary }}</p>

              <!-- 小卡片：字體放大為 text-sm、內容分段、無 icon -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                <div
                  v-for="(point, idx) in routeGuide.points"
                  :key="idx"
                  class="rounded-xl bg-slate-50/80 border border-slate-200/70 p-4 space-y-2"
                >
                  <h4 class="font-bold text-sm text-slate-900">{{ point.title }}</h4>
                  <div class="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-1.5">
                    <p v-for="(para, pIdx) in point.paragraphs" :key="pIdx">
                      {{ para }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- 底部資訊校對提醒 -->
        <div class="rounded-xl bg-stone-50 border border-stone-200/80 px-4 py-3 flex items-start gap-2.5 text-xs text-slate-600">
          <ShieldAlert class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p class="leading-relaxed">
            <strong>資訊查核提示：</strong>
            Camino Plan 所整理之歷史文獻、城鎮里程與轉乘班次均定期核對聖地牙哥官方朝聖者辦公室及地方機構。路上遇天候或營業異動請以現場最新公告為準。祝您一路順風（¡Buen Camino!）。
          </p>
        </div>
      </div>
    </main>

    <!-- 底部精簡版權資訊 -->
    <footer class="border-t border-slate-200/60 bg-white/50 py-4 text-center text-xs text-slate-400">
      <p>© {{ new Date().getFullYear() }} Camino Plan. All rights reserved.</p>
    </footer>
  </div>
</template>
