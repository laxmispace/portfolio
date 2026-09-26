// Two candidate layouts for the blog section, shown side by side on the homepage so the
// design direction can be compared:
//   A. BlogEditorialList — big serif titles; a tilted preview card follows the cursor (web),
//      the title crossing the middle of the screen expands into its preview (mobile).
//   B. BlogStickyBoard   — posts as sticky notes; drag them around the board and they spring
//      back (web), or swipe a snap carousel where notes straighten at the centre (mobile).
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { useScrollContainer } from "../ScrollContext";
import type { BlogPost, BlogCategory } from "./BlogDetail";

const INK = "#212012";

// Category → note / preview colour (the portfolio's three accents).
export const CATEGORY_COLOR: Record<BlogCategory, string> = {
  "write about design": "#C67D39",
  "personal musings": "#DDA1AE",
  "life in a nutshell": "#C3BE6F",
};

const MARTEL = { fontFamily: "'Martel', serif", fontWeight: 600 };
export function withMartel(text: string) {
  const parts = text.split("सुकून");
  if (parts.length === 1) return text;
  return parts.flatMap((part, i) =>
    i < parts.length - 1 ? [part, <span key={i} style={MARTEL}>सुकून</span>] : [part],
  );
}

interface LayoutProps {
  posts: BlogPost[];
  isMobile: boolean;
  onOpen: (post: BlogPost) => void;
  /** id of the newest post, which gets a "new" tag */
  newestId?: number;
}

function Meta({ post, isNew, color = INK }: { post: BlogPost; isNew?: boolean; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {isNew && (
        <span className="font-inclusive-sans font-semibold" style={{ fontSize: 9, letterSpacing: "0.5px", textTransform: "uppercase", color: INK, backgroundColor: "rgba(255,255,255,0.55)", borderRadius: 20, padding: "2px 7px" }}>
          new
        </span>
      )}
      <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, letterSpacing: "0.4px", textTransform: "uppercase", color, opacity: 0.8 }}>
        {post.category}
      </span>
      <span style={{ fontSize: 10, color, opacity: 0.4 }}>·</span>
      <span className="font-inclusive-sans" style={{ fontSize: 11, color, opacity: 0.6 }}>{post.readTime}</span>
    </div>
  );
}

function PreviewCard({ post, isNew, width }: { post: BlogPost; isNew?: boolean; width: number | string }) {
  return (
    <div style={{
      width, padding: 18, borderRadius: 14, boxSizing: "border-box",
      backgroundColor: CATEGORY_COLOR[post.category], color: INK,
      display: "flex", flexDirection: "column", gap: 10,
      boxShadow: "0 18px 40px rgba(33,32,18,0.18)",
    }}>
      <Meta post={post} isNew={isNew} />
      <p className="font-inclusive-sans" style={{ fontSize: 13, lineHeight: "19px", color: INK }}>{post.subtitle}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="font-inclusive-sans" style={{ fontSize: 11, color: INK, opacity: 0.6 }}>{post.date}</span>
        <span className="font-caslon" style={{ fontSize: 14, fontStyle: "italic", color: INK }}>read →</span>
      </div>
    </div>
  );
}

// ─── A. Editorial hover list ──────────────────────────────────────────────────
export function BlogEditorialList(props: LayoutProps) {
  return props.isMobile ? <EditorialMobile {...props} /> : <EditorialWeb {...props} />;
}

