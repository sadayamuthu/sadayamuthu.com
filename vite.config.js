import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const buildDate = new Date().toISOString().slice(0, 10)

export default defineConfig({
  plugins: [react()],
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
