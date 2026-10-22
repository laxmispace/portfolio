import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { colors, withAlpha } from "@/app/theme/tokens";
import { BOOKS, MOVIES, RESOURCES } from "@/app/data/shelf";

// ── Shelf cards: Books / Movies / Resources ────────────────────────────────────
// A 3-slot sliding cover carousel (prev/active/next) with one forward arrow that
// wraps around at the end.

type BookSlot = "left" | "center" | "right";

function bookSlotStyle(slot: BookSlot): React.CSSProperties {
  switch (slot) {
    case "center":
      return { transform: "translateX(-50%) translateY(-50%) rotate(0deg) scale(1)", opacity: 1, zIndex: 10, left: "50%", top: "calc(50% - 10px)" };
    case "left":
      return { transform: "translateX(-50%) translateY(-50%) rotate(-8deg) scale(0.78)", opacity: 0.35, zIndex: 5, left: "calc(50% - 70px)", top: "calc(50% + 12px)" };
    case "right":
      return { transform: "translateX(-50%) translateY(-50%) rotate(8deg) scale(0.78)", opacity: 0.35, zIndex: 5, left: "calc(50% + 70px)", top: "calc(50% + 12px)" };
  }
}

function BooksPanel({ activeIdx }: { activeIdx: number }) {
  const total = BOOKS.length;
  const prevIdx = (activeIdx - 1 + total) % total;
  const nextIdx = (activeIdx + 1) % total;

  return (
    <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", overflow: "hidden", width: 154, height: 188, backgroundColor: colors.pinkLight }}>
      {[prevIdx, activeIdx, nextIdx].map((idx, i) => {
        const slot: BookSlot = i === 0 ? "left" : i === 1 ? "center" : "right";
        const book = BOOKS[idx];
        return (
          <div
            key={idx}
            style={{
              position: "absolute", width: 80, height: 120, borderRadius: 1.4, overflow: "hidden",
              transition: "transform 0.4s cubic-bezier(0.25,0.1,0.25,1), opacity 0.4s cubic-bezier(0.25,0.1,0.25,1)",
              boxShadow: "2.78px 2.78px 1.39px rgba(56,20,28,0.14), 2.78px 5.56px 41.72px rgba(115,114,109,0.25)",
              ...bookSlotStyle(slot),
            }}
          >
            {book.cover ? (
              <img src={book.cover} alt={book.title} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg, ${colors.pinkLight}, ${colors.pink})`, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 8px" }}>
                <span className="font-caslon not-italic" style={{ fontSize: 9, lineHeight: "12px", textAlign: "center", fontWeight: 600, color: colors.ink }}>{book.title}</span>
              </div>
            )}
            <div style={{ position: "absolute", top: 0, left: "2.97px", height: "100%", width: 2, filter: "blur(1.4px)", backgroundColor: "rgba(35,30,30,0.3)" }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", bottom: 9, left: 64, display: "flex", alignItems: "center", gap: 4 }}>
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: colors.brown }}>{activeIdx + 1}</span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: withAlpha(colors.brown, 0.3) }} />
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: withAlpha(colors.brown, 0.5) }}>{total}</span>
      </div>
    </div>
  );
}

function movieSlotStyle(slot: BookSlot): React.CSSProperties {
  switch (slot) {
    case "center":
      return { width: 90, height: 120, left: "50%", top: "calc(50% - 10px)", transform: "translateX(-50%) translateY(-50%) scale(1)", opacity: 1, zIndex: 10 };
    case "right":
      return { width: 60, height: 80, left: "calc(50% + 82px)", top: "calc(50% + 6px)", transform: "translateX(-50%) translateY(-50%) scale(1)", opacity: 0.35, zIndex: 5 };
    case "left":
      return { width: 60, height: 80, left: "calc(50% - 82px)", top: "calc(50% - 18px)", transform: "translateX(-50%) translateY(-50%) scale(1)", opacity: 0.35, zIndex: 5 };
  }
}

// Each slot remounts on index change (its key includes the item's own index),
// so a plain CSS transition can't animate it - GSAP gives it a subtle fade+settle
// entrance instead.
function MovieImage({ src, alt, slot }: { src?: string; alt: string; slot: BookSlot }) {
  const elRef = useRef<HTMLDivElement>(null);
  const { transform: _transform, opacity: targetOpacity, ...rest } = movieSlotStyle(slot);

  useEffect(() => {
    if (!elRef.current) return;
    // GSAP owns the transform (xPercent/yPercent recenter the anchor point,
    // matching the translate(-50%,-50%) the CSS version used) so its scale
    // tween doesn't clobber the centering.
    gsap.set(elRef.current, { xPercent: -50, yPercent: -50 });
    gsap.fromTo(elRef.current, { opacity: 0, scale: 0.94 }, { opacity: targetOpacity, scale: 1, duration: 0.35, ease: "power2.out" });
  }, [targetOpacity]);

  return (
    <div ref={elRef} style={{ position: "absolute", borderRadius: 2, overflow: "hidden", boxShadow: "2px 2px 2px rgba(0,0,0,0.25)", ...rest }}>
      {src ? (
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg, ${colors.sandLight}, ${colors.sandBorder})`, display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 6px" }}>
          <span className="font-caslon not-italic" style={{ fontSize: 8.5, lineHeight: "11px", textAlign: "center", fontWeight: 600, color: colors.brown }}>{alt}</span>
        </div>
      )}
    </div>
  );
}

function MoviesPanel({ activeIdx }: { activeIdx: number }) {
  const total = MOVIES.length;
  const prevIdx = (activeIdx - 1 + total) % total;
  const nextIdx = (activeIdx + 1) % total;

  return (
    <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", overflow: "hidden", width: 154, height: 188, backgroundColor: colors.sandBorder }}>
      <MovieImage key={`left-${prevIdx}`} src={MOVIES[prevIdx].poster} alt={MOVIES[prevIdx].title} slot="left" />
      <MovieImage key={`center-${activeIdx}`} src={MOVIES[activeIdx].poster} alt={MOVIES[activeIdx].title} slot="center" />
      <MovieImage key={`right-${nextIdx}`} src={MOVIES[nextIdx].poster} alt={MOVIES[nextIdx].title} slot="right" />
      <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 4 }}>
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: colors.brown }}>{activeIdx + 1}</span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: withAlpha(colors.brown, 0.3) }} />
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: withAlpha(colors.brown, 0.5) }}>{total}</span>
      </div>
    </div>
  );
}

