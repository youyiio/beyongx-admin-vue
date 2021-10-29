/**
 * 有关内容管理相关接口
 */
import request from '@/utils/request'

// 查询文章列表
export function articleList(data) {
  return request({
    url: '/article/list',
    method: 'post',
    data
  })
}

// 创建新文章
export function createArticle() {
  return request({
    url: '/article/create',
    method: 'post'
  })
}

// 编辑文章
export function editArticle() {
  return request({
    url: '/article/edit',
    method: 'post'
  })
}

// 发布文章
export function publishArticle(data) {
  return request({
    url: '/article/publish',
    method: 'post',
    data
  })
}

// 审核文章
export function auditArticle() {
  return request({
    url: '/article/audit',
    method: 'post'
  })
}

// 删除文章
export function deleteArticle(data) {
  return request({
    url: '/article/delete',
    method: 'delete',
    data
  })
}
