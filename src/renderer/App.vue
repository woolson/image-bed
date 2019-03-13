<template lang="pug">
  div(id="app")
    header
      div(
        v-for="item,index in tabs"
        :class="{active: $route.path === item.path}"
        @click="$router.push(item.path)"
      )
        span {{item.name}}
    main.content
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
        {name: '上传', path: '/'},
        {name: '历史', path: '/history'},
        {name: '设置', path: '/setting'}
        // {name: '关于', path: '/about'}
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
          case newPath === '/history' && oldPath === '/about':
          case newPath === '/history' && oldPath === '/setting':
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
body
  min-width 300px

#app
  height 100vh
  display flex
  flex-direction column
  header
    margin 0
    color $black
    display flex
    padding-top .05rem
    align-items flex-end
    height 1.2rem
    flex-shrink 0
    justify-content center
    display flex
    -webkit-app-region drag
    background linear-gradient(45deg, #0fbae5, #20b583)
    > div
      margin-left .5rem
      user-select none
      display flex
      text-align center
      color white
      cursor pointer
      font-size 14px
      transition all .3s
      opacity .5
      &:first-child
        margin-left 0
      &.active
        opacity 1
        font-size 18px
        position relative
        border-bottom .05rem solid white
        &:after
          position absolute
          content ' '
          height .05rem
          width 100%
          background white
          bottom -.1rem
      // &.active
      //   color $primary
    > .header__ctrl
      display flex
      height 25px
      align-items center
      padding 0 3px 0 8px
      -webkit-app-region drag
      flex-shrink 0
      span
        display inline-flex
        width 10px
        height 10px
        border-radius 100%
        font-size 14px
        justify-content center
        line-height 8px
        cursor pointer
        &.close
          margin-right 8px
          color $red
          border 1px solid darken($red, 10)
          background $red
          &:hover
            color: darken($red, 50)
        &.minus
          color $yellow
          border 1px solid darken($yellow, 10)
          background $yellow
          &:hover
            color: darken($yellow, 50)

#app > .content
  flex 1
  position relative
  display flex
  > div
    height 100%
    width 100vw
    background white
    box-sizing border-box

.slide-enter-active
  z-index 2
  min-height 100vh
  animation-fill-mode both
  animation-duration .25s
  &.left
    animation-name moveLeftIn
  &.right
    animation-name moveRightIn
.slide-leave-active
  z-index 1
  min-height 100vh
  animation-fill-mode both
  animation-duration .25s
  &.left
    animation moveLeftOut
  &.right
    animation moveRightOut

.slide-enter-active, .slide-leave-active
  position absolute
  top 0
  left 0
  width 100vw
  height 100%
  background white
  // opacity 0
</style>
