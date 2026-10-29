import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import type { Plugin } from 'vite'

// Case studies 1 and 2 are encrypted (see scripts/encrypt-case-studies.mjs). Only `pnpm dev` on
// the machine that has src/private/ may import the readable sources; a build never does, so
// nothing private can end up in dist/ even when building locally.
function caseStudyDev(): Plugin {
  const id = 'virtual:case-study-dev'
  let serve = false
  return {
    name: 'case-study-dev',
    configResolved(c) { serve = c.command === 'serve' },
    resolveId(source) { return source === id ? '\0' + id : null },
    load(source) {
      if (source !== '\0' + id) return null
      const entries = { 0: 'itravel.entry.tsx', 1: 'fastag.entry.tsx' }
      const lines = serve
        ? Object.entries(entries)
            .filter(([, f]) => fs.existsSync(path.resolve(__dirname, 'src/private', f)))
            .map(([i, f]) => `  ${i}: () => import('/src/private/${f}'),`)
        : []
      return `export default {\n${lines.join('\n')}\n}`
    },
  }
}

export default defineConfig({
  // GitHub Pages serves the site from /portfolio/, so every asset URL starts there.
  base: '/portfolio/',
  build: {
    sourcemap: false, // no source maps: DevTools only ever sees the minified bundle
  },
  esbuild: {
    legalComments: 'none',
  },
  plugins: [react(), tailwindcss(), caseStudyDev()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
