// Loads the password-protected case studies (1 and 2).
//
// The live site only ships encrypted files (public/cs/, made by scripts/encrypt-case-studies.mjs).
// The password derives the AES key in the browser; a wrong password simply fails to decrypt,
// so neither the password nor the content is anywhere in the public code.
import type { ComponentType } from "react";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import * as primitives from "./CaseStudyPrimitives";
import * as tokens from "@/app/theme/tokens";
import devEntries from "virtual:case-study-dev";

export interface ProtectedCaseStudy {
  Content: ComponentType<{ isMobile: boolean }>;
  sections: { id: string; label: string; noNumber?: boolean }[];
}

// What the encrypted bundles import from the public site.
const DEPS: Record<string, unknown> = {
  react: React,
  "react/jsx-runtime": jsxRuntime,
  "@/app/components/case-study/CaseStudyPrimitives": primitives,
  "@/app/theme/tokens": tokens,
};

const BASE = `${import.meta.env.BASE_URL}cs/`;
const ITERATIONS = 600_000;
const KEY_STORAGE = "case-study-key";

const loaded = new Map<number, ProtectedCaseStudy>();
let cachedKey: { salt: string; key: Uint8Array } | null = null;

const toHex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
const fromHex = (h: string) => new Uint8Array(h.match(/../g)!.map((x) => parseInt(x, 16)));

async function fetchBytes(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Couldn't load ${url} (${res.status})`);
  return new Uint8Array(await res.arrayBuffer());
}

// Browsers only expose WebCrypto on secure pages (https, or localhost). The live site is https;
// on a plain-http address - e.g. the dev server opened on a phone over Wi-Fi - fall back to the
// audited @noble libraries, loaded only in that case.
const hasWebCrypto = () => typeof crypto !== "undefined" && !!crypto.subtle;
const noble = () => Promise.all([import("@noble/hashes/pbkdf2"), import("@noble/hashes/sha2"), import("@noble/ciphers/aes")]);

/** PBKDF2-SHA256 → 32-byte AES key. */
async function deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const pw = new TextEncoder().encode(password);
  if (hasWebCrypto()) {
    const base = await crypto.subtle.importKey("raw", pw, "PBKDF2", false, ["deriveBits"]);
    return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" }, base, 256));
  }
  const [{ pbkdf2Async }, { sha256 }] = await noble();
  return pbkdf2Async(sha256, pw, salt, { c: ITERATIONS, dkLen: 32, asyncTick: 20 });
}

const importedKeys = new WeakMap<Uint8Array, Promise<CryptoKey>>();

/** salt (16) | iv (12) | ciphertext + tag. Throws when the key is wrong. */
async function decrypt(key: Uint8Array, file: Uint8Array): Promise<Uint8Array> {
  const iv = file.slice(16, 28), data = file.slice(28);
  if (hasWebCrypto()) {
    if (!importedKeys.has(key)) importedKeys.set(key, crypto.subtle.importKey("raw", key, "AES-GCM", false, ["decrypt"]));
    return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, await importedKeys.get(key)!, data));
  }
  const [, , { gcm }] = await noble();
  return gcm(key, iv).decrypt(data);
}

/** Remember the key (never the password) for this tab, so other case studies and reloads open straight away. */
function rememberKey(salt: string, key: Uint8Array) {
  cachedKey = { salt, key };
  try {
    sessionStorage.setItem(KEY_STORAGE, JSON.stringify({ salt, key: toHex(key) }));
  } catch { /* private mode - they'll be asked again after a reload */ }
}

function storedKey(salt: string): Uint8Array | null {
  if (cachedKey?.salt === salt) return cachedKey.key;
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY_STORAGE) ?? "null");
    if (saved?.salt !== salt) return null;
    cachedKey = { salt, key: fromHex(saved.key) };
    return cachedKey.key;
  } catch {
    return null;
  }
}

async function evaluate(key: Uint8Array, file: Uint8Array): Promise<ProtectedCaseStudy> {
  const payload = JSON.parse(new TextDecoder().decode(await decrypt(key, file))) as {
    code: string; assets: Record<string, { file: string; type: string }>;
  };
  // Decrypt every screenshot / prototype up front into blob: URLs the content can use as-is.
  const urls: Record<string, string> = {};
  await Promise.all(Object.entries(payload.assets).map(async ([id, a]) => {
    const bytes = await decrypt(key, await fetchBytes(`${BASE}a/${a.file}.enc`));
    urls[id] = URL.createObjectURL(new Blob([bytes], { type: a.type }));
  }));
  const module = { exports: {} as Record<string, unknown> };
  const require = (id: string) => {
    if (!(id in DEPS)) throw new Error(`Case study needs "${id}" - add it to DEPS in protectedCaseStudies.ts`);
    return DEPS[id];
  };
  const csAsset = (id: string) => urls[id];
  new Function("require", "module", "exports", "__csAsset", payload.code)(require, module, module.exports, csAsset);
  return module.exports as unknown as ProtectedCaseStudy;
}

/** In `pnpm dev` the readable sources are used (after the password check) so edits show live. */
async function finish(index: number, key: Uint8Array, file: Uint8Array) {
  const dev = devEntries[index];
  let cs: ProtectedCaseStudy;
  if (dev) {
    await decrypt(key, file); // still check the password
    cs = (await dev()) as ProtectedCaseStudy;
  } else {
    cs = await evaluate(key, file);
  }
  loaded.set(index, cs);
  return cs;
}

/** Already unlocked this tab? Returns the case study without asking again, else null. */
export async function restoreCaseStudy(index: number): Promise<ProtectedCaseStudy | null> {
  if (loaded.has(index)) return loaded.get(index)!;
  try {
    const file = await fetchBytes(`${BASE}${index}.enc`);
    const key = storedKey(toHex(file.slice(0, 16)));
    return key ? await finish(index, key, file) : null;
  } catch {
    return null;
  }
}

/** Unlock with a password. Resolves null when the password is wrong. */
export async function unlockCaseStudy(index: number, password: string): Promise<ProtectedCaseStudy | null> {
  const file = await fetchBytes(`${BASE}${index}.enc`);
  const salt = file.slice(0, 16);
  // Phone keyboards like to capitalise the first letter or add a trailing space - ignore both.
  const key = await deriveKey(password.trim().toLowerCase(), salt);
  try {
    await decrypt(key, file);
  } catch {
    return null; // wrong password
  }
  rememberKey(toHex(salt), key);
  return finish(index, key, file);
}

export const getLoadedCaseStudy = (index: number) => loaded.get(index) ?? null;
