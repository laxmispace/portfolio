import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Home } from "lucide-react";
import { AI_PROJECTS, isOpenableAiProject, type AiProject } from "@/app/data/aiProjects";
import { AiProjectDrawer } from "./AiProjectDrawer";
import { AiProjectFrame } from "./AiProjectFrame";
import { colors, textStyles, withAlpha } from "@/app/theme/tokens";
import { toCss } from "@/app/lib/zoom";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { CaseStudyTab } from "@/app/components/home/ProjectsSection";
import { slugify, useRoutedSelection } from "@/app/lib/routedSelection";

// Inside the lab a project lives at #lab/<slug>, e.g. /portfolio/#lab/browser-piano
const LAB_PROJECT_HASH = "#lab/";

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
        borderRadius: "50%",
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
// Project lab first - it's where the page opens. Each tab has its own colour while it's
// not chosen; the chosen one turns the sheet's sand.
const TABS: { key: TabKey; label: string; color: string }[] = [
  { key: "project", label: "Project lab", color: colors.orange },
  { key: "animation", label: "Animation lab", color: colors.pink },
];

/** The homepage's case-study folder tabs, sitting on the sheet's top edge: they choose
 *  what the sheet below shows, so they belong to it. */
function Tabs({ active, onSelect, isMobile }: { active: TabKey; onSelect: (k: TabKey) => void; isMobile: boolean }) {
  return (
    <div
      role="tablist"
      aria-label="What's in the lab"
      className="lab-tabs"
      style={{ position: "absolute", left: isMobile ? 12 : 28, bottom: "calc(100% - 1px)", display: "flex", alignItems: "flex-end", gap: isMobile ? 0 : 4 }}
    >
      <style>{".lab-tab [role=button] { transition: filter .25s ease; } .lab-tab [role=button]:hover { filter: brightness(1.06); }"}</style>
      {TABS.map((t) => {
        const on = active === t.key;
        return (
          // no lift on hover - it would open a gap onto the dark page behind; the colour
          // just eases a touch lighter instead
          <div key={t.key} role="tab" aria-selected={on} className="lab-tab" style={{ position: "relative", zIndex: on ? 1 : 0 }}>
            <CaseStudyTab color={on ? SHEET_BG : t.color} label={t.label} compact={isMobile} lift={false} weight={on ? 600 : 400} onClick={on ? undefined : () => onSelect(t.key)} />
          </div>
        );
      })}
    </div>
  );
}

// ── Cards ──────────────────────────────────────────────────────────────────────
// Same card as the homepage AI section - the hand-designed cover on top, title and
// one line below - laid out three across, each cover inset so it has room to breathe.

// The lab's line-up. Ordered so no two covers of the same colour touch: typeface (orange),
// job tracker (olive), piano (orange), breathing (pink). That only holds at one or three
// across, so the grid below is fixed to exactly those.
const LAB_PROJECT_IDS = [11, 2, 9, 0];
const LAB_PROJECTS = LAB_PROJECT_IDS.map((id) => AI_PROJECTS.find((p) => p.id === id)).filter(
  (p): p is AiProject => Boolean(p),
);

const KIND_LABEL: Record<NonNullable<AiProject["kind"]>, string> = {
  webapp: "web app",
  extension: "chrome extension",
  player: "spotify player",
  typeface: "typeface",
};

/** The small "web app" / "chrome extension" tag beside a project's title - here and on the
 *  homepage's AI cards. */
export function KindTag({ kind }: { kind: AiProject["kind"] }) {
  return (
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
      {KIND_LABEL[kind ?? "webapp"]}
    </span>
  );
}

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
            <KindTag kind={project.kind} />
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

/** Back to the portfolio: just a home icon, top right. */
function BackHome({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="Back to home"
      title="Back to home"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        background: withAlpha(colors.sand, hover ? 0.16 : 0.08),
        color: withAlpha(colors.sand, hover ? 1 : 0.8),
        transition: "background 0.2s ease, color 0.2s ease",
        flexShrink: 0,
      }}
    >
      <Home size={18} strokeWidth={1.75} color="currentColor" />
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
  const { selected, open: setSelected, close: closeSelected } = useRoutedSelection({
    items: LAB_PROJECTS.filter(isOpenableAiProject),
    slugOf: (p) => slugify(p.title),
    stateKey: "labProjectSlug",
    urlFor: (slug) => `${LAB_PROJECT_HASH}${slug}`,
    closedUrl: () => "#lab",
    slugFromLocation: () => {
      const { hash } = window.location;
      return hash.startsWith(LAB_PROJECT_HASH) ? hash.slice(LAB_PROJECT_HASH.length) : null;
    },
  });

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
        <p className="font-caslon" style={{ fontStyle: "normal", fontSize: isMobile ? 17 : 20, lineHeight: isMobile ? "22px" : "26px", fontWeight: 600, color: colors.sand }}>
          This is my <span style={{ fontStyle: "italic" }}>personal lab</span>
        </p>
        <p style={{ ...textStyles.byline, ...(isMobile && { fontSize: 12, lineHeight: "16px" }), color: withAlpha(colors.sand, 0.6) }}>where risk is zero and satisfaction is total</p>
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

      <BubbleField />

      <AiProjectDrawer project={selected} onClose={closeSelected} />

      {/* Header - the lab mark + title, and a home icon on the right. The tabs live on
          the sheet below, since they only change what's in it. */}
      <header style={{ position: "relative", zIndex: 2, padding: isMobile ? "20px 16px 0" : "28px 32px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          {title}
          {onBack && <BackHome onClick={onBack} />}
        </div>
      </header>

      {/* The container: sand, edge to edge, rounded at the top, painted over the bubble
          layer. The work fills it, 40px in from every side (16px on a phone). */}
      <main
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: isMobile ? 56 : 68, // room for the tabs on its top edge
          background: SHEET_BG,
          borderRadius: isMobile ? "16px 16px 0 0" : "24px 24px 0 0",
          padding: isMobile ? 16 : 40,
          minHeight: "calc(100vh / var(--page-zoom) - 120px)",
        }}
      >
        <Tabs active={tab} onSelect={setTab} isMobile={isMobile} />
        <div role="tabpanel" aria-label={tab === "project" ? "Project lab" : "Animation lab"}>
          {projectView ? (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0, 1fr)" : "repeat(3, minmax(0, 1fr))", gap: isMobile ? 20 : 32 }}>
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
