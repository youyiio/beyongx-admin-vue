import { constantRoutes } from '@/router/routers'
import Layout from '@/layout'
import ParentView from '@/components/ParentView'

const permission = {
  state: {
    routes: constantRoutes,
    addRoutes: [],
    sidebarRoutes: [],
    roles: []
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes
      state.routes = constantRoutes.concat(routes)
    },
    SET_SIDEBAR_ROUTES: (state, routes) => {
      state.sidebarRoutes = constantRoutes.concat(routes)
    },
    SET_ROLES: (state, permissions) => {
      state.roles = permissions
    }
  },
  actions: {
    GenerateRoutes({ commit }, asyncRoute) {
      commit('SET_ROUTES', asyncRoute)
    },
    SetSidebarRoutes({ commit }, sidebarRoute) {
      commit('SET_SIDEBAR_ROUTES', sidebarRoute)
    },
    SetRoles({ commit }, permissions) {
      if (permissions.length === 0) {
        commit('SET_ROLES', ['ROLE_SYSTEM_DEFAULT'])
      } else {
        commit('SET_ROLES', permissions)
      }
    }
  }
}

export const filterAsyncRoutes = (routes, lastRoute = false, type = false) => { // 遍历后台传来的路由字符串，转换为组件对象
  return routes.filter(route => {
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    if (route.component) {
      if (route.component === 'Layout') { // Layout组件特殊处理
        route.component = Layout
      } else if (route.component === 'ParentView') {
        route.component = ParentView
      } else {
        const component = route.component
        route.component = loadView(component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRoutes(route.children, route, type)
    } else {
      delete route['children']
      delete route['redirect']
    }
    return true
  })
}

function filterChildren(childrenMap, lastRoute = false) {
  var children = []
  childrenMap.forEach((el, index) => {
    if (el.children && el.children.length) {
      if (el.component === 'ParentView') {
        el.children.forEach(c => {
          c.path = el.path + '/' + c.path
          if (c.children && c.children.length) {
            children = children.concat(filterChildren(c.children, c))
            return
          }
          children.push(c)
        })
        return
      }
    }
    if (lastRoute) {
      el.path = lastRoute.path + '/' + el.path
    }
    children = children.concat(el)
  })
  return children
}

export const loadView = (view) => {
  return (resolve) => require([`@/views/${view}`], resolve)
}

export default permission
