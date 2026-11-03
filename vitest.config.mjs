import { defineConfig } from 'vitest/config';

// biome-ignore lint/style/noDefaultExport: vitest requires a default export
export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/types.*'],
    },
  },
});
