<template lang="pug">
  div(id="app")
    div.header
      div.header__ctrl
        span.close(@click="quite") &times;
        span.minus(@click="mini") &minus;
      ul.header__nav
        li(
          v-for="item,index in tabs"
          :class="{active: $route.path === item.path}"
          @click="$router.push(item.path)"
        )
          span {{item.name}}
    div.content
      transition(
        name="slide"
        appear
        duration="300"
        v-on:before-enter="addAnimation"
        v-on:before-leave="addAnimation"
        v-on:after-enter="removeAnimation"
        v-on:after-leave="removeAnimation"
      )
        keep-alive
          router-view
</template>

<script>
  export default {
    name: 'mac-share',

    data: () => ({
      tabs: [
        {name: '首页', path: '/'},
        {name: '历史', path: '/history'},
        {name: '关于', path: '/about'}
      ],
      tabIndex: 0,
      showLogin: false
    }),

    methods: {
      quite () {
        this.$electron.ipcRenderer.sendSync('quite')
      },
      mini () {
        this.$electron.ipcRenderer.sendSync('mini')
      },
      // 动态添加滑动的方向
      addAnimation (el) {
        el.className += ` ${this.routeDir}`
      },
      // 去除添加的方向class
      removeAnimation (el) {
        el.className = el.className.replace(/(\sleft|\sright)/g, '')
      }
    },

    watch: {
      $route (newRoute = {}, oldRoute = {}) {
        // 根据路由确定滑动方向
        let newPath = newRoute.fullPath
        let oldPath = oldRoute.fullPath

        switch (true) {
          // 必须向右滑动
          case newPath === '/':
          case newPath === '/setting' && oldPath === '/about':
            this.routeDir = 'right'
            break
          // 必须向左滑动
          case oldPath === '/functionManage':
            this.routeDir = 'left'
            break
          default:
            if (newPath !== '/') newPath = newPath.substring(0, newPath.length - 1)
            let newPathLevel = newPath.match(/\//g).length

            if (oldPath !== '/') oldPath = oldPath.substring(0, oldPath.length - 1)
            let oldPathLevel = oldPath.match(/\//g).length

            this.routeDir = newPathLevel < oldPathLevel ? 'right' : 'left'
        }
      }
    }
  }
</script>

<style lang="stylus">
@import "./style/components/app.styl"
</style>
