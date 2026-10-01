import { defineConfig } from 'vitest/config'

process.env.DATABASE_URL ??= 'postgresql://justdoit:justdoit@localhost:5432/justdoit'

export default defineConfig({
  test: {
    environment: 'node',
    clearMocks: true,
    include: ['src/**/*.test.ts'],
  },
})
