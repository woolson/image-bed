import Vue from 'vue'
// import axios from 'axios'
import ElementUI from 'element-ui'
import VueClipboards from 'vue-clipboards'
import 'element-ui/lib/theme-chalk/index.css'
import 'element-ui/lib/theme-chalk/base.css'

import App from './App'
import router from './router'
import store from './store'
import './common/filter'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
// Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(ElementUI, { size: 'small' })
Vue.use(VueClipboards)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
