// Encrypts case studies 1 and 2 for the live site.
//
//   pnpm encrypt
//
// Bundles each private entry (src/private/*.entry.tsx) on its own, pulls out every image /
// prototype it imports, and encrypts all of it with AES-256-GCM under a key derived from the
// password (PBKDF2-SHA256). Only the encrypted files in public/cs/ are committed and deployed;
// the readable sources in src/private/ never leave this machine.
//
// File layout (every .enc file): salt (16 bytes) | iv (12 bytes) | ciphertext + GCM tag.
// Unchanged inputs keep their old encrypted file, so re-running doesn't churn git.

import { build } from "vite";
import { webcrypto as crypto } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");
const PRIVATE = path.join(SRC, "private");
const OUT = path.join(ROOT, "public", "cs");
const OUT_ASSETS = path.join(OUT, "a");
const CACHE_FILE = path.join(PRIVATE, ".encrypt-cache.json");
const ITERATIONS = 600_000;

// index in CASE_STUDY_DATA -> private entry file
const ENTRIES = { 0: "itravel.entry.tsx", 1: "fastag.entry.tsx" };

const MIME = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".gif": "image/gif", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".webm": "video/webm",
  ".json": "application/json", ".html": "text/html",
};

function readPassword() {
  if (process.env.CASE_STUDY_PASSWORD) return process.env.CASE_STUDY_PASSWORD;
  for (const f of [path.join(ROOT, ".env.local"), path.join(ROOT, "..", ".env.local")]) {
    if (!fs.existsSync(f)) continue;
    const m = fs.readFileSync(f, "utf8").match(/^\s*CASE_STUDY_PASSWORD\s*=\s*"?([^"\n]*)"?\s*$/m);
    if (m) return m[1].trim();
  }
  console.error("Set CASE_STUDY_PASSWORD in .env.local (or the environment) first.");
  process.exit(1);
}

const sha256hex = async (data) =>
  Buffer.from(await crypto.subtle.digest("SHA-256", typeof data === "string" ? new TextEncoder().encode(data) : data)).toString("hex");

async function deriveKey(password, salt) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    base, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"],
  );
}

async function encrypt(key, salt, bytes) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, bytes));
  return Buffer.concat([salt, iv, ct]);
}

const randomName = () => Buffer.from(crypto.getRandomValues(new Uint8Array(12))).toString("hex");

async function main() {
  if (!fs.existsSync(PRIVATE)) {
    console.error("src/private/ is missing - it only exists on the machine with the case study sources.");
    process.exit(1);
  }
  const password = readPassword();

  // The salt (and so the key) stays the same between runs unless the password changes.
  let cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) : null;
  let salt = cache ? Buffer.from(cache.salt, "hex") : null;
  let key = salt ? await deriveKey(password, salt) : null;
  const keyId = key ? await sha256hex(new Uint8Array(await crypto.subtle.exportKey("raw", key))) : null;
  if (!cache || cache.keyId !== keyId) {
    salt = Buffer.from(crypto.getRandomValues(new Uint8Array(16)));
    key = await deriveKey(password, salt);
    cache = { salt: salt.toString("hex"), keyId: await sha256hex(new Uint8Array(await crypto.subtle.exportKey("raw", key))), files: {} };
  }
  const nextFiles = {};
  fs.mkdirSync(OUT_ASSETS, { recursive: true });

  /** Encrypt `bytes` into `dir`, reusing the previous file when the plaintext hasn't changed. */
  async function write(dir, bytes, fixedName) {
    const hash = await sha256hex(bytes);
    const prev = cache.files[hash];
    const name = fixedName ?? prev?.name ?? randomName();
    const target = path.join(dir, `${name}.enc`);
    if (!(prev && prev.name === name && fs.existsSync(target))) fs.writeFileSync(target, await encrypt(key, salt, bytes));
    nextFiles[hash] = { name };
    return name;
  }

  const keepAssets = new Set();
  for (const [index, entry] of Object.entries(ENTRIES)) {
    const assets = new Map(); // abs path -> id
    const result = await build({
      configFile: false,
      root: ROOT,
      logLevel: "warn",
      esbuild: { jsx: "automatic", jsxImportSource: "react", legalComments: "none" },
      plugins: [{
        name: "case-study-private",
        enforce: "pre",
        resolveId(source, importer) {
          if (!importer) return null; // the entry itself
          const clean = source.replace(/\?url$/, "");
          const resolved = clean.startsWith("@/") ? path.join(SRC, clean.slice(2))
            : clean.startsWith(".") ? path.resolve(path.dirname(importer), clean) : null;
          // Images, videos and the prototype become encrypted assets
          if (resolved && (MIME[path.extname(resolved).toLowerCase()] && !/\.(tsx?|jsx?)$/.test(resolved))) {
            if (!assets.has(resolved)) assets.set(resolved, `a${assets.size}`);
            return { id: "\0cs-asset:" + assets.get(resolved), moduleSideEffects: false }; // opaque id, so Vite's own html/json handling stays out of it
          }
          // Private code is bundled (and so encrypted) ...
          if (resolved && resolved.startsWith(PRIVATE + path.sep)) {
            for (const ext of ["", ".tsx", ".ts"]) if (fs.existsSync(resolved + ext) && fs.statSync(resolved + ext).isFile()) return resolved + ext;
          }
          // ... everything else (react, the shared primitives, tokens) comes from the public site.
          return { id: source, external: true };
        },
        load(id) {
          if (!id.startsWith("\0cs-asset:")) return null;
          return `export default /*#__PURE__*/ __csAsset(${JSON.stringify(id.slice("\0cs-asset:".length))});`;
        },
      }],
      build: {
        write: false,
        minify: "esbuild",
        sourcemap: false,
        lib: { entry: path.join(PRIVATE, entry), formats: ["cjs"], fileName: () => "cs.js" },
        rollupOptions: { output: { exports: "named" } },
      },
    });
    const output = (Array.isArray(result) ? result[0] : result).output;
    const code = output.find((o) => o.type === "chunk").code;
    if (output.length > 1) throw new Error(`Unexpected extra output for ${entry}: ${output.map((o) => o.fileName).join(", ")}`);

    const manifest = {};
    for (const [file, id] of assets) {
      if (!code.includes(`__csAsset("${id}")`)) continue; // imported by the other case study only
      const name = await write(OUT_ASSETS, fs.readFileSync(file));
      keepAssets.add(`${name}.enc`);
      manifest[id] = { file: name, type: MIME[path.extname(file).toLowerCase()] };
    }
    const payload = new TextEncoder().encode(JSON.stringify({ v: 1, code, assets: manifest }));
    await write(OUT, payload, index);
    console.log(`case study ${Number(index) + 1}: ${Object.keys(manifest).length} assets, ${(code.length / 1024).toFixed(0)} KB code`);
  }

  // Drop encrypted assets nothing points to any more.
  for (const f of fs.readdirSync(OUT_ASSETS)) if (!keepAssets.has(f)) fs.rmSync(path.join(OUT_ASSETS, f));
  cache.files = nextFiles;
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  console.log(`Encrypted into public/cs/ - commit that folder.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
