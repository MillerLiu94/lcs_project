<template>
  <i class="el-icon-date" :style="iconStyle" />
</template>

<script>
export default {
  name: 'CalendarIcon',
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
