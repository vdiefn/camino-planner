import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { AVAILABLE_ROUTES, getRouteMetadata } from '@/data/routes'
import type { RouteId } from '@/types/route'

const SITE_ORIGIN = 'https://camino-plan.com'
const DEFAULT_TITLE = '【2026 朝聖之路】行程規劃與裝備試算工具 | Camino Plan'
const DEFAULT_DESCRIPTION =
  '專為聖雅各朝聖之路（Camino de Santiago）徒步者打造的免費極簡規劃工具。提供法國之路、葡萄牙之路與北方之路的每日分段里程計算、10% 體重負重裝備打包清單，以及各起點交通避坑指南。支援離線使用與跨裝置免登入同步。'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/schedule/frances',
    },
    {
      path: '/schedule',
      redirect: '/schedule/frances',
    },
    {
      path: '/schedule/:routeId/:branchId?',
      name: 'schedule',
      component: HomeView,
    },
    {
      path: '/packing',
      name: 'packing',
      component: HomeView,
      meta: {
        title: '【2026 朝聖之路裝備清單】10% 體重負重計算機與必備打包檢查表 | Camino Plan',
        description:
          '科學化朝聖者背包負重計算機，嚴格把關 10% 體重負重警戒線，內建九大必備裝備分類與減重避坑指南。',
      },
    },
    {
      path: '/transport',
      redirect: '/transport/frances',
    },
    {
      path: '/transport/:routeId/:branchId?',
      name: 'transport',
      component: HomeView,
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/PrivacyView.vue'),
      meta: {
        title: '隱私權政策 | Camino Plan',
        description: 'Camino Plan 朝聖者智慧規劃工具之本機資料儲存、隱私保護與 Cookie 政策說明。',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/schedule/frances',
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

// 路由防禦：確保 /schedule/:routeId/:branchId? 與 /transport/:routeId/:branchId? 為合法收錄之路線與分支，否則自動 fallback
router.beforeEach((to, _from, next) => {
  if (to.name === 'schedule' || to.name === 'transport') {
    const routeId = to.params.routeId as string
    const branchId = to.params.branchId as string | undefined
    const routeMeta = AVAILABLE_ROUTES.find((r) => r.id === routeId)
    if (!routeMeta) {
      return next(`/${String(to.name)}/frances`)
    }
    if (branchId && routeMeta.branches) {
      const isValidBranch = routeMeta.branches.some((b) => b.id === branchId)
      if (!isValidBranch) {
        return next(`/${String(to.name)}/${routeId}`)
      }
    }
  }
  next()
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

/**
 * 資料驅動自動化 SEO Meta Resolver
 * 從 AVAILABLE_ROUTES 動態推導路線名稱、總里程與建議天數，未來擴充新路線零配置自動生效
 */
function resolveRouteSeoMeta(to: RouteLocationNormalized) {
  const routeId = to.params.routeId as RouteId
  const branchId = to.params.branchId as string | undefined
  const routeMeta = getRouteMetadata(routeId)

  if (to.name === 'schedule' && routeMeta) {
    if (routeId === 'portugues' && branchId === 'costa') {
      const costaBranch = routeMeta.branches?.find((b) => b.id === 'costa')
      return {
        title: `【2026 朝聖之路】葡萄牙之路海岸線 (Camino de la Costa) 行程規劃與每日里程試算 | Camino Plan`,
        description: `專為葡萄牙海岸線徒步者打造的免費規劃工具。自波多沿大西洋海岸北上，全長約 ${costaBranch?.totalDistanceKm || 270.9}km、建議 ${costaBranch?.recommendedDays || 13} 天，支援每日海風步道與木棧道里程試算、爬升、庇護所清單與 Caminha 跨國渡輪節點。`,
      }
    }
    return {
      title: `【2026 朝聖之路】${routeMeta.chineseName} (${routeMeta.name}) 行程規劃與每日里程計算 | Camino Plan`,
      description: `專為${routeMeta.chineseName}徒步者打造的免費規劃工具。全長約 ${routeMeta.totalDistanceKm}km、建議 ${routeMeta.recommendedDays} 天，支援每日分段公里試算、爬升下降、庇護所清單與世界盡頭延伸段。`,
    }
  }

  if (to.name === 'transport' && routeMeta) {
    if (routeId === 'portugues' && branchId === 'costa') {
      return {
        title: `【2026 朝聖之路】葡萄牙之路海岸線起點交通與 Caminha 跨國渡輪避坑指南 | Camino Plan`,
        description: `提供前往葡萄牙海岸線起點（波多主教座堂 / Matosinhos 海邊起點）地鐵接駁、Caminha 跨米尼奧河至西班牙 A Guarda 的 Xacobeo 渡輪與計程快艇全攻略。`,
      }
    }
    return {
      title: `【2026 朝聖之路】${routeMeta.chineseName} (${routeMeta.name}) 起點交通攻略與轉乘指南 | Camino Plan`,
      description: `提供抵達${routeMeta.chineseName}起點的最佳大眾運輸交通指南、高鐵與巴士班次規劃、跨國轉乘避坑提醒與官方訂票連結。`,
    }
  }

  return {
    title: (to.meta.title as string) || DEFAULT_TITLE,
    description: (to.meta.description as string) || DEFAULT_DESCRIPTION,
  }
}

router.afterEach((to) => {
  if (typeof document === 'undefined') return
  const seo = resolveRouteSeoMeta(to)
  const canonicalUrl = `${SITE_ORIGIN}${to.path}`

  document.title = seo.title
  upsertMeta('meta[name="description"]', 'name', 'description', seo.description)
  upsertMeta('meta[property="og:title"]', 'property', 'og:title', seo.title)
  upsertMeta('meta[property="og:description"]', 'property', 'og:description', seo.description)
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
  upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', seo.title)
  upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', seo.description)

  let canonicalEl = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonicalEl) {
    canonicalEl = document.createElement('link')
    canonicalEl.setAttribute('rel', 'canonical')
    document.head.appendChild(canonicalEl)
  }
  canonicalEl.setAttribute('href', canonicalUrl)
})

export default router
