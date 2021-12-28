
/**
 * 有关服务器管理相关接口
 */
import request from '@/utils/request'

// 获取服务器状态
export function serverStatus(data) {
  return request({
    url: '/server/status',
    method: 'post',
    data
  })
}
