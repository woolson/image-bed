<template lang="pug">
div.setting
  section
    h3.setting__title.u-bb 基本设置
    div.setting__line
      label 清空历史
      el-button(
        size="mini"
        type="danger"
        plain
        @click="clearHistory"
      ) 清空历史
  section.u-mt50
    h3.setting__title.u-bb 关于
    div.setting__line
      label 当前版本
      span.u-mr20.u-main v{{version}}
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
      }
    }
  },

  mounted () {
    this.$get(`https://woolson.github.io/weibo-img/package.json?${new Date().getTime()}`)
      .then(res => (this.newestVersion = res.version))
  },

  activated () {
    this.$get(`https://woolson.github.io/weibo-img/package.json?${new Date().getTime()}`)
      .then(res => (this.newestVersion = res.version))
  },

  methods: {
    fetchVersion () {
      this.$get(`https://woolson.github.io/weibo-img/package.json?${new Date().getTime()}`)
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
