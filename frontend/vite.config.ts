import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'child_process'

function getGitCommit(): string {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8', cwd: path.resolve(__dirname, '..') }).trim()
  } catch {
    return 'live build'
  }
}

export default defineConfig({
  plugins: [react()],
  define: {
    __COMMIT_HASH__: JSON.stringify(getGitCommit()),
  },
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, '../shared/core'),
      '@twcode/ocean-ui': path.resolve(__dirname, '../ocean/ui'),
      '@twcode/shipwright-ui': path.resolve(__dirname, '../shipwright/ui'),
      '@twcode/harbor-ui': path.resolve(__dirname, '../harbor/ui'),
      '@twcode/ledger-ui': path.resolve(__dirname, '../ledger/ui'),
      '@twcode/captain-ui': path.resolve(__dirname, '../captain/ui'),
      '@twcode/skipper-ui': path.resolve(__dirname, '../skipper/ui'),
      '@components': path.resolve(__dirname, 'src/components'),
    },
    dedupe: ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit'],
  },
  server: {
    host: '0.0.0.0',
    fs: {
      allow: ['..'],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
