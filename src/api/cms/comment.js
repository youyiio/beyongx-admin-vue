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

// 审核文章
export function commentAudit(data) {
  return request({
    url: '/comment/audit',
    method: 'post',
    data
  })
}

// 删除文章
export function commentDelete(data) {
  return request({
    url: '/comment/delete',
    method: 'delete',
    data
  })
}
