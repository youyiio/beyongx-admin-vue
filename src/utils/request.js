import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// 针对token过期多个请求同时请求的问题
const CancelToken = axios.CancelToken
const penddingUrl = []

// request interceptor
service.interceptors.request.use(
  config => {
    config.cancelToken = new CancelToken((c) => {
      penddingUrl.push({ fun: c, url: config.url })
    })
    // do something before request is sent
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // if the custom code is not 1, it is judged as an error.
    if (res.code !== 1) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 6 || res.code === 7 || res.code === 8) {
        for (const i in penddingUrl) {
          penddingUrl[i].fun()
          penddingUrl.splice(i, 1)
        }
        // to re-login
        MessageBox.confirm('您即将退出，您可以取消留在当前页或者重新登录！', '确认退出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('ResetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      for (const i in penddingUrl) {
        if (response.config.url === penddingUrl[i].url) {
          penddingUrl.splice(i, 1)
        }
      }
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
