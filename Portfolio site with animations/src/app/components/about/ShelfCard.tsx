import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { motion } from "motion/react";
import { colors, withAlpha } from "@/app/theme/tokens";
import { SquiggleLink } from "@/app/components/ui/Buttons";
import { BOOKS, MOVIES, RESOURCES } from "@/app/data/shelf";

// ── Shelf cards: Cinema / Books / Random ───────────────────────────────────────
// A sliding cover carousel (prev/active/next) with one forward arrow that wraps
// around at the end. Every cover stays mounted and only its slot changes, so the
// stack glides: the outgoing cover drifts off left, the next one fades in from the right.

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const MOVE = `transform 0.65s ${EASE}, opacity 0.65s ${EASE}`;

type Slot = "exit" | "left" | "center" | "right" | "enter";
type Pose = { x: number; y: number; r?: number; s: number; o: number };
type Layout = Record<Slot, Pose>;

function slotOf(i: number, active: number, total: number): Slot {
  const off = (i - active + total) % total;
  if (off === 0) return "center";
  if (off === 1) return "right";
  if (off === total - 1) return "left";
  if (off === 2) return "enter"; // waiting just off the right edge
  return "exit"; // parked off the left edge
}

const Z: Record<Slot, number> = { exit: 1, enter: 1, left: 5, right: 5, center: 10 };

function poseStyle({ x, y, r = 0, s, o }: Pose, slot: Slot): React.CSSProperties {
  return {
    position: "absolute", left: "50%", top: "50%",
    transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`,
    opacity: o, zIndex: Z[slot], transition: MOVE, willChange: "transform, opacity", backfaceVisibility: "hidden",
  };
}

const BOOK_LAYOUT: Layout = {
  exit: { x: -112, y: 16, r: -12, s: 0.7, o: 0 },
  left: { x: -70, y: 12, r: -8, s: 0.78, o: 0.35 },
  center: { x: 0, y: -10, s: 1, o: 1 },
  right: { x: 70, y: 12, r: 8, s: 0.78, o: 0.35 },
  enter: { x: 112, y: 16, r: 12, s: 0.7, o: 0 },
};
const MOVIE_LAYOUT: Layout = {
  exit: { x: -120, y: -22, s: 0.6, o: 0 },
  left: { x: -82, y: -18, s: 0.667, o: 0.35 },
  center: { x: 0, y: -10, s: 1, o: 1 },
  right: { x: 82, y: 6, s: 0.667, o: 0.35 },
  enter: { x: 120, y: 10, s: 0.6, o: 0 },
};
const RANDOM_LAYOUT: Layout = {
  exit: { x: -130, y: 16, r: -10, s: 0.7, o: 0 },
  left: { x: -90, y: 12, r: -6, s: 0.78, o: 0.35 },
  center: { x: 0, y: -10, s: 1, o: 1 },
  right: { x: 90, y: 12, r: 6, s: 0.78, o: 0.35 },
  enter: { x: 130, y: 16, r: 10, s: 0.7, o: 0 },
};

function Counter({ active, total, color }: { active: number; total: number; color: string }) {
  return (
    <div style={{ position: "absolute", bottom: 9, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 4, zIndex: 20 }}>
      <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color, fontVariantNumeric: "tabular-nums" }}>{active + 1}</span>
      <span style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: withAlpha(color, 0.3) }} />
      <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: withAlpha(color, 0.5) }}>{total}</span>
    </div>
  );
}

/** The panel on the left of a shelf: every item rendered once, posed by its slot. */
function Stack({ total, active, layout, background, counterColor, tile }: {
  total: number; active: number; layout: Layout; background: string; counterColor: string;
  tile: (i: number) => { width: number; height: number; radius: number; shadow: string; body: React.ReactNode };
}) {
  return (
    <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", overflow: "hidden", width: 154, height: 188, backgroundColor: background }}>
      {Array.from({ length: total }, (_, i) => {
        const slot = slotOf(i, active, total);
        const t = tile(i);
        return (
          <div
            key={i}
            aria-hidden={slot !== "center"}
            style={{ ...poseStyle(layout[slot], slot), width: t.width, height: t.height, borderRadius: t.radius, overflow: "hidden", boxShadow: t.shadow, pointerEvents: "none" }}
          >
            {t.body}
          </div>
        );
      })}
      <Counter active={active} total={total} color={counterColor} />
    </div>
  );
}

function Cover({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} draggable={false} decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />;
}

function BooksPanel({ activeIdx }: { activeIdx: number }) {
  return (
    <Stack
      total={BOOKS.length} active={activeIdx} layout={BOOK_LAYOUT} background={colors.pinkLight} counterColor={colors.brown}
      tile={(i) => {
        const book = BOOKS[i];
        return {
          width: 80, height: 120, radius: 1.4,
          shadow: "2.78px 2.78px 1.39px rgba(56,20,28,0.14), 2.78px 5.56px 41.72px rgba(115,114,109,0.25)",
          body: (
            <>
              {book.cover ? (
                <Cover src={book.cover} alt={book.title} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg, ${colors.pinkLight}, ${colors.pink})`, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 8px" }}>
                  <span className="font-caslon not-italic" style={{ fontSize: 9, lineHeight: "12px", textAlign: "center", fontWeight: 600, color: colors.ink }}>{book.title}</span>
                </div>
              )}
              {/* the spine's crease */}
              <div style={{ position: "absolute", top: 0, left: "2.97px", height: "100%", width: 2, filter: "blur(1.4px)", backgroundColor: "rgba(35,30,30,0.3)" }} />
            </>
          ),
        };
      }}
    />
  );
}

