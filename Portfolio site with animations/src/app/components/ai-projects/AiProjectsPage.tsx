import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AI_PROJECTS, isOpenableAiProject, type AiProject } from "@/app/data/aiProjects";
import { AiProjectDrawer } from "./AiProjectDrawer";
import { AiProjectFrame } from "./AiProjectFrame";
import { colors, textStyles, withAlpha } from "@/app/theme/tokens";
import { toCss } from "@/app/lib/zoom";
import { useIsMobile } from "@/app/hooks/useIsMobile";

// The animation lab pulls in p5 and three.js - only fetch them once the tab is opened.
const AnimationLab = lazy(() => import("./AnimationLab").then((m) => ({ default: m.AnimationLab })));

// Bubble colours (sand at low opacity over the ink page)
// The lab page: dark green, with a sand container running edge to edge below the header.
const PAGE_BG = colors.ink;
const SHEET_BG = colors.sand;

// Bubbles (sand at low opacity over the dark page)
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
          x: toCss(e.clientX - rect.left) + (Math.random() - 0.5) * 26,
          y: toCss(e.clientY - rect.top) + (Math.random() - 0.5) * 18,
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
    { left: 9, size: 6, dur: 2.4, delay: 0 },
    { left: 22, size: 4, dur: 2.9, delay: 0.7 },
    { left: 30, size: 7, dur: 2.2, delay: 1.2 },
    { left: 16, size: 4, dur: 3.1, delay: 1.9 },
  ];
  return (
    <div
      style={{
        width: 44,
        height: 44,
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
          height: 15,
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
            animate={{ y: [0, -50], opacity: [0, 1, 0], scale: [0.6, 1, 0.9] }}
            transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
    </div>
  );
}

// ── Tabs ───────────────────────────────────────────────────────────────────────

type TabKey = "animation" | "project";
const TABS: { key: TabKey; label: string }[] = [
  { key: "animation", label: "Animation lab" },
  { key: "project", label: "Project lab" },
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
// Opaque equivalent of sand at ~18% over the dark page - the gooey trick needs an opaque fill.
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
          return { left: toCss(r.left - base), width: toCss(r.width) };
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
      style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
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
            className="font-inclusive-sans"
            style={{
              position: "relative",
              zIndex: 1,
              fontSize: 14,
              fontWeight: 400,
              lineHeight: "20px",
              color: colors.sand,
              background: on ? "transparent" : withAlpha(colors.sand, 0.1),
              border: "none",
              borderRadius: 999,
              padding: "6px 14px",
              cursor: "pointer",
              transition: "background 0.2s ease, color 0.25s ease",
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
// Same card as the homepage AI section - the hand-designed cover on top, title and
// one line below - laid out three across, each cover inset so it has room to breathe.

// The lab's line-up, in order: the three homepage projects, then the music player.
const LAB_PROJECT_IDS = [9, 2, 0, 10];
const LAB_PROJECTS = LAB_PROJECT_IDS.map((id) => AI_PROJECTS.find((p) => p.id === id)).filter(
  (p): p is AiProject => Boolean(p),
);

const KIND_LABEL: Record<NonNullable<AiProject["kind"]>, string> = {
  webapp: "web app",
  extension: "chrome extension",
  player: "spotify player",
};

const SAND_SOFT = "rgba(227, 224, 208, 0.1)";

// Cover on top (700×400 in the design), details on an ink band underneath.
function LabProjectCard({
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
      className="ai-project-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 16,
        overflow: "hidden",
        cursor: clickable ? "pointer" : "default",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "700 / 400", background: colors.oliveDeep }}>
        {project.frameKey && <AiProjectFrame frameKey={project.frameKey} />}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, background: colors.ink, flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <p className="font-caslon not-italic" style={{ color: colors.sand, fontSize: 16, lineHeight: "20px", fontWeight: 600 }}>
              {project.title}
            </p>
            <span
              className="font-inclusive-sans"
              style={{
                padding: 6,
                borderRadius: 4,
                background: withAlpha(colors.oliveDeep, 0.2),
                color: colors.sand,
                fontSize: 11,
                lineHeight: "12px",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {KIND_LABEL[project.kind ?? "webapp"]}
            </span>
          </div>
          <p className="font-inclusive-sans" style={{ color: colors.sand, opacity: 0.8, fontSize: 14, lineHeight: "20px" }}>
            {project.description}
          </p>
        </div>
        {clickable && (
          <span
            aria-hidden
            style={{
              width: 32,
              height: 32,
              borderRadius: 32,
              background: SAND_SOFT,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowRight size={14} color={colors.sand} />
          </span>
        )}
      </div>
    </motion.div>
  );
}

function BackHome({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="font-inclusive-sans"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        color: withAlpha(colors.sand, hover ? 1 : 0.6),
        fontSize: 14,
        fontWeight: 400,
        lineHeight: "20px",
        transition: "color 0.2s ease",
        flexShrink: 0,
      }}
    >
      <motion.span animate={{ x: hover ? -2 : 0 }} transition={{ duration: 0.2 }} style={{ display: "flex" }}>
        <ArrowLeft size={14} color="currentColor" />
      </motion.span>
      home
    </button>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

interface AiProjectsPageProps {
  /** Back to the portfolio - the header button, or Esc. */
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
  const isMobile = useIsMobile();

  const title = (
    <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
      <LabMark />
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <p className="font-caslon" style={{ fontStyle: "normal", fontSize: 20, lineHeight: "26px", fontWeight: 600, color: colors.sand }}>
          This is my <span style={{ fontStyle: "italic" }}>personal lab</span>
        </p>
        <p style={{ ...textStyles.byline, color: withAlpha(colors.sand, 0.6) }}>where risk is zero and satisfaction is total</p>
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: "relative",
        minHeight: "calc(100vh / var(--page-zoom))",
        backgroundColor: PAGE_BG,
        overflowX: "hidden",
      }}
    >

      <GooDefs />
      <BubbleField />

      <AiProjectDrawer project={selected} onClose={() => setSelected(null)} />

      {/* Header - back link, lab mark + title, tabs. On phones the back link and tabs
          share the top row and the title drops beneath them. */}
      <header style={{ position: "relative", zIndex: 2, padding: isMobile ? "20px 16px 0" : "28px 32px 0" }}>
        {isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              {onBack ? <BackHome onClick={onBack} /> : <span />}
              <Tabs active={tab} onSelect={setTab} />
            </div>
            {title}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
              {onBack && (
                <>
                  <BackHome onClick={onBack} />
                  <span aria-hidden style={{ width: 1, height: 28, background: withAlpha(colors.sand, 0.15), margin: "0 4px" }} />
                </>
              )}
              {title}
            </div>
            <Tabs active={tab} onSelect={setTab} />
          </div>
        )}
      </header>

      {/* The container: sand, edge to edge, rounded at the top, painted over the bubble
          layer. The work fills it, 40px in from every side (16px on a phone). */}
      <main
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: isMobile ? 20 : 28,
          background: SHEET_BG,
          borderRadius: isMobile ? "16px 16px 0 0" : "24px 24px 0 0",
          padding: isMobile ? 16 : 40,
          minHeight: "calc(100vh / var(--page-zoom) - 120px)",
        }}
      >
        <div>
          {projectView ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 360px), 1fr))", gap: isMobile ? 20 : 32 }}>
              {LAB_PROJECTS.map((project, i) => (
                <LabProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                  onClick={isOpenableAiProject(project) ? () => setSelected(project) : undefined}
                />
              ))}
            </div>
          ) : (
            <Suspense fallback={null}>
              <AnimationLab />
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}
