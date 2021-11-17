/**
 * 有关文章管理相关接口
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

// 获取文章详情
export function articleDetail(id) {
  return request({
    url: '/article/' + id,
    method: 'get'
  })
}

// 创建新文章
export function articleCreate(data) {
  return request({
    url: '/article/create',
    method: 'post',
    data
  })
}

// 编辑文章
export function articleUpdate(id, data) {
  return request({
    url: '/article/' + id,
    method: 'post',
    data
  })
}

// 发布文章
export function articlePublish(data) {
  return request({
    url: '/article/publish',
    method: 'post',
    data
  })
}

// 审核文章
export function articleAudit() {
  return request({
    url: '/article/audit',
    method: 'post'
  })
}

// 删除文章
export function articleDelete(data) {
  return request({
    url: '/article/delete',
    method: 'delete',
    data
  })
}
