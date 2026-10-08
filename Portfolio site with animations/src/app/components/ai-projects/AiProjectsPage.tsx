import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { AI_PROJECTS, isOpenableAiProject, type AiProject } from "@/app/data/aiProjects";
import { AiProjectDrawer } from "./AiProjectDrawer";
import { ANIMATION_DEMOS } from "./AnimationDemos";
import { colors, withAlpha } from "@/app/theme/tokens";

// Bubble colours (sand at low opacity over the ink page)
const BUBBLE_FILL = withAlpha(colors.sand, 0.1);
const BUBBLE_STROKE = withAlpha(colors.sand, 0.16);

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// ── BubbleField ────────────────────────────────────────────────────────────────
// Things brewing in the lab. Faint bubbles drift in the dark-green page
// background; the olive container is painted on top of this layer, so bubbles
// only ever show in the exposed dark area (the header band + side gutters).
// Moving the mouse through that area brews in more.

type Popped = { id: number; x: number; y: number; size: number; rise: number; dur: number };

function BubbleField() {
  const reduced = useMemo(prefersReducedMotion, []);
  const fieldRef = useRef<HTMLDivElement>(null);
  const [popped, setPopped] = useState<Popped[]>([]);
  const lastSpawn = useRef(0);
  const idRef = useRef(0);

  const ambient = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        // ~40% biased into the exposed top band so the header always looks alive
        const inBand = i % 5 < 2;
        return {
          left: Math.random() * 100,
          top: inBand ? 8 + Math.random() * 118 : Math.random() * 100,
          topIsPx: inBand,
          size: 6 + Math.random() * 22,
          dur: 6 + Math.random() * 9,
          delay: Math.random() * 7,
          drift: (Math.random() - 0.5) * 34,
        };
      }),
    [],
  );

  const brew = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduced) return;
      const now = performance.now();
      if (now - lastSpawn.current < 80) return;
      lastSpawn.current = now;
      const rect = fieldRef.current?.getBoundingClientRect();
      if (!rect) return;
      const id = idRef.current++;
      setPopped((list) => [
        ...list.slice(-30),
        {
          id,
          x: e.clientX - rect.left + (Math.random() - 0.5) * 26,
          y: e.clientY - rect.top + (Math.random() - 0.5) * 18,
          size: 5 + Math.random() * 14,
          rise: 70 + Math.random() * 70,
          dur: 1.4 + Math.random() * 0.7,
        },
      ]);
    },
    [reduced],
  );

  return (
    <div
      ref={fieldRef}
      onMouseMove={brew}
      aria-hidden
      style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}
    >
      {ambient.map((b, i) => {
        const base = {
          position: "absolute" as const,
          left: `${b.left}%`,
          top: b.topIsPx ? `${b.top}px` : `${b.top}%`,
          width: b.size,
          height: b.size,
          borderRadius: "50%",
          background: BUBBLE_FILL,
          border: `1px solid ${BUBBLE_STROKE}`,
        };
        if (reduced) return <div key={i} style={base} />;
        return (
          <motion.div
            key={i}
            style={{ ...base, willChange: "transform, opacity" }}
            animate={{ y: [0, -14, 0], x: [0, b.drift, 0], opacity: [0.35, 0.9, 0.35] }}
            transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })}

      {popped.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 0.85, 0], scale: 1, y: -p.rise }}
          transition={{ duration: p.dur, ease: "easeOut" }}
          onAnimationComplete={() => setPopped((list) => list.filter((q) => q.id !== p.id))}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: withAlpha(colors.sand, 0.14),
            border: `1px solid ${withAlpha(colors.sand, 0.2)}`,
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}

// ── LabMark ────────────────────────────────────────────────────────────────────
// The orange container from the header. Placeholder for the real animation -
// for now, bubbles quietly rise inside it so it reads as "brewing".

function LabMark() {
  const reduced = useMemo(prefersReducedMotion, []);
  const bubbles = [
    { left: 14, size: 8, dur: 2.4, delay: 0 },
    { left: 32, size: 6, dur: 2.9, delay: 0.7 },
    { left: 44, size: 10, dur: 2.2, delay: 1.2 },
    { left: 24, size: 5, dur: 3.1, delay: 1.9 },
  ];
  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 8,
        background: colors.orange,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 22,
          background: "rgba(255,246,235,0.14)",
        }}
      />
      {!reduced &&
        bubbles.map((b, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              left: b.left,
              bottom: -b.size,
              width: b.size,
              height: b.size,
              borderRadius: "50%",
              background: "rgba(255,246,235,0.55)",
              border: "1px solid rgba(255,246,235,0.7)",
            }}
            animate={{ y: [0, -72], opacity: [0, 1, 0], scale: [0.6, 1, 0.9] }}
            transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
    </div>
  );
}

