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
  buildMenus().then(res => {
    res = [{
      'alwaysShow': true,
      'component': 'Layout',
      'hidden': false,
      'meta': { 'icon': 'el-icon-news', 'noCache': true, 'title': '内容管理' },
      'name': '内容管理',
      'path': '/cms',
      'redirect': 'noRedirect',
      'children': [
        { 'component': 'cms/article', 'hidden': false, 'meta': { 'icon': 'el-icon-reading', 'noCache': true, 'title': '文章管理' }, 'name': 'ArticleList', 'path': 'articleList' },
        { 'component': 'cms/article/detail', 'hidden': true, 'meta': { 'icon': 'el-icon-reading', 'noCache': true, 'title': '文章详情' }, 'name': 'ArticleDetail', 'path': 'articleDetail' },
        { 'component': 'cms/comment', 'hidden': false, 'meta': { 'icon': 'el-icon-reading', 'noCache': true, 'title': '评论管理' }, 'name': 'Comment', 'path': 'commentList' },
        { 'component': 'cms/category', 'hidden': false, 'meta': { 'icon': 'el-icon-reading', 'noCache': true, 'title': '文章分类' }, 'name': 'Category', 'path': 'categoryList' },
        { 'component': 'cms/ad', 'hidden': false, 'meta': { 'icon': 'el-icon-reading', 'noCache': true, 'title': '广告管理' }, 'name': 'Ad', 'path': 'AdList' }
      ]
    },
    {
      'alwaysShow': true,
      'component': 'Layout',
      'hidden': false,
      'meta': { 'icon': 'el-icon-data-line', 'noCache': true, 'title': '运维管理' },
      'name': '运维管理',
      'path': '/operation',
      'redirect': 'noRedirect',
      'children': [
        { 'component': 'empty', 'hidden': false, 'meta': { 'icon': 'el-icon-reading', 'noCache': true, 'title': '服务器监控' }, 'name': 'Serve', 'path': 'serve' },
        { 'component': 'empty', 'hidden': false, 'meta': { 'icon': 'el-icon-reading', 'noCache': false, 'title': '操作日志' }, 'name': 'Logs', 'path': 'logs' },
        { 'component': 'empty', 'hidden': false, 'meta': { 'icon': 'el-icon-reading', 'noCache': true, 'title': '数据库管理' }, 'name': 'SqlData', 'path': 'sqlData' }
      ]

    },
    {
      'alwaysShow': true,
      'component': 'Layout',
      'hidden': false,
      'meta': { 'icon': 'el-icon-setting', 'noCache': true, 'title': '系统管理' },
      'name': '系统管理',
      'path': '/system',
      'redirect': 'noRedirect',
      'children': [
        { 'component': 'empty', 'hidden': false, 'meta': { 'icon': 'el-icon-reading', 'noCache': true, 'title': '用户管理' }, 'name': 'User', 'path': 'user' },
        { 'component': 'empty', 'hidden': false, 'meta': { 'icon': 'el-icon-reading', 'noCache': false, 'title': '角色管理' }, 'name': 'Roles', 'path': 'roles' },
        { 'component': 'empty', 'hidden': false, 'meta': { 'icon': 'el-icon-reading', 'noCache': true, 'title': '菜单管理' }, 'name': 'Menus', 'path': 'menus' },
        { 'component': 'empty', 'hidden': false, 'meta': { 'icon': 'el-icon-reading', 'noCache': true, 'title': '部门管理' }, 'name': 'Department', 'path': 'department' },
        { 'component': 'empty', 'hidden': false, 'meta': { 'icon': 'el-icon-reading', 'noCache': true, 'title': '岗位管理' }, 'name': 'Gangwei', 'path': 'gangwei' },
        { 'component': 'empty', 'hidden': false, 'meta': { 'icon': 'el-icon-reading', 'noCache': true, 'title': '字典管理' }, 'name': 'Dict', 'path': 'dict' }
      ]

    }]
    const sdata = JSON.parse(JSON.stringify(res))
    const rdata = JSON.parse(JSON.stringify(res))
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
