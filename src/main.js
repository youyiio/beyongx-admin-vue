import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets (css样式初始化)

import Element from 'element-ui'
import '@/assets/styles/element-variables.scss' // 自定义主题

import '@/assets/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router/routers'

import './icons' // icon
import './router/index'
// import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters

Vue.use(Element, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
})

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
