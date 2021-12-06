/**
 * 有关部门管理相关接口
 */
import request from '@/utils/request'

// 获取部门列表
export function deptList(data) {
  return request({
    url: '/dept/list',
    method: 'post',
    data
  })
}

// 新增部门
export function deptCreate(data) {
  return request({
    url: '/dept/create',
    method: 'post',
    data
  })
}

// 编辑部门
export function deptUpdate(data) {
  return request({
    url: '/dept/edit',
    method: 'post',
    data
  })
}

// 删除部门
export function deptDelete(id) {
  return request({
    url: '/dept/' + id,
    method: 'delete'
  })
}
