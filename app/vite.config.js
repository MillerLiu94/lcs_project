import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'

export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        // Element UI 2.x theme-chalk uses legacy Sass syntax/APIs; silence the
        // upstream deprecation noise so our build output stays readable.
        silenceDeprecations: [
          'import',
          'global-builtin',
          'slash-div',
          'function-units',
          'legacy-js-api',
        ],
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
