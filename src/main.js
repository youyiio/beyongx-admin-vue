import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets (css样式初始化)

import Element from 'element-ui'
import '@/assets/styles/element-variables.scss' // 自定义主题

import '@/assets/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router/routers'

import './assets/icons' // icon
import './router/index'
import './utils/error-log' // error log
import permission from '@/directive/permission'

import * as filters from './filters' // global filters

Vue.use(Element, {
  size: Cookies.get('size') || 'small' // set element-ui default size
})

Vue.use(permission)

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
