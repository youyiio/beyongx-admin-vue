/**
 * 有关字典管理相关接口
 */
import request from '@/utils/request'

// 获取字典组别列表
export function dictList(data) {
  return request({
    url: '/config/groups',
    method: 'post',
    data
  })
}

// 获取字典列表
export function detailList(data) {
  return request({
    url: '/config/list',
    method: 'post',
    data
  })
}

// 新增字典
export function dictCreate(data) {
  return request({
    url: '/config/create',
    method: 'post',
    data
  })
}

// 编辑字典
export function dictUpdate(data) {
  return request({
    url: '/config/edit',
    method: 'post',
    data
  })
}

// 删除字典
export function dictDelete(id) {
  return request({
    url: '/config/' + id,
    method: 'delete'
  })
}
