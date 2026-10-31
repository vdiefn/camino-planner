import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const SITE_ORIGIN = 'https://camino-plan.com'
const DEFAULT_TITLE = '朝聖之路行程與裝備規劃工具 | Camino Plan (法國之路 / 葡萄牙之路 / 北方之路)'
const DEFAULT_DESCRIPTION =
  '專為聖雅各朝聖之路（Camino de Santiago）徒步者打造的免費極簡規劃工具。提供法國之路、葡萄牙之路與北方之路的每日分段里程計算、10% 體重負重裝備打包清單，以及各起點交通避坑指南。支援離線使用與跨裝置免登入同步。'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/schedule',
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: HomeView,
      meta: {
        title: '朝聖之路行程與分段規劃 | Camino Plan (法國之路 / 葡萄牙之路 / 北方之路)',
        description:
          '支援法國之路、葡萄牙之路與北方之路的每日分段公里、爬升下降與世界盡頭延伸段規劃計算。',
      },
    },
    {
      path: '/packing',
      name: 'packing',
      component: HomeView,
      meta: {
        title: '朝聖之路行李打包清單與 10% 負重試算 | Camino Plan',
        description:
          '科學化朝聖者背包負重計算機，嚴格把關 10% 體重負重警戒線，內建九大必備裝備分類與減重避坑指南。',
      },
    },
    {
      path: '/transport',
      name: 'transport',
      component: HomeView,
      meta: {
        title: '朝聖之路起點交通轉乘與避坑指南 | Camino Plan',
        description:
          '提供巴黎、馬德里、波多直達各朝聖之路起點（SJPP、Porto、Irún）的最佳交通決策與避坑提醒。',
      },
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
      redirect: '/schedule',
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
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

router.afterEach((to) => {
  if (typeof document === 'undefined') return
  const title = (to.meta.title as string) || DEFAULT_TITLE
  const description = (to.meta.description as string) || DEFAULT_DESCRIPTION
  const normalizedPath = to.path === '/' ? '/schedule' : to.path
  const canonicalUrl = `${SITE_ORIGIN}${normalizedPath}`

  document.title = title
  upsertMeta('meta[name="description"]', 'name', 'description', description)
  upsertMeta('meta[property="og:title"]', 'property', 'og:title', title)
  upsertMeta('meta[property="og:description"]', 'property', 'og:description', description)
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
  upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
  upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)

  let canonicalEl = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonicalEl) {
    canonicalEl = document.createElement('link')
    canonicalEl.setAttribute('rel', 'canonical')
    document.head.appendChild(canonicalEl)
  }
  canonicalEl.setAttribute('href', canonicalUrl)
})

export default router
