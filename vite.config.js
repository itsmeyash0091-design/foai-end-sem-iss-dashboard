import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/iss': {
        target: 'http://api.open-notify.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/iss/, '')
      },
      '/api/chat': {
        target: 'https://api-inference.huggingface.co/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chat/, '')
      }
    }
  }
})
