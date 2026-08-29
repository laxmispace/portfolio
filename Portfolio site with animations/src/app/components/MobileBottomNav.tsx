import { useRef } from "react";
import { motion } from "motion/react";
import type { NavSection } from "./SideNav";
import { haptic, softTick } from "@/app/lib/feedback";

// Fixed order — items never reflow. Only the active row changes style.
const NAV_ITEMS: { id: NavSection; label: string }[] = [
  { id: "home",          label: "home" },
  { id: "projects",      label: "projects" },
  { id: "ai-playground", label: "ai playground" },
  { id: "tinkering",     label: "tinkering hobbies" },
];

const LINKS: { label: string; href: string }[] = [
  { label: "linkedin", href: "https://in.linkedin.com/in/laxmi-mahajan" },
  { label: "gmail",    href: "mailto:laxmimahajanwork@gmail.com" },
  { label: "resume",   href: "https://drive.google.com/file/d/1cm1x-y31ugOERxl7MaLuoOYGnNq0r1p0/view?usp=sharing" },
  { label: "github",   href: "https://github.com/mycodedump" },
];

const NAV_WIDTH = "min(328px, calc(100vw - 32px))";

// Minor ticks between each pair of section ticks — "like an inch scale".
const MINOR_PER_GAP = 2;
const STEP = MINOR_PER_GAP + 1;

function lerpColor(t: number) {
  // #c67d39 (inactive) → #625e37 (active)
  const a = [198, 125, 57];
  const b = [98, 94, 55];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

// ── Ruler / scrubbing scale ─────────────────────────────────────────────────────
// A number-less vertical rule. The tick on the active section swells + darkens;
// its neighbours taper off (a little fish-eye). Drag or tap to scrub sections —
// each new section gives a haptic tap + a soft notch sound.
function SectionRuler({ count, activeIndex, onScrub }: { count: number; activeIndex: number; onScrub: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef(activeIndex);
  const total = count + (count - 1) * MINOR_PER_GAP;
  const activeTick = activeIndex * STEP;

  const scrubTo = (clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const f = Math.min(Math.max((clientY - r.top) / r.height, 0), 1);
    const i = Math.round(f * (count - 1));
    if (i !== last.current) {
      last.current = i;
      haptic(9);
      softTick(0.06);
      onScrub(i);
    }
  };

  return (
    <div
      ref={ref}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); scrubTo(e.clientY); }}
      onPointerMove={(e) => { if (e.buttons) scrubTo(e.clientY); }}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "flex-start",
        alignSelf: "stretch",
        width: 16,
        flexShrink: 0,
        cursor: "ns-resize",
        touchAction: "none",
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const isMajor = i % STEP === 0;
        const dist = Math.abs(i - activeTick) / STEP; // in section units
        const m = Math.max(0, 1 - dist);
        const e = m * m * (3 - 2 * m); // smoothstep falloff
        const width = (isMajor ? 8 : 4) + e * (isMajor ? 8 : 4);
        const height = isMajor ? 1.5 + e : 1;
        const opacity = 0.28 + e * 0.72;
        return (
          <motion.span
            key={i}
            animate={{ width, height, opacity, backgroundColor: lerpColor(e) }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "block", borderRadius: 1, width, height }}
          />
        );
      })}
    </div>
  );
}

export function MobileBottomNav({
  activeSection,
  onNavigate,
}: {
  activeSection: NavSection;
  onNavigate: (s: NavSection) => void;
}) {
  const activeIndex = Math.max(0, NAV_ITEMS.findIndex((i) => i.id === activeSection));

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: 76,
        zIndex: 10,
        background: "#ECE6DF",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: NAV_WIDTH,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "8px 0",
          overflow: "hidden",
        }}
      >
        {/* Top fade — pinned to the top edge of the band */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            background: "linear-gradient(180deg, #ECE6DF 30%, rgba(236,230,223,0) 100%)",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />

        {/* Ruler + left-aligned nav labels (clip if tight) */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 10, height: "100%", minWidth: 0 }}>
          <SectionRuler
            count={NAV_ITEMS.length}
            activeIndex={activeIndex}
            onScrub={(i) => onNavigate(NAV_ITEMS[i].id)}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
              minWidth: 0,
            }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = item.id === activeSection;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  whileTap={{ scale: 0.96 }}
                  className="font-inclusive-sans"
                  animate={{ color: isActive ? "#625e37" : "#c67d39" }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    textAlign: "left",
                    fontWeight: isActive ? 500 : 400,
                    fontSize: isActive ? 12 : 10,
                    lineHeight: isActive ? "16px" : "12px",
                    letterSpacing: isActive ? "-0.02em" : "0.02em",
                    textTransform: "uppercase",
                  }}
                >
                  {item.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── External links — fixed to the right edge ── */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-caslon"
              style={{
                fontWeight: 600,
                fontSize: 11,
                lineHeight: "14px",
                letterSpacing: "0.01em",
                textAlign: "right",
                textDecoration: "underline",
                textTransform: "lowercase",
                color: "#625e37",
                whiteSpace: "nowrap",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
