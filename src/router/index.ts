import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import PrivacyView from '@/views/PrivacyView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: PrivacyView
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
