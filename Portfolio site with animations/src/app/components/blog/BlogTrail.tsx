// "The reading trail" — a game-like take on the blog list. Each post is a chunky
// level button on a winding path. The bee from the side nav hovers over the next
// unread level and flies to whichever one you point at; tapping a level sends the
// bee there, bursts honey confetti and opens the post. Read levels get a tick, the
// path turns solid up to them, and a honey jar fills with every minute read.
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import confetti from "canvas-confetti";
import type { BlogPost } from "@/app/data/blogPosts";
import { MARTEL } from "@/app/lib/devanagari";
import { markPostRead, useReadPosts } from "@/app/lib/readPosts";
import { haptic } from "@/app/lib/feedback";
import { colors, motionTokens, radii, withAlpha } from "@/app/theme/tokens";
import { BLOG_INSET, CATEGORY_ACCENT, CATEGORY_DOODLE } from "./BlogJournal";

const minutesOf = (post: BlogPost) => parseInt(post.readTime, 10) || 3;
const titleStyle = (title: string) => (/^[\x20-\x7E’'—–-]+$/.test(title.replace(/\s/g, " ")) ? null : MARTEL);

function HoneyJar({ collected, total, isMobile }: { collected: number; total: number; isMobile: boolean }) {
  const pct = total ? collected / total : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
      <motion.span
        aria-hidden="true"
        animate={pct >= 1 ? { rotate: [0, -12, 12, -6, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8, repeat: pct >= 1 ? Infinity : 0, repeatDelay: 2 }}
        style={{ fontSize: isMobile ? 20 : 24, display: "inline-block" }}
      >
        🍯
      </motion.span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: isMobile ? 120 : 180 }}>
        <span className="font-inclusive-sans" style={{ fontSize: 11, color: colors.oliveDeep }}>
          {collected} / {total} honey collected
        </span>
        <div style={{ height: 10, borderRadius: radii.pill, backgroundColor: withAlpha(colors.oliveDeep, 0.12), overflow: "hidden", position: "relative" }}>
          <motion.div
            initial={false}
            animate={{ width: `${pct * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            style={{ height: "100%", borderRadius: radii.pill, background: `linear-gradient(90deg, ${colors.orangeLight}, ${colors.orange})`, position: "relative", overflow: "hidden" }}
          >
            {/* a glint that keeps sliding across the honey */}
            <motion.span
              animate={{ x: ["-120%", "320%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              style={{ position: "absolute", top: 0, bottom: 0, width: "30%", background: `linear-gradient(90deg, transparent, ${withAlpha(colors.white, 0.6)}, transparent)` }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function LevelButton({
  post, size, read, isNext, onHover, onPick,
}: {
  post: BlogPost; size: number; read: boolean; isNext: boolean; onHover: (on: boolean) => void; onPick: (el: HTMLElement) => void;
}) {
  const accent = CATEGORY_ACCENT[post.category];
  return (
    <motion.button
      type="button"
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      onClick={(e) => onPick(e.currentTarget)}
      aria-label={`Read ${post.title}`}
      animate={isNext ? { y: [0, -6, 0] } : { y: 0 }}
      transition={isNext ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
      whileHover={{ scale: 1.08, rotate: -4 }}
      whileTap={{ scale: 0.92, y: 4 }}
      style={{
        position: "relative", width: size, height: size, borderRadius: "50%", border: "none", cursor: "pointer",
        background: `radial-gradient(circle at 35% 30%, ${withAlpha(colors.white, 0.55)} 0 14%, transparent 15%), ${accent}`,
        boxShadow: `0 6px 0 ${withAlpha(colors.ink, 0.22)}, 0 12px 24px ${withAlpha(colors.ink, 0.12)}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.42,
      }}
    >
      <span aria-hidden="true">{CATEGORY_DOODLE[post.category]}</span>
      {read && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 14 }}
          style={{ position: "absolute", right: -4, top: -4, width: 24, height: 24, borderRadius: "50%", backgroundColor: colors.ink, color: colors.sand, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 2px ${colors.sand}` }}
        >
          ✓
        </motion.span>
      )}
    </motion.button>
  );
}

export function BlogTrail({ posts, isMobile, onOpen }: { posts: BlogPost[]; isMobile: boolean; onOpen: (post: BlogPost) => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const readIds = useReadPosts();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (posts.length === 0) return null;

  const inset = isMobile ? BLOG_INSET.mobile : BLOG_INSET.desktop;
  const node = isMobile ? 64 : 76;
  const row = isMobile ? 132 : 150;
  const top = 40;
  // Levels zigzag between two columns; the label sits to the right of each level.
  const colX = isMobile ? [inset, inset + 56] : [inset + 24, Math.max(inset + 24, width * 0.42)];
  const points = posts.map((_, i) => ({ x: colX[i % 2] + node / 2, y: top + i * row + node / 2 }));
  const height = top + (posts.length - 1) * row + node + 48;

  const pathD = points.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const midY = (prev.y + p.y) / 2;
    return `${d} C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
  }, "");

  const readCount = posts.filter((p) => readIds.includes(p.id)).length;
  const furthestRead = posts.reduce((acc, p, i) => (readIds.includes(p.id) ? i : acc), -1);
  const nextIndex = posts.findIndex((p) => !readIds.includes(p.id));
  const totalHoney = posts.reduce((sum, p) => sum + minutesOf(p), 0);
  const honey = posts.filter((p) => readIds.includes(p.id)).reduce((sum, p) => sum + minutesOf(p), 0);

  // The bee rests on whatever you're pointing at, else the next unread level.
  const beeIndex = picked ?? hovered ?? (nextIndex === -1 ? posts.length - 1 : nextIndex);
  const bee = points[beeIndex];

  const pick = (i: number, el: HTMLElement) => {
    const post = posts[i];
    haptic(10);
    setPicked(i);
    if (!reduceMotion) {
      const r = el.getBoundingClientRect();
      confetti({
        particleCount: 40, spread: 70, startVelocity: 26, gravity: 0.8, ticks: 160, scalar: 0.9, zIndex: 10000,
        origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight },
        colors: [colors.orange, colors.orangeLight, colors.olive, colors.pink],
        shapes: ["circle"],
      });
    }
    setTimeout(() => {
      markPostRead(post.id);
      onOpen(post);
      setPicked(null);
    }, reduceMotion ? 0 : 520);
  };

  return (
    <div
      style={{
        position: "relative",
        background: `linear-gradient(180deg, ${withAlpha(colors.pinkLight, 0.45)} 0%, ${withAlpha(colors.oliveLight, 0.35)} 100%)`,
        padding: `20px 0 8px`,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: `0 ${inset}px` }}>
        <div>
          <p className="font-caslon not-italic" style={{ fontSize: isMobile ? 22 : 28, lineHeight: 1.1, fontWeight: 600, color: colors.ink }}>the reading trail</p>
          <p className="font-inclusive-sans" style={{ fontSize: 12, color: withAlpha(colors.ink, 0.55), marginTop: 4 }}>follow the bee · tap a level to read</p>
        </div>
        <HoneyJar collected={honey} total={totalHoney} isMobile={isMobile} />
      </div>

      <div ref={boxRef} style={{ position: "relative", height, marginTop: 8 }}>
        {width > 0 && (
          <>
            <svg width={width} height={height} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden="true">
              <path d={pathD} fill="none" stroke={withAlpha(colors.oliveDeep, 0.3)} strokeWidth={3} strokeLinecap="round" strokeDasharray="2 10" />
              {furthestRead > 0 && (
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke={colors.orange}
                  strokeWidth={4}
                  strokeLinecap="round"
                  initial={false}
                  animate={{ pathLength: furthestRead / (posts.length - 1) }}
                  transition={{ duration: 0.9, ease: motionTokens.easeOut }}
                />
              )}
            </svg>

            {posts.map((post, i) => {
              const read = readIds.includes(post.id);
              const p = points[i];
              const labelLeft = p.x + node / 2 + 16;
              return (
                <div key={post.id}>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ type: "spring", stiffness: 300, damping: 16, delay: i * 0.12 }}
                    style={{ position: "absolute", left: p.x - node / 2, top: p.y - node / 2 }}
                  >
                    <LevelButton
                      post={post}
                      size={node}
                      read={read}
                      isNext={i === nextIndex && !reduceMotion}
                      onHover={(on) => setHovered((cur) => (on ? i : cur === i ? null : cur))}
                      onPick={(el) => pick(i, el)}
                    />
                  </motion.div>

                  <motion.button
                    type="button"
                    onClick={(e) => pick(i, e.currentTarget)}
                    onPointerEnter={() => setHovered(i)}
                    onPointerLeave={() => setHovered((cur) => (cur === i ? null : cur))}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.12, ease: motionTokens.easeOut }}
                    style={{
                      position: "absolute", left: labelLeft, top: p.y - (isMobile ? 30 : 34), width: Math.max(140, width - labelLeft - inset),
                      textAlign: "left", border: "none", background: "none", padding: 0, cursor: "pointer",
                      display: "flex", flexDirection: "column", gap: 4,
                    }}
                  >
                    <span className="font-jakarta font-medium" style={{ fontSize: 10, letterSpacing: "0.08em", color: CATEGORY_ACCENT[post.category] === colors.olive ? colors.oliveDeep : CATEGORY_ACCENT[post.category] }}>
                      LEVEL {i + 1}{read ? " · DONE" : i === nextIndex ? " · UP NEXT" : ""}
                    </span>
                    <span className="font-caslon not-italic" style={{ fontSize: isMobile ? 18 : 22, lineHeight: isMobile ? "22px" : "26px", fontWeight: 600, color: colors.ink, ...titleStyle(post.title) }}>
                      {post.title}
                    </span>
                    <span className="font-inclusive-sans" style={{ fontSize: 12, color: withAlpha(colors.ink, 0.55) }}>
                      ☕ {post.readTime} · +{minutesOf(post)} 🍯
                    </span>
                  </motion.button>
                </div>
              );
            })}

            {/* the bee */}
            <motion.div
              aria-hidden="true"
              initial={false}
              animate={{ x: bee.x - node / 2 - 14, y: bee.y - node / 2 - 22 }}
              transition={{ type: "spring", stiffness: picked != null ? 260 : 140, damping: picked != null ? 18 : 14 }}
              style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", zIndex: 3 }}
            >
              <motion.span
                animate={reduceMotion ? undefined : { y: [0, -5, 0], rotate: [-8, 6, -8] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                style={{ display: "inline-block", fontSize: isMobile ? 24 : 28 }}
              >
                🐝
              </motion.span>
            </motion.div>
          </>
        )}
      </div>

      <p className="font-inclusive-sans" style={{ fontSize: 11, color: withAlpha(colors.ink, 0.45), padding: `0 ${inset}px 12px` }}>
        {readCount === posts.length ? "trail complete — you've read everything 🌼" : `${readCount} of ${posts.length} levels done`}
      </p>
    </div>
  );
}
