import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue()],
    server: {
      port: 5173,
      strictPort: true,
      // 开发环境代理后端请求
      proxy: mode === 'development' && env.VITE_API_BASE_URL?.startsWith('http://localhost')
        ? {
            '/api': {
              target: env.VITE_API_BASE_URL,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, '')
            }
          }
        : undefined
    }
  }
})
