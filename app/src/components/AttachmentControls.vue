<template>
  <div class="attach-controls">
    <button
      type="button"
      class="attach-controls__btn"
      aria-label="新增附件"
      :aria-expanded="String(open)"
      @click="toggle"
    >
      <i class="el-icon-plus" aria-hidden="true" />
    </button>

    <div v-if="open" class="attach-controls__menu" role="menu">
      <button
        type="button"
        role="menuitem"
        class="attach-controls__item"
        @click="choose('photo')"
      >
        <i class="el-icon-picture-outline" aria-hidden="true" /> 上傳照片
      </button>
      <button
        type="button"
        role="menuitem"
        class="attach-controls__item"
        @click="choose('audio')"
      >
        <i class="el-icon-headset" aria-hidden="true" /> 上傳音檔
      </button>
    </div>

    <button
      v-if="isMobile"
      type="button"
      class="attach-controls__btn"
      aria-label="拍照"
      @click="choose('camera')"
    >
      <i class="el-icon-camera" aria-hidden="true" />
    </button>

    <input ref="photo" type="file" accept="image/*" class="attach-controls__input" @change="onFile($event, 'photo')" />
    <input ref="audio" type="file" accept="audio/*" class="attach-controls__input" @change="onFile($event, 'audio')" />
    <input ref="camera" type="file" accept="image/*" capture="environment" class="attach-controls__input" @change="onFile($event, 'photo')" />
  </div>
</template>

<script>
const MAX_BYTES = 8 * 1024 * 1024

export default {
  name: 'AttachmentControls',
  props: {
    isMobile: { type: Boolean, default: false },
  },
  data() {
    return { open: false }
  },
  methods: {
    toggle() {
      this.open = !this.open
    },
    choose(kind) {
      this.open = false
      const input = this.$refs[kind]
      if (input) input.click()
    },
    onFile(event, kind) {
      const input = event.target
      const file = input.files && input.files[0]
      input.value = ''
      if (!file) return
      if (file.size > MAX_BYTES) {
        this.$emit('error', '檔案太大（上限 8MB），請換小一點的檔案。')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        if (kind === 'audio') this.$emit('audio', { name: file.name, dataUrl: reader.result })
        else this.$emit('photo', reader.result)
      }
      reader.onerror = () => this.$emit('error', '讀取檔案失敗，請再試一次。')
      reader.readAsDataURL(file)
    },
  },
}
</script>

<style scoped>
.attach-controls {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.attach-controls__btn {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  padding: 0;
  background: none;
  color: var(--foreground);
  border: none;
  border-radius: var(--radius-pill);
  font-size: 1.25rem;
  cursor: pointer;
}
.attach-controls__btn:hover {
  background: var(--secondary);
}
.attach-controls__btn:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
.attach-controls__menu {
  position: absolute;
  left: 0;
  bottom: calc(100% + 0.5rem);
  z-index: 20;
  display: flex;
  flex-direction: column;
  min-width: 11rem;
  padding: 0.25rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-float-strong);
}
.attach-controls__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 48px;
  padding: 0 0.75rem;
  background: none;
  color: var(--card-foreground);
  border: none;
  border-radius: var(--radius);
  font: inherit;
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
}
.attach-controls__item:hover {
  background: var(--accent);
  color: var(--accent-foreground);
}
.attach-controls__item:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
.attach-controls__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
</style>
