import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/layout'

Vue.use(Router)

// 默认是 @/views/login/index,根据项目调整, 修改.env
const loginComponent = process.env.VUE_APP_LOGIN_COMPONENT

/**
 * 定义无需权限控制页面路径
 */
export const constantRoutes = [
  {
    path: '/login',
    component: (resolve) => require([`@/views/${loginComponent}`], resolve),
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
        meta: { title: '首页', icon: 'index', affix: true, noCache: true }
      }
    ]
  }
]

const router = new Router(
  {
    // mode: 'hash',
    // mode: 'history',
    mode: process.env.VUE_APP_ROUTER_MODE,
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  }
)

export default router

