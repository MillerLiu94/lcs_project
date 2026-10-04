<template>
  <i class="el-icon-arrow-left" :style="iconStyle" />
</template>

<script>
export default {
  name: 'ArrowLeftIcon',
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
