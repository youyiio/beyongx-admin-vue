/**
 * 有关岗位管理相关接口
 */
import request from '@/utils/request'

// 获取岗位列表
export function jobList(data) {
  return request({
    url: '/job/list',
    method: 'post',
    data
  })
}

// 新增岗位
export function jobCreate(data) {
  return request({
    url: '/job/create',
    method: 'post',
    data
  })
}

// 编辑岗位
export function jobUpdate(data) {
  return request({
    url: '/job/edit',
    method: 'post',
    data
  })
}

// 删除岗位
export function jobDelete(id) {
  return request({
    url: '/job/' + id,
    method: 'delete'
  })
}
