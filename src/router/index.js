import router from '@/router/routers'
import store from '@/store'
import setConfig from '@/settings'
import NProgress from 'nprogress' // 引入进度条插件
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { buildMenus } from '@/api/menu'
import { filterAsyncRoutes } from '@/store/modules/permission'

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
          store.dispatch('LogOut').then(() => {
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
  buildMenus().then(res => {
    res = [{
      'alwaysShow': true,
      'component': 'Layout',
      'hidden': false,
      'meta': { 'icon': 'el-icon-news', 'noCache': true, 'title': '内容管理' },
      'name': '内容管理',
      'path': '/cms',
      'redirect': 'noredirect',
      'children': [
        { 'component': 'example/list', 'hidden': false, 'meta': { 'icon': 'peoples', 'noCache': true, 'title': '文章管理' }, 'name': 'User', 'path': 'user' },
        { 'component': 'example/list', 'hidden': false, 'meta': { 'icon': 'role', 'noCache': true, 'title': '评论管理' }, 'name': 'Role', 'path': 'role' },
        { 'component': 'example/list', 'hidden': false, 'meta': { 'icon': 'menu', 'noCache': true, 'title': '文章分类' }, 'name': 'Menu', 'path': 'menu' },
        { 'component': 'example/list', 'hidden': false, 'meta': { 'icon': 'dept', 'noCache': true, 'title': '广告管理' }, 'name': 'Dept', 'path': 'dept' }
      ]
    },
    {
      'alwaysShow': true,
      'component': 'Layout',
      'hidden': false,
      'meta': { 'icon': 'el-icon-data-line', 'noCache': true, 'title': '运维管理' },
      'name': '运维管理',
      'path': '/monitor',
      'redirect': 'noredirect',
      'children': [
        { 'component': 'monitor/online/index', 'hidden': false, 'meta': { 'icon': 'Steve-Jobs', 'noCache': true, 'title': '服务器监控' }, 'name': 'OnlineUser', 'path': 'online' },
        { 'component': 'monitor/log/index', 'hidden': false, 'meta': { 'icon': 'log', 'noCache': false, 'title': '操作日志' }, 'name': 'Log', 'path': 'logs' },
        { 'component': 'monitor/log/errorLog', 'hidden': false, 'meta': { 'icon': 'error', 'noCache': true, 'title': '数据库管理' }, 'name': 'ErrorLog', 'path': 'errorLog' }
      ]

    },
    {
      'alwaysShow': true,
      'component': 'Layout',
      'hidden': false,
      'meta': { 'icon': 'el-icon-setting', 'noCache': true, 'title': '系统管理' },
      'name': '系统管理',
      'path': '/system',
      'redirect': 'noredirect',
      'children': [
        { 'component': 'monitor/online/index', 'hidden': false, 'meta': { 'icon': 'Steve-Jobs', 'noCache': true, 'title': '用户管理' }, 'name': 'OnlineUser', 'path': 'online' },
        { 'component': 'monitor/log/index', 'hidden': false, 'meta': { 'icon': 'log', 'noCache': false, 'title': '角色管理' }, 'name': 'Log', 'path': 'logs' },
        { 'component': 'monitor/log/errorLog', 'hidden': false, 'meta': { 'icon': 'error', 'noCache': true, 'title': '菜单管理' }, 'name': 'ErrorLog', 'path': 'errorLog' },
        { 'component': 'monitor/server/index', 'hidden': false, 'meta': { 'icon': 'codeConsole', 'noCache': true, 'title': '部门管理' }, 'name': 'ServerMonitor', 'path': 'server' },
        { 'component': 'monitor/sql/index', 'hidden': true, 'meta': { 'icon': 'sqlMonitor', 'noCache': true, 'title': '岗位管理' }, 'name': 'Sql', 'path': 'druid' },
        { 'component': 'monitor/sql/index', 'hidden': true, 'meta': { 'icon': 'sqlMonitor', 'noCache': true, 'title': '字典管理' }, 'name': 'Sql', 'path': 'druid' }
      ]

    }]
    const sdata = JSON.parse(JSON.stringify(res))
    const rdata = JSON.parse(JSON.stringify(res))
    const sidebarRoutes = filterAsyncRoutes(sdata)
    const rewriteRoutes = filterAsyncRoutes(rdata, false, true)
    // const sidebarRoutes = []
    // const rewriteRoutes = []
    rewriteRoutes.push({ path: '*', redirect: '/404', hidden: true })

    store.dispatch('GenerateRoutes', rewriteRoutes).then(() => { // 存储路由
      router.addRoutes(rewriteRoutes) // 动态添加可访问路由表
      next({ ...to, replace: true })
    })
    store.dispatch('SetSidebarRoutes', sidebarRoutes)
  })
}