function MoviesPanel({ activeIdx }: { activeIdx: number }) {
  return (
    <Stack
      total={MOVIES.length} active={activeIdx} layout={MOVIE_LAYOUT} background={colors.sandBorder} counterColor={colors.brown}
      tile={(i) => {
        const movie = MOVIES[i];
        return {
          width: 90, height: 120, radius: 2,
          shadow: "2px 2px 1px rgba(40,30,20,0.14), 2px 5px 30px rgba(115,114,109,0.25)",
          body: movie.poster ? (
            <Cover src={movie.poster} alt={movie.title} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg, ${colors.sandLight}, ${colors.sandBorder})`, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 6px" }}>
              <span className="font-caslon not-italic" style={{ fontSize: 8.5, lineHeight: "11px", textAlign: "center", fontWeight: 600, color: colors.brown }}>{movie.title}</span>
            </div>
          ),
        };
      }}
    />
  );
}

function ResourcesPanel({ activeIdx }: { activeIdx: number }) {
  return (
    <Stack
      total={RESOURCES.length} active={activeIdx} layout={RANDOM_LAYOUT} background={colors.oliveLight} counterColor={colors.oliveDeep}
      tile={(i) => {
        const item = RESOURCES[i];
        return {
          width: 120, height: 68, radius: 4,
          shadow: "2.78px 2.78px 1.39px rgba(40,40,20,0.14), 2.78px 5.56px 41.72px rgba(115,114,109,0.25)",
          body: item.art ? (
            <Cover src={item.art} alt={item.title} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg, ${colors.sandLight}, ${colors.oliveLight})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="font-inclusive-sans font-normal uppercase" style={{ fontSize: 8, letterSpacing: "0.5px", color: colors.oliveDeep }}>{item.kind}</span>
            </div>
          ),
        };
      }}
    />
  );
}

function NextArrowButton({ onClick, fill }: { onClick: () => void; fill: string }) {
  const nextPath = "M9.2751 5.99991L18.0002 11.2981V12.6742L9.2751 17.9999V16.2522L15.5054 12.6605L5.0002 13.0871V11.0779L15.4919 11.4907L9.2751 7.85771V5.99991Z";
  return (
    <motion.button
      onClick={onClick}
      aria-label="Next"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      style={{ position: "relative", flexShrink: 0, width: 24, height: 24, cursor: "pointer", background: "none", border: "none", padding: 0 }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <rect width="24" height="24" rx="12" fill="white" fillOpacity="0.5" />
        <path d={nextPath} fill={fill} style={{ transition: `fill 0.5s ${EASE}` }} />
      </svg>
    </motion.button>
  );
}

// One shelf: a sliding cover carousel on the left, a heading (or tab switch) and the
// current item's title + forward arrow on the right. Several shelves in one card
// switch with tabs.
interface Shelf {
  label: string;
  count: number;
  background: string;
  arrowFill: string;
  panel: (activeIdx: number) => React.ReactNode;
  item: (activeIdx: number) => { title: string; subtitle: string; badge?: string; href?: string };
}

const SHELF_HEIGHT = 188;

export function ShelfCard({ shelves, isMobile }: { shelves: Shelf[]; isMobile: boolean }) {
  const [tab, setTab] = useState(0);
  const [indices, setIndices] = useState(() => shelves.map(() => 0));
  const textRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const shelf = shelves[tab];
  const idx = indices[tab];
  const { title, subtitle, badge, href } = shelf.item(idx);

  // Subtle GSAP crossfade whenever the displayed title/subtitle changes.
  useEffect(() => {
    if (!textRef.current) return;
    gsap.killTweensOf(textRef.current);
    gsap.fromTo(textRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" });
  }, [title, subtitle]);

  // Switching tabs swaps the whole cover stack, so fade the new one in.
  useEffect(() => {
    if (!panelRef.current) return;
    gsap.killTweensOf(panelRef.current);
    gsap.fromTo(panelRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
  }, [tab]);

  const next = () => setIndices((all) => all.map((v, i) => (i === tab ? (v + 1) % shelf.count : v)));
  const headingStyle = { fontSize: 12, letterSpacing: "-0.02em", background: "none", border: "none", padding: 0, color: colors.ink } as const;

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, width: "100%", height: SHELF_HEIGHT, backgroundColor: shelf.background, transition: `background-color 0.5s ${EASE}` }}>
      <div ref={panelRef}>{shelf.panel(idx)}</div>

      <div style={{ position: "absolute", left: 170, top: 16, right: isMobile ? 12 : 16, height: SHELF_HEIGHT - 32, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {shelves.length === 1 ? (
            <p className="font-caslon" style={{ ...headingStyle, fontWeight: 500 }}>{shelf.label}</p>
          ) : (
            // The open tab is the footer's text button; the others are the same words, unlined.
            shelves.map((sh, i) =>
              i === tab ? (
                <SquiggleLink key={sh.label} onClick={() => setTab(i)} style={{ fontSize: 12, letterSpacing: "-0.02em" }}>
                  {sh.label}
                </SquiggleLink>
              ) : (
                <button
                  key={sh.label}
                  onClick={() => setTab(i)}
                  className="font-caslon"
                  style={{ ...headingStyle, fontWeight: 500, cursor: "pointer", color: withAlpha(colors.ink, 0.6) }}
                >
                  {sh.label}
                </button>
              ),
            )
          )}
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
          <div ref={textRef} style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
            {badge && (
              <span style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", backgroundColor: colors.pink, borderRadius: 20, padding: "3px 7px", marginBottom: 2 }}>
                <span className="font-inclusive-sans font-normal" style={{ fontSize: 7.5, lineHeight: 1, letterSpacing: "0.5px", textTransform: "uppercase", color: colors.ink }}>{badge}</span>
              </span>
            )}
            {href ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className="font-caslon not-italic" style={{ fontSize: 16, lineHeight: "20px", fontWeight: 600, color: colors.ink, textDecoration: "underline", textDecorationColor: withAlpha(colors.ink, 0.25), textUnderlineOffset: 3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{title}</a>
            ) : (
              <p className="font-caslon not-italic" style={{ fontSize: 16, lineHeight: "20px", fontWeight: 600, color: colors.ink }}>{title}</p>
            )}
            <p className="font-inclusive-sans uppercase" style={{ fontSize: 12, lineHeight: "16px", color: colors.oliveDeep }}>{subtitle}</p>
          </div>
          <NextArrowButton onClick={next} fill={shelf.arrowFill} />
        </div>
      </div>
    </div>
  );
}

export const BOOKS_SHELF: Shelf = {
  label: "Books",
  count: BOOKS.length,
  background: colors.sand,
  arrowFill: colors.pink,
  panel: (i) => <BooksPanel activeIdx={i} />,
  item: (i) => ({ title: BOOKS[i].title, subtitle: BOOKS[i].author.toUpperCase(), badge: BOOKS[i].reading ? "reading now" : undefined }),
};
export const MOVIES_SHELF: Shelf = {
  label: "Cinema",
  count: MOVIES.length,
  background: colors.sand,
  arrowFill: colors.orange,
  panel: (i) => <MoviesPanel activeIdx={i} />,
  item: (i) => ({ title: MOVIES[i].title, subtitle: MOVIES[i].year }),
};
export const RESOURCES_SHELF: Shelf = {
  label: "Random",
  count: RESOURCES.length,
  background: colors.sandLight,
  arrowFill: colors.oliveDeep,
  panel: (i) => <ResourcesPanel activeIdx={i} />,
  item: (i) => ({ title: RESOURCES[i].title, subtitle: RESOURCES[i].kind, href: RESOURCES[i].url }),
};
