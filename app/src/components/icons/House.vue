<template>
  <i class="el-icon-house" :style="iconStyle" />
</template>

<script>
export default {
  name: 'HouseIcon',
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
