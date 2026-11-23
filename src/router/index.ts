import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { AVAILABLE_ROUTES, getRouteMetadata } from '@/data/routes'
import { getGuideBySlug } from '@/data/guides'
import { setAppLocale } from '@/i18n'
import {
  buildBilingualSeoUrls,
  extractLocaleFromPath,
  localizePath,
  type SupportedLocale,
} from '@/utils/localeRoute'
import type { RouteId } from '@/types/route'

const SITE_ORIGIN = 'https://camino-plan.com'

const DEFAULT_SEO = {
  'zh-TW': {
    title: '朝聖之路規劃工具｜法國之路・葡萄牙之路・北方之路行程與裝備表 | Camino Plan',
    description:
      '專為聖雅各朝聖之路（Camino de Santiago）徒步者打造的免費規劃工具。涵蓋朝聖法國之路、葡萄牙之路與北方之路的每日天數行程表、里程計算、10% 體重裝備打包清單與起點交通攻略。',
    keywords:
      '朝聖之路, 聖雅各朝聖之路, 朝聖之路規劃, 朝聖法國之路, 法國之路規劃, 葡萄牙之路, 北方之路, 朝聖裝備清單, 庇護所, 完步證書, Camino de Santiago, Camino planner, Camino Francés, Camino Portugués, Camino del Norte',
  },
  en: {
    title: 'Camino de Santiago Planner & Packing Tool | Camino Plan',
    description:
      'Free minimalist planner for Camino de Santiago pilgrims. Daily stage distance calculator, 10% body weight packing checklist, and trailhead transport guides for French, Portuguese, and Northern ways. Works offline.',
    keywords:
      'Camino de Santiago, Camino planner, Camino Francés, Camino Portugués, Camino del Norte, Camino packing list, Camino budget calculator, albergue, compostela certificate, Camino route guide, Santiago de Compostela',
  },
}

interface StaticSeoConfig {
  'zh-TW': {
    title: string
    description: string
    keywords: string
  }
  en: {
    title: string
    description: string
    keywords: string
  }
}

