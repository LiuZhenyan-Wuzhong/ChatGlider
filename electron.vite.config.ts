import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['clipboardy'] })]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    server: {
      proxy: {
        '/api/openai': {
          target: 'https://service-8w4ctcv6-1317242412.hk.apigw.tencentcs.com',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/openai/, '')
        },
        '/api/googleapis': {
          target: 'https://translation.googleapis.com/language/translate/v2/detect',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/googleapis/, '')
        }
      }
    },
    resolve: {
      alias: [{ find: '@renderer', replacement: resolve('src/renderer/src') }]
    },
    plugins: [react(), svgr()]
  }
})
