// The blog list — a quiet "reading nook". The newest post gets a warm featured card
// (soft light follows the cursor, a hint of tilt); the rest are clean serif rows that
// glow under the cursor and reveal their subtitle. Reading time is counted in cups of chai.
import { useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionTemplate, useTransform } from "motion/react";
import type { BlogPost, BlogCategory } from "@/app/data/blogPosts";
import { withMartel } from "@/app/lib/devanagari";
import { colors, motionTokens, radii, withAlpha } from "@/app/theme/tokens";

const CATEGORY_ACCENT: Record<BlogCategory, string> = {
  "write about design": colors.orange,
  "personal musings": colors.pink,
  "life in a nutshell": colors.olive,
};

// One cup per three minutes of reading, between one and four.
function ChaiTime({ readTime, color = colors.oliveDeep }: { readTime: string; color?: string }) {
  const minutes = parseInt(readTime, 10) || 3;
  const cups = Math.min(4, Math.max(1, Math.round(minutes / 3)));
  return (
    <span className="font-inclusive-sans" title={readTime} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color, whiteSpace: "nowrap" }}>
      <span aria-hidden="true" style={{ fontSize: 11, letterSpacing: 1 }}>{"☕".repeat(cups)}</span>
      {minutes} min
    </span>
  );
}

function CategoryDot({ category, size = 8 }: { category: BlogCategory; size?: number }) {
  return <span aria-hidden="true" style={{ width: size, height: size, borderRadius: "50%", backgroundColor: CATEGORY_ACCENT[category], flexShrink: 0, display: "inline-block" }} />;
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────
export function BlogFilterTabs({
  categories, active, onChange, count,
}: {
  categories: BlogCategory[]; active: BlogCategory | null; onChange: (c: BlogCategory | null) => void; count: number;
}) {
  const tabs: (BlogCategory | null)[] = [null, ...categories];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderBottom: `1px solid ${withAlpha(colors.ink, 0.1)}`, paddingBottom: 10 }}>
      <div role="tablist" aria-label="Filter posts" style={{ display: "flex", gap: 4, overflowX: "auto", margin: "0 -4px", padding: "0 4px" }}>
        {tabs.map((tab) => {
          const on = tab === active;
          return (
            <button
              key={tab ?? "all"}
              role="tab"
              aria-selected={on}
              onClick={() => onChange(tab)}
              className="font-inclusive-sans"
              style={{ position: "relative", border: "none", background: "none", cursor: "pointer", padding: "6px 12px", fontSize: 12, whiteSpace: "nowrap", color: on ? colors.ink : withAlpha(colors.ink, 0.5), transition: "color 0.2s" }}
            >
              {on && (
                <motion.span
                  layoutId="blog-filter-highlight"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  style={{ position: "absolute", inset: 0, borderRadius: radii.pill, backgroundColor: tab ? withAlpha(CATEGORY_ACCENT[tab], 0.25) : colors.sandPanel }}
                />
              )}
              <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6 }}>
                {tab && <CategoryDot category={tab} size={6} />}
                {tab ?? "everything"}
              </span>
            </button>
          );
        })}
      </div>
      <span className="font-inclusive-sans" style={{ fontSize: 11, color: withAlpha(colors.ink, 0.4), whiteSpace: "nowrap" }}>
        {count} {count === 1 ? "essay" : "essays"}
      </span>
    </div>
  );
}

