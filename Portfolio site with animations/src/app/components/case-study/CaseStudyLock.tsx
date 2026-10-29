import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { X, Eye, EyeOff } from "lucide-react";
import { WatchingEyes } from "./WatchingEyes";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { colors, withAlpha } from "@/app/theme/tokens";

/** Covers the open drawer until the password unlocks (decrypts) the case study.
 *  `onSubmit` resolves true when the password was right. */
export function CaseStudyLock({ onSubmit, onClose }: { onSubmit: (password: string) => Promise<boolean>; onClose: () => void }) {
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile(768);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 450);
    return () => clearTimeout(t);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || checking) return;
    setChecking(true);
    const ok = await onSubmit(value.trim()).catch(() => false);
    setChecking(false);
    if (!ok) {
      setError(true);
      setValue("");
      inputRef.current?.focus();
    }
  };

  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 30,
        backgroundColor: colors.sand,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? 16 : 24,
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute", top: 20, right: 20,
          width: 36, height: 36, borderRadius: "50%",
          border: `1px solid ${withAlpha(colors.oliveDeep, 0.2)}`,
          backgroundColor: withAlpha(colors.sand, 0.85),
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: colors.ink,
        }}
      >
        <X size={16} />
      </button>

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 8 }}
        animate={error ? { opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: "100%", maxWidth: 460, minWidth: 0, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "stretch", gap: 16, textAlign: "center" }}
      >
        {/* a little more room under the eyes, and the two lines of copy kept close together */}
        <div style={{ alignSelf: "center", marginBottom: 12 }}>
          <WatchingEyes width={62} closed={visible} watch={inputRef} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <p className="font-caslon not-italic" style={{ fontSize: 24, fontWeight: isMobile ? 600 : 500, color: colors.ink, lineHeight: "normal", overflowWrap: "break-word" }}>
            This case study is password protected
          </p>
          {/* one line on desktop; on phones it wraps rather than running off the screen */}
          <p className="font-inclusive-sans font-normal" style={{ fontSize: 14, lineHeight: "20px", whiteSpace: isMobile ? "normal" : "nowrap", color: withAlpha(colors.ink, 0.6) }}>
            It covers client work under NDA. Enter the password to read it.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
            <input
              ref={inputRef}
              type={visible ? "text" : "password"}
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(false); }}
              placeholder="Password"
              aria-label="Password"
              aria-invalid={error}
              autoComplete="current-password"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="font-inclusive-sans"
              style={{
                width: "100%", height: 40, padding: "0 42px 0 14px", borderRadius: 10, fontSize: 14, boxSizing: "border-box",
                border: `1px solid ${error ? colors.orangeDeep : withAlpha(colors.ink, 0.2)}`,
                backgroundColor: colors.white, color: colors.ink, outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => { setVisible((v) => !v); inputRef.current?.focus(); }}
              aria-label={visible ? "Hide password" : "Show password"}
              aria-pressed={visible}
              style={{
                position: "absolute", right: 4, top: 4, width: 32, height: 32, borderRadius: 8,
                border: "none", background: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: withAlpha(colors.ink, 0.5),
              }}
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={checking}
            className="font-inclusive-sans"
            style={{ height: 40, padding: "0 18px", borderRadius: 10, border: "none", backgroundColor: colors.ink, color: colors.sand, fontSize: 14, cursor: checking ? "wait" : "pointer", flexShrink: 0 }}
          >
            {checking ? "Unlocking…" : "Unlock"}
          </button>
        </div>
        <p className="font-inclusive-sans font-normal" role="alert" style={{ fontSize: 13, minHeight: 18, color: colors.orangeDeep }}>
          {error ? "That's not it - try again." : ""}
        </p>
      </motion.form>
    </div>
  );
}
