/**
 * 有关角色管理相关接口
 */
import request from '@/utils/request'

// 获取角色列表
export function roleList(data) {
  return request({
    url: '/role/list',
    method: 'post',
    data
  })
}

// 新增角色
export function roleCreate(data) {
  return request({
    url: '/role/create',
    method: 'post',
    data
  })
}

// 编辑角色
export function roleUpdate(data) {
  return request({
    url: '/role/edit',
    method: 'post',
    data
  })
}

// 删除角色
export function roleDelete(id) {
  return request({
    url: '/role/' + id,
    method: 'delete'
  })
}

// 查询角色权限
export function roleMenuList(id) {
  return request({
    url: '/role/menus/' + id,
    method: 'get'
  })
}

// 分配角色权限
export function roleMenuUpdate(id, data) {
  return request({
    url: '/role/addMenus/' + id,
    method: 'post',
    data
  })
}
