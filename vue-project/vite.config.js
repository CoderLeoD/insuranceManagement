import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: "0.0.0.0", // 指定服务器应该监听哪个 IP 地址。 如果将此设置为 0.0.0.0 或者 true 将监听所有地址，包括局域网和公网地址。
    open: false,
    port: 5173, // 默认值就是 5173 这里可以不用配置这项
    cors: true, // 允许跨域
    proxy: {
      // 带选项写法：http://localhost:5173/api/bar -> http://localhost:3000/bar
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,//是否跨域
        rewrite: (path) => path.replace(/^\/api/, ''), // 非必要配置项, /api 在真正发送网络请求时, 会被替换掉
      },
    }
  }
})
