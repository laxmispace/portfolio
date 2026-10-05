// The blog list as a page from a notebook: ruled lines, a pink margin, no cards,
// running edge to edge. Text starts at the same 36px inset as the case study cards
// (16px on mobile). Titles rise in word by word as they scroll into view; hovering a
// post (or, on mobile, scrolling it to the middle of the screen) makes its letters
// wave, scribbles an underline in its category colour, pops a doodle and sets the
// chai steaming. On web a little "read →" bubble trails the cursor.
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, type MotionValue } from "motion/react";
import type { BlogPost, BlogCategory } from "@/app/data/blogPosts";
import { MARTEL } from "@/app/lib/devanagari";
import { useScrollContainer } from "@/app/context/ScrollContext";
import { colors, motionTokens, radii, withAlpha } from "@/app/theme/tokens";

export const CATEGORY_ACCENT: Record<BlogCategory, string> = {
  "write about design": colors.orange,
  "personal musings": colors.pink,
  "life in a nutshell": colors.olive,
};
export const CATEGORY_DOODLE: Record<BlogCategory, string> = {
  "write about design": "✏️",
  "personal musings": "☁️",
  "life in a nutshell": "🌱",
};

// Horizontal layout, matched to the case study cards' 36px (desktop) / 16px (mobile) inset.
export const BLOG_INSET = { desktop: 36, mobile: 16 } as const;
const MARGIN_LINE_X = { desktop: 26, mobile: 8 } as const;
const RULE_SPACING = 32;

