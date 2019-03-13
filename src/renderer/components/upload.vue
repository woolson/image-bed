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
    li.home__list__item(
      v-for="file,index in fileList"
      :class="{active: index === compressIndex}"
    )
      div.avatar.u-br(:style="{backgroundImage: 'url(' + getBG(file) + ')'}")
      div.content
        p.name {{file.name}}
        span.u-ml20 {{sizeFormat(file.size)}}
        div.u-bt
          i.iconfont.icon-cut.u-bold(@click="clipIndex = index")
          i.iconfont.icon-compress(@click="compressIndex = index")
          i.iconfont.icon-delete.u-bold(
            type="danger"
            @click="onDelete(index)"
          )
  ul.home__result(v-else)
    li(v-for="item in result")
      div.avatar(:style="{backgroundImage: 'url(' + item.imageUrl + ')'}")
      div.u-display-flex.u-direction-column.u-flex-1
        div
          i.iconfont.icon-link.u-mr10.u-s24
          span.u-underline(v-clipboard="item.imageUrl") {{item.imageUrl}}
        div.u-mt10
          i.iconfont.icon-image.u-mr10.u-s24
          span {{item.name || '—'}}
        div.u-mtauto.u-text-right
          span.u-mtauto.u-green.u-pointer(
            v-clipboard="item.imageUrl"
            @success="copySuccessFn"
          ) 点击复制
  el-button.home__button.u-bt(
    plain
    @click="onUpload"
    v-if="!result.length && fileList.length"
  ) 确认上传
  el-button.home__button(
    plain
    type="info"
    @click="onClear"
    v-if="result.length && fileList.length"
  ) 清空列表(可去历史记录查看)
  div.home__login(:style="{top: showLogin ? '0rem' : '-11rem'}")
    webview(src="https://passport.weibo.cn/signin/login?entry=mweibo&r=http%3A%2F%2Fm.weibo.cn" target="_self")
    div(@click="showLogin = false")
      span 登录完成后请关闭
      i.iconfont.icon-close.u-s24.u-ml10
  div.home__layout(v-show="disabled")
    el-button(@click="showLogin = true") 登录
  transition(name="el-zoom-in-top")
    compress(
      v-if="compressIndex >= 0"
      :resource="fileList[compressIndex].clipBase64 || fileList[compressIndex].base64"
      :defaultQuality="fileList[compressIndex].quality"
      @cancel="compressIndex = -1"
      @submit="onCompress"
    )
  transition(name="el-zoom-in-top")
    clipboard(
      v-if="clipIndex >= 0"
      :resource="fileList[clipIndex].base64"
      @cancel="clipIndex = -1"
      @submit="onClipboard"
    )
</template>

<script>
import Compress from './compress'
import Clipboard from './clipboard'
import { ipcRenderer } from 'electron'
import { fileToBase64, uploadFile, deepCopy } from '../common/utils'
import moment from 'moment'

const TEST_BASE64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='

