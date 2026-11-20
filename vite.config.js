import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The CV has been linked under a lowercase name too. Case-insensitive
// filesystems (macOS) cannot hold both names in public/, so emit the
// lowercase alias into the build output instead.
function lowercaseCvAlias() {
  return {
    name: 'lowercase-cv-alias',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'karthikeyan_sadayamuthu.pdf',
        source: readFileSync('public/Karthikeyan_Sadayamuthu.pdf'),
      })
    },
  }
}

const buildDate = new Date().toISOString().slice(0, 10)

export default defineConfig({
  plugins: [react(), lowercaseCvAlias()],
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
    __BUILD_YEAR__: JSON.stringify(buildDate.slice(0, 4)),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
