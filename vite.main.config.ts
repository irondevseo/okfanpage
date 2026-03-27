import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      /** Binary + native-ish deps — resolve lúc chạy từ node_modules. */
      external: ['ffmpeg-static', 'form-data'],
    },
  },
});
