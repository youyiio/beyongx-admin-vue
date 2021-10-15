/** 内容管理 **/

import Layout from '@/layout'

const contentRouter = {
  path: '/content',
  component: Layout,
  redirect: 'noRedirect',
  name: 'Content',
  meta: { title: '内容管理', icon: '' },
  children: [
    {
      path: 'article',
      component: () => import('@/views/empty/index'),
      name: 'Article',
      meta: { title: '文章管理', noCache: true, icon: '' }
    },
    {
      path: 'comment',
      component: () => import('@/views/empty/index'),
      name: 'Comment',
      meta: { title: '评论管理', noCache: true, icon: '' }
    },
    {
      path: 'category',
      component: () => import('@/views/empty/index'),
      name: 'Category',
      meta: { title: '文章分类', noCache: true, icon: '' }
    },
    {
      path: 'ad',
      component: () => import('@/views/empty/index'),
      name: 'Ad',
      meta: { title: '广告管理', noCache: true, icon: '' }
    }
  ]
}

export default contentRouter
