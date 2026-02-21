import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      '../shared/**/*.{test,spec}.{ts,tsx}',
      '../*/ui/**/*.{test,spec}.{ts,tsx}',
    ],
    coverage: {
      provider: 'v8',
      allowExternal: true,
      include: [
        'src/components/**/*.{ts,tsx}',
        'shared/core/utils/**/*.ts',
        'shared/core/hooks/**/*.ts',
        'shared/core/store/**/*.ts',
        '*/ui/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/index.ts',
        '**/*.d.ts',
        '**/gen/**',
        '**/services/service.ts',
      ],
    },
  },
}));
