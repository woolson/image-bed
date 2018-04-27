<template lang="pug">
div._clipboard
  croppa(
    v-model="croppa"
    :quality="10"
    :initial-image="image"
    :show-remove-button="false"
    initial-size="contain"
    initial-position="center"
  )
  div._clipboard__options
    i.iconfont.icon-zoom-in(@click="croppa.zoomIn()")
    i.iconfont.icon-zoom-out(@click="croppa.zoomOut()")
    i.iconfont.icon-rotate.u-bold(@click="croppa.rotate(++rotate)")
    i.iconfont.icon-initial.u-bold(@click="croppa.refresh()")
  div
    el-button(
      plain
      size="mini"
      @click="$emit('cancel')"
    ) 取消
    el-button(
      plain
      size="mini"
      @click="onClip"
    ) 确认
</template>

<script>
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
      image,
      rotate: 0,
      croppa: {}
    }
  },

  methods: {
    onClip () {
      const result = this.croppa.generateDataUrl('image/jpeg')
      this.$emit('submit', result)
    }
  }
}
</script>

<style lang="stylus">
._clipboard
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
  canvas
    width 80vw !important
    height 80vw !important

._clipboard__options
  padding .3rem 0 .3rem 0
  background white
  width 30vw
  display flex
  align-items center
  justify-content space-between
  i
    color $background
    opacity .6
    cursor pointer
    font-size .5rem
    &:nth-child(3)
      font-size .45rem
    &:last-child
      font-size .5rem
      font-weight lighter
    &:hover
      opacity .8
      text-shadow 0 0 .02rem rgba($background, .7)
    &:active
      opacity 1
</style>