// ─── Featured card ────────────────────────────────────────────────────────────
function FeaturedPost({ post, isNew, isMobile, onOpen }: { post: BlogPost; isNew: boolean; isMobile: boolean; onOpen: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const accent = CATEGORY_ACCENT[post.category];
  // Pointer position within the card, 0–1 on each axis (centre at rest).
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 180, damping: 22 });
  const sy = useSpring(py, { stiffness: 180, damping: 22 });
  const rotateY = useTransform(sx, [0, 1], [-2, 2]);
  const rotateX = useTransform(sy, [0, 1], [2, -2]);
  const lightX = useTransform(sx, (v) => `${v * 100}%`);
  const lightY = useTransform(sy, (v) => `${v * 100}%`);
  const light = useMotionTemplate`radial-gradient(420px circle at ${lightX} ${lightY}, ${withAlpha(colors.white, 0.45)}, transparent 60%)`;

  const track = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || isMobile) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => { px.set(0.5); py.set(0.5); };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onOpen}
      onPointerMove={track}
      onPointerLeave={reset}
      whileTap={{ scale: 0.985 }}
      style={{
        position: "relative", overflow: "hidden", width: "100%", textAlign: "left", cursor: "pointer",
        border: `1px solid ${withAlpha(accent, 0.35)}`, borderRadius: radii.drawer,
        padding: isMobile ? "24px 20px 20px" : "36px 40px 32px",
        background: `linear-gradient(135deg, ${withAlpha(accent, 0.28)} 0%, ${withAlpha(accent, 0.1)} 45%, ${colors.sandLight} 100%)`,
        rotateX: isMobile ? 0 : rotateX, rotateY: isMobile ? 0 : rotateY, transformPerspective: 900,
        display: "flex", flexDirection: "column", gap: isMobile ? 14 : 18,
      }}
    >
      {!isMobile && <motion.span aria-hidden="true" style={{ position: "absolute", inset: 0, background: light, pointerEvents: "none" }} />}

      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {isNew && (
          <span className="font-inclusive-sans font-semibold" style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: colors.ink, backgroundColor: colors.pink, borderRadius: radii.pill, padding: "3px 9px" }}>
            new
          </span>
        )}
        <span className="font-inclusive-sans" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: colors.oliveDeep }}>
          <CategoryDot category={post.category} /> {post.category}
        </span>
        <span style={{ color: withAlpha(colors.ink, 0.25) }}>·</span>
        <span className="font-inclusive-sans" style={{ fontSize: 12, color: withAlpha(colors.ink, 0.55) }}>{post.date}</span>
      </div>

      <p className="font-caslon not-italic" style={{ position: "relative", fontSize: isMobile ? 30 : 44, lineHeight: isMobile ? "34px" : "48px", fontWeight: 600, color: colors.ink, letterSpacing: "-0.01em", maxWidth: 720 }}>
        {withMartel(post.title)}
      </p>
      <p className="font-inclusive-sans" style={{ position: "relative", fontSize: isMobile ? 14 : 16, lineHeight: isMobile ? "21px" : "24px", color: colors.body, maxWidth: 560 }}>
        {post.subtitle}
      </p>

      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 4 }}>
        <ChaiTime readTime={post.readTime} />
        <span className="font-caslon" style={{ fontSize: 16, fontStyle: "italic", color: colors.ink }}>
          pour a cup, read →
        </span>
      </div>
    </motion.button>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function PostRow({ post, isMobile, onOpen, index }: { post: BlogPost; isMobile: boolean; onOpen: () => void; index: number }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const accent = CATEGORY_ACCENT[post.category];
  const glow = useMotionTemplate`radial-gradient(260px circle at ${gx}px ${gy}px, ${withAlpha(accent, 0.22)}, transparent 70%)`;

  const track = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    gx.set(e.clientX - r.left);
    gy.set(e.clientY - r.top);
  };
  const showDetails = hovered || isMobile;

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onOpen}
      onPointerMove={track}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={track}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: motionTokens.easeOut }}
      style={{
        position: "relative", overflow: "hidden", width: "100%", textAlign: "left", cursor: "pointer",
        border: "none", background: "none", borderRadius: radii.xxl,
        padding: isMobile ? "18px 12px" : "22px 20px",
        display: "flex", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 12 : 20,
      }}
    >
      <motion.span aria-hidden="true" animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.25 }} style={{ position: "absolute", inset: 0, background: glow, pointerEvents: "none" }} />

      <span style={{ position: "relative", marginTop: isMobile ? 8 : 0 }}><CategoryDot category={post.category} size={10} /></span>

      <div style={{ position: "relative", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <motion.p
          animate={{ x: hovered && !isMobile ? 6 : 0 }}
          transition={{ duration: 0.3, ease: motionTokens.easeOut }}
          className="font-caslon not-italic"
          style={{ fontSize: isMobile ? 20 : 24, lineHeight: isMobile ? "25px" : "30px", fontWeight: 600, color: colors.ink }}
        >
          {withMartel(post.title)}
        </motion.p>
        <AnimatePresence initial={false}>
          {showDetails && (
            <motion.p
              initial={{ opacity: 0, height: 0, x: 0 }}
              animate={{ opacity: 1, height: "auto", x: isMobile ? 0 : 6 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: motionTokens.easeOut }}
              className="font-inclusive-sans"
              style={{ fontSize: 13, lineHeight: "19px", color: withAlpha(colors.ink, 0.6), overflow: "hidden" }}
            >
              {post.subtitle}
            </motion.p>
          )}
        </AnimatePresence>
        {isMobile && (
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <span className="font-inclusive-sans" style={{ fontSize: 12, color: withAlpha(colors.ink, 0.5) }}>{post.date}</span>
            <ChaiTime readTime={post.readTime} />
          </div>
        )}
      </div>

      {!isMobile && (
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
          <span className="font-inclusive-sans" style={{ fontSize: 12, color: withAlpha(colors.ink, 0.5) }}>{post.date}</span>
          <ChaiTime readTime={post.readTime} />
          <motion.span
            animate={{ x: hovered ? 4 : 0, opacity: hovered ? 1 : 0.35 }}
            transition={{ duration: 0.25, ease: motionTokens.easeOut }}
            className="font-caslon"
            style={{ fontSize: 20, color: colors.ink }}
          >
            →
          </motion.span>
        </div>
      )}
    </motion.button>
  );
}

// ─── List ─────────────────────────────────────────────────────────────────────
export function BlogJournal({
  posts, isMobile, onOpen, newestId,
}: {
  posts: BlogPost[]; isMobile: boolean; onOpen: (post: BlogPost) => void; newestId?: number;
}) {
  if (posts.length === 0) return null;
  const [featured, ...rest] = posts;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 16 : 20 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={featured.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: motionTokens.easeOut }}
        >
          <FeaturedPost post={featured} isNew={featured.id === newestId} isMobile={isMobile} onOpen={() => onOpen(featured)} />
        </motion.div>
      </AnimatePresence>
      {rest.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {rest.map((post, i) => (
            <div key={post.id} style={{ borderTop: i ? `1px solid ${withAlpha(colors.ink, 0.08)}` : "none" }}>
              <PostRow post={post} index={i} isMobile={isMobile} onOpen={() => onOpen(post)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
