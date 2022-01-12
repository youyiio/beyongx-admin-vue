import router from '@/router/routers'
import store from '@/store'
import setConfig from '@/settings'
import NProgress from 'nprogress' // 引入进度条插件
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { filterAsyncRoutes } from '@/store/modules/permission'
import { menuRoleList } from '@/api/system/menu'
import { buildMenus, buildPermissions } from '@/utils'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login'] // 无需权限控制的组件模块白名单

router.beforeEach((to, from, next) => {
  // 设置网站标题
  if (to.meta.title) {
    document.title = to.meta.title + ' - ' + setConfig.title
  }
  NProgress.start() // 进度条开始
  if (getToken()) { // 已登录获取到了Token
    if (to.path === '/login') {
      next({ path: '/' }) // 登录页有Token直接跳转
      NProgress.done() // 进度条结束
    } else {
      if (store.getters.roles.length === 0) { // 判断登录用户是否有角色权限信息
        store.dispatch('GetInfo').then(() => { // 拉取用户信息
          loadMenus(next, to) // 动态路由，拉取菜单信息
        }).catch(() => {
          store.dispatch('Logout').then(() => {
            location.reload() // 为了重新实例化vue-router对象 避免bug
          })
        })
        // 登录时未拉取菜单，在此处拉取
      } else if (store.getters.loadMenus) {
        // loadMenus修改成false，防止死循环
        store.dispatch('UpdateLoadMenus')
        loadMenus(next, to)
      } else {
        next()
      }
    }
  } else {
    // 未获取到Token
    if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${to.path}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // 进度条结束
})

export const loadMenus = (next, to) => {
  menuRoleList().then(res => {
    const menus = buildMenus(res.data)
    const permissions = buildPermissions(res.data)
    store.dispatch('SetRoles', permissions)
    const sdata = JSON.parse(JSON.stringify(menus))
    const rdata = JSON.parse(JSON.stringify(menus))
    const sidebarRoutes = filterAsyncRoutes(sdata)
    const rewriteRoutes = filterAsyncRoutes(rdata, false, true)

    rewriteRoutes.push({ path: '*', redirect: '/404', hidden: true })

    store.dispatch('GenerateRoutes', rewriteRoutes).then(() => { // 存储路由
      router.addRoutes(rewriteRoutes) // 动态添加可访问路由表
      next({ ...to, replace: true })
    })
    store.dispatch('SetSidebarRoutes', sidebarRoutes)
  })
}
