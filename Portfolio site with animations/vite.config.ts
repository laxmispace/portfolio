import { defineConfig, loadEnv, type Plugin } from 'vite'
import path from 'path'
import crypto from 'crypto'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// ─── Password protection for case studies 1 & 2 ──────────────────────────────
// Builds src/app/components/case-study/ProtectedCaseStudies.tsx as its own chunk, encrypts it with
// AES-256-GCM (PBKDF2-SHA256 key from CASE_STUDY_PASSWORD) and ships only the ciphertext.
// CaseStudyGate.tsx decrypts it in the browser. The password itself is never bundled.
const PROTECTED_MODULE = path.resolve(__dirname, 'src/app/components/case-study/ProtectedCaseStudies.tsx')
const PBKDF2_ITERATIONS = 250_000 // keep in sync with CaseStudyGate.tsx
// Phrases that only exist in the protected content — the build fails if any public file contains one.
const LEAK_SENTINELS = [
  'iTravel was built to close Layer 3',
  "It's 11pm on the highway",
  'The stamp collection scales without manual asset creation',
]

function protectCaseStudies(password: string | undefined, encFile: string): Plugin {
  let ref: string
  return {
    name: 'protect-case-studies',
    apply: 'build',
    buildStart() {
      if (!password) {
        this.error('CASE_STUDY_PASSWORD is not set. Add it to .env.local (local builds) or the repo secrets (GitHub Actions).')
      }
      // 'strict' keeps the CS1Content/CS2Content exports — Vite otherwise drops entry exports and tree-shakes everything away.
      ref = this.emitFile({ type: 'chunk', id: PROTECTED_MODULE, name: 'cs', preserveSignature: 'strict' })
    },
    generateBundle(_, bundle) {
      const fileName = this.getFileName(ref)
      const chunk = bundle[fileName]
      if (!chunk || chunk.type !== 'chunk') this.error('Protected case study chunk missing')
      if (!LEAK_SENTINELS.every((s) => chunk.code.includes(s))) this.error('Protected chunk is missing case study content (tree-shaken?)')

      // Relative imports of shared chunks can't resolve from a blob: URL — mark them for the runtime.
      const code = chunk.code.replace(/((?:from|import)\s*\(?\s*)(["'])\.\/([^"']+\.js)\2/g, '$1$2__CS_ASSETS__/$3$2')

      const salt = crypto.randomBytes(16)
      const iv = crypto.randomBytes(12)
      const key = crypto.pbkdf2Sync(password!, salt, PBKDF2_ITERATIONS, 32, 'sha256')
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
      const encrypted = Buffer.concat([cipher.update(code, 'utf8'), cipher.final(), cipher.getAuthTag()])
      delete bundle[fileName]
      this.emitFile({ type: 'asset', fileName: encFile, source: Buffer.concat([salt, iv, encrypted]) })

      // Leak check: nothing public may reference the plaintext chunk or contain its text.
      for (const out of Object.values(bundle)) {
        const text = out.type === 'chunk' ? out.code : typeof out.source === 'string' ? out.source : ''
        if (out.type === 'chunk' && out.moduleIds.includes(PROTECTED_MODULE)) this.error(`${out.fileName} bundles the protected module`)
        if (text.includes(path.basename(fileName))) this.error(`${out.fileName} references the protected chunk`)
        const leak = LEAK_SENTINELS.find((s) => text.includes(s))
        if (leak) this.error(`${out.fileName} contains protected text: "${leak}"`)
      }
    },
  }
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const password = env.CASE_STUDY_PASSWORD || undefined
  // New name every build, so a cached old ciphertext is never paired with new chunk hashes.
  const encFile = `assets/cs-${crypto.randomBytes(6).toString('hex')}.enc`

  return {
  // Replace 'REPO_NAME' with your GitHub repo name (must match exactly, case-sensitive).
  // Required so asset URLs resolve correctly at username.github.io/REPO_NAME/
  base: '/portfolio/',
  define: {
    __CS_ENC_FILE__: JSON.stringify(encFile),
    // Dev server only — production bundles get null, so the password never ships.
    __CS_DEV_PASSWORD__: command === 'serve' && password ? JSON.stringify(password) : 'null',
  },
  build: {
    sourcemap: false, // no source maps: DevTools only ever sees the minified bundle
    rollupOptions: {
      output: {
        // Libraries and the shared case-study helpers get their own chunk. Without this Rollup
        // may host them inside the protected chunk, and the public app would import from it.
        manualChunks(id) {
          if (id.includes('node_modules') || id.endsWith('CaseStudyPrimitives.tsx')) return 'vendor'
        },
      },
    },
  },
  esbuild: {
    legalComments: 'none',
  },
  plugins: [
    protectCaseStudies(password, encFile),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  }
})
