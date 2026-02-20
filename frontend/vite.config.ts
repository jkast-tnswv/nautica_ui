import { defineConfig, type Plugin } from 'vite'
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

// Vite plugin that resolves bare module imports through the frontend's
// node_modules directory. Needed for Bazel sandbox where source files from
// other packages (shared/core, service UIs) can't find node_modules via
// standard Node resolution because they're placed outside the frontend tree.
//
// Uses Vite's own resolver (this.resolve) with a virtual importer inside
// frontend/src/ to ensure consistent paths — avoids "two React" errors.
function bazelModuleResolve(): Plugin {
  const frontendImporter = path.resolve(__dirname, 'src/_virtual_importer.ts')
  const internalPrefixes = ['.', '/', '\0', '@core', '@twcode/', '@components']
  return {
    name: 'bazel-module-resolve',
    async resolveId(source, importer) {
      if (internalPrefixes.some(p => source.startsWith(p))) return null
      if (!importer) return null
      // Only intercept when the importer is outside the frontend source tree
      if (/\/frontend\/src\//.test(importer)) return null
      // Re-resolve the same import as if it came from within frontend/src/
      const resolved = await this.resolve(source, frontendImporter, { skipSelf: true })
      return resolved
    },
  }
}

export default defineConfig({
  plugins: [react(), bazelModuleResolve()],
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
      '@twcode/anchor-ui': path.resolve(__dirname, '../anchor/ui'),
      '@twcode/keel-ui': path.resolve(__dirname, '../keel/ui'),
      '@twcode/quartermaster-ui': path.resolve(__dirname, '../quartermaster/ui'),
      '@twcode/tidewatch-ui': path.resolve(__dirname, '../tidewatch/ui'),
      '@twcode/island-ui': path.resolve(__dirname, '../island/ui'),
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