function EditorialWeb({ posts, onOpen, newestId }: LayoutProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  // Card trails the cursor on a spring so it feels attached but a little lazy.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 260, damping: 26, mass: 0.6 });
  const y = useSpring(my, { stiffness: 260, damping: 26, mass: 0.6 });
  const CARD_W = 280;

  const onMove = (e: React.MouseEvent) => {
    const r = listRef.current?.getBoundingClientRect();
    if (!r) return;
    // Sit the card to the right of the cursor; flip left near the right edge so it never clips.
    const px = e.clientX - r.left;
    const flip = px + CARD_W + 40 > r.width;
    mx.set(flip ? px - CARD_W - 28 : px + 28);
    my.set(e.clientY - r.top - 60);
  };

  const activePost = active != null ? posts[active] : null;

  return (
    <div ref={listRef} onMouseMove={onMove} onMouseLeave={() => setActive(null)} style={{ position: "relative" }}>
      {posts.map((post, i) => (
        <div
          key={post.id}
          onMouseEnter={() => setActive(i)}
          onClick={() => onOpen(post)}
          style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 24,
            padding: "22px 0", borderBottom: "1px solid rgba(33,32,18,0.1)", cursor: "pointer",
            opacity: active == null || active === i ? 1 : 0.28, transition: "opacity 0.25s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, minWidth: 0 }}>
            <span className="font-inclusive-sans" style={{ fontSize: 12, color: "rgba(33,32,18,0.4)", flexShrink: 0, width: 22 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="font-caslon not-italic" style={{ fontSize: 40, lineHeight: "46px", fontWeight: 600, color: INK, letterSpacing: "-0.01em" }}>
              {withMartel(post.title)}
            </p>
          </div>
          <span className="font-inclusive-sans" style={{ fontSize: 12, color: "#625e37", opacity: 0.6, flexShrink: 0, whiteSpace: "nowrap" }}>
            {post.date}
          </span>
        </div>
      ))}

      <motion.div style={{ position: "absolute", left: 0, top: 0, x, y, pointerEvents: "none", zIndex: 5 }}>
        <AnimatePresence mode="wait">
          {activePost && (
            <motion.div
              key={activePost.id}
              initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -4 }}
              exit={{ opacity: 0, scale: 0.9, rotate: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <PreviewCard post={activePost} isNew={activePost.id === newestId} width={CARD_W} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function EditorialMobile({ posts, onOpen, newestId }: LayoutProps) {
  const scrollEl = useScrollContainer();
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [active, setActive] = useState(0);

  // The row whose title is nearest the middle of the visible scroll area is "active".
  const pick = useCallback(() => {
    if (!scrollEl) return;
    const c = scrollEl.getBoundingClientRect();
    const mid = c.top + c.height / 2;
    let best = 0;
    let bestDist = Infinity;
    rowRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.top + 24 - mid);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    setActive(best);
  }, [scrollEl]);

  useEffect(() => {
    if (!scrollEl) return;
    pick();
    scrollEl.addEventListener("scroll", pick, { passive: true });
    return () => scrollEl.removeEventListener("scroll", pick);
  }, [scrollEl, pick, posts.length]);

  return (
    <div>
      {posts.map((post, i) => {
        const on = i === active;
        return (
          <div
            key={post.id}
            ref={(el) => { rowRefs.current[i] = el; }}
            onClick={() => onOpen(post)}
            style={{ padding: "18px 0", borderBottom: "1px solid rgba(33,32,18,0.1)", cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, opacity: on ? 1 : 0.35, transition: "opacity 0.3s ease" }}>
              <span className="font-inclusive-sans" style={{ fontSize: 11, color: "rgba(33,32,18,0.45)", flexShrink: 0 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-caslon not-italic" style={{ fontSize: 26, lineHeight: "32px", fontWeight: 600, color: INK }}>
                {withMartel(post.title)}
              </p>
            </div>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <motion.div initial={{ rotate: -3, y: 8 }} animate={{ rotate: -1.5, y: 0 }} style={{ padding: "14px 4px 4px" }}>
                    <PreviewCard post={post} isNew={post.id === newestId} width="100%" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── B. Sticky-note board ─────────────────────────────────────────────────────
const NOTE_TILT = [-5, 4, -2, 6, -4, 3];
const NOTE_OFFSET_Y = [16, 56, 0, 40, 24, 8];

function Note({ post, isNew, tilt, width, height }: { post: BlogPost; isNew?: boolean; tilt: number; width: number | string; height: number }) {
  return (
    <div style={{
      position: "relative", width, height, boxSizing: "border-box", padding: "30px 18px 18px",
      backgroundColor: CATEGORY_COLOR[post.category], borderRadius: 4,
      boxShadow: "0 1px 2px rgba(33,32,18,0.12), 0 14px 28px rgba(33,32,18,0.14)",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      {/* strip of tape holding the note up */}
      <div style={{ position: "absolute", top: -10, left: "50%", width: 72, height: 22, transform: `translateX(-50%) rotate(${-tilt * 0.6}deg)`, backgroundColor: "rgba(255,255,255,0.45)", boxShadow: "0 1px 2px rgba(33,32,18,0.08)" }} />
      <Meta post={post} isNew={isNew} />
      <p className="font-caslon not-italic" style={{ fontSize: 22, lineHeight: "27px", fontWeight: 600, color: INK }}>
        {withMartel(post.title)}
      </p>
      <p className="font-inclusive-sans" style={{ fontSize: 12, lineHeight: "17px", color: INK, opacity: 0.75, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
        {post.subtitle}
      </p>
      <span className="font-caslon" style={{ marginTop: "auto", fontSize: 14, fontStyle: "italic", color: INK }}>read →</span>
    </div>
  );
}

export function BlogStickyBoard(props: LayoutProps) {
  return props.isMobile ? <StickyMobile {...props} /> : <StickyWeb {...props} />;
}

function StickyWeb({ posts, onOpen, newestId }: LayoutProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const [top, setTop] = useState<number | null>(null);
  const PER_ROW = 3;
  const NOTE_H = 250;
  const rows = Math.max(1, Math.ceil(posts.length / PER_ROW));

  return (
    <div>
      <div
        ref={boardRef}
        style={{
          position: "relative", height: rows * (NOTE_H + 60) + 40, borderRadius: 16,
          border: "1px solid rgba(33,32,18,0.08)",
          backgroundColor: "rgba(255,255,255,0.25)",
          backgroundImage: "radial-gradient(rgba(33,32,18,0.14) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      >
        {posts.map((post, i) => {
          const col = i % PER_ROW;
          const row = Math.floor(i / PER_ROW);
          const tilt = NOTE_TILT[i % NOTE_TILT.length];
          return (
            <motion.div
              key={post.id}
              drag
              dragConstraints={boardRef}
              dragElastic={0.15}
              dragSnapToOrigin
              dragTransition={{ bounceStiffness: 260, bounceDamping: 18 }}
              onDragStart={() => { dragged.current = true; setTop(i); }}
              onPointerDown={() => { dragged.current = false; setTop(i); }}
              onClick={() => { if (!dragged.current) onOpen(post); }}
              initial={{ rotate: tilt }}
              animate={{ rotate: tilt }}
              whileHover={{ rotate: 0, scale: 1.04 }}
              whileDrag={{ rotate: tilt * 0.3, scale: 1.08, cursor: "grabbing" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{
                position: "absolute",
                left: `calc(${(col / PER_ROW) * 100}% + ${col === 0 ? 28 : 12}px)`,
                top: 32 + row * (NOTE_H + 60) + NOTE_OFFSET_Y[i % NOTE_OFFSET_Y.length],
                width: `calc(${100 / PER_ROW}% - 40px)`,
                zIndex: top === i ? 3 : 1,
                cursor: "grab",
                touchAction: "none",
              }}
            >
              <Note post={post} isNew={post.id === newestId} tilt={tilt} width="100%" height={NOTE_H} />
            </motion.div>
          );
        })}
      </div>
      <p className="font-inclusive-sans" style={{ fontSize: 12, color: "rgba(33,32,18,0.45)", marginTop: 10, textAlign: "right" }}>
        drag the notes around — they'll find their way back
      </p>
    </div>
  );
}

function StickyMobile({ posts, onOpen, newestId }: LayoutProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const noteRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Tilt each note by how far it is from the centre of the track: straight at the
  // centre, back to its resting tilt one note-width away.
  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const t = track.getBoundingClientRect();
    const mid = t.left + t.width / 2;
    noteRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const d = Math.min(1, Math.abs(r.left + r.width / 2 - mid) / r.width);
      const tilt = NOTE_TILT[i % NOTE_TILT.length] * d;
      el.style.transform = `rotate(${tilt}deg) scale(${1 - d * 0.06})`;
    });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update, posts.length]);

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={update}
        className="blog-note-track"
        style={{
          display: "flex", gap: 16, overflowX: "auto", scrollSnapType: "x mandatory",
          padding: "28px 14vw 32px", margin: "0 -16px", scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <style>{`.blog-note-track::-webkit-scrollbar{display:none}`}</style>
        {posts.map((post, i) => (
          <div
            key={post.id}
            ref={(el) => { noteRefs.current[i] = el; }}
            onClick={() => onOpen(post)}
            style={{ flex: "0 0 72vw", scrollSnapAlign: "center", cursor: "pointer", transition: "transform 0.12s linear" }}
          >
            <Note post={post} isNew={post.id === newestId} tilt={NOTE_TILT[i % NOTE_TILT.length]} width="100%" height={240} />
          </div>
        ))}
      </div>
      <p className="font-inclusive-sans" style={{ fontSize: 12, color: "rgba(33,32,18,0.45)", textAlign: "center" }}>
        swipe through the notes →
      </p>
    </div>
  );
}
