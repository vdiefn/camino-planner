import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](vue|vue-router|pinia|vue-i18n)[\\/]/.test(id)) {
            return 'vue-vendor'
          }
          if (/[\\/]node_modules[\\/]chart\.js[\\/]/.test(id)) {
            return 'chart-vendor'
          }
        },
      },
    },
  },
})
