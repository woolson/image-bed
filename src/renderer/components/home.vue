<template lang="pug">
div.home
  el-upload.home__upload(
    drag
    action="http://picupload.service.weibo.com/interface/pic_upload.php?mime=image%2Fjpeg&data=base64&url=0&markpos=1&logo=&nick=0&marks=1&app=miniblog"
    multiple
    :on-change="onChange"
    :auto-upload="false"
    :show-file-list="false"
    v-if="!result.length"
  )
    i.el-icon-upload
    div.el-upload__text 将文件拖到此处，或
      em 点击上传
  ul.home__list(v-if="!result.length")
    li(v-for="file,index in fileList")
      div.avatar(:style="{backgroundImage: 'url(' + file.url + ')'}")
      div.u-display-flex.u-direction-column.u-flex-1
        div.u-s28.u-display-flex
          span.name {{file.name}}
        div.u-mtauto
          el-button 压缩
          el-button 剪裁
          el-button(
            type="danger"
            @click="onDelete(index)"
          ) 删除
  ul.home__result(v-else)
    li(v-for="item in result")
      div.avatar(:style="{backgroundImage: 'url(' + item.imageUrl + ')'}")
      div.u-display-flex.u-direction-column.u-flex-1
        a(:href="item.imageUrl" target="_blank") {{item.imageUrl}}
        span.u-mtauto.u-green.u-pointer(
          v-clipboard="item.imageUrl"
          @success="copySuccessFn"
        ) 点击复制
  el-button.u-mtauto(
    plain
    @click="onUpload"
    v-if="!result.length"
  ) 确认上传
  el-button.u-mtauto(
    plain
    type="info"
    @click="onClear"
    v-else
  ) 清空列表(可去历史记录查看)
  div.home__login(:style="{top: showLogin ? '0rem' : '-11rem'}")
    webview(src="https://passport.weibo.cn/signin/login?entry=mweibo&r=http%3A%2F%2Fm.weibo.cn" target="_self")
    div(@click="showLogin = false")
      span 登录完成后请关闭
      i.iconfont.icon-close.u-s24.u-ml10
  div.home__layout(v-show="disabled")
    el-button(@click="showLogin = true") 登录
</template>

<script>
import axios from 'axios'
// import { shell } from 'electron'
import { fileToBase64, pidToUrl } from '../common/utils'

const UPLOAD_URL = 'http://picupload.service.weibo.com/interface/pic_upload.php?mime=image%2Fjpeg&data=base64&url=0&markpos=1&logo=&nick=0&marks=1&app=miniblog'
const TEST_BASE64 = '/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAAAAD/4QNQaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0MCA3OS4xNjA0NTEsIDIwMTcvMDUvMDYtMDE6MDg6MjEgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjYzNDdGREZBM0ZGNTExRTg4Qzk2OEE2RjU2MDM1ODhFIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjYzNDdGREY5M0ZGNTExRTg4Qzk2OEE2RjU2MDM1ODhFIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6MGMxZmQxMDAtNzk2Yy0yNjRkLTk5NWUtNjdjOTlmNjZlOGJjIiBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6MGMxZmQxMDAtNzk2Yy0yNjRkLTk5NWUtNjdjOTlmNjZlOGJjIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/+4ADkFkb2JlAGTAAAAAAf/bAIQAGxoaKR0pQSYmQUIvLy9CRz8+Pj9HR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHRwEdKSk0JjQ/KCg/Rz81P0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dH/8AAEQgAAQABAwEiAAIRAQMRAf/EAEsAAQEAAAAAAAAAAAAAAAAAAAAGAQEAAAAAAAAAAAAAAAAAAAAAEAEAAAAAAAAAAAAAAAAAAAAAEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCmAB//2Q=='

