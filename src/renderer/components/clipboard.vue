<template lang="pug">
div._clipboard
  vue-cropper(
    ref="cropper"
    :quality="10"
    :img="image"
    :autoCrop="true"
    :show-remove-button="false"
    initial-size="contain"
    initial-position="center"
  )
  div._clipboard__options
    i.iconfont.icon-zoom-in(@click="$refs.cropper.changeScale(2)")
    i.iconfont.icon-zoom-out(@click="$refs.cropper.changeScale(-2)")
    i.iconfont.icon-rotate.u-bold(@click="$refs.cropper.rotateLeft()")
    i.iconfont.icon-rotate.reserve.u-bold(@click="$refs.cropper.rotateRight()")
  div.u-pb30
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
import VueCropper from 'vue-cropper'

export default {
  components: {
    'vue-cropper': VueCropper
  },

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
      this.$refs.cropper.getCropData(data => {
        this.$emit('submit', data)
      })
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
  .reserve
    transform scaleX(-1)

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
    &:nth-child(4)
      font-size .45rem
    &:hover
      opacity .8
      text-shadow 0 0 .02rem rgba($background, .7)
    &:active
      opacity 1
</style>
