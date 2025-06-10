import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import swc from 'unplugin-swc';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/in-memory/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './coverage/junit-results.xml'
    }
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
