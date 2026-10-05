// The blog as a diary on a desk. Closed, it's a stitched leather book with an elastic
// band and a ribbon bookmark; click it and the cover swings open. Inside, cream pages
// with paper grain and faint rules hold one blog post each, after a flyleaf and a
// handwritten contents page. Pages turn in 3D — drag a page edge, click a page, or use
// the arrow keys. Desktop shows two-page spreads; phones show one page at a time.
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import type { BlogPost } from "@/app/data/blogPosts";
import { MARTEL } from "@/app/lib/devanagari";
import { haptic } from "@/app/lib/feedback";
import { colors, fonts, withAlpha } from "@/app/theme/tokens";
import { CATEGORY_ACCENT, CATEGORY_DOODLE } from "./blogCategories";

// ─── Textures ─────────────────────────────────────────────────────────────────
const noise = (alpha: number, tint = "0.35 0 0 0 0 0.28 0 0 0 0 0.18") =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 ${tint} 0 0 0 0 ${alpha} 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
const PAPER_GRAIN = noise(0.16);
const LEATHER_GRAIN = noise(0.5, "0.12 0 0 0 0 0.1 0 0 0 0 0.05");

type Side = "left" | "right";

function paperBackground(side: Side) {
  const spine = side === "left" ? "270deg" : "90deg";
  return [
    // the curve into the spine
    `linear-gradient(${spine}, ${withAlpha(colors.ink, 0.16)} 0%, ${withAlpha(colors.ink, 0.05)} 4%, transparent 11%)`,
    // faint rules
    `repeating-linear-gradient(180deg, transparent 0 27px, ${withAlpha(colors.brown, 0.09)} 27px 28px)`,
    PAPER_GRAIN,
  ].join(",");
}

// ─── Page contents ────────────────────────────────────────────────────────────
type PageSpec =
  | { kind: "cover" }
  | { kind: "flyleaf" }
  | { kind: "contents" }
  | { kind: "post"; post: BlogPost; number: number }
  | { kind: "end" }
  | { kind: "blank" };

const isLatin = (text: string) => /^[\x20-\x7E’'—–-]+$/.test(text);
const firstParagraph = (post: BlogPost) => post.body.find((b): b is string => typeof b === "string");

function Hand({ children, size = 20, color = colors.brown, style }: { children: ReactNode; size?: number; color?: string; style?: React.CSSProperties }) {
  return <span style={{ fontFamily: fonts.hand, fontSize: size, lineHeight: 1.15, color, ...style }}>{children}</span>;
}

function Cover({ isMobile }: { isMobile: boolean }) {
  return (
    <div
      style={{
        position: "absolute", inset: 0, borderRadius: "4px 14px 14px 4px", overflow: "hidden",
        backgroundColor: colors.leather,
        backgroundImage: [
          `radial-gradient(120% 90% at 30% 20%, ${withAlpha(colors.white, 0.1)}, transparent 55%)`,
          `radial-gradient(140% 120% at 50% 50%, transparent 55%, ${withAlpha(colors.ink, 0.55)} 100%)`,
          LEATHER_GRAIN,
        ].join(","),
        boxShadow: `inset 6px 0 10px ${withAlpha(colors.ink, 0.45)}, inset -2px 0 0 ${withAlpha(colors.white, 0.06)}`,
      }}
    >
      {/* stitching */}
      <div style={{ position: "absolute", inset: isMobile ? 12 : 16, borderRadius: 10, border: `2px dashed ${withAlpha(colors.sand, 0.32)}` }} />
      {/* embossed title */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 32, textAlign: "center" }}>
        <span aria-hidden="true" style={{ fontSize: isMobile ? 26 : 32, filter: "grayscale(1) contrast(0.8)", opacity: 0.55 }}>🐝</span>
        <p className="font-caslon" style={{ fontSize: isMobile ? 26 : 34, lineHeight: 1.1, fontStyle: "italic", color: withAlpha(colors.sand, 0.82), textShadow: `0 1px 0 ${withAlpha(colors.white, 0.18)}, 0 -1px 1px ${withAlpha(colors.ink, 0.6)}` }}>
          notes from my<br />notes app
        </p>
        <p className="font-inclusive-sans" style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: withAlpha(colors.sand, 0.5), textShadow: `0 -1px 1px ${withAlpha(colors.ink, 0.6)}` }}>
          laxmi mahajan
        </p>
      </div>
      {/* elastic band */}
      <div style={{ position: "absolute", top: 0, bottom: 0, right: isMobile ? 26 : 34, width: 12, background: `linear-gradient(90deg, ${withAlpha(colors.ink, 0.35)}, ${colors.orange} 30%, ${colors.orangeLight} 55%, ${colors.orange} 75%, ${withAlpha(colors.ink, 0.35)})`, boxShadow: `2px 0 6px ${withAlpha(colors.ink, 0.4)}` }} />
    </div>
  );
}

