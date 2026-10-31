import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import PrivacyView from '@/views/PrivacyView.vue'

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
        description: '支援法國之路、葡萄牙之路與北方之路的每日分段公里、爬升下降與世界盡頭延伸段規劃計算。',
      },
    },
    {
      path: '/packing',
      name: 'packing',
      component: HomeView,
      meta: {
        title: '朝聖之路行李打包清單與 10% 負重試算 | Camino Plan',
        description: '科學化朝聖者背包負重計算機，嚴格把關 10% 體重負重警戒線，內建九大必備裝備分類與減重避坑指南。',
      },
    },
    {
      path: '/transport',
      name: 'transport',
      component: HomeView,
      meta: {
        title: '朝聖之路起點交通轉乘與避坑指南 | Camino Plan',
        description: '提供巴黎、馬德里、波多直達各朝聖之路起點（SJPP、Porto、Irún）的最佳交通決策與避坑提醒。',
      },
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: PrivacyView,
      meta: {
        title: '隱私權政策 | Camino Plan',
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

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
})

export default router