function NextArrowButton({ onClick, fill }: { onClick: () => void; fill: string }) {
  const nextPath = "M9.2751 5.99991L18.0002 11.2981V12.6742L9.2751 17.9999V16.2522L15.5054 12.6605L5.0002 13.0871V11.0779L15.4919 11.4907L9.2751 7.85771V5.99991Z";
  return (
    <button onClick={onClick} aria-label="Next" style={{ position: "relative", flexShrink: 0, width: 24, height: 24, cursor: "pointer", background: "none", border: "none", padding: 0 }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <rect width="24" height="24" rx="12" fill="white" fillOpacity="0.5" />
        <path d={nextPath} fill={fill} />
      </svg>
    </button>
  );
}

// One shelf: a sliding cover carousel on the left, a heading (or tab switch) and the
// current item's title + forward arrow on the right. Books uses one shelf; Movies and
// Resources share a card and switch with tabs.
interface Shelf {
  label: string;
  count: number;
  background: string;
  arrowFill: string;
  panel: (activeIdx: number) => React.ReactNode;
  item: (activeIdx: number) => { title: string; subtitle: string; badge?: string };
}

const SHELF_HEIGHT = 188;

export function ShelfCard({ shelves, isMobile }: { shelves: Shelf[]; isMobile: boolean }) {
  const [tab, setTab] = useState(0);
  const [indices, setIndices] = useState(() => shelves.map(() => 0));
  const textRef = useRef<HTMLDivElement>(null);
  const shelf = shelves[tab];
  const idx = indices[tab];
  const { title, subtitle, badge } = shelf.item(idx);

  // Subtle GSAP crossfade whenever the displayed title/subtitle changes.
  useEffect(() => {
    if (!textRef.current) return;
    gsap.fromTo(textRef.current, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, [title, subtitle]);

  const next = () => setIndices((all) => all.map((v, i) => (i === tab ? (v + 1) % shelf.count : v)));
  const headingStyle = { fontSize: 12, letterSpacing: "-0.02em", background: "none", border: "none", padding: 0, color: colors.ink } as const;

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 16, width: "100%", height: SHELF_HEIGHT, backgroundColor: shelf.background, transition: "background 0.4s ease" }}>
      {shelf.panel(idx)}

      <div style={{ position: "absolute", left: 170, top: 16, right: isMobile ? 12 : 16, height: SHELF_HEIGHT - 32, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {shelves.length === 1 ? (
            <p className="font-caslon" style={{ ...headingStyle, fontStyle: "italic" }}>{shelf.label}</p>
          ) : (
            shelves.map((sh, i) => (
              <button
                key={sh.label}
                onClick={() => setTab(i)}
                className="font-caslon"
                style={{ ...headingStyle, cursor: "pointer", fontStyle: i === tab ? "italic" : "normal", textDecoration: i === tab ? "underline" : "none" }}
              >
                {sh.label}
              </button>
            ))
          )}
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
          <div ref={textRef} style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
            {badge && (
              <span style={{ alignSelf: "flex-start", backgroundColor: colors.pink, borderRadius: 20, padding: "2px 8px", marginBottom: 2 }}>
                <span className="font-inclusive-sans font-normal" style={{ fontSize: 9, letterSpacing: "0.5px", textTransform: "uppercase", color: colors.ink }}>{badge}</span>
              </span>
            )}
            <p className="font-caslon not-italic" style={{ fontSize: 16, lineHeight: "20px", fontWeight: 600, color: colors.ink }}>{title}</p>
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
  background: colors.pinkLight,
  arrowFill: colors.pink,
  panel: (i) => <BooksPanel activeIdx={i} />,
  item: (i) => ({ title: BOOKS[i].title, subtitle: BOOKS[i].author.toUpperCase(), badge: BOOKS[i].reading ? "reading now" : undefined }),
};
export const MOVIES_SHELF: Shelf = {
  label: "Movies",
  count: MOVIES.length,
  background: colors.sand,
  arrowFill: colors.orange,
  panel: (i) => <MoviesPanel activeIdx={i} />,
  item: (i) => ({ title: MOVIES[i].title, subtitle: MOVIES[i].year }),
};
export const RESOURCES_SHELF: Shelf = {
  label: "Resources",
  count: RESOURCES.length,
  background: colors.sandLight,
  arrowFill: colors.oliveDeep,
  panel: (i) => <ResourcesPanel activeIdx={i} />,
  item: (i) => ({ title: RESOURCES[i].title, subtitle: RESOURCES[i].kind }),
};

// Resources: same stacked-tile carousel, with placeholder tiles until real artwork lands.

function ResourcesPanel({ activeIdx }: { activeIdx: number }) {
  const total = RESOURCES.length;
  const prevIdx = (activeIdx - 1 + total) % total;
  const nextIdx = (activeIdx + 1) % total;

  return (
    <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", overflow: "hidden", width: 154, height: 188, backgroundColor: colors.oliveLight }}>
      {[prevIdx, activeIdx, nextIdx].map((idx, i) => {
        const slot: BookSlot = i === 0 ? "left" : i === 1 ? "center" : "right";
        const resource = RESOURCES[idx];
        return (
          <div
            key={idx}
            style={{
              position: "absolute", width: 80, height: 120, borderRadius: 1.4, overflow: "hidden",
              transition: "transform 0.4s cubic-bezier(0.25,0.1,0.25,1), opacity 0.4s cubic-bezier(0.25,0.1,0.25,1)",
              boxShadow: "2.78px 2.78px 1.39px rgba(40,40,20,0.14), 2.78px 5.56px 41.72px rgba(115,114,109,0.25)",
              ...bookSlotStyle(slot),
            }}
          >
            {resource.art ? (
              <img src={resource.art} alt={resource.title} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg, ${colors.sandLight}, ${colors.oliveLight})`, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 8px" }}>
                <span className="font-inclusive-sans font-normal uppercase" style={{ fontSize: 8, letterSpacing: "0.5px", textAlign: "center", color: colors.oliveDeep }}>{resource.kind}</span>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ position: "absolute", bottom: 9, left: 64, display: "flex", alignItems: "center", gap: 4 }}>
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: colors.oliveDeep }}>{activeIdx + 1}</span>
        <span style={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: withAlpha(colors.oliveDeep, 0.3) }} />
        <span className="font-inclusive-sans font-medium" style={{ fontSize: 10, lineHeight: 1, color: withAlpha(colors.oliveDeep, 0.5) }}>{total}</span>
      </div>
    </div>
  );
}
