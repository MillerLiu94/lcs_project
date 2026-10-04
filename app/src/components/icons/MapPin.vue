<template>
  <i class="el-icon-location" :style="iconStyle" />
</template>

<script>
export default {
  name: 'MapPinIcon',
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
