import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: require('@/components/home').default
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
      path: '/about',
      name: 'about',
      component: require('@/components/about').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
