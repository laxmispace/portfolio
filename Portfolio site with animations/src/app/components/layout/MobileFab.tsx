import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileDown, Mail, Github, Linkedin } from "lucide-react";
import { haptic } from "@/app/lib/feedback";
import { colors, withAlpha } from "@/app/theme/tokens";
import { RESUME_URL } from "@/app/lib/links";

// ── Speed-dial FAB ────────────────────────────────────────────────────────────
// Lives in the bottom sticky nav band (rendered by MobileBottomNav). The trigger
// sits in normal flow so the parent can place it; the fanned-out actions and the
// scrim are position:fixed so the band's overflow:hidden can't clip them.
const ACTIONS = [
  { label: "resume",   href: RESUME_URL, Icon: FileDown },
  { label: "gmail",    href: "mailto:laxmimahajanwork@gmail.com", Icon: Mail },
  { label: "github",   href: "https://github.com/laxmispace", Icon: Github },
  { label: "linkedin", href: "https://in.linkedin.com/in/laxmi-mahajan", Icon: Linkedin },
];

export function MobileFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Scrim — tap anywhere to close */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, background: withAlpha(colors.ink, 0.28), zIndex: 2147483644 }}
          />
        )}
      </AnimatePresence>

      {/* Fanned-out actions — fixed, just above the nav band */}
      <div
        style={{
          position: "fixed",
          right: 14,
          bottom: 80,
          zIndex: 2147483646,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 10,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <AnimatePresence>
          {open &&
            ACTIONS.map((a, i) => (
              <motion.a
                key={a.label}
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 16, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1], delay: (ACTIONS.length - 1 - i) * 0.04 }}
                style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
              >
                <span
                  className="font-inclusive-sans lowercase"
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.02em",
                    color: colors.ink,
                    background: colors.sandLight,
                    padding: "5px 10px",
                    borderRadius: 8,
                    boxShadow: `0 2px 10px ${withAlpha(colors.ink, 0.14)}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {a.label}
                </span>
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: colors.sand,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 2px 10px ${withAlpha(colors.ink, 0.16)}`,
                  }}
                >
                  <a.Icon size={18} strokeWidth={1.8} color={colors.oliveDeep} />
                </span>
              </motion.a>
            ))}
        </AnimatePresence>
      </div>

      {/* Trigger — plain olive circle, placed by the parent inside the band */}
      <motion.button
        onClick={() => { haptic(8); setOpen((v) => !v); }}
        whileTap={{ scale: 0.92 }}
        aria-label={open ? "Close links" : "Open links"}
        aria-expanded={open}
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: colors.olive,
          display: "block",
          flexShrink: 0,
          position: "relative",
          zIndex: 2147483647,
        }}
      />
    </>
  );
}
