import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'upload',
      component: require('@/components/upload').default
    },
    {
      path: '/setting',
      name: 'setting',
      component: require('@/components/setting').default
    },
    {
      path: '/history',
      name: 'history',
      component: require('@/components/history').default
    },
    {
      path: '/setting',
      name: 'setting',
      component: require('@/components/setting').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
