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
</template>

<script>
import axios from 'axios'
// import { shell } from 'electron'
import { fileToBase64, pidToUrl } from '../common/utils'

const UPLOAD_URL = 'http://picupload.service.weibo.com/interface/pic_upload.php?mime=image%2Fjpeg&data=base64&url=0&markpos=1&logo=&nick=0&marks=1&app=miniblog'

export default {
  name: 'home',

  data: () => ({
    fileList: [],
    result: []
  }),

  methods: {
    async onChange (file) {
      const base64 = await fileToBase64(file.raw)
      file.base64 = base64.split(',')[1]
      this.fileList.push(file)
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
</style>