export default {
  name: 'home',

  components: {
    'compress': Compress,
    'clipboard': Clipboard
  },

  data: () => ({
    fileList: [],
    result: [],
    testFile: {
      name: 'test',
      base64: TEST_BASE64
    },
    showLogin: false,
    disabled: false,
    compressIndex: -1,
    clipIndex: -1
  }),

  async mounted () {
    ipcRenderer.on('onPaste', (evt, img) => {
      // 非图片则不做处理
      if (img.length < 30) return
      const etc = img.match(/\/\w+;/g)[0].replace(/(;|\/)/g, '')
      const strLen = img.length
      this.fileList.push({
        name: moment().format('YYYY-MM-DD_HH:mm:SS') + '.' + etc,
        base64: img,
        size: strLen - (strLen / 8) * 2
      })
    })

    // if (process.env.NODE_ENV === 'development') return

    const hasLogin = await this.checkLogin()
    if (!hasLogin) {
      this.showLogin = true
      this.disabled = true
      this.$notify.error({title: '请登录微博先'})
    }
  },

  async activated () {
    if (this.disabled && process.env.NODE_ENV !== 'development') {
      const hasLogin = await this.checkLogin()
      this.disabled = !hasLogin
    }
  },

  methods: {
    async onChange (file) {
      file.base64 = await fileToBase64(file.raw)
      this.fileList.push(file)
    },
    async checkLogin () {
      const testRel = await uploadFile(this.testFile)
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
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(255, 255, 255, 0.7)'
      })
      const requests = this.fileList.map(item => {
        item.base64 = this.getBG(item)
        return uploadFile(item)
      })
      const result = await Promise.all(requests)

      result.forEach(item => {
        item.date = moment().format('YYYY-MM-DD HH:mm:SS')
      })
      // ipcRenderer.sendSync('insert-history', result)
      this.$db.insert(result, (err, newDocs) => {
        if (err) {
          this.$notify.error({title: '上传出错'})
        } else {
          this.result = result
          loading.close()
          this.$notify({
            title: '上传完成',
            type: 'success'
          })
        }
      })
    },
    copySuccessFn () {
      this.$notify({
        title: '复制成功',
        type: 'success'
      })
    },
    onCompress (data, quality) {
      const img = deepCopy(this.fileList[this.compressIndex])
      img.quality = quality
      img.compressBase64 = data
      this.$set(this.fileList, this.compressIndex, img)
      this.compressIndex = -1
    },
    onClipboard (data) {
      const img = deepCopy(this.fileList[this.clipIndex])
      img.clipBase64 = data
      img.compressBase64 = undefined
      this.$set(this.fileList, this.clipIndex, img)
      this.clipIndex = -1
    },
    sizeFormat (size, digit = 2) {
      const unit = ['B', 'KB', 'MB', 'GB', 'TB']
      let unitIndex = 0

      while (size > 1000) {
        size = size / 1000
        unitIndex++
      }

      return `${Number(size).toFixed(digit)}${unit[unitIndex]}`
    },
    getBG ({base64, clipBase64, compressBase64}) {
      return compressBase64 || clipBase64 || base64
    }
  },

  watch: {
    async showLogin (newValue) {
      if (!newValue) {
        const hasLogin = await this.checkLogin()
        this.disabled = !hasLogin
        if (hasLogin) {
          this.$notify({
            title: '登录成功',
            type: 'success'
          })
        } else {
          this.$notify.error({title: '未登录成功'})
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
  // padding .2rem .3rem
  // position sticky
  overflow hidden

.home__upload
  padding .2rem .3rem 0 .3rem
  > div
    display flex
    .el-upload-dragger
      width 100%
      height auto
      padding .2rem
    .el-icon-upload
      margin-top 0

.home__list
  flex 1
  overflow auto
  list-style none
  padding .2rem .3rem
  margin 0
  li
    width 49%
    display inline-flex
    box-shadow 0 0 .02rem rgba(black, .2)
    border-radius .12rem
    box-sizing border-box
    margin-right 2%
    margin-bottom .2rem
    overflow hidden
    height 2rem
    background-size cover
    background-position center
    transition all .3s
    &:nth-child(2n)
      margin-right 0
    &.active
      border-color $gray
    &:hover
      box-shadow 0 0 .2rem rgba(black, .15)

.home__list__item
  .avatar
    height 2rem
    width 2rem
    flex-shrink 0
    background-size cover
    background-position center
    border-radius .05rem 0 0 .05rem
  .content
    flex 1
    display flex
    flex-direction column
    overflow auto
    p
      width 100%
      box-sizing border-box
      margin 0
      padding .1rem .2rem
      text-overflow ellipsis
      overflow hidden
      white-space nowrap
      font-size .28rem
      line-height .4rem
      color $background
      opacity .7
    span
      color $background
      opacity .7
    div
      display flex
      justify-content space-around
      margin-top auto
      padding .1rem
      > i
        color rgba($background, .6)
        cursor pointer
        padding 0 .1rem
        &:hover
          &:nth-child(1)
            color $green
            text-shadow 0 0 .02rem rgba($green, .5)
          &:nth-child(2)
            color $yellow
            text-shadow 0 0 .02rem rgba($yellow, .5)
          &:nth-child(3)
            color $red
            text-shadow 0 0 .02rem rgba($red, .5)

.home__result
  flex 1
  overflow auto
  margin 0
  padding .25rem
  color $background
  list-style none
  li
    display flex
    padding .2rem
    border-radius .05rem
    &:nth-child(2n)
      background $border
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
    height 8rem
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
    top 8.01rem
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

.home__button
  border none
  margin-top .02rem
  padding .3rem

</style>
