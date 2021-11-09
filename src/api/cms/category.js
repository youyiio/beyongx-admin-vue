/**
 * 有关分类管理相关接口
 */
import request from '@/utils/request'

// 查询分类列表
export function categoryList(data) {
  return request({
    url: '/category/list',
    method: 'post',
    data
  })
}

// 查询分类列表
export function setStatus(data) {
  return request({
    url: '/category/setStatus',
    method: 'post',
    data
  })
}