export default {
  name: 'home',

  data: () => ({
    fileList: [],
    result: [],
    testFile: {
      name: 'test',
      base64: TEST_BASE64
    },
    showLogin: false,
    disabled: false
  }),

  async mounted () {
    const hasLogin = await this.checkLogin()
    if (!hasLogin) {
      this.showLogin = true
      this.disabled = true
      this.$notify.error({
        title: '错误',
        message: '请登录微博先'
      })
    }
  },

  methods: {
    async onChange (file) {
      const base64 = await fileToBase64(file.raw)
      file.base64 = base64.split(',')[1]
      this.fileList.push(file)
    },
    async checkLogin () {
      const testRel = await this.uploadFile(this.testFile)
      if (!testRel.success && testRel.msg === '请登录微博') {
        return false
      } else return true
    },
    onDelete (index) {
      this.fileList.splice(index, 1)
    },
    onClear () {
      this.fileList = []
      this.result = []
    },
    async onUpload () {
      const requests = this.fileList.map(item => {
        return this.uploadFile(item)
      })
      const result = await Promise.all(requests)

      this.result = result
    },
    uploadFile (file) {
      const formData = new FormData()
      formData.append('b64_data', file.base64)

      const request = [
        UPLOAD_URL,
        formData,
        { withCredentials: true }
      ]

      return axios.post(...request).then(res => {
        let text = res.data
        text = text.replace(/<.*?\/>/, '')
        text = text.replace(/<(\w+).*?>.*?<\/\1>/, '')
        const result = JSON.parse(text)

        switch (result.code) {
          case 'A20001':
            if (result.data.count === -1) {
              return { success: false, msg: '请登录微博', ...file }
            } else {
              return { success: false, msg: '文件类型错误', ...file }
            }
          case 'A00006':
            const pid = result.data.pics.pic_1.pid
            return { success: true, imageUrl: pidToUrl(pid), ...file }
          default:
            return { success: false, msg: '未知错误', ...file }
        }
      })
    },
    copySuccessFn () {
      this.$notify({
        title: '成功',
        message: '复制成功',
        type: 'success'
      })
    }
  },

  watch: {
    async showLogin (newValue) {
      if (!newValue) {
        const hasLogin = await this.checkLogin()
        if (hasLogin) {
          this.disabled = false
          this.$notify({
            title: '成功',
            message: '可以开始使用了',
            type: 'success'
          })
        } else {
          this.$notify.error({
            title: '错误',
            message: '未登录成功哦'
          })
        }
      }
    }
  }
}
</script>

<style lang="stylus">
.home
  flex 1
  display flex
  flex-direction column
  align-items stretch
  padding .2rem .3rem
  // position sticky
  overflow hidden

.home__upload
  > div
    display flex
    .el-upload-dragger
      width 100%
      height auto
      padding .2rem
    .el-icon-upload
      margin-top 0

.home__list
  // display flex
  list-style none
  padding 0
  margin 0
  margin-top .2rem
  // display flex
  // flex-wrap wrap
  li
    width 49%
    display inline-flex
    border 1px solid $border
    padding .1rem
    border-radius .05rem
    box-sizing border-box
    margin-right 2%
    margin-bottom .2rem
    &:nth-child(2n)
      margin-right 0
  .avatar
    flex-shrink 0
    margin-right .15rem
    height 1.3rem
    width 1.3rem
    border-radius .05rem
    background-size cover
    background-position center
  .name
    flex 1
    width 1px
    overflow hidden
    text-overflow ellipsis
    white-space nowrap
  button
    padding .1rem .2rem !important

.home__result
  margin 0
  padding 0
  li
    display flex
    border-bottom 1px solid $gray
    padding .15rem 0
    .avatar
      flex-shrink 0
      margin-right .35rem
      height 1.3rem
      width 1.3rem
      border-radius .05rem
      background-size cover
      background-position center

.home__login
    left 50%
    margin-left -3rem
    position fixed
    transition all .3s ease-in-out
    z-index 9
    webview
        height 10rem
        width 6rem
        box-shadow 0 0 .5rem rgba(black, .15)
        border-radius 0 0 .05rem .05rem
        overflow hidden
        border 1px solid #CCCCCC
        border-top none
    > div
        cursor pointer
        position absolute
        width 3rem
        padding .1rem .2rem
        box-sizing border-box
        right -1rem
        top 10.01rem
        text-align center
        left 50%
        margin-left -1.5rem
        color #969696
        font-size .26rem
        background #F8F8F8
        border-radius 0 0 .05rem .05rem
        border 1px solid #CCCCCC
        border-top none

.home__layout
  position absolute
  height 100%
  width 100%
  background rgba(white, .8)
  left 0
  top 0
  z-index 8
  text-align center
  button
    margin-top 5rem
</style>
