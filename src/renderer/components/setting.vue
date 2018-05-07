<template lang="pug">
div.setting
  section
    h3.setting__title.u-bb 基本设置
    div.setting__line
      label 清空历史
      div
        el-button(
          size="mini"
          type="danger"
          plain
          @click="clearHistory"
        ) 清空历史
  section.u-mt50
    h3.setting__title.u-bb 关于图吧
    div.setting__line
      label 当前版本
      div
        span.u-mr20.u-main v{{version}}
        span.u-mr20.u-red.u-pointer.u-underline(
          v-if="version !== newestVersion && newestVersion"
          @click="openDownload"
        ) 最新【点击下载】: v{{newestVersion}}
        el-button(
          size="mini"
          :loading="checking"
          @click="fetchVersion"
        ) 检查更新
    div.setting__line(v-if="false")
      label 意见反馈
      div.u-display-flex
        el-button(
          size="mini"
          @click="showSuggestion = true"
        ) 立即反馈
  el-dialog.setting__dialog(:visible.sync="showSuggestion")
    div.dialog-header(slot="title")
      h2 意见与反馈
      span 你的意见对我很重要 !!!
    el-form(:model="form" label-width="70px")
      el-form-item(label="联系方式")
        el-input(
          autofocus
          v-model="form.name"
          auto-complete="off"
        )
      el-form-item(label="建议内容")
        el-input(
          type="textarea"
          :rows="4"
        )
    div.dialog-footer(slot="footer")
      el-button(
        @click="showSuggestion = false"
      ) 取 消
      el-button(
        type="primary"
        @click="showSuggestion = false"
      ) 确 定
</template>

<script>
import Package from '../../../package.json'
import { shell } from 'electron'

export default {
  data () {
    return {
      checking: false,
      version: Package.version,
      newestVersion: '',
      form: {
        name: ''
      },
      showSuggestion: false
    }
  },

  mounted () {
    this.$get(`http://woolson.coding.me/image-bed-app/package.json?${new Date().getTime()}`)
      .then(res => (this.newestVersion = res.version))
  },

  activated () {
    this.$get(`http://woolson.coding.me/image-bed-app/package.json?${new Date().getTime()}`)
      .then(res => (this.newestVersion = res.version))
  },

  methods: {
    fetchVersion () {
      this.$get(`http://woolson.coding.me/image-bed-app/package.json?${new Date().getTime()}`)
        .then(res => {
          this.newestVersion = res.version
          if (res.version === this.version) {
            this.$alert('您的版本已经是最新的')
          }
        })
    },
    clearHistory () {
      this.$confirm('确认清空历史记录？这将无法撤回！')
        .then(() => {
          this.$db.remove({}, { multi: true }, (err, numRemoved) => {
            if (err) {
              this.$notify.error({title: '清除失败'})
            } else {
              this.$notify({
                title: `成功清除${numRemoved}条记录`,
                type: 'success'
              })
            }
          })
        })
    },
    openDownload () {
      shell.openExternal(Package.download || '')
    }
  }
}
</script>


<style lang="stylus">
.setting__dialog
  .el-dialog
    width 70%

  .dialog-header
    display flex
    align-items flex-end
    flex-direction column
    align-items flex-start
    h2
      margin 0
      color $background
    span
      color $red
      opacity .7

.setting
  padding .2rem .3rem

.setting__title
  color $background
  font-size .3rem
  padding .2rem 0
  margin 0 0 .3rem 0

.setting__line
  border-radius .05rem
  display flex
  align-items center
  margin .3rem .2rem
  label
    margin-right .3rem
    display inline-block
    font-size .26rem
    color $background
</style>
