<template lang="pug">
div._compress
  div._compress__wrapper
    img(:src="after")
  div._compress__control
    span(
      :class="quality === 100 ? 'warn': ''"
    ) {{quality === 100 ? '原图' : quality + '%'}}
    el-slider.u-w50_(
      v-model="quality"
      show-stops
      :step="10"
      :min="10"
    )
    div.button
      el-button(
        plain
        size="mini"
        @click="$emit('cancel')"
      ) 取消
      el-button(
        plain
        size="mini"
        @click="$emit('submit', after, quality)"
      ) 确认
</template>

<script>
import { imgCompress } from '../common/utils'

export default {
  props: {
    resource: {
      type: String,
      default: ''
    },
    defaultQuality: {
      type: Number,
      default: 100
    }
  },

  data () {
    const image = this.resource
    return {
      before: image,
      after: image,
      quality: this.defaultQuality
    }
  },

  methods: {
    async compress () {
      const result = await imgCompress(this.before, this.quality / 100)
      this.after = result
    }
  },

  watch: {
    quality: {
      handler: 'compress',
      immediately: true
    },
    defaultQuality (newValue) {
      this.quality = newValue
    }
  }
}
</script>

<style scoped lang="stylus">
._compress
  height 100vh
  width 100vw
  position fixed
  display flex
  flex-direction column
  align-items center
  justify-content center
  top 0
  left 0
  background rgba(white, .9)

._compress__wrapper
  width 96vw
  height 80vh
  text-align center
  vertical-align middle
  display flex
  justify-content center
  align-items center
  > img
    max-width 100%
    max-height 100%

._compress__control
  text-align center
  width 100%
  margin-top .1rem
  span
    display inline-flex
    font-size .26rem
    background rgba(white, .6)
    padding .1rem .2rem
    border-radius .05rem
    color $background
    line-height 1
    &.warn
      color white
      background $red
  > div
    margin 0 auto
</style>
