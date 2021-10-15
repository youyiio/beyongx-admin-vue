/** 运维管理 **/

import Layout from '@/layout'

const operationRouter = {
  path: '/operation',
  component: Layout,
  redirect: 'noRedirect',
  name: 'Operation',
  meta: { title: '运维管理', icon: 'el-icon-data-line' },
  children: [
    {
      path: 'server',
      component: () => import('@/views/empty/index'),
      name: 'Server',
      meta: { title: '服务器监控', noCache: true, icon: '' }
    },
    {
      path: 'log',
      component: () => import('@/views/empty/index'),
      name: 'Log',
      meta: { title: '操作日志', noCache: true, icon: '' }
    },
    {
      path: 'database',
      component: () => import('@/views/empty/index'),
      name: 'Database',
      meta: { title: '数据库管理', noCache: true, icon: '' }
    },
    {
      path: 'redis',
      component: () => import('@/views/empty/index'),
      name: 'Redis',
      meta: { title: 'Redis管理', noCache: true, icon: '' }
    }
  ]
}

export default operationRouter
