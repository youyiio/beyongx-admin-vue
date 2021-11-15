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

// 设置分类状态
export function categoryStatus(data) {
  return request({
    url: '/category/setStatus',
    method: 'post',
    data
  })
}

// 新增分类
export function categoryCreate(data) {
  return request({
    url: '/category/create',
    method: 'post',
    data
  })
}

// 编辑分类
export function categoryUpdate(data) {
  return request({
    url: '/category/edit',
    method: 'post',
    data
  })
}

// 删除分类
export function categoryDelete(id) {
  return request({
    url: '/category/' + id,
    method: 'delete'
  })
}

