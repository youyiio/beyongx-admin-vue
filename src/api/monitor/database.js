
/**
 * 有关数据库管理相关接口
 */
import request from '@/utils/request'

// 获取数据库表
export function tables(data) {
  return request({
    url: '/db/tables',
    method: 'post',
    data
  })
}
