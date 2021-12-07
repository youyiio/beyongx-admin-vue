/**
 * 有关日志管理相关接口
 */
import request from '@/utils/request'

// 获取部门列表
export function logList(data) {
  return request({
    url: '/log/list',
    method: 'post',
    data
  })
}
