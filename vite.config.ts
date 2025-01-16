import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            sourcemap: true,
            rollupOptions: {
              external: [
                'electron',
                'better-sqlite3',
                'path',
                'fs',
                'url'
              ]
            }
          }
        }
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
      }
    ])
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  base: './',
  build: {
    sourcemap: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
}) 