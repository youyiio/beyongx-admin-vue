/**
 * 有关树形目录的获取API
 */
import request from '@/utils/request'

export function buildMenus() {
  return request({
    url: 'ucenter/getInfo',
    method: 'get'
  })
}

export default { buildMenus }
