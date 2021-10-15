/** 内容管理 **/

import Layout from '@/layout'

const systemRouter = {
  path: '/system',
  component: Layout,
  redirect: 'noRedirect',
  name: 'System',
  meta: { title: '系统管理', icon: 'el-icon-setting' },
  children: [
    {
      path: 'user',
      component: () => import('@/views/empty/index'),
      name: 'User',
      meta: { title: '用户管理', noCache: true, icon: '' }
    },
    {
      path: 'role',
      component: () => import('@/views/empty/index'),
      name: 'Role',
      meta: { title: '角色管理', noCache: true, icon: '' }
    },
    {
      path: 'menu',
      component: () => import('@/views/empty/index'),
      name: 'Menu',
      meta: { title: '菜单管理', noCache: true, icon: '' }
    },
    {
      path: 'department',
      component: () => import('@/views/empty/index'),
      name: 'Department',
      meta: { title: '部门管理', noCache: true, icon: '' }
    },
    {
      path: 'dict',
      component: () => import('@/views/empty/index'),
      name: 'Dict',
      meta: { title: '字典管理', noCache: true, icon: '' }
    }
  ]
}

export default systemRouter
