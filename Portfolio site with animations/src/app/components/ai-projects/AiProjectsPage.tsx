import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { AI_PROJECTS, isOpenableAiProject, type AiProject } from "@/app/data/aiProjects";
import { AiProjectDrawer } from "./AiProjectDrawer";
import { AiProjectFrame } from "./AiProjectFrame";
import { colors, textStyles, withAlpha } from "@/app/theme/tokens";
import { ICON_BUTTON } from "@/app/components/ui/Buttons";
import { toCss } from "@/app/lib/zoom";

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
            className="font-inclusive-sans"
            style={{
              position: "relative",
              zIndex: 1,
              fontSize: 16,
              fontWeight: 400,
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
      whileHover={clickable ? { y: -4 } : undefined}
      onClick={onClick}
      style={{
        background: withAlpha(colors.ink, 0.22),
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        cursor: clickable ? "pointer" : "default",
      }}
    >
      <div
        style={{
          aspectRatio: "353 / 240",
          borderRadius: 10,
          position: "relative",
          overflow: "hidden",
          backgroundColor: withAlpha(colors.sand, 0.07),
        }}
      >
        {project.frameKey && <AiProjectFrame frameKey={project.frameKey} />}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 4px 4px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
          <p className="font-caslon not-italic" style={{ color: colors.sand, fontSize: 20, lineHeight: "26px", fontWeight: 600 }}>
            {project.title}
          </p>
          <p className="font-caslon" style={{ color: withAlpha(colors.sand, 0.6), fontSize: 14, lineHeight: "20px", fontStyle: "italic", flexShrink: 0 }}>
            {KIND_LABEL[project.kind ?? "webapp"]}
            {clickable && <span style={{ fontStyle: "normal", marginLeft: 8 }}>→</span>}
          </p>
        </div>
        <p className="font-inclusive-sans" style={{ color: withAlpha(colors.sand, 0.6), fontSize: 14, lineHeight: "21px", maxWidth: 520 }}>
          {project.description}
        </p>
      </div>
    </motion.div>
  );
}

// Nothing in the animation lab yet - it fills up as new pieces get made.
function AnimationLabEmpty() {
  return (
    <div
      style={{
        minHeight: 360,
        borderRadius: 16,
        border: `1px dashed ${withAlpha(colors.sand, 0.22)}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        textAlign: "center",
        padding: 32,
      }}
    >
      <p className="font-caslon" style={{ fontSize: 22, lineHeight: "28px", color: colors.sand, fontStyle: "italic" }}>
        still brewing
      </p>
      <p style={{ ...textStyles.byline, color: withAlpha(colors.sand, 0.55) }}>
        new animations will show up here soon
      </p>
    </div>
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
        gap: 10,
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        color: colors.sand,
        fontSize: 14,
        fontWeight: 400,
        lineHeight: "20px",
      }}
    >
      <span
        style={{
          width: ICON_BUTTON.desktop,
          height: ICON_BUTTON.desktop,
          borderRadius: "50%",
          backgroundColor: withAlpha(colors.sand, hover ? 0.16 : 0.08),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.2s ease",
        }}
      >
        <motion.span animate={{ x: hover ? -2 : 0 }} transition={{ duration: 0.2 }} style={{ display: "flex" }}>
          <ArrowLeft size={16} color={colors.sand} />
        </motion.span>
      </span>
      back to home
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

  return (
    <div style={{ position: "relative", minHeight: "calc(100vh / var(--page-zoom))", background: colors.ink, overflowX: "hidden" }}>

      <GooDefs />
      <BubbleField />

      <AiProjectDrawer project={selected} onClose={() => setSelected(null)} />

      {/* Header - orange lab mark + title, filter tabs on the right */}
      <header
        style={{
          position: "relative",
          zIndex: 2,
          padding: "28px 36px 0",
        }}
      >
        {onBack && (
          <div style={{ marginBottom: 28 }}>
            <BackHome onClick={onBack} />
          </div>
        )}
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
              <p style={{ ...textStyles.byline, color: withAlpha(colors.sand, 0.6) }}>
                where risk is zero and satisfaction is total
              </p>
            </div>
          </div>

          <Tabs active={tab} onSelect={setTab} />
        </div>
      </header>

      {/* The raised olive container - full-bleed, painted on top of the bubble layer. */}
      <main
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 40,
          background: colors.oliveDeep,
          borderRadius: "24px 24px 0 0",
          overflow: "hidden",
          padding: 36,
          minHeight: "calc(100vh / var(--page-zoom) - 210px)",
        }}
      >
        {projectView ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 24, maxWidth: 1440, margin: "0 auto" }}>
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
          <AnimationLabEmpty />
        )}
      </main>
    </div>
  );
}
