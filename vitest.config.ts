import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import swc from 'unplugin-swc';

export default defineConfig({
  test: {
    globals: true,
    root: './',
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      'src': resolve(__dirname, './src'),
      'mongo': resolve(__dirname, './mongo')
    }
  }
})
