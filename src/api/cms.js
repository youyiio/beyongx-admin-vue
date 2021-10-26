/**
 * 有关内容管理相关接口
 */
import request from '@/utils/request'

// 查询文章列表
export function articleList() {
  return request({
    url: '/article/list',
    method: 'post'
  })
}

export function createArticle() {
  return request({
    url: '/article/create',
    method: 'post'
  })
}

export function editArticle() {
  return request({
    url: '/article/edit',
    method: 'post'
  })
}

export function publishArticle() {
  return request({
    url: '/article/publish',
    method: 'post'
  })
}

export function auditArticle() {
  return request({
    url: '/article/audit',
    method: 'post'
  })
}

export function deleteArticle() {
  return request({
    url: '/article/delete',
    method: 'post'
  })
}
