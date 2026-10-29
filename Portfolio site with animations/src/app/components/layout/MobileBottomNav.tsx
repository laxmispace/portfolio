import { useRef } from "react";
import { motion } from "motion/react";
import type { NavSection } from "./SideNav";
import { haptic, softTick } from "@/app/lib/feedback";
import { MobileFab } from "./MobileFab";
import { colors, withAlpha } from "@/app/theme/tokens";

// Fixed order - items never reflow. Only the active row changes style.
const NAV_ITEMS: { id: NavSection; label: string }[] = [
  { id: "home",          label: "home" },
  { id: "projects",      label: "projects" },
  { id: "ai-projects",   label: "playground" },
  { id: "about",         label: "about me" },
  { id: "blog",          label: "blogs" },
];

// Must match --mobile-nav-height in styles/layout.css (the page scroller stops above it).
const BAND_HEIGHT = 72;
const BAND_WIDTH = 328;

// ── The drum ─────────────────────────────────────────────────────────────────
// Ticks and labels ride one column that slides as a unit, so the active section's
// long dark tick always sits in the band's middle, level with its label. Each
// section is an 18px row: its major tick through the middle and a minor tick 6px
// above and below - one even 6px rhythm all the way down. A few rows of plain ticks
// run past both ends so the ruler never stops short while it slides.
const ROW_H = 18;
const TICK_PITCH = ROW_H / 3;
const RULER_W = 80;
const EDGE_ROWS = 3;
const SPRING = { type: "spring", stiffness: 380, damping: 36 } as const;

function Tick({ width, color, top }: { width: number; color: string; top: number }) {
  return (
    <motion.span
      animate={{ width, backgroundColor: color }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "absolute", left: 0, top, height: 1, width }}
    />
  );
}

function MinorTicks({ near }: { near: boolean }) {
  const color = withAlpha(colors.orange, near ? 0.32 : 0.2);
  return (
    <>
      <Tick width={near ? 60 : 52} color={color} top={ROW_H / 2 - TICK_PITCH} />
      <Tick width={near ? 60 : 52} color={color} top={ROW_H / 2 + TICK_PITCH} />
    </>
  );
}

function SectionDrum({ activeIndex, onNavigate }: { activeIndex: number; onNavigate: (i: number) => void }) {
  const columnY = BAND_HEIGHT / 2 - (activeIndex * ROW_H + ROW_H / 2);
  // A drag scrubs: moving up a row's height steps to the next section, like a picker.
  const drag = useRef<{ id: number; y0: number; i0: number; last: number; moved: boolean } | null>(null);
  const last = Math.max(0, NAV_ITEMS.length - 1);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { id: e.pointerId, y0: e.clientY, i0: activeIndex, last: activeIndex, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dy = d.y0 - e.clientY;
    if (!d.moved && Math.abs(dy) > 4) {
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    const i = Math.min(Math.max(d.i0 + Math.round(dy / ROW_H), 0), last);
    if (i !== d.last) {
      d.last = i;
      haptic(9);
      softTick(0.06);
      onNavigate(i);
    }
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved) return;
    // a tap on the ruler (labels handle their own clicks) jumps to the row under it
    if ((e.target as HTMLElement).closest("button")) return;
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.min(Math.max(activeIndex + Math.round((e.clientY - (r.top + r.height / 2)) / ROW_H), 0), last);
    if (i !== activeIndex) { haptic(9); onNavigate(i); }
  };

  const fade = (dir: "180deg" | "0deg") =>
    `linear-gradient(${dir}, ${colors.sandLight} 15%, ${withAlpha(colors.sandLight, 0)} 100%)`;

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { drag.current = null; }}
      style={{ position: "relative", flexGrow: 1, minWidth: 0, height: BAND_HEIGHT, overflow: "hidden", touchAction: "none", cursor: "ns-resize" }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 20, background: fade("180deg"), pointerEvents: "none", zIndex: 2 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 20, background: fade("0deg"), pointerEvents: "none", zIndex: 2 }} />

      <motion.div initial={false} animate={{ y: columnY }} transition={SPRING} style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
        {/* plain ticks running on above the first row and below the last */}
        {[-1, 1].map((side) =>
          Array.from({ length: EDGE_ROWS }).map((_, k) => (
            <div
              key={`${side}-${k}`}
              style={{ position: "absolute", left: 0, width: RULER_W, height: ROW_H, top: side < 0 ? -(k + 1) * ROW_H : (NAV_ITEMS.length + k) * ROW_H }}
            >
              <Tick width={k % 2 ? 52 : 64} color={withAlpha(colors.orange, 0.2)} top={ROW_H / 2} />
              <MinorTicks near={false} />
            </div>
          ))
        )}

        {NAV_ITEMS.map((item, i) => {
          const isActive = i === activeIndex;
          const near = Math.abs(i - activeIndex) === 1;
          return (
            <div key={item.id} style={{ position: "absolute", top: i * ROW_H, left: 0, right: 0, height: ROW_H, display: "flex", alignItems: "center" }}>
              <div style={{ position: "relative", width: RULER_W, height: ROW_H, flexShrink: 0 }}>
                <Tick
                  width={isActive ? RULER_W : near ? 70 : 64}
                  color={isActive ? colors.oliveDeep : withAlpha(colors.orange, near ? 0.45 : 0.3)} // same green as the active label
                  top={ROW_H / 2}
                />
                <MinorTicks near={isActive} />
              </div>
              <motion.button
                onClick={() => onNavigate(i)}
                whileTap={{ scale: 0.96 }}
                className="font-inclusive-sans"
                animate={{ color: isActive ? colors.oliveDeep : colors.orange, opacity: isActive ? 1 : near ? 0.85 : 0.6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{
                  marginLeft: 8,
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  textAlign: "left",
                  textTransform: "uppercase",
                  fontWeight: isActive ? 500 : 400,
                  fontSize: isActive ? 14 : 10,
                  lineHeight: `${ROW_H}px`,
                  height: ROW_H,
                  letterSpacing: isActive ? "-0.02em" : "0.02em",
                }}
              >
                {item.label}
              </motion.button>
            </div>
          );
        })}
      </motion.div>
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
        height: BAND_HEIGHT,
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
        <SectionDrum activeIndex={activeIndex} onNavigate={(i) => onNavigate(NAV_ITEMS[i].id)} />

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

    </div>
  );
}
