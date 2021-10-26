const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  introduction: state => state.user.introduction,
  user: state => state.user.user,
  roles: state => state.user.roles,
  loadMenus: state => state.user.loadMenus,
  permission_routes: state => state.permission.routes,
  addRoutes: state => state.permission.addRoutes,
  sidebarRoutes: state => state.permission.sidebarRoutes,
  errorLogs: state => state.errorLog.logs
}
export default getters
