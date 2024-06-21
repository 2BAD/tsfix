import tsconfigPaths from 'vite-tsconfig-paths'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'build'],
    coverage: {
      exclude: [...(configDefaults.coverage.exclude ?? []), 'build'],
      provider: 'v8'
    },
    testTimeout: 30000
  },
  plugins: [tsconfigPaths()]
})
