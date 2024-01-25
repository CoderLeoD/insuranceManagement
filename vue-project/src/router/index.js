import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/Login.vue'
import { usersList } from './userManagement'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    // 客户管理
    {
      path: '/main',
      name: 'main',
      redirect: '/main/usersList',
      component: () => import('../views/HomeView.vue'),
      children: [
        ...usersList,
      ],
    },
    {
      path: '/404',
      name: 'notFound',
      component: () => import('../views/NotFound.vue'),
    },
    {
      // 将匹配所有内容并将其放在 `$route.params.pathMatch` 下
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ]
})

export default router
