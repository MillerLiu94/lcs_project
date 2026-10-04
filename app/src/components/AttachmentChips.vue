<template>
  <div v-if="photo || audioName" class="attach-chips">
    <span v-if="photo" class="attach-chips__item">
      <img class="attach-chips__thumb" :src="photo" alt="已選照片預覽" />
      <button
        type="button"
        class="attach-chips__remove"
        aria-label="移除照片"
        @click="$emit('remove-photo')"
      >
        <i class="el-icon-close" aria-hidden="true" />
      </button>
    </span>

    <span v-if="audioName" class="attach-chips__item">
      <i class="el-icon-headset" aria-hidden="true" />
      <span class="attach-chips__name">{{ audioName }}</span>
      <button
        type="button"
        class="attach-chips__remove"
        aria-label="移除音檔"
        @click="$emit('remove-audio')"
      >
        <i class="el-icon-close" aria-hidden="true" />
      </button>
    </span>
  </div>
</template>

<script>
export default {
  name: 'AttachmentChips',
  props: {
    photo: { type: String, default: '' },
    audioName: { type: String, default: '' },
  },
}
</script>

<style scoped>
.attach-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.attach-chips__item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.25rem 0.5rem;
  background: var(--secondary);
  color: var(--secondary-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  max-width: 100%;
}
.attach-chips__thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: var(--radius-sm, 8px);
}
.attach-chips__name {
  min-width: 0;
  max-width: 16rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1rem;
}
.attach-chips__remove {
  display: grid;
  place-items: center;
  flex: none;
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  color: inherit;
  border: none;
  border-radius: var(--radius-pill);
  cursor: pointer;
}
.attach-chips__remove:hover {
  background: var(--accent);
  color: var(--accent-foreground);
}
.attach-chips__remove:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
</style>
