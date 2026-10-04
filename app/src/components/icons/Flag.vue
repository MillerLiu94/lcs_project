<template>
  <i class="el-icon-warning-outline" :style="iconStyle" />
</template>

<script>
export default {
  name: 'FlagIcon',
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
