/**
 * 有关菜单管理相关接口
 */
import request from '@/utils/request'

// 获取菜单列表
export function menuList(data) {
  return request({
    url: '/menu/list',
    method: 'post',
    data
  })
}

// 新增菜单
export function menuCreate(data) {
  return request({
    url: '/menu/create',
    method: 'post',
    data
  })
}

// 编辑菜单
export function menuUpdate(data) {
  return request({
    url: '/menu/edit',
    method: 'post',
    data
  })
}

// 删除菜单
export function menuDelete(id) {
  return request({
    url: '/menu/' + id,
    method: 'delete'
  })
}