// ─── Filter tabs ──────────────────────────────────────────────────────────────
// Each tab's pill has 12px of padding, so the row starts 12px left of the text inset.
export function BlogFilterTabs({
  categories, active, onChange,
}: {
  categories: BlogCategory[]; active: BlogCategory | null; onChange: (c: BlogCategory | null) => void;
}) {
  const tabs: (BlogCategory | null)[] = [null, ...categories];
  return (
    <div role="tablist" aria-label="Filter posts" style={{ display: "flex", gap: 4, overflowX: "auto", marginLeft: -12, paddingRight: 12 }}>
      {tabs.map((tab) => {
        const on = tab === active;
        return (
          <motion.button
            key={tab ?? "all"}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(tab)}
            whileTap={{ scale: 0.94 }}
            className="font-inclusive-sans"
            style={{ position: "relative", border: "none", background: "none", cursor: "pointer", padding: "6px 12px", fontSize: 12, whiteSpace: "nowrap", color: on ? colors.ink : withAlpha(colors.ink, 0.5), transition: "color 0.2s" }}
          >
            {on && (
              <motion.span
                layoutId="blog-filter-highlight"
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                style={{ position: "absolute", inset: 0, borderRadius: radii.pill, backgroundColor: tab ? withAlpha(CATEGORY_ACCENT[tab], 0.3) : colors.sandPanel }}
              />
            )}
            <span style={{ position: "relative" }}>{tab ? `${CATEGORY_DOODLE[tab]} ${tab}` : "everything"}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Title: words rise in on scroll, letters wave when active ─────────────────
// Latin words split into letters for the wave; any other script (e.g. Devanagari)
// stays whole so combining marks never get pulled apart.
function WavyTitle({ text, active, isMobile }: { text: string; active: boolean; isMobile: boolean }) {
  let letterIndex = 0;
  const words = text.split(" ");
  return (
    <span style={{ display: "inline" }}>
      <span className="sr-only">{text}</span>
      {words.map((word, w) => {
        const splittable = /^[\x20-\x7E’'—–-]+$/.test(word);
        const units = splittable ? Array.from(word) : [word];
        return (
          <span key={w} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: 2, marginRight: "0.26em" }}>
            <motion.span
              aria-hidden="true"
              initial={{ y: "105%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: w * 0.05, ease: motionTokens.easeOut }}
              style={{ display: "inline-block", ...(splittable ? null : MARTEL) }}
            >
              {units.map((unit) => {
                const i = letterIndex++;
                return (
                  <motion.span
                    key={i}
                    animate={active ? { y: [0, isMobile ? -4 : -6, 0] } : { y: 0 }}
                    transition={{ duration: 0.42, delay: i * 0.018, ease: "easeOut" }}
                    style={{ display: "inline-block", whiteSpace: "pre" }}
                  >
                    {unit}
                  </motion.span>
                );
              })}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

// A loose hand-drawn underline that scribbles itself in.
function Scribble({ color, active }: { color: string; active: boolean }) {
  return (
    <svg viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: -8, width: "100%", height: 12, overflow: "visible", pointerEvents: "none" }}>
      <motion.path
        d="M2 9 C 40 3, 70 12, 110 7 S 180 2, 220 8 S 280 10, 298 5"
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={false}
        animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{ pathLength: { duration: 0.55, ease: motionTokens.easeOut }, opacity: { duration: 0.15 } }}
      />
    </svg>
  );
}

// ☕ with three soft, round-capped wisps of steam that rise while the post is active.
export function SteamingChai({ readTime, active }: { readTime: string; active: boolean }) {
  return (
    <span className="font-inclusive-sans" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: withAlpha(colors.ink, 0.55), whiteSpace: "nowrap" }}>
      <span style={{ position: "relative", display: "inline-block" }}>
        <AnimatePresence>
          {active &&
            [0, 1, 2].map((i) => (
              <motion.svg
                key={i}
                aria-hidden="true"
                width={6}
                height={12}
                viewBox="0 0 6 12"
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: [0, 0.75, 0], y: -12 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, delay: i * 0.4, repeat: Infinity, ease: "easeOut" }}
                style={{ position: "absolute", left: 1 + i * 4, top: -8, overflow: "visible" }}
              >
                <path d="M3 11 C 0.5 8.5, 5.5 6.5, 3 4 S 4.5 1.5, 3 1" fill="none" stroke={withAlpha(colors.ink, 0.4)} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            ))}
        </AnimatePresence>
        <span aria-hidden="true">☕</span>
      </span>
      {readTime}
    </span>
  );
}

// ─── One line in the notebook ─────────────────────────────────────────────────
function NotebookEntry({
  post, index, active, isMobile, onOpen, onHover, entryRef,
}: {
  post: BlogPost; index: number; active: boolean; isMobile: boolean;
  onOpen: () => void; onHover: (hovering: boolean) => void; entryRef: (el: HTMLButtonElement | null) => void;
}) {
  const accent = CATEGORY_ACCENT[post.category];
  const inset = isMobile ? BLOG_INSET.mobile : BLOG_INSET.desktop;
  const date = <span className="font-inclusive-sans" style={{ fontSize: 12, color: withAlpha(colors.ink, 0.5), whiteSpace: "nowrap" }}>{post.date}</span>;

  return (
    <motion.button
      ref={entryRef}
      type="button"
      onClick={onOpen}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      whileTap={{ scale: 0.99 }}
      style={{
        position: "relative", width: "100%", textAlign: "left", cursor: isMobile ? "pointer" : "none",
        border: "none", background: "none",
        padding: `${isMobile ? 18 : 22}px ${inset}px`,
        display: "flex", flexDirection: "column", gap: 10,
      }}
    >
      {/* number in the margin (desktop — the phone margin is too narrow) */}
      {!isMobile && (
        <motion.span
          className="font-caslon"
          animate={{ color: active ? accent : withAlpha(colors.ink, 0.3), scale: active ? 1.15 : 1 }}
          transition={{ duration: 0.3 }}
          style={{ position: "absolute", left: 0, width: MARGIN_LINE_X.desktop - 6, textAlign: "right", top: 26, fontSize: 13, fontStyle: "italic" }}
        >
          {String(index + 1).padStart(2, "0")}
        </motion.span>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span className="font-inclusive-sans" style={{ fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: colors.oliveDeep }}>{post.category}</span>
        <span style={{ color: withAlpha(colors.ink, 0.25) }}>·</span>
        <SteamingChai readTime={post.readTime} active={active} />
      </div>

      {/* title + doodle, with the date pinned to the end of the line on desktop */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
        <p className="font-caslon not-italic" style={{ position: "relative", fontSize: isMobile ? 24 : 32, lineHeight: isMobile ? "29px" : "38px", fontWeight: 600, color: colors.ink, letterSpacing: "-0.01em" }}>
          <WavyTitle text={post.title} active={active} isMobile={isMobile} />
          <Scribble color={accent} active={active} />
        </p>
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={active ? { scale: 1, rotate: 0, y: 0, opacity: 1 } : { scale: 0, rotate: -40, y: 6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 14 }}
          style={{ fontSize: isMobile ? 20 : 26, lineHeight: 1, marginBottom: isMobile ? 4 : 6, display: "inline-block", flexShrink: 0 }}
        >
          {CATEGORY_DOODLE[post.category]}
        </motion.span>
        {!isMobile && <span style={{ marginLeft: "auto", marginBottom: 8, flexShrink: 0 }}>{date}</span>}
      </div>

      <motion.p
        className="font-inclusive-sans"
        animate={{ opacity: active ? 0.85 : 0.55, x: active && !isMobile ? 4 : 0 }}
        transition={{ duration: 0.35, ease: motionTokens.easeOut }}
        style={{ fontSize: isMobile ? 13 : 15, lineHeight: isMobile ? "19px" : "22px", fontWeight: 300, color: colors.ink, maxWidth: 620, marginTop: 6 }}
      >
        {post.subtitle}
      </motion.p>

      {isMobile && date}
    </motion.button>
  );
}

// ─── Cursor bubble (web) ──────────────────────────────────────────────────────
function ReadBubble({ x, y, visible }: { x: MotionValue<number>; y: MotionValue<number>; visible: boolean }) {
  return (
    <motion.div style={{ position: "absolute", left: 0, top: 0, x, y, pointerEvents: "none", zIndex: 5 }}>
      <AnimatePresence>
        {visible && (
          <div style={{ transform: "translate(-50%, -50%)" }}>
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: -4 }}
              exit={{ scale: 0, rotate: 8 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="font-caslon"
              style={{ backgroundColor: colors.ink, color: colors.sand, fontSize: 14, fontStyle: "italic", padding: "8px 14px", borderRadius: radii.pill, whiteSpace: "nowrap", boxShadow: `0 8px 20px ${withAlpha(colors.ink, 0.22)}` }}
            >
              read →
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Notebook ─────────────────────────────────────────────────────────────────
export function BlogJournal({ posts, isMobile, onOpen }: { posts: BlogPost[]; isMobile: boolean; onOpen: (post: BlogPost) => void }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const entryRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [centred, setCentred] = useState<number | null>(null);
  const scrollEl = useScrollContainer();

  // Cursor bubble follows the pointer on a soft spring.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const bx = useSpring(mx, { stiffness: 380, damping: 30, mass: 0.5 });
  const by = useSpring(my, { stiffness: 380, damping: 30, mass: 0.5 });
  const onMove = (e: React.PointerEvent) => {
    const r = pageRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  // Mobile: the entry nearest the middle of the visible scroll area is the active one.
  const pickCentred = useCallback(() => {
    if (!scrollEl) return;
    const c = scrollEl.getBoundingClientRect();
    const mid = c.top + c.height * 0.5;
    let best: number | null = null;
    let bestDist = Infinity;
    entryRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < c.top || r.top > c.bottom) return;
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    setCentred(bestDist < c.height * 0.3 ? best : null);
  }, [scrollEl]);

  useEffect(() => {
    if (!isMobile || !scrollEl) return;
    pickCentred();
    scrollEl.addEventListener("scroll", pickCentred, { passive: true });
    return () => scrollEl.removeEventListener("scroll", pickCentred);
  }, [isMobile, scrollEl, pickCentred, posts.length]);

  if (posts.length === 0) return null;
  const activeIndex = isMobile ? centred : hovered;
  const marginX = isMobile ? MARGIN_LINE_X.mobile : MARGIN_LINE_X.desktop;

  return (
    <div
      ref={pageRef}
      onPointerMove={isMobile ? undefined : onMove}
      style={{
        position: "relative",
        backgroundColor: withAlpha(colors.white, 0.35),
        // ruled lines + the notebook's pink margin
        backgroundImage: [
          `linear-gradient(90deg, transparent ${marginX}px, ${withAlpha(colors.pink, 0.55)} ${marginX}px, ${withAlpha(colors.pink, 0.55)} ${marginX + 1.5}px, transparent ${marginX + 1.5}px)`,
          `repeating-linear-gradient(180deg, transparent 0, transparent ${RULE_SPACING - 1}px, ${withAlpha(colors.oliveDeep, 0.1)} ${RULE_SPACING - 1}px, ${withAlpha(colors.oliveDeep, 0.1)} ${RULE_SPACING}px)`,
        ].join(","),
        padding: "8px 0",
        overflow: "hidden",
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            layout
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.35, ease: motionTokens.easeOut }}
          >
            <NotebookEntry
              post={post}
              index={i}
              active={activeIndex === i}
              isMobile={isMobile}
              onOpen={() => onOpen(post)}
              onHover={(h) => setHovered((cur) => (h ? i : cur === i ? null : cur))}
              entryRef={(el) => { entryRefs.current[i] = el; }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      {!isMobile && <ReadBubble x={bx} y={by} visible={hovered !== null} />}
    </div>
  );
}
