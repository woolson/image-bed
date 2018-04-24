<template lang="pug">
div.history
  div.history__header.u-bb
    el-input.u-w500(
      placeholder="请输入内容"
      prefix-icon="el-icon-search"
      v-model="search"
      clearable
    )
    el-button.u-mlauto(@click="sort = !sort") {{sort ? '倒序' : '顺序'}}
    el-popover(
      ref="discription"
      placement="top-start"
      title="描述"
      width="200"
      trigger="hover"
      content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。"
    )
    i.iconfont.icon-question.u-ml20
  ul.history__list
      li(v-for="item in historyList")
        div.avatar(:style="{backgroundImage: 'url(' + item.imageUrl + ')'}")
        div.u-display-flex.u-direction-column.u-flex-1
          div
            i.iconfont.icon-link.u-mr10.u-s24
            span.u-underline(v-clipboard="item.imageUrl") {{item.imageUrl}}
          div.u-mt10
            i.iconfont.icon-image.u-mr10.u-s24
            span {{item.name || '—'}}
          div.u-display-flex.u-mtauto.u-align-center
            span.u-flex-1
              i.iconfont.icon-calendar.u-mr10.u-s24
              span {{item.date}}
            span.u-mtauto.u-green.u-pointer(
              v-clipboard="item.imageUrl"
              @success="copySuccessFn"
            ) 点击复制
</template>

<script>
import moment from 'moment'
import { ipcRenderer } from 'electron'

export default {
  data: () => ({
    history: [],
    sort: true,
    search: ''
  }),

  mounted () {
    this.getHistory()
  },

  activated () {
    this.getHistory()
  },

  computed: {
    historyList () {
      let history = [...this.history]
      const temp = 'YYYY-MM-DD HH:mm:SS'
      history.sort((a, b) => {
        if (this.sort) {
          return moment(a.date, temp).isBefore(moment(b.date, temp))
        } else {
          return moment(a.date, temp).isAfter(moment(b.date, temp))
        }
      })

      if (this.search) {
        history = history.filter(item => {
          return item.name.indexOf(this.search) !== -1
        })
      }

      return history
    }
  },

  methods: {
    getHistory () {
      const history = ipcRenderer.sendSync('get-history')
      this.history = history
    },
    copySuccessFn () {
      this.$message({
        message: '复制成功',
        type: 'success'
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.history
  display flex
  flex-direction column

.history__header
  padding .2rem
  display flex
  align-items center
  i
    font-size .4rem
    color $gray
    cursor help

.history__list
  flex 1
  overflow auto
  margin 0
  padding 0
  color $background
  li
    display flex
    padding .2rem .3rem
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
</style>
