import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages serves the site from /portfolio/, so every asset URL starts there.
  base: '/portfolio/',
  build: {
    sourcemap: false, // no source maps: DevTools only ever sees the minified bundle
  },
  esbuild: {
    legalComments: 'none',
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