// ── Tabs ───────────────────────────────────────────────────────────────────────

type TabKey = "animation" | "project";
const TABS: { key: TabKey; label: string }[] = [
  { key: "animation", label: "Animation Lab" },
  { key: "project", label: "Project Lab" },
];

const GOO_ID = "ai-projects-tab-goo";

// The gooey filter itself - dropped once into the page. Blur + a hard alpha
// contrast so overlapping opaque shapes fuse into a metaball / liquid blob.
function GooDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        <filter id={GOO_ID}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
          />
        </filter>
      </defs>
    </svg>
  );
}

// Opaque equivalent of rgba(227,217,206,0.18) over the #212012 header - needed
// because the gooey alpha trick only works on near-opaque sources.
const PILL = "#444134";

function Tabs({ active, onSelect }: { active: TabKey; onSelect: (k: TabKey) => void }) {
  const reduced = useMemo(prefersReducedMotion, []);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [rects, setRects] = useState<{ left: number; width: number }[]>([]);

  useLayoutEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const base = wrap.getBoundingClientRect().left;
      setRects(
        btnRefs.current.map((b) => {
          const r = b!.getBoundingClientRect();
          return { left: r.left - base, width: r.width };
        }),
      );
    };
    measure();
    window.addEventListener("resize", measure);
    if (typeof document !== "undefined" && "fonts" in document) {
      (document as Document).fonts.ready.then(measure).catch(() => {});
    }
    return () => window.removeEventListener("resize", measure);
  }, []);

  const activeIdx = TABS.findIndex((t) => t.key === active);
  const target = rects[activeIdx];

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}
    >
      {/* Gooey highlight - two blobs chase the same target at different spring
          rates, so during a click they stretch apart then fuse under the filter.
          The button text lives outside this layer, so it never distorts. */}
      {target && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            filter: reduced ? undefined : `url(#${GOO_ID})`,
          }}
        >
          <motion.div
            initial={false}
            animate={{ x: target.left, width: target.width }}
            transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 34, mass: 0.7 }}
            style={{ position: "absolute", top: 0, bottom: 0, borderRadius: 999, background: PILL }}
          />
          {!reduced && (
            <motion.div
              initial={false}
              animate={{ x: target.left, width: target.width }}
              transition={{ type: "spring", stiffness: 120, damping: 17, mass: 1 }}
              style={{ position: "absolute", top: 0, bottom: 0, borderRadius: 999, background: PILL }}
            />
          )}
        </div>
      )}

      {TABS.map((t, i) => {
        const on = active === t.key;
        return (
          <button
            key={t.key}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            onClick={() => onSelect(t.key)}
            className="font-inclusive-sans font-semibold"
            style={{
              position: "relative",
              zIndex: 1,
              fontSize: 16,
              lineHeight: "20px",
              textTransform: "uppercase",
              color: colors.sand,
              background: on ? "transparent" : withAlpha(colors.sand, 0.1),
              border: "none",
              borderRadius: 999,
              padding: "8px 12px",
              cursor: "pointer",
              transition: "background 0.2s ease",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Cards ──────────────────────────────────────────────────────────────────────

// Three across, 16px gutters - the inner rows are flex, not a grid.
const CARD_BASIS = "calc((100% - 32px) / 3)";

const demoShell: React.CSSProperties = {
  background: colors.sand,
  borderRadius: 12,
  minHeight: 480,
  padding: 24,
  display: "flex",
  flexDirection: "column",
  flex: `1 1 ${CARD_BASIS}`,
  maxWidth: CARD_BASIS,
};

const cardEnter = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Project row - full-width, no artwork: title, byline, tag pills. Nothing else.
function AiProjectCard({
  project,
  index,
  onClick,
}: {
  project: AiProject;
  index: number;
  onClick?: () => void;
}) {
  const clickable = Boolean(onClick);
  return (
    <motion.div
      {...cardEnter}
      transition={{ duration: 0.4, delay: Math.min(index, 10) * 0.04, ease: [0.16, 1, 0.3, 1] }}
      whileHover={clickable ? { backgroundColor: "#ece3d8" } : undefined}
      onClick={onClick}
      style={{
        background: colors.sand,
        borderRadius: 12,
        padding: "20px 24px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        cursor: clickable ? "pointer" : "default",
        opacity: clickable ? 1 : 0.7,
      }}
    >
      <p
        className="font-caslon"
        style={{ fontStyle: "normal", fontSize: 20, lineHeight: "26px", fontWeight: 600, color: colors.ink }}
      >
        {project.title}
      </p>
      <p className="font-inclusive-sans" style={{ fontSize: 14, lineHeight: "20px", color: withAlpha(colors.ink, 0.6) }}>
        {project.description}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="font-inclusive-sans"
            style={{
              fontSize: 11,
              letterSpacing: "0.3px",
              padding: "3px 10px",
              borderRadius: 999,
              color: withAlpha(colors.ink, 0.55),
              background: withAlpha(colors.ink, 0.06),
              whiteSpace: "nowrap",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function AnimationDemoCard({
  demo,
  index,
}: {
  demo: (typeof ANIMATION_DEMOS)[number];
  index: number;
}) {
  const { number, title, tagline, Component } = demo;
  return (
    <motion.div
      {...cardEnter}
      transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      style={demoShell}
    >
      <div
        style={{
          position: "relative",
          borderRadius: 8,
          overflow: "hidden",
          marginBottom: 20,
          background: withAlpha(colors.ink, 0.05),
          border: `1px solid ${withAlpha(colors.ink, 0.06)}`,
        }}
      >
        <Component />
        <span
          className="font-inclusive-sans font-medium"
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            fontSize: 10,
            letterSpacing: "1.4px",
            textTransform: "uppercase",
            color: withAlpha(colors.ink, 0.4),
          }}
        >
          {number} · animation
        </span>
      </div>

      <p
        className="font-caslon"
        style={{ fontStyle: "normal", fontSize: 20, lineHeight: "26px", fontWeight: 600, color: colors.ink, marginBottom: 8 }}
      >
        {title}
      </p>
      <p className="font-inclusive-sans" style={{ fontSize: 14, lineHeight: "20px", color: withAlpha(colors.ink, 0.6) }}>
        {tagline}
      </p>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

interface AiProjectsPageProps {
  /** Kept for the host route - no visible control; Esc returns to the portfolio. */
  onBack?: () => void;
}

export function AiProjectsPage({ onBack }: AiProjectsPageProps) {
  const [tab, setTab] = useState<TabKey>("project");
  const [selected, setSelected] = useState<AiProject | null>(null);

  useEffect(() => {
    if (!onBack) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !selected) onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack, selected]);

  const projectView = tab === "project";

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: colors.ink, overflowX: "hidden" }}>

      <GooDefs />
      <BubbleField />

      <AiProjectDrawer project={selected} onClose={() => setSelected(null)} />

      {/* Header - orange lab mark + title, filter tabs on the right */}
      <header
        style={{
          position: "relative",
          zIndex: 2,
          padding: "40px 36px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1, minWidth: 0 }}>
            <LabMark />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
              <p
                className="font-caslon"
                style={{ fontStyle: "normal", fontSize: 24, lineHeight: "28px", fontWeight: 600, color: colors.sand }}
              >
                This is my <span style={{ fontStyle: "italic" }}>personal lab</span>
              </p>
              <p className="font-inclusive-sans" style={{ fontSize: 16, lineHeight: "20px", color: colors.sand }}>
                where risk is zero and satisfaction is total
              </p>
            </div>
          </div>

          <Tabs active={tab} onSelect={setTab} />
        </div>
      </header>

      {/* The raised olive container - full-bleed, painted on top of the bubble layer.
          Projects fill it edge to edge; the animation grid keeps a 36px inset. */}
      <main
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 40,
          background: colors.oliveDeep,
          borderRadius: "24px 24px 0 0",
          overflow: "hidden",
          padding: projectView ? 0 : 36,
          minHeight: projectView ? undefined : "calc(100vh - 148px)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            flexDirection: projectView ? "column" : "row",
          }}
        >
          {projectView
            ? AI_PROJECTS.map((project, i) => (
                <AiProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                  onClick={isOpenableAiProject(project) ? () => setSelected(project) : undefined}
                />
              ))
            : ANIMATION_DEMOS.map((demo, i) => (
                <AnimationDemoCard key={`demo-${demo.number}`} demo={demo} index={i} />
              ))}
        </div>
      </main>
    </div>
  );
}
