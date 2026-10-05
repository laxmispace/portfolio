// "Lights off" — the blog as a dark room. Titles are painted huge on the wall but
// barely visible; the cursor is a warm torch that lights up whatever it points at,
// with dust drifting in the beam. Hovering a title widens the beam; clicking flicks
// the lights on like an old bulb, then opens the post. Left alone, the torch wanders
// the wall by itself. On phones the beam follows the title in the middle of the screen.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { BlogPost } from "@/app/data/blogPosts";
import { MARTEL } from "@/app/lib/devanagari";
import { haptic } from "@/app/lib/feedback";
import { useScrollContainer } from "@/app/context/ScrollContext";
import { colors, withAlpha } from "@/app/theme/tokens";
import { BLOG_INSET, CATEGORY_ACCENT, CATEGORY_DOODLE } from "./BlogJournal";

const isLatin = (text: string) => /^[\x20-\x7E’'—–-]+$/.test(text);
const BEAM = { idle: 170, focus: 250 } as const;

// Dust motes floating in the beam (only visible where the light falls).
function Dust({ count = 26 }: { count?: number }) {
  const motes = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1 + Math.random() * 2.2,
        drift: 10 + Math.random() * 24,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * -12,
      })),
    [count],
  );
  return (
    <>
      {motes.map((m, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          animate={{ y: [0, -m.drift, 0], x: [0, m.drift / 3, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: m.duration, delay: m.delay, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", left: `${m.left}%`, top: `${m.top}%`, width: m.size, height: m.size, borderRadius: "50%", backgroundColor: colors.sand }}
        />
      ))}
    </>
  );
}

// The wall: rendered twice with identical layout — once dim (it takes the clicks)
// and once lit, masked to the beam — so the light lines up exactly with the text.
function Wall({
  posts, lit, focused, isMobile, onPick, onFocusTitle, titleRefs,
}: {
  posts: BlogPost[]; lit: boolean; focused: number | null; isMobile: boolean;
  onPick?: (i: number) => void; onFocusTitle?: (i: number | null) => void;
  titleRefs?: React.MutableRefObject<Array<HTMLButtonElement | null>>;
}) {
  const inset = isMobile ? BLOG_INSET.mobile : BLOG_INSET.desktop;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 36 : 52, padding: `${isMobile ? 56 : 80}px ${inset}px ${isMobile ? 64 : 96}px` }}>
      {posts.map((post, i) => {
        const accent = CATEGORY_ACCENT[post.category];
        const on = lit && focused === i;
        return (
          <button
            key={post.id}
            ref={titleRefs ? (el) => { titleRefs.current[i] = el; } : undefined}
            type="button"
            tabIndex={lit ? -1 : 0}
            aria-hidden={lit || undefined}
            onClick={onPick ? () => onPick(i) : undefined}
            onPointerEnter={onFocusTitle ? () => onFocusTitle(i) : undefined}
            onPointerLeave={onFocusTitle ? () => onFocusTitle(null) : undefined}
            onFocus={onFocusTitle ? () => onFocusTitle(i) : undefined}
            onBlur={onFocusTitle ? () => onFocusTitle(null) : undefined}
            style={{
              display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12, alignItems: "flex-start",
              textAlign: "left", background: "none", border: "none", padding: 0, cursor: isMobile ? "pointer" : "none",
              color: lit ? colors.sand : withAlpha(colors.sand, 0.07),
            }}
          >
            <span className="font-inclusive-sans" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: lit ? accent : "inherit" }}>
              <span aria-hidden="true">{CATEGORY_DOODLE[post.category]}</span>
              {post.category} · {post.date} · {post.readTime}
            </span>
            <span
              className="font-caslon not-italic"
              style={{
                fontSize: isMobile ? 40 : 76, lineHeight: isMobile ? "44px" : "80px", fontWeight: 600, letterSpacing: "-0.02em",
                textShadow: on ? `0 0 28px ${withAlpha(colors.orange, 0.55)}, 0 0 2px ${withAlpha(colors.sand, 0.8)}` : "none",
                transition: "text-shadow 0.3s ease",
                ...(isLatin(post.title) ? null : MARTEL),
              }}
            >
              {post.title}
            </span>
            <span className="font-inclusive-sans" style={{ fontSize: isMobile ? 14 : 17, lineHeight: 1.45, fontWeight: 300, maxWidth: 640, color: lit ? withAlpha(colors.sand, 0.75) : "inherit" }}>
              {post.subtitle}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function BlogDarkRoom({ posts, isMobile, onOpen }: { posts: BlogPost[]; isMobile: boolean; onOpen: (post: BlogPost) => void }) {
  const roomRef = useRef<HTMLDivElement>(null);
  const titleRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reduceMotion = useReducedMotion();
  const scrollEl = useScrollContainer();
  const [focused, setFocused] = useState<number | null>(null);
  const [switching, setSwitching] = useState(false);

  // Torch position and beam size, all on springs so the light glides.
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const x = useSpring(tx, { stiffness: 140, damping: 22, mass: 0.6 });
  const y = useSpring(ty, { stiffness: 140, damping: 22, mass: 0.6 });
  const radiusTarget = useMotionValue<number>(BEAM.idle);
  const radius = useSpring(radiusTarget, { stiffness: 160, damping: 20 });
  const pointerInside = useRef(false);

  const mask = useMotionTemplate`radial-gradient(circle ${radius}px at ${x}px ${y}px, #000 0%, #000 42%, transparent 100%)`;
  const bloomRadius = useTransform(radius, (r) => r * 1.7); // the glow reaches past the beam
  const bloom = useMotionTemplate`radial-gradient(circle ${bloomRadius}px at ${x}px ${y}px, ${withAlpha(colors.orange, 0.24)}, ${withAlpha(colors.orange, 0.06)} 45%, transparent 75%)`;

  useEffect(() => {
    radiusTarget.set(focused !== null ? BEAM.focus : BEAM.idle);
  }, [focused, radiusTarget]);

  // Aim the torch at the centre of a title (keyboard focus, mobile scroll).
  const aimAt = useCallback((i: number) => {
    const room = roomRef.current;
    const el = titleRefs.current[i];
    if (!room || !el) return;
    const r = room.getBoundingClientRect();
    const t = el.getBoundingClientRect();
    tx.set(t.left - r.left + Math.min(t.width, r.width * 0.6) / 2);
    ty.set(t.top - r.top + t.height / 2);
  }, [tx, ty]);

  // Desktop idle: the torch wanders the wall on a slow figure-of-eight.
  useEffect(() => {
    if (isMobile || reduceMotion) return;
    let raf = 0;
    const tick = (now: number) => {
      const room = roomRef.current;
      if (room && !pointerInside.current) {
        const t = now / 1000;
        tx.set(room.clientWidth * (0.5 + 0.34 * Math.sin(t * 0.42)));
        ty.set(room.clientHeight * (0.5 + 0.32 * Math.sin(t * 0.31 + 1.2)));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isMobile, reduceMotion, tx, ty]);

  // Mobile: the beam settles on whichever title is nearest the middle of the screen.
  useEffect(() => {
    if (!isMobile || !scrollEl) return;
    const pick = () => {
      const c = scrollEl.getBoundingClientRect();
      const mid = c.top + c.height / 2;
      let best: number | null = null;
      let bestDist = Infinity;
      titleRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      if (best !== null && bestDist < c.height * 0.45) {
        aimAt(best);
        setFocused(best);
      }
    };
    pick();
    scrollEl.addEventListener("scroll", pick, { passive: true });
    return () => scrollEl.removeEventListener("scroll", pick);
  }, [isMobile, scrollEl, aimAt, posts.length]);

  const onPointerMove = (e: React.PointerEvent) => {
    if (isMobile) return;
    const r = roomRef.current?.getBoundingClientRect();
    if (!r) return;
    pointerInside.current = true;
    tx.set(e.clientX - r.left);
    ty.set(e.clientY - r.top);
  };

  const pick = (i: number) => {
    if (switching) return;
    haptic(14);
    aimAt(i);
    if (reduceMotion) { onOpen(posts[i]); return; }
    setSwitching(true);
    setTimeout(() => { onOpen(posts[i]); setSwitching(false); }, 620);
  };

  if (posts.length === 0) return null;

  return (
    <div
      ref={roomRef}
      onPointerMove={onPointerMove}
      onPointerLeave={() => { pointerInside.current = false; setFocused(null); }}
      style={{ position: "relative", backgroundColor: colors.ink, overflow: "hidden", cursor: isMobile ? "auto" : "none" }}
    >
      {/* the hint */}
      <p className="font-inclusive-sans" style={{ position: "absolute", top: isMobile ? 18 : 24, left: isMobile ? BLOG_INSET.mobile : BLOG_INSET.desktop, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: withAlpha(colors.sand, 0.35), zIndex: 2 }}>
        lights off · {isMobile ? "scroll to find a title, tap to switch on" : "move your torch, click to switch on"}
      </p>

      {/* dim wall — takes the clicks and sets the height */}
      <Wall posts={posts} lit={false} focused={focused} isMobile={isMobile} onPick={pick} onFocusTitle={(i) => { setFocused(i); if (i !== null && !pointerInside.current) aimAt(i); }} titleRefs={titleRefs} />

      {/* warm bloom on the wall where the torch points */}
      {!reduceMotion && <motion.div aria-hidden="true" style={{ position: "absolute", inset: 0, background: bloom, pointerEvents: "none" }} />}

      {/* lit wall + dust, revealed only inside the beam */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          ...(reduceMotion ? null : { maskImage: mask, WebkitMaskImage: mask }),
        }}
      >
        <Wall posts={posts} lit focused={focused} isMobile={isMobile} />
        {!reduceMotion && <Dust />}
      </motion.div>

      {/* the light switch: an old bulb flickering on */}
      {switching && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.85, 0.1, 0.9, 0.35, 1] }}
          transition={{ duration: 0.6, times: [0, 0.15, 0.3, 0.5, 0.65, 1] }}
          style={{ position: "absolute", inset: 0, backgroundColor: colors.sand, pointerEvents: "none", zIndex: 4 }}
        />
      )}
    </div>
  );
}

