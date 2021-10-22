/**
 * 有关树形目录的获取API
 */
import request from '@/utils/request'

export function buildMenus() {
  return request({
    url: 'user/getInfo',
    method: 'get'
  })
}

export default { buildMenus }
