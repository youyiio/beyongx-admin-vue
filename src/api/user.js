import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/sign/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/ucenter/getInfo',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/sign/logout',
    method: 'post'
  })
}
