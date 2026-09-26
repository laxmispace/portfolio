// Password gate for case studies 1 and 2.
//
// Production: the content module (protectedCaseStudies.tsx) is NOT in the public bundle.
// vite.config.ts builds it as its own chunk, encrypts it with AES-256-GCM (key derived
// from CASE_STUDY_PASSWORD via PBKDF2) and ships only the ciphertext. Here we fetch that
// file, decrypt it with what the visitor typed, and import the result as a module.
// A wrong password fails AES-GCM authentication, so there is no password to find in the JS.
//
// Dev: the module is imported directly; the password is checked against .env.local.
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { Lock, X } from "lucide-react";
import { colors, withAlpha } from "@/app/theme/tokens";

type ProtectedModule = typeof import("./ProtectedCaseStudies");

const STORAGE_KEY = "cs-unlock";
const PBKDF2_ITERATIONS = 250_000;

// ─── Unlock store (shared by every gate instance, so one unlock opens both case studies) ──
let unlocked: ProtectedModule | null = null;
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
const setUnlocked = (mod: ProtectedModule) => { unlocked = mod; listeners.forEach((fn) => fn()); };

export function useProtectedCaseStudies(): ProtectedModule | null {
  return useSyncExternalStore(subscribe, () => unlocked);
}

class WrongPasswordError extends Error {}

async function decryptModule(password: string): Promise<ProtectedModule> {
  const res = await fetch(`${import.meta.env.BASE_URL}${__CS_ENC_FILE__}`);
  if (!res.ok) throw new Error(`Couldn't load the case study (${res.status})`);
  const data = new Uint8Array(await res.arrayBuffer());
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const ciphertext = data.slice(28);

  const baseKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    baseKey, { name: "AES-GCM", length: 256 }, false, ["decrypt"],
  );

  let plain: ArrayBuffer;
  try {
    plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  } catch {
    throw new WrongPasswordError();
  }

  // The chunk's imports of shared chunks were rewritten to "__CS_ASSETS__/…" at build time;
  // a blob: module can't resolve relative paths, so point them at the real assets folder.
  const assetsUrl = new URL(`${import.meta.env.BASE_URL}assets`, window.location.href).href;
  const code = new TextDecoder().decode(plain).replaceAll("__CS_ASSETS__", assetsUrl);
  const url = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
  try {
    return await import(/* @vite-ignore */ url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function unlock(password: string): Promise<ProtectedModule> {
  if (import.meta.env.DEV) {
    if (__CS_DEV_PASSWORD__ && password !== __CS_DEV_PASSWORD__) throw new WrongPasswordError();
    return import("./ProtectedCaseStudies");
  }
  return decryptModule(password);
}

// Re-open automatically for the rest of the browser session after one successful unlock.
let autoUnlockTried = false;
function tryAutoUnlock() {
  if (autoUnlockTried || unlocked) return;
  autoUnlockTried = true;
  let saved: string | null = null;
  try { saved = sessionStorage.getItem(STORAGE_KEY); } catch { /* storage blocked */ }
  if (saved) unlock(saved).then(setUnlocked).catch(() => { try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ } });
}

// ─── Gate UI ──────────────────────────────────────────────────────────────────
// Web: the form sits inline where the content goes. Mobile: a bottom sheet over a dim
// overlay; dismissing it (overlay tap or ✕) calls onDismiss, which closes the case study.
export function CaseStudyGate({ caseStudy, isMobile, onDismiss }: { caseStudy: "itravel" | "fastag"; isMobile: boolean; onDismiss?: () => void }) {
  const mod = useProtectedCaseStudies();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "wrong" | "error">("idle");
  tryAutoUnlock();

  if (mod) {
    const Content = caseStudy === "itravel" ? mod.ItravelCaseStudy : mod.FastagCaseStudy;
    return <Content isMobile={isMobile} />;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password || status === "checking") return;
    setStatus("checking");
    try {
      const loaded = await unlock(password);
      try { sessionStorage.setItem(STORAGE_KEY, password); } catch { /* storage blocked */ }
      setUnlocked(loaded);
    } catch (err) {
      setStatus(err instanceof WrongPasswordError ? "wrong" : "error");
    }
  };

  const form = (
    <form
      onSubmit={submit}
      style={isMobile ? {
        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16,
        padding: "12px 20px calc(24px + env(safe-area-inset-bottom, 0px))",
      } : {
        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16,
        padding: 28, borderRadius: 12,
        backgroundColor: colors.sandPanel, border: `1px solid ${colors.sandBorder}`,
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: withAlpha(colors.orange, 0.15), display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Lock size={16} color={colors.orange} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <p className="font-caslon not-italic" style={{ fontSize: 20, lineHeight: "26px", fontWeight: 600, color: colors.ink }}>
          This case study is password protected
        </p>
        <p className="font-inclusive-sans font-normal" style={{ fontSize: 14, lineHeight: "20px", color: colors.body }}>
          Enter the password to read it.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 8, width: "100%" }}>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); if (status !== "checking") setStatus("idle"); }}
          placeholder="Password"
          aria-label="Case study password"
          autoComplete="current-password"
          autoFocus={!isMobile}
          enterKeyHint="go"
          className="font-inclusive-sans"
          style={{
            flex: 1, minWidth: 0, height: isMobile ? 44 : 40, padding: "0 12px",
            // 16px on mobile stops iOS Safari zooming the page when the field is focused
            fontSize: isMobile ? 16 : 14, color: colors.ink,
            backgroundColor: "#F3EEE8", borderRadius: 8, outline: "none",
            border: `1px solid ${status === "wrong" ? colors.error : colors.sandBorder}`,
          }}
        />
        <button
          type="submit"
          disabled={!password || status === "checking"}
          className="font-inclusive-sans font-medium"
          style={{
            height: isMobile ? 44 : 40, padding: "0 20px", fontSize: isMobile ? 15 : 14, color: colors.white, border: "none", borderRadius: 8,
            backgroundColor: colors.orange, cursor: password ? "pointer" : "not-allowed",
            opacity: !password || status === "checking" ? 0.6 : 1,
          }}
        >
          {status === "checking" ? "Unlocking…" : "Unlock"}
        </button>
      </div>
      {status === "wrong" && (
        <p className="font-inclusive-sans" role="alert" style={{ fontSize: 13, color: colors.error }}>That password isn't right. Try again.</p>
      )}
      {status === "error" && (
        <p className="font-inclusive-sans" role="alert" style={{ fontSize: 13, color: colors.error }}>Couldn't load the case study. Check your connection and try again.</p>
      )}
    </form>
  );

  if (!isMobile) return form;

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        onClick={onDismiss}
        style={{ position: "fixed", inset: 0, zIndex: 600, backgroundColor: withAlpha(colors.ink, 0.6), backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Enter the case study password"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 601,
          backgroundColor: colors.sandPanel, borderRadius: "20px 20px 0 0",
          boxShadow: `0 -8px 32px ${withAlpha(colors.ink, 0.18)}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", paddingTop: 10 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: withAlpha(colors.ink, 0.2) }} />
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close"
            style={{ position: "absolute", top: 10, right: 12, width: 32, height: 32, borderRadius: "50%", border: `1px solid ${withAlpha(colors.ink, 0.15)}`, backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <X size={14} color={colors.ink} />
          </button>
        </div>
        {form}
      </motion.div>
    </>,
    document.body,
  );
}