const STATIC_ROUTE_SEO: Record<string, StaticSeoConfig> = {
  landing: {
    'zh-TW': {
      title: '朝聖之路規劃工具｜法國之路・葡萄牙之路・北方之路行程與裝備表 | Camino Plan',
      description:
        '專為聖雅各朝聖之路（Camino de Santiago）徒步者打造的免費規劃工具。涵蓋朝聖法國之路、葡萄牙之路與北方之路的每日天數行程表、里程計算、10% 體重裝備打包清單與起點交通攻略。',
      keywords:
        '朝聖之路, 聖雅各朝聖之路, 朝聖之路規劃, 朝聖法國之路, 法國之路規劃, 葡萄牙之路, 北方之路, Camino de Santiago, Camino planner, Camino Francés, Camino Portugués, Camino del Norte, Santiago de Compostela',
    },
    en: {
      title: 'Camino de Santiago Planner & Packing Tool | Camino Plan',
      description:
        'Free minimalist planner for Camino de Santiago pilgrims. Daily stage distance calculator, 10% body weight packing checklist, and trailhead transport guides for French, Portuguese, and Northern ways. Works offline.',
      keywords:
        'Camino de Santiago, Camino planner, Camino Francés, Camino Portugués, Camino del Norte, Camino packing list, Camino budget calculator, albergue, compostela certificate, Camino route guide',
    },
  },
  routes: {
    'zh-TW': {
      title: '聖雅各三大經典朝聖路線攻略與難度評估 | Camino Plan',
      description:
        '法國之路、葡萄牙之路與北方之路深度攻略剖析。提供總里程、徒步天數、地形難度、路面鋪裝材質比例、最佳行走月份與避坑防禦提醒。',
      keywords:
        '聖雅各朝聖路線攻略, 路線難度評估, 法國之路攻略, 葡萄牙之路, 北方之路, Camino route guides, Camino difficulty, French Way, Portuguese Way, Northern Way, best months',
    },
    en: {
      title: 'Camino Route Guides & Difficulty Assessment | Camino Plan',
      description:
        'In-depth guide for Camino Francés, Portugués, and del Norte. Real-world distances, suggested days, trail difficulty, pavement surface breakdowns, best seasons, and essential pitfalls.',
      keywords:
        'Camino route guides, Camino Francés, Camino Portugués, Camino del Norte, trail difficulty, pavement surface, best months, pilgrimage guide',
    },
  },
  packing: {
    'zh-TW': {
      title: '裝備清單與負重計算機 (10% 體重法則) | Camino Plan',
      description:
        '科學化朝聖者背包負重計算機，嚴格把關 10% 體重負重警戒線，內建九大必備裝備分類與減重避坑指南。',
      keywords:
        '朝聖裝備清單, 朝聖負重計算機, 10%體重法則, 背包減重, Camino packing list, backpack weight calculator, 10% body weight rule, pilgrim gear list',
    },
    en: {
      title: 'Camino Packing Checklist & 10% Weight Calculator | Camino Plan',
      description:
        'Scientific Camino packing calculator adhering to the strict 10% body weight rule. Includes 9 essential categories and ultra-lightweight gear optimization tips.',
      keywords:
        'Camino packing checklist, backpack weight calculator, 10% body weight rule, pilgrim gear, ultralight Camino packing',
    },
  },
  budget: {
    'zh-TW': {
      title: '朝聖花費與預算計算機 (全雙幣試算) | Camino Plan',
      description:
        '專為聖雅各朝聖之路設計的免費預算計算機，全雙幣 EUR/TWD 動態試算，涵蓋機票裝備、公私立庇護所住宿、朝聖者套餐伙食與突發應急金。',
      keywords:
        '朝聖花費, 朝聖預算計算機, 庇護所費用, 朝聖雙幣試算, Camino budget calculator, Camino cost estimator, albergue prices, pilgrim expenses',
    },
    en: {
      title: 'Camino Budget & Cost Calculator (Dual Currency) | Camino Plan',
      description:
        'Comprehensive Camino de Santiago budget estimator with real-time EUR and TWD conversions. Covers flights, gear, municipal/private albergues, pilgrim meals, and emergency buffer.',
      keywords:
        'Camino budget calculator, Camino cost, albergue cost, pilgrim menu price, Camino de Santiago expenses',
    },
  },
  history: {
    'zh-TW': {
      title: '聖雅各朝聖之路歷史淵源與文化象徵 | Camino Plan',
      description:
        '深度解析聖雅各朝聖之路（Camino de Santiago）千年歷史：繁星原野聖骨發現、第一位朝聖者阿方索二世、中世紀朝聖風潮、扇貝殼與黃色箭頭文化象徵典故。',
      keywords:
        '朝聖之路歷史, 聖雅各傳說, 扇貝殼象徵, 黃色箭頭由來, 朝聖護照規範, 完步證書條件, Camino history, scallop shell, yellow arrow, credencial, compostela',
    },
    en: {
      title: 'Camino History & Cultural Heritage | Camino Plan',
      description:
        'Comprehensive guide to the 1,000-year history of the Camino de Santiago: the legend of Campus Stellae, King Alfonso II, the medieval golden age, cultural symbols, and Credencial rules.',
      keywords:
        'Camino history, history of Camino de Santiago, scallop shell meaning, yellow arrow history, credencial rules, compostela requirements',
    },
  },
  faq: {
    'zh-TW': {
      title: '常見問題百科 (FAQ) | Camino Plan',
      description:
        '專為聖雅各朝聖之路徒步者整理的問答百科，收錄證書規定、庇護所入住技巧、行李減重與交通銜接全指南。',
      keywords:
        '朝聖之路常見問題, 朝聖FAQ, 庇護所入住, 朝聖護照蓋章, 完步證書規定, Camino FAQ, pilgrim tips, how to get compostela, albergue booking',
    },
    en: {
      title: 'Camino FAQ Encyclopedia & Essential Tips | Camino Plan',
      description:
        'Practical Q&A encyclopedia for Camino pilgrims: Compostela certificate requirements, public vs private albergues, luggage transport, and essential route navigation.',
      keywords:
        'Camino FAQ, pilgrim questions, albergue rules, Camino pilgrim passport, compostela certificate rules',
    },
  },
  privacy: {
    'zh-TW': {
      title: '隱私權政策 | Camino Plan',
      description: 'Camino Plan 朝聖規劃工具之本機資料儲存、隱私保護與 Cookie 政策說明。',
      keywords: '隱私權政策, 本機儲存, Camino Plan Privacy Policy, local storage',
    },
    en: {
      title: 'Privacy Policy | Camino Plan',
      description: 'Privacy Policy and local storage transparency for the Camino Plan application.',
      keywords: 'Privacy Policy, local storage privacy, Camino Plan terms',
    },
  },
  weather: {
    'zh-TW': {
      title: '朝聖之路過往天氣與區域氣候查詢 | Camino Plan',
      description:
        '依西班牙 AEMET 與葡萄牙 IPMA 1991–2020 官方區域測站統計，比較法國之路、葡萄牙之路、北方之路與世界盡頭各月份溫度與降雨變化，精準準備睡袋與雨具。',
      keywords:
        '朝聖之路天氣, 朝聖之路過往天氣, 法國之路氣候, 葡萄牙之路天氣, 朝聖之路幾月去, Camino weather, Camino historical climate, AEMET Camino',
    },
    en: {
      title: 'Camino Historical Weather & Regional Climate | Camino Plan',
      description:
        'Compare 1991–2020 official AEMET & IPMA station normals across Camino Francés, Portugués, del Norte, and Finisterre by month and elevation to pack the right gear.',
      keywords:
        'Camino de Santiago weather, Camino historical weather, Camino climate by month, Camino packing weather, AEMET IPMA Camino',
    },
  },
  about: {
    'zh-TW': {
      title: '關於我們 | Camino Plan 朝聖之路規劃工具',
      description:
        '認識 Camino Plan 的創立初衷、朝聖之路里程與庇護所資料校對原則，以及免費免登入的社群工具定位。',
      keywords: '關於 Camino Plan, 朝聖之路工具介紹, 庇護所資料校對, Camino de Santiago planner',
    },
    en: {
      title: 'About Us | Camino Plan',
      description:
        'Learn about Camino Plan, our mission, trail and albergue verification standards, and independent community project statement.',
      keywords: 'About Camino Plan, Camino guide verification, Camino de Santiago community tool',
    },
  },
  contact: {
    'zh-TW': {
      title: '聯絡我們與資料勘誤 | Camino Plan',
      description:
        '回報朝聖之路庇護所異動、里程勘誤、交通班次更新、功能建議或合作洽談的官方聯絡管道。',
      keywords: '聯絡 Camino Plan, 朝聖之路資料勘誤, 庇護所異動回報, Contact Camino Plan',
    },
    en: {
      title: 'Contact & Data Corrections | Camino Plan',
      description:
        'Reach out to Camino Plan to report albergue updates, trail data corrections, feature requests, or partnership inquiries.',
      keywords: 'Contact Camino Plan, Camino data correction, albergue update report',
    },
  },
  guides: {
    'zh-TW': {
      title: '朝聖之路實戰攻略專區 | Camino Plan',
      description:
        '從四季氣候、庇里牛斯山路線、最後 100 公里雙章規則，到庇護所入住、選鞋防泡與每日花費預算拆解的完整行前實戰指南。',
      keywords: '朝聖之路攻略, 庇里牛斯山, 最後100公里, 庇護所入住, 朝聖之路花費, 越野跑鞋',
    },
    en: {
      title: 'Camino Field Guides & Practical Tips | Camino Plan',
      description:
        'Practical Camino de Santiago guides covering best seasons, crossing the Pyrenees, the last 100 km rules, albergue etiquette, footwear, and daily costs.',
      keywords: 'Camino field guides, Camino tips, Pyrenees crossing, last 100km, albergue guide',
    },
  },
  'not-found': {
    'zh-TW': {
      title: '找不到頁面 (404) | Camino Plan',
      description: '您所尋找的頁面不存在、已被移動或網址輸入有誤。',
      keywords: '404, 找不到頁面',
    },
    en: {
      title: 'Page Not Found (404) | Camino Plan',
      description: 'The page you are looking for does not exist or has been moved.',
      keywords: '404, Page Not Found',
    },
  },
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/:locale(en)?',
      children: [
        {
          path: '',
          name: 'landing',
          component: () => import('@/views/LandingView.vue'),
          meta: {
            title: '朝聖之路行程與裝備規劃工具 | Camino Plan (法國之路 / 葡萄牙之路 / 北方之路)',
            description:
              '專為聖雅各朝聖之路（Camino de Santiago）徒步者打造的免費極簡規劃工具。提供法國之路、葡萄牙之路與北方之路的每日分段里程計算、10% 體重負重裝備打包清單，以及各起點交通避坑指南。支援離線使用與跨裝置免登入同步。',
          },
        },
        {
          path: 'schedule',
          redirect: (to) => ({
            path: localizePath('/schedule/frances', extractLocaleFromPath(to.path)),
            query: to.query,
            hash: to.hash,
          }),
        },
        {
          path: 'schedule/:routeId/:branchId?',
          name: 'schedule',
          component: HomeView,
        },
        {
          path: 'packing',
          name: 'packing',
          component: HomeView,
          meta: {
            title: '裝備清單與負重計算機 (10% 體重法則) | Camino Plan',
            description:
              '科學化朝聖者背包負重計算機，嚴格把關 10% 體重負重警戒線，內建九大必備裝備分類與減重避坑指南。',
          },
        },
        {
          path: 'transport',
          redirect: (to) => ({
            path: localizePath('/transport/frances', extractLocaleFromPath(to.path)),
            query: to.query,
            hash: to.hash,
          }),
        },
        {
          path: 'transport/:routeId/:branchId?',
          name: 'transport',
          component: HomeView,
        },
        {
          path: 'budget',
          name: 'budget',
          component: HomeView,
          meta: {
            title: '朝聖花費與預算計算機 (全雙幣試算) | Camino Plan',
            description:
              '專為聖雅各朝聖之路設計的免費預算計算機，全雙幣 EUR/TWD 動態試算，涵蓋機票裝備、公私立庇護所住宿、朝聖者套餐伙食與突發應急金。',
          },
        },
        {
          path: 'history',
          name: 'history',
          component: () => import('@/views/HistoryView.vue'),
          meta: {
            title: '聖雅各朝聖之路歷史淵源與文化象徵 | Camino Plan',
            description:
              '深度解析聖雅各朝聖之路（Camino de Santiago）千年歷史：繁星原野聖骨發現、第一位朝聖者阿方索二世、中世紀朝聖風潮、扇貝殼與黃色箭頭文化象徵典故。',
          },
        },
        {
          path: 'routes/:routeId?',
          name: 'routes',
          component: () => import('@/views/RoutesGuideView.vue'),
          meta: {
            title: '聖雅各三大經典朝聖路線攻略與難度評估 | Camino Plan',
            description:
              '法國之路、葡萄牙之路與北方之路深度攻略剖析。提供總里程、徒步天數、地形難度、路面鋪裝材質比例、最佳行走月份與避坑防禦提醒。',
          },
        },
        {
          path: 'guides',
          name: 'guides',
          component: () => import('@/views/GuidesView.vue'),
          meta: {
            title: '朝聖之路實戰攻略專區 | Camino Plan',
            description:
              '從四季氣候、庇里牛斯山路線、最後 100 公里雙章規則，到庇護所入住、選鞋防泡與每日花費預算拆解的完整行前實戰指南。',
          },
        },
        {
          path: 'guides/:slug',
          name: 'guide-detail',
          component: () => import('@/views/GuideDetailView.vue'),
        },
        {
          path: 'weather',
          name: 'weather',
          component: () => import('@/views/WeatherView.vue'),
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/AboutView.vue'),
          meta: {
            title: '關於我們 | Camino Plan 朝聖之路規劃工具',
            description:
              '認識 Camino Plan 的創立初衷、朝聖之路里程與庇護所資料校對原則，以及免費免登入的社群工具定位。',
          },
        },
        {
          path: 'contact',
          name: 'contact',
          component: () => import('@/views/ContactView.vue'),
          meta: {
            title: '聯絡我們與資料勘誤 | Camino Plan',
            description:
              '回報朝聖之路庇護所異動、里程勘誤、交通班次更新、功能建議或合作洽談的官方聯絡管道。',
          },
        },
        {
          path: 'faq',
          name: 'faq',
          component: () => import('@/views/FaqView.vue'),
          meta: {
            title: '常見問題百科 (FAQ) | Camino Plan',
            description:
              '專為聖雅各朝聖之路徒步者整理的問答百科，收錄證書規定、庇護所入住技巧、行李減重與交通銜接全指南。',
          },
        },
        {
          path: 'privacy',
          name: 'privacy',
          component: () => import('@/views/PrivacyView.vue'),
          meta: {
            title: '隱私權政策 | Camino Plan',
            description: 'Camino Plan 朝聖規劃工具之本機資料儲存、隱私保護與 Cookie 政策說明。',
          },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        title: '找不到頁面 (404) | Camino Plan',
        description: '您所尋找的頁面不存在、已被移動或網址輸入有誤。',
        robots: 'noindex, nofollow',
      },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

// 路由防禦與語系同步：
// 1. 舊版 ?lang=en / ?lang=zh-TW 自動轉址至對應語系 URL 並保留其餘 Query / Hash
// 2. 強制以 URL pathname 同步 i18n 語系（URL 為唯一真實來源）
// 3. 驗證動態參數合法性，非法時 fallback 並維持原語系前綴
router.beforeEach((to) => {
  const rawLangQuery = Array.isArray(to.query.lang) ? to.query.lang[0] : to.query.lang
  if (rawLangQuery === 'en' || rawLangQuery === 'zh-TW') {
    const restQuery = { ...to.query }
    delete restQuery.lang
    const targetPath = localizePath(to.path, rawLangQuery)
    return {
      path: targetPath,
      query: restQuery,
      hash: to.hash,
      replace: true,
    }
  }

  const urlLocale: SupportedLocale = extractLocaleFromPath(to.path)
  setAppLocale(urlLocale)

  if (to.name === 'guide-detail') {
    const slug = to.params.slug as string
    if (!getGuideBySlug(slug)) {
      return localizePath('/guides', urlLocale)
    }
  }
  if (to.name === 'routes') {
    const routeId = to.params.routeId as string | undefined
    if (routeId && !AVAILABLE_ROUTES.some((r) => r.id === routeId)) {
      return localizePath('/routes', urlLocale)
    }
  }
  if (to.name === 'schedule' || to.name === 'transport') {
    const routeId = to.params.routeId as string
    const branchId = to.params.branchId as string | undefined
    const routeMeta = AVAILABLE_ROUTES.find((r) => r.id === routeId)
    if (!routeMeta) {
      return localizePath(`/${String(to.name)}/frances`, urlLocale)
    }
    if (branchId && routeMeta.branches) {
      const isValidBranch = routeMeta.branches.some((b) => b.id === branchId)
      if (!isValidBranch) {
        return localizePath(`/${String(to.name)}/${routeId}`, urlLocale)
      }
    }
  }
  return true
})

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  if (typeof document === 'undefined') return
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertHreflangLink(hreflang: string, href: string) {
  if (typeof document === 'undefined') return
  let el = document.head.querySelector<HTMLLinkElement>(
    `link[rel="alternate"][hreflang="${hreflang}"]`,
  )
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'alternate')
    el.setAttribute('hreflang', hreflang)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function removeHreflangLinks() {
  if (typeof document === 'undefined') return
  document.head
    .querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')
    .forEach((el) => el.remove())
}

/**
 * 資料驅動自動化 SEO Meta Resolver
 * 從 AVAILABLE_ROUTES 動態推導路線名稱、總里程與建議天數，未來擴充新路線零配置自動生效
 */
function resolveRouteSeoMeta(to: RouteLocationNormalized, isEn: boolean) {
  const langKey = isEn ? 'en' : 'zh-TW'
  const routeId = to.params.routeId as RouteId
  const branchId = to.params.branchId as string | undefined
  const routeMeta = getRouteMetadata(routeId)

  if (to.name === 'schedule' && routeMeta) {
    if (routeId === 'portugues' && branchId === 'costa') {
      const costaBranch = routeMeta.branches?.find((b) => b.id === 'costa')
      const dist = costaBranch?.totalDistanceKm || 270.9
      const days = costaBranch?.recommendedDays || 13
      if (isEn) {
        return {
          title: `Camino Portugués Coastal Route Schedule Planner (Camino de la Costa) | Camino Plan`,
          description: `Interactive stage planner for the Portuguese Coastal Way. Porto to Santiago along the Atlantic Coast (~${dist}km, ${days} days). Stage distances, elevation, albergues, and Caminha ferry info.`,
          keywords: `Camino Portugués Costa, Portuguese Coastal Way planner, Caminha ferry, Porto to Santiago stages, Camino albergues`,
        }
      }
      return {
        title: `葡萄牙之路海岸線行程規劃 (Camino de la Costa) | Camino Plan`,
        description: `專為葡萄牙海岸線徒步者打造的免費規劃工具。自波多沿大西洋海岸北上，全長約 ${dist}km、建議 ${days} 天，支援每日海風步道與木棧道里程試算、爬升、庇護所清單與 Caminha 跨國渡輪節點。`,
        keywords: `葡萄牙之路海岸線, 葡萄牙中央線, 波多出發, Caminha渡輪, 每日里程計算, 庇護所清單`,
      }
    }

    if (isEn) {
      return {
        title: `${routeMeta.name} Schedule & Stage Planner | Camino Plan`,
        description: `Free stage planner for ${routeMeta.name}. Total distance ~${routeMeta.totalDistanceKm}km, suggested ${routeMeta.recommendedDays} days. Daily distance calculations, elevations, albergue directories, and Finisterre extension.`,
        keywords: `${routeMeta.name} planner, Camino stages, daily walking distance, albergue list, ${routeMeta.name} itinerary`,
      }
    }
    return {
      title: `朝聖${routeMeta.chineseName}行程規劃與每日天數表 (${routeMeta.name}) | Camino Plan`,
      description: `專為朝聖${routeMeta.chineseName}規劃打造的免費行程表工具。全長約 ${routeMeta.totalDistanceKm}km、建議 ${routeMeta.recommendedDays} 天，支援每日分段公里試算、爬升下降、庇護所住宿清單與世界盡頭延伸段。`,
      keywords: `朝聖${routeMeta.chineseName}, ${routeMeta.chineseName}規劃, ${routeMeta.name}, 每日分段里程, 朝聖住宿清單, 爬升下降, 世界盡頭`,
    }
  }

  if (to.name === 'transport' && routeMeta) {
    if (routeId === 'portugues' && branchId === 'costa') {
      if (isEn) {
        return {
          title: `Camino Portugués Coastal Trailhead Transport & Ferry Guide | Camino Plan`,
          description: `Comprehensive transport guide to the Portuguese Coastal Way trailheads (Porto Cathedral / Matosinhos), metro connections, and the Xacobeo ferry / taxi-boat crossing from Caminha to A Guarda.`,
          keywords: `Porto trailhead transport, Matosinhos metro, Caminha ferry to A Guarda, taxi boat Caminha, Portuguese Way access`,
        }
      }
      return {
        title: `葡萄牙之路海岸線起點交通與渡輪指南 | Camino Plan`,
        description: `提供前往葡萄牙海岸線起點（波多主教座堂 / Matosinhos 海邊起點）地鐵接駁、Caminha 跨米尼奧河至西班牙 A Guarda 的 Xacobeo 渡輪與計程快艇全攻略。`,
        keywords: `波多地鐵接駁, Matosinhos, Caminha渡輪, A Guarda, 葡萄牙海岸線交通`,
      }
    }

    if (isEn) {
      return {
        title: `${routeMeta.name} Trailhead Transport & Transfer Guide | Camino Plan`,
        description: `Essential public transit guide to reach the start of ${routeMeta.name}: high-speed trains, regional buses, airport transfers, and booking links.`,
        keywords: `how to get to ${routeMeta.name}, trailhead transport, airport transfer, train bus booking`,
      }
    }
    return {
      title: `${routeMeta.chineseName}起點交通攻略與轉乘指南 (${routeMeta.name}) | Camino Plan`,
      description: `提供抵達${routeMeta.chineseName}起點的最佳大眾運輸交通指南、高鐵與巴士班次規劃、跨國轉乘避坑提醒與官方訂票連結。`,
      keywords: `${routeMeta.chineseName}交通, 起點轉乘, 機場接駁, 高鐵巴士班次, 官方訂票`,
    }
  }

  if (to.name === 'routes' && routeId && routeMeta) {
    if (isEn) {
      return {
        title: `${routeMeta.name} Route Guide, Difficulty & Trail Tips | Camino Plan`,
        description: `Complete guide to ${routeMeta.name} (~${routeMeta.totalDistanceKm}km, ${routeMeta.recommendedDays} days): terrain breakdown, best walking months, trailhead transit, and key pitfalls.`,
        keywords: `${routeMeta.name} guide, ${routeMeta.name} difficulty, Camino route guide, Santiago de Compostela`,
      }
    }
    return {
      title: `朝聖${routeMeta.chineseName}深度攻略與難度評估 (${routeMeta.name}) | Camino Plan`,
      description: `完整解析朝聖${routeMeta.chineseName}（約 ${routeMeta.totalDistanceKm}km、建議 ${routeMeta.recommendedDays} 天）之地形特色、鋪裝材質比例、最佳行走季節、起點交通銜接與實戰避坑提醒。`,
      keywords: `朝聖${routeMeta.chineseName}攻略, ${routeMeta.chineseName}難度, ${routeMeta.name}, 朝聖之路路線比較`,
    }
  }

  if (to.name === 'guide-detail') {
    const article = getGuideBySlug(String(to.params.slug || ''))
    if (article) {
      if (isEn) {
        return {
          title: `${article.titleEn} | Camino Plan`,
          description: article.seoDescriptionEn,
          keywords: article.keywordsEn,
        }
      }
      return {
        title: `${article.title} | Camino Plan`,
        description: article.seoDescription,
        keywords: article.keywords,
      }
    }
  }

  const staticConfig = STATIC_ROUTE_SEO[String(to.name)]
  if (staticConfig) {
    return staticConfig[langKey]
  }

  return DEFAULT_SEO[langKey]
}

export function updateDocumentSeo(to?: RouteLocationNormalized) {
  if (typeof document === 'undefined') return
  const activeRoute = to || router.currentRoute.value
  const seoUrls = buildBilingualSeoUrls(SITE_ORIGIN, activeRoute.path)
  const isEn = seoUrls.locale === 'en'
  const seo = resolveRouteSeoMeta(activeRoute, isEn)
  const ogImageUrl = `${SITE_ORIGIN}/${isEn ? 'og-cover-en.png' : 'og-cover.png'}`

  document.title = seo.title
  document.documentElement.lang = isEn ? 'en' : 'zh-Hant-TW'

  upsertMeta('meta[name="description"]', 'name', 'description', seo.description)
  upsertMeta('meta[property="og:title"]', 'property', 'og:title', seo.title)
  upsertMeta('meta[property="og:description"]', 'property', 'og:description', seo.description)
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', seoUrls.canonicalUrl)
  upsertMeta('meta[property="og:locale"]', 'property', 'og:locale', isEn ? 'en_US' : 'zh_TW')
  upsertMeta('meta[property="og:image"]', 'property', 'og:image', ogImageUrl)
  upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', seo.title)
  upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', seo.description)
  upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImageUrl)

  // 同步更新全站 WebApplication JSON-LD 語系與內容
  const appSchemaEl = document.head.querySelector<HTMLScriptElement>('#webapp-schema-jsonld')
  if (appSchemaEl) {
    appSchemaEl.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: isEn ? 'Camino Plan — Camino de Santiago Planner' : 'Camino Plan 朝聖之路規劃工具',
      url: isEn ? `${SITE_ORIGIN}/en` : `${SITE_ORIGIN}/`,
      inLanguage: isEn ? 'en' : 'zh-TW',
      description: DEFAULT_SEO[isEn ? 'en' : 'zh-TW'].description,
      applicationCategory: 'TravelApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    }).replaceAll('<', '\\u003c')
  }

  // 處理 robots 標籤：若路由宣告 noindex 則動態注入，否則安全移除防範全站誤傷
  const robotsMetaEl = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
  if (activeRoute.meta?.robots) {
    upsertMeta('meta[name="robots"]', 'name', 'robots', activeRoute.meta.robots as string)
  } else if (robotsMetaEl) {
    robotsMetaEl.remove()
  }

  let canonicalEl = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (activeRoute.meta?.robots) {
    canonicalEl?.remove()
    removeHreflangLinks()
  } else {
    if (!canonicalEl) {
      canonicalEl = document.createElement('link')
      canonicalEl.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalEl)
    }
    canonicalEl.setAttribute('href', seoUrls.canonicalUrl)
    upsertHreflangLink('zh-Hant-TW', seoUrls.zhUrl)
    upsertHreflangLink('en', seoUrls.enUrl)
    upsertHreflangLink('x-default', seoUrls.xDefaultUrl)
  }
}

router.afterEach((to) => {
  updateDocumentSeo(to)
})

export default router
