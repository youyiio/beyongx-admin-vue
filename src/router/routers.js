import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/layout'

Vue.use(Router)

/**
 * 定义无需权限控制页面路径
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login'),
    meta: { title: '登录', noCache: true },
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/exception/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/exception/401'),
    hidden: true
  },
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/exception/redirect')
      }
    ]
  },
  /**
     * 默认进入首页
     */
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'el-icon-s-home', affix: true, noCache: true }
      }
    ]
  }
]

const router = new Router(
  {
    // mode: 'hash',
    mode: 'history',
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  }
)

export default router

