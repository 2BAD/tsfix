import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    root: 'source',
    exclude: ['build', 'node_modules'],
    globals: true,
    coverage: {
      provider: 'v8'
    },
    testTimeout: 30000
  },
  plugins: [tsconfigPaths()]
})
