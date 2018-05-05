import Vue from 'vue'
// import axios from 'axios'
import ElementUI from 'element-ui'
import Mousetrap from 'mousetrap'
import VueClipboards from 'vue-clipboards'
// import VueCroppa from 'vue-cropper'
import './assets/font/iconfont.css'
import 'element-ui/lib/theme-chalk/index.css'
import 'element-ui/lib/theme-chalk/base.css'

import App from './App'
import router from './router'
// import store from './store'
import Fetch from './common/fetch'
import DB from './common/db'
import './common/filter'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
// Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(ElementUI, { size: 'small' })
Vue.use(VueClipboards)
// Vue.use(VueCroppa)
Vue.use(Fetch)

Mousetrap.bind('command+,', () => {
  window.vm.$router.push('/setting')
})

Vue.prototype.$db = DB
/* eslint-disable no-new */
window.vm = new Vue({
  components: { App },
  router,
  // store,
  template: '<App/>'
}).$mount('#app')
