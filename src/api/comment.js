/**
 * 有关评论管理相关接口
 */
import request from '@/utils/request'

// 查询文章列表
export function commentList(data) {
  return request({
    url: '/comment/list',
    method: 'post',
    data
  })
}

// 创建新文章
export function createComment() {
  return request({
    url: '/comment/create',
    method: 'post'
  })
}

// 编辑文章
export function editComment() {
  return request({
    url: '/comment/edit',
    method: 'post'
  })
}

// 审核文章
export function auditComment() {
  return request({
    url: '/comment/audit',
    method: 'post'
  })
}

// 删除文章
export function deleteComment(data) {
  return request({
    url: '/comment/delete',
    method: 'delete',
    data
  })
}
