import { useRef } from "react";
import { motion } from "motion/react";
import type { NavSection } from "./SideNav";
import { haptic, softTick } from "@/app/lib/feedback";
import { MobileFab } from "./MobileFab";
import { MadeWithLove } from "./MadeWithLove";
import { STYLE_GUIDE_PATH } from "@/app/lib/routes";
import { colors, withAlpha } from "@/app/theme/tokens";

// Fixed order — items never reflow. Only the active row changes style.
const NAV_ITEMS: { id: NavSection; label: string }[] = [
  { id: "home",          label: "home" },
  { id: "projects",      label: "projects" },
  { id: "ai-projects",   label: "ai playground" },
  { id: "blog",          label: "tinkering hobbies" },
];

const BAND_HEIGHT = 72;
// Slim sign-off row under the band. BAND_HEIGHT + FOOTER_HEIGHT must match
// --mobile-nav-height in styles/layout.css (the page scroller stops above it).
const FOOTER_HEIGHT = 26;
const BAND_WIDTH = 328;

// ── Ruler / scrubbing scale ──────────────────────────────────────────────────
// A ragged stack of 13 thin rules. One "major" line per section (indices 2,5,8,
// 11); the active section's line is the long dark one, its immediate neighbours
// a touch darker, the rest faint. Drag or tap to scrub sections.
const TOTAL_LINES = 13;
const MAJOR_INDICES = [2, 5, 8, 11];

function SectionRuler({ count, activeIndex, onScrub }: { count: number; activeIndex: number; onScrub: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef(activeIndex);
  const activeLine = MAJOR_INDICES[Math.min(Math.max(activeIndex, 0), count - 1)];

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
        width: 80,
        flexShrink: 0,
        cursor: "ns-resize",
        touchAction: "none",
        padding: "8px 0 4px",
      }}
    >
      {Array.from({ length: TOTAL_LINES }).map((_, i) => {
        const isMajor = MAJOR_INDICES.includes(i);
        const isActive = i === activeLine;
        const near = Math.abs(i - activeLine) === 1;
        const width = isActive ? 80 : isMajor ? 72 : i % 2 === 0 ? 56 : 60;
        const color = isActive
          ? colors.ink
          : near
          ? withAlpha(colors.orange, 0.4)
          : withAlpha(colors.orange, 0.2);
        return (
          <motion.span
            key={i}
            animate={{ width, backgroundColor: color }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "block", height: 1, width }}
          />
        );
      })}
    </div>
  );
}

export function MobileBottomNav({
  activeSection,
  onNavigate,
  onOpenStyleGuide,
}: {
  activeSection: NavSection;
  onNavigate: (s: NavSection) => void;
  onOpenStyleGuide: () => void;
}) {
  const activeIndex = Math.max(0, NAV_ITEMS.findIndex((i) => i.id === activeSection));

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: BAND_HEIGHT + FOOTER_HEIGHT,
        zIndex: 9000,
        background: colors.sandLight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: BAND_WIDTH,
          maxWidth: "calc(100vw - 20px)",
          height: BAND_HEIGHT,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {/* Left group — ruler + section labels */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 6,
            flexGrow: 1,
            minWidth: 0,
            height: BAND_HEIGHT,
            isolation: "isolate",
            overflow: "hidden",
          }}
        >
          <SectionRuler
            count={NAV_ITEMS.length}
            activeIndex={activeIndex}
            onScrub={(i) => onNavigate(NAV_ITEMS[i].id)}
          />

          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: activeIndex >= 2 ? "flex-end" : "flex-start",
              alignItems: "flex-start",
              gap: 4,
              padding: "12px 0",
              flexGrow: 1,
              minWidth: 0,
              height: BAND_HEIGHT,
            }}
          >
            {/* Top fade */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 12,
                background: `linear-gradient(180deg, ${colors.sandLight} 30%, rgba(236,230,223,0) 100%)`,
                pointerEvents: "none",
                zIndex: 2,
              }}
            />

            {NAV_ITEMS.map((item) => {
              const isActive = item.id === activeSection;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  whileTap={{ scale: 0.96 }}
                  className="font-inclusive-sans"
                  animate={{ color: isActive ? colors.oliveDeep : colors.orange }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    textAlign: "left",
                    textTransform: "uppercase",
                    fontWeight: isActive ? 500 : 400,
                    fontSize: isActive ? 14 : 10,
                    lineHeight: isActive ? "16px" : "12px",
                    letterSpacing: isActive ? "-0.02em" : "0.02em",
                  }}
                >
                  {item.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* FAB group */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            padding: "14px 0",
            width: 44,
            height: BAND_HEIGHT,
            flexShrink: 0,
          }}
        >
          <MobileFab />
        </div>
      </div>

      {/* Sign-off row */}
      <div
        style={{
          width: BAND_WIDTH,
          maxWidth: "calc(100vw - 20px)",
          height: FOOTER_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          borderTop: `1px solid ${withAlpha(colors.oliveDeep, 0.12)}`,
        }}
      >
        <MadeWithLove fontSize={10} />
        <a
          href={STYLE_GUIDE_PATH}
          onClick={(e) => { e.preventDefault(); onOpenStyleGuide(); }}
          className="font-inclusive-sans"
          style={{ fontSize: 10, color: colors.orange, textDecoration: "none", whiteSpace: "nowrap" }}
        >
          style guide ↗
        </a>
      </div>
    </div>
  );
}