function PageFrame({ side, children, number }: { side: Side; children: ReactNode; number?: number }) {
  return (
    <div
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        borderRadius: side === "left" ? "8px 2px 2px 8px" : "2px 8px 8px 2px",
        backgroundColor: colors.paper, backgroundImage: paperBackground(side),
      }}
    >
      <div style={{ position: "absolute", inset: 0, padding: side === "left" ? "34px 30px 40px 34px" : "34px 34px 40px 30px", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
      {number !== undefined && (
        <Hand size={16} color={withAlpha(colors.brown, 0.55)} style={{ position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center" }}>{number}</Hand>
      )}
    </div>
  );
}

function PostPage({ post, number, side, isMobile, onRead }: { post: BlogPost; number: number; side: Side; isMobile: boolean; onRead: () => void }) {
  const accent = CATEGORY_ACCENT[post.category];
  const excerpt = firstParagraph(post);
  return (
    <PageFrame side={side} number={number}>
      {/* a coffee ring on every other page, because diaries live on desks */}
      {number % 2 === 0 && (
        <div aria-hidden="true" style={{ position: "absolute", right: -30, bottom: 40, width: 120, height: 120, borderRadius: "50%", border: `5px solid ${withAlpha(colors.brown, 0.07)}`, boxShadow: `inset 0 0 0 2px ${withAlpha(colors.brown, 0.04)}`, transform: "rotate(-12deg) scaleX(1.05)" }} />
      )}

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        {/* ink stamp */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", border: `1.5px solid ${withAlpha(accent, 0.8)}`, borderRadius: 999, transform: "rotate(-4deg)", opacity: 0.9 }}>
          <span aria-hidden="true" style={{ fontSize: 12 }}>{CATEGORY_DOODLE[post.category]}</span>
          <span className="font-inclusive-sans" style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: accent === colors.olive ? colors.oliveDeep : accent }}>{post.category}</span>
        </div>
        <Hand size={20} style={{ transform: "rotate(2deg)", whiteSpace: "nowrap" }}>{post.date}</Hand>
      </div>

      <p className="font-caslon not-italic" style={{ marginTop: isMobile ? 18 : 24, fontSize: isMobile ? 25 : 30, lineHeight: isMobile ? "29px" : "34px", fontWeight: 600, color: colors.ink, ...(isLatin(post.title) ? null : MARTEL) }}>
        {post.title}
      </p>
      <p className="font-inclusive-sans" style={{ marginTop: 10, fontSize: 14, lineHeight: "21px", fontWeight: 300, color: withAlpha(colors.ink, 0.75) }}>
        {post.subtitle}
      </p>
      {excerpt && (
        <p className="font-inclusive-sans" style={{ marginTop: 14, fontSize: 13, lineHeight: "28px", color: withAlpha(colors.ink, 0.6), display: "-webkit-box", WebkitLineClamp: isMobile ? 4 : 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {excerpt}
        </p>
      )}

      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 12 }}>
        <Hand size={18} color={withAlpha(colors.ink, 0.55)}>☕ {post.readTime}</Hand>
        <button
          type="button"
          data-no-flip
          onClick={onRead}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <Hand size={22} color={colors.orange} style={{ textDecoration: "underline", textUnderlineOffset: 4, textDecorationThickness: 1.5 }}>read the full entry →</Hand>
        </button>
      </div>
    </PageFrame>
  );
}

// ─── Leaf: one sheet that turns, with a page on each face ─────────────────────
function Leaf({ side, angle, front, back }: { side: Side; angle: MotionValue<number>; front: ReactNode; back: ReactNode }) {
  // shading follows the fold: darkest halfway through the turn
  const fold = useTransform(angle, (a) => Math.sin((Math.abs(a) / 180) * Math.PI));
  const frontShade = useTransform(fold, (f) => f * 0.35);
  const backShade = useTransform(fold, (f) => f * 0.25);
  const lift = useTransform(fold, (f) => `0 ${8 + f * 18}px ${16 + f * 30}px ${withAlpha(colors.ink, 0.12 + f * 0.18)}`);
  const face: React.CSSProperties = { position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };
  return (
    <motion.div
      style={{
        position: "absolute", top: 0, bottom: 0, width: "50%",
        left: side === "right" ? "50%" : 0,
        transformOrigin: side === "right" ? "left center" : "right center",
        transformStyle: "preserve-3d", rotateY: angle, zIndex: 5, boxShadow: lift, pointerEvents: "none",
      }}
    >
      <div style={face}>
        {front}
        <motion.div style={{ position: "absolute", inset: 0, background: `linear-gradient(${side === "right" ? "90deg" : "270deg"}, ${colors.ink}, transparent 70%)`, opacity: frontShade }} />
      </div>
      <div style={{ ...face, transform: "rotateY(180deg)" }}>
        {back}
        <motion.div style={{ position: "absolute", inset: 0, background: `linear-gradient(${side === "right" ? "270deg" : "90deg"}, ${colors.ink}, transparent 70%)`, opacity: backShade }} />
      </div>
    </motion.div>
  );
}

// ─── Diary ────────────────────────────────────────────────────────────────────
export function BlogDiary({ posts, isMobile, onOpen }: { posts: BlogPost[]; isMobile: boolean; onOpen: (post: BlogPost) => void }) {
  const deskRef = useRef<HTMLDivElement>(null);
  const [deskWidth, setDeskWidth] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = deskRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setDeskWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Page order. Desktop pairs them into spreads; "-1" is the closed book (cover only).
  const postPages: PageSpec[] = posts.map((post, i) => ({ kind: "post", post, number: i + 1 }));
  const pages: PageSpec[] = [{ kind: "flyleaf" }, { kind: "contents" }, ...postPages, { kind: "end" }];
  if (!isMobile && pages.length % 2) pages.push({ kind: "blank" });
  const step = isMobile ? 1 : 2;
  const lastView = Math.ceil(pages.length / step) - 1;
  const viewOf = (pageIndex: number) => Math.floor(pageIndex / step);

  const [view, setView] = useState(-1); // -1 = closed
  const [turn, setTurn] = useState<{ dir: 1 | -1; to: number } | null>(null);
  const angle = useMotionValue(0);

  // What sits on each side for a view (desktop: [left, right]; mobile: [_, page]).
  const sides = (v: number): [PageSpec | null, PageSpec | null] => {
    if (v < 0) return [null, { kind: "cover" }];
    // phones show one page; the half to its left only appears as a page's back mid-turn
    if (isMobile) return [{ kind: "blank" }, pages[v] ?? null];
    return [pages[v * 2] ?? null, pages[v * 2 + 1] ?? null];
  };

  const render = (spec: PageSpec | null, side: Side): ReactNode => {
    if (!spec) return null;
    switch (spec.kind) {
      case "cover":
        return <Cover isMobile={isMobile} />;
      case "flyleaf":
        return (
          <PageFrame side={side}>
            <div style={{ margin: "auto 0", display: "flex", flexDirection: "column", gap: 10, transform: "rotate(-3deg)" }}>
              <Hand size={22} color={withAlpha(colors.ink, 0.5)}>this diary belongs to</Hand>
              <Hand size={44} color={colors.ink}>laxmi 🐝</Hand>
              <Hand size={19} color={withAlpha(colors.ink, 0.5)}>if found, please read anyway.</Hand>
            </div>
            <span aria-hidden="true" style={{ position: "absolute", right: 26, bottom: 30, fontSize: 30, transform: "rotate(18deg)", opacity: 0.8 }}>🌼</span>
          </PageFrame>
        );
      case "contents":
        return (
          <PageFrame side={side}>
            <p className="font-caslon" style={{ fontSize: isMobile ? 28 : 32, fontStyle: "italic", color: colors.ink }}>contents</p>
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              {posts.map((post, i) => (
                <button
                  key={post.id}
                  type="button"
                  data-no-flip
                  onClick={() => turnTo(viewOf(i + 2))}
                  style={{ display: "flex", alignItems: "baseline", gap: 6, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}
                >
                  <Hand size={isMobile ? 21 : 23} color={colors.ink} style={{ flexShrink: 1, ...(isLatin(post.title) ? null : MARTEL) }}>{post.title}</Hand>
                  <span aria-hidden="true" style={{ flex: 1, minWidth: 16, borderBottom: `2px dotted ${withAlpha(colors.brown, 0.3)}`, transform: "translateY(-4px)" }} />
                  <Hand size={20}>{i + 1}</Hand>
                </button>
              ))}
            </div>
            <Hand size={18} color={withAlpha(colors.ink, 0.45)} style={{ marginTop: "auto" }}>
              {isMobile ? "swipe or tap a page to turn it →" : "drag a corner, or tap a page, to turn it →"}
            </Hand>
          </PageFrame>
        );
      case "post":
        return <PostPage post={spec.post} number={spec.number} side={side} isMobile={isMobile} onRead={() => onOpen(spec.post)} />;
      case "end":
        return (
          <PageFrame side={side}>
            <div style={{ margin: "auto 0", display: "flex", flexDirection: "column", gap: 8, alignItems: "center", textAlign: "center", transform: "rotate(-2deg)" }}>
              <Hand size={34} color={colors.ink}>to be continued…</Hand>
              <Hand size={19} color={withAlpha(colors.ink, 0.5)}>the next drafts are still living in my notes app ✍️</Hand>
            </div>
          </PageFrame>
        );
      case "blank":
        return <PageFrame side={side}>{null}</PageFrame>;
    }
  };

  // ── Turning ──
  const settle = useCallback((to: number) => {
    setView(to);
    setTurn(null);
    angle.set(0);
    haptic(6);
  }, [angle]);

  const turnTo = useCallback((to: number) => {
    if (turn || to === view || to < -1 || to > lastView) return;
    const dir: 1 | -1 = to > view ? 1 : -1;
    if (reduceMotion) { setView(to); return; }
    setTurn({ dir, to });
    angle.set(0);
    animate(angle, dir === 1 ? -180 : 180, { duration: 0.75, ease: [0.4, 0.05, 0.25, 1], onComplete: () => settle(to) });
  }, [turn, view, lastView, reduceMotion, angle, settle]);

  // Dragging a page edge turns it by hand; let go past a third and it finishes the turn.
  const drag = useRef<{ x: number; dir: 1 | -1; width: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent, side: Side) => {
    if ((e.target as HTMLElement).closest("[data-no-flip]") || turn) return;
    const dir: 1 | -1 = side === "right" ? 1 : -1;
    const to = view + dir;
    if (to < -1 || to > lastView) return;
    const width = (e.currentTarget as HTMLElement).getBoundingClientRect().width;
    drag.current = { x: e.clientX, dir, width, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.x) * -d.dir; // towards the spine
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      setTurn({ dir: d.dir, to: view + d.dir });
    }
    if (d.moved) angle.set(-d.dir * Math.min(180, Math.max(0, (dx / d.width) * 180)));
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const to = view + d.dir;
    if (!d.moved) { turnTo(to); return; }
    const done = Math.abs(angle.get()) > 60;
    animate(angle, done ? -d.dir * 180 : 0, {
      duration: 0.45, ease: [0.25, 1, 0.5, 1],
      onComplete: () => (done ? settle(to) : (setTurn(null), angle.set(0))),
    });
  };

  // Arrow keys while the diary has focus.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); turnTo(view + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); turnTo(view - 1); }
  };

  // ── Layout ──
  const pageW = isMobile ? Math.min(380, Math.max(260, deskWidth - 48)) : Math.min(440, Math.max(300, (deskWidth - 96) / 2));
  const pageH = Math.round(pageW * (isMobile ? 1.42 : 1.34));
  const bookW = pageW * 2; // on phones only the right half (the current page) is on screen
  const closed = view === -1 && !turn;

  // Base layer: during a forward turn the page beneath on the right is already the next
  // view's; during a backward turn the left beneath is the previous view's.
  const [curL, curR] = sides(view);
  const target = turn ? sides(turn.to) : null;
  const baseLeft = turn && turn.dir === -1 ? target![0] : curL;
  const baseRight = turn && turn.dir === 1 ? target![1] : curR;
  const leafFront = turn ? (turn.dir === 1 ? curR : curL) : null;
  const leafBack = turn ? (turn.dir === 1 ? target![0] : target![1]) : null;

  // Centre the right half (the cover when closed; the single page on phones) on the desk.
  const centreRightHalf = isMobile || (view === -1 && !turn) || turn?.to === -1;
  const shiftX = centreRightHalf ? -pageW / 2 : 0;

  return (
    <div
      ref={deskRef}
      style={{
        position: "relative", padding: `${isMobile ? 28 : 44}px 0 ${isMobile ? 36 : 52}px`,
        backgroundColor: colors.sandPanel,
        backgroundImage: [
          `radial-gradient(70% 60% at 50% 45%, ${withAlpha(colors.white, 0.35)}, transparent 70%)`,
          `repeating-linear-gradient(92deg, transparent 0 22px, ${withAlpha(colors.brown, 0.035)} 22px 24px, transparent 24px 61px)`,
          PAPER_GRAIN,
        ].join(","),
        overflow: "hidden",
      }}
    >
      {deskWidth > 0 && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <motion.div
            tabIndex={0}
            role="region"
            aria-label="Blog diary — use the arrow keys to turn pages"
            onKeyDown={onKeyDown}
            animate={{ x: shiftX }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            style={{ position: "relative", width: bookW, height: pageH, perspective: 2200, outline: "none", flexShrink: 0 }}
          >
            {/* page edges under the book block + its shadow on the desk */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute", top: 6, bottom: -8,
                left: closed || isMobile ? "50%" : 4, right: -6,
                borderRadius: 10, backgroundColor: colors.paper,
                backgroundImage: `repeating-linear-gradient(0deg, ${withAlpha(colors.brown, 0.18)} 0 1px, transparent 1px 3px)`,
                boxShadow: `0 24px 40px ${withAlpha(colors.ink, 0.28)}, 0 4px 8px ${withAlpha(colors.ink, 0.15)}`,
              }}
            />

            {/* the static pages */}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "50%" }} onPointerDown={(e) => onPointerDown(e, "left")} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
              {render(baseLeft, "left")}
            </div>
            <motion.div
              style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: "50%", cursor: view < lastView ? "grab" : "default", touchAction: "pan-y" }}
              whileHover={closed && !reduceMotion ? { rotateY: -10, x: -4 } : undefined}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              onPointerDown={(e) => onPointerDown(e, "right")}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {render(baseRight, "right")}
              {/* a curled corner hinting that the page turns */}
              {!turn && view < lastView && (
                <motion.div
                  aria-hidden="true"
                  animate={reduceMotion ? undefined : { scale: [1, 1.15, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  style={{ position: "absolute", right: 0, bottom: 0, width: 26, height: 26, transformOrigin: "bottom right", background: `linear-gradient(315deg, transparent 50%, ${withAlpha(colors.ink, 0.12)} 51%, ${closed ? colors.sand : colors.paper} 56%)`, borderRadius: "0 0 8px 0", pointerEvents: "none" }}
                />
              )}
            </motion.div>

            {/* the ribbon bookmark */}
            <motion.div
              aria-hidden="true"
              animate={reduceMotion ? undefined : { rotate: [-2, 2, -2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ position: "absolute", left: closed ? "62%" : "calc(50% + 24px)", bottom: -34, width: 12, height: 52, transformOrigin: "top center", background: `linear-gradient(90deg, ${colors.pink}, ${colors.pinkLight} 50%, ${colors.pink})`, clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)", zIndex: closed ? 6 : 1 }}
            />

            {turn && (
              <Leaf side={turn.dir === 1 ? "right" : "left"} angle={angle} front={render(leafFront, turn.dir === 1 ? "right" : "left")} back={render(leafBack, turn.dir === 1 ? "left" : "right")} />
            )}
          </motion.div>
        </div>
      )}

      {/* controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginTop: isMobile ? 40 : 52 }}>
        {view > -1 && (
          <button type="button" onClick={() => turnTo(view - 1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <Hand size={20} color={withAlpha(colors.ink, 0.6)}>← back</Hand>
          </button>
        )}
        <Hand size={18} color={withAlpha(colors.ink, 0.45)}>
          {view === -1 ? (isMobile ? "tap the diary to open it" : "click the diary to open it") : `${Math.min(view + 1, lastView + 1)} / ${lastView + 1}`}
        </Hand>
        {view > -1 && view < lastView && (
          <button type="button" onClick={() => turnTo(view + 1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <Hand size={20} color={withAlpha(colors.ink, 0.6)}>next →</Hand>
          </button>
        )}
        {view > -1 && (
          <button type="button" onClick={() => turnTo(-1)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <Hand size={20} color={colors.orange}>close the diary</Hand>
          </button>
        )}
      </div>
    </div>
  );
}
