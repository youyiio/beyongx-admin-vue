import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'

const user = {
  state: {
    token: getToken(),
    tokenExpired: false,
    user: {},
    roles: [],
    // 第一次加载菜单时用到
    loadMenus: false
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_USER: (state, user) => {
      state.user = user
    },
    SET_ROLES: (state, roles) => {
      roles.forEach(element => {
        state.roles.push(element.name)
      })
      // state.roles = roles
    },
    SET_LOAD_MENUS: (state, loadMenus) => {
      state.loadMenus = loadMenus
    },
    SET_TOKEN_EXPIRED: (state, tokenExpired) => {
      state.tokenExpired = tokenExpired
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const { username, password } = userInfo
      return new Promise((resolve, reject) => {
        login({ username: username.trim(), password: password }).then(response => {
          const { data } = response
          commit('SET_TOKEN', data.token)
          setToken(data.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit }) {
      return new Promise((resolve, reject) => {
        getInfo().then(response => {
          const { data } = response
          setUserInfo(data, commit)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    // 登出
    Logout({ commit }) {
      return new Promise((resolve, reject) => {
        logout().then(res => {
          setLogout(commit)
          resolve()
        }).catch(error => {
          setLogout(commit)
          reject(error)
        })
      })
    },

    UpdateLoadMenus({ commit }) {
      return new Promise((resolve, reject) => {
        commit('SET_LOAD_MENUS', false)
      })
    },

    ResetToken({ commit }) {
      return new Promise(resolve => {
        setLogout(commit)
        resolve()
      })
    },
    TokenExpired({ commit }, tokenExpired) {
      return new Promise((resolve, reject) => {
        commit('SET_TOKEN_EXPIRED', tokenExpired)
      })
    }
  }
}

export const setLogout = (commit) => {
  commit('SET_TOKEN', '')
  commit('SET_ROLES', [])
  removeToken()
}

export const setUserInfo = (res, commit) => {
  // 如果没有任何权限，则赋予一个默认的权限，避免请求死循环
  // if (res.roles.length === 0) {
  //   commit('SET_ROLES', ['ROLE_SYSTEM_DEFAULT'])
  // } else {
  //   commit('SET_ROLES', res.roles)
  // }
  commit('SET_USER', res)
}

export default user
