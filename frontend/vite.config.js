import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  // 相对路径：部署到 /、/web、/web02 任意 deployPath 都能正确加载资源
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        users: resolve(__dirname, 'users.html'),
        todos: resolve(__dirname, 'todos.html'),
        about: resolve(__dirname, 'about.html')
      }
    }
  },
  server: {
    // 本地开发时把接口代理到本地启动的 http-demo 函数（PORT=9000）
    proxy: {
      '/api': 'http://127.0.0.1:9000',
      '/api-demo': 'http://127.0.0.1:9000'
    }
  }
})
