/**
 * 有关字典管理相关接口
 */
import request from '@/utils/request'

// 获取字典组别列表
export function dictList(data) {
  return request({
    url: '/config/query',
    method: 'post',
    data
  })
}
