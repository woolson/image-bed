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
    li.history__list__item(v-for="history in historyList")
      div.header.u-s34.u-bb {{history.date | date('YYYY年M月D日')}}
      div.content(v-for="item in history.list")
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
      const result = {}
      const tempOne = 'YYYY-MM-DD HH:mm:SS'
      const tempTwo = 'YYYY-MM-DD'
      history.sort((a, b) => {
        if (this.sort) {
          return moment(a.date, tempOne).isBefore(moment(b.date, tempOne))
        } else {
          return moment(a.date, tempOne).isAfter(moment(b.date, tempOne))
        }
      })

      if (this.search) {
        history = history.filter(item => {
          return (item.name || '').indexOf(this.search) !== -1
        })
      }

      history.forEach(item => {
        const date = moment(item.date, tempOne).format(tempTwo)
        if (result[date]) result[date].push(item)
        else result[date] = [item]
      })

      const sortDate = Object.keys(result).sort((a, b) => {
        if (this.sort) {
          return moment(a, tempTwo).isBefore(moment(b, tempTwo))
        } else {
          return moment(a, tempTwo).isAfter(moment(b, tempTwo))
        }
      })

      return sortDate.map(item => ({
        date: item,
        list: result[item]
      }))
    }
  },

  methods: {
    getHistory () {
      const history = ipcRenderer.sendSync('get-history')
      this.history = history
    },
    copySuccessFn () {
      this.$notify({
        title: '复制成功',
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
  padding .25rem
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
  padding .25rem
  color $background
  list-style none

.history__list__item
  border-radius .05rem
  // border 1px solid #EFEFEF
  margin-bottom .3rem
  box-shadow 0 0 .3rem rgba(black, .1)
  .header
    padding .2rem 0
    text-align center
    font-weight bold
  .content
    display flex
    padding .2rem .3rem
    &:nth-child(2n + 1)
      background lighten($border, 60%)
    .avatar
      flex-shrink 0
      margin-right .35rem
      height 1.3rem
      width 1.3rem
      border-radius .05rem
      background-size cover
      background-position center
</style>
