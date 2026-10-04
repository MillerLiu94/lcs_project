<template>
  <i class="el-icon-microphone" :style="iconStyle" />
</template>

<script>
export default {
  name: 'MicrophoneIcon',
  props: {
    size: { type: [Number, String], default: 24 },
  },
  computed: {
    iconStyle() {
      return { fontSize: `${this.size}px` }
    },
  },
}
</script>
