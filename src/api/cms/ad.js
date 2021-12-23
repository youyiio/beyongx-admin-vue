/**
 * 有关广告管理相关接口
 */
import request from '@/utils/request'

// 查询广告列表
export function adList(data) {
  return request({
    url: '/ad/list',
    method: 'post',
    data
  })
}

// 查询广告插槽
export function slotList() {
  return request({
    url: '/ad/slots',
    method: 'get'
  })
}

// 新增广告
export function adCreate(data) {
  return request({
    url: '/ad/create',
    method: 'post',
    data
  })
}

// 编辑广告
export function adUpdate(data) {
  return request({
    url: '/ad/edit',
    method: 'post',
    data
  })
}

// 上下线广告
export function adStatus(data) {
  return request({
    url: '/ad/setStatus',
    method: 'post',
    data
  })
}

// 删除广告
export function adDelete(id) {
  return request({
    url: '/ad/' + id,
    method: 'delete'
  })
}
