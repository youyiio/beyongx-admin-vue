/**
 * 有关用户管理相关接口
 */
import request from '@/utils/request'

// 获取用户列表
export function userList(data) {
  return request({
    url: '/user/list',
    method: 'post',
    data
  })
}

// 新增用户
export function userCreate(data) {
  return request({
    url: '/user/create',
    method: 'post',
    data
  })
}

// 编辑用户
export function userUpdate(data) {
  return request({
    url: '/user/edit',
    method: 'post',
    data
  })
}

// 删除用户
export function userDelete(id) {
  return request({
    url: '/user/' + id,
    method: 'delete'
  })
}

// 冻结用户
export function userFreeze(data) {
  return request({
    url: '/user/freeze',
    method: 'post',
    data
  })
}

// 解冻用户
export function userUnfreeze(data) {
  return request({
    url: '/user/unfreeze',
    method: 'post',
    data
  })
}

// 修改密码
export function userModifyPwd(data) {
  return request({
    url: '/user/modifyPassword',
    method: 'post',
    data
  })
}
