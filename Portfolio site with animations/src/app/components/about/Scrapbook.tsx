import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { colors, fonts, withAlpha } from "@/app/theme/tokens";

// ── Scrapbook ────────────────────────────────────────────────────────────────────
// One short scrapbook row of photos you swipe (or drag) through sideways, so it takes
// little height. Each photo keeps its own shape - nothing cropped, no borders - and is
// held on by a strip of washi tape, a little crooked, overlapping its neighbours.
//   in     - when it scrolls into view the photos land one after another and the tape
//            is smoothed on over each
//   scroll - while you swipe, the photos lean with the motion and spring back upright
//   focus  - no tapping needed: whichever photo is nearest the middle of the row (or under
//            the mouse) lifts a little, straightens, and a kraft-paper tag with a handwritten
//            note of where it was taken slides out from under it.

export interface ScrapPhoto {
  id: string;
  src: string;
  /** natural size - sets each photo's shape before it loads */
  w: number;
  h: number;
  place?: string;
}

/** A faint paper grain - the scrapbook page. */
export const PAPER_GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.3 0 0 0 0 0.28 0 0 0 0 0.2 0 0 0 0.09 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")`;

// washi tape in the site's colours, see-through like the real thing
const TAPES = [withAlpha(colors.pink, 0.72), withAlpha(colors.olive, 0.72), withAlpha(colors.orangeLight, 0.7), withAlpha(colors.pinkLight, 0.8)];
// torn ends: a little zigzag at both short edges
const TAPE_CLIP =
  "polygon(0% 0%, 4% 12%, 0% 25%, 4% 37%, 0% 50%, 4% 62%, 0% 75%, 4% 87%, 0% 100%, 100% 100%, 96% 87%, 100% 75%, 96% 62%, 100% 50%, 96% 37%, 100% 25%, 96% 12%, 100% 0%)";
const KRAFT = "#C8A47C";

function seeded(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
}
const spread = (key: string, amount: number) => (seeded(key) - 0.5) * 2 * amount;

export function Scrapbook({ photos, isMobile }: { photos: ScrapPhoto[]; isMobile: boolean }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<string, HTMLDivElement>());
  const tapes = useRef(new Map<string, HTMLSpanElement>());
  const [centred, setCentred] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const dragged = useRef(false);

  // portraits stand at full height; landscapes a bit shorter, so the row reads as a collage
  const H = isMobile ? 168 : 200;
  const sizeOf = (p: ScrapPhoto) => {
    const portrait = p.h >= p.w;
    const h = portrait ? H : Math.round(H * 0.8);
    return { w: Math.round((h * p.w) / p.h), h };
  };
  const ROW_H = H + 56;

  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── in: land one after another, then the tape goes on ──
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const all = photos.map((p) => ({ p, card: cards.current.get(p.id)!, tape: tapes.current.get(p.id)! }));
    if (reduced) return;
    all.forEach(({ card, tape }) => {
      gsap.set(card, { opacity: 0 });
      gsap.set(tape, { scaleX: 0 });
    });
    let done = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done) return;
        done = true;
        io.disconnect();
        all.forEach(({ p, card, tape }, i) => {
          const at = i * 0.11;
          gsap.fromTo(
            card,
            { opacity: 0, y: -50, rotation: spread(p.id + "in", 18), scale: 1.12 },
            { opacity: 1, y: 0, rotation: 0, scale: 1, duration: 0.75, delay: at, ease: "back.out(1.6)" },
          );
          gsap.to(tape, { scaleX: 1, duration: 0.35, delay: at + 0.45, ease: "power2.out" });
        });
        // a little nudge along, so it's clear the row moves
        if (el.scrollWidth > el.clientWidth + 40) {
          const proxy = { x: 0 };
          gsap.to(proxy, {
            x: 56,
            duration: 0.7,
            delay: all.length * 0.11 + 0.5,
            ease: "power2.inOut",
            yoyo: true,
            repeat: 1,
            onUpdate: () => (el.scrollLeft = proxy.x),
          });
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      all.forEach(({ card, tape }) => gsap.killTweensOf([card, tape]));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos]);

  // ── scroll: photos lean with the swipe and spring back ──
  useEffect(() => {
    const el = scrollerRef.current;
    const track = trackRef.current;
    if (!el || !track || reduced) return;
    const leanTo = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3.out" });
    let last = el.scrollLeft;
    let lastT = performance.now();
    let settle = 0;
    const onScroll = () => {
      const now = performance.now();
      const v = (el.scrollLeft - last) / Math.max(8, now - lastT); // px per ms
      last = el.scrollLeft;
      lastT = now;
      leanTo(gsap.utils.clamp(-7, 7, -v * 6));
      window.clearTimeout(settle);
      settle = window.setTimeout(() => leanTo(0), 90);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.clearTimeout(settle);
      gsap.killTweensOf(track);
    };
  }, [reduced]);

  // ── focus: the photo nearest the middle of the row ──
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let frame = 0;
    const pick = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      const mid = box.left + box.width / 2;
      let best: string | null = null;
      let bestD = Infinity;
      cards.current.forEach((card, id) => {
        const r = card.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - mid);
        if (d < bestD) { bestD = d; best = id; }
      });
      setCentred(best);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(pick); };
    // wait for the photos to land before the first one is picked
    const first = window.setTimeout(pick, reduced ? 0 : photos.length * 110 + 900);
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearTimeout(first);
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos]);

  // ── drag to scroll with a mouse (touch and trackpads scroll natively) ──
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let start: { x: number; left: number } | null = null;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      start = { x: e.clientX, left: el.scrollLeft };
      dragged.current = false;
    };
    const move = (e: PointerEvent) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      if (Math.abs(dx) > 5) dragged.current = true;
      if (dragged.current) el.scrollLeft = start.left - dx;
    };
    const up = () => {
      start = null;
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <div>
      <div
        ref={scrollerRef}
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarWidth: "none",
          cursor: "grab",
          // the row fades out at both edges, so it reads as carrying on
          WebkitMaskImage: "linear-gradient(90deg, transparent 0, #000 28px, #000 calc(100% - 28px), transparent 100%)",
          maskImage: "linear-gradient(90deg, transparent 0, #000 28px, #000 calc(100% - 28px), transparent 100%)",
        }}
      >
        <div
          ref={trackRef}
          // room underneath for the place tag on the lowest photos (+8px breathing room), so nothing gets clipped
          style={{ display: "flex", alignItems: "center", height: ROW_H, boxSizing: "content-box", width: "max-content", padding: `8px ${isMobile ? 28 : 48}px ${isMobile ? 36 : 38}px` }}
        >
          {photos.map((p, i) => {
            const { w, h } = sizeOf(p);
            const tilt = spread(p.id + "tilt", 4.5);
            const lift = (i % 2 ? 1 : -1) * (isMobile ? 9 : 12) + spread(p.id + "y", 5);
            const tapeAngle = spread(p.id + "tape", 9);
            const tapeAt = 50 + spread(p.id + "tapeAt", 18);
            const on = (hovered ?? centred) === p.id;
            return (
              <div
                key={p.id}
                ref={(el) => {
                  if (el) cards.current.set(p.id, el);
                }}
                style={{
                  position: "relative",
                  flex: "0 0 auto",
                  width: w,
                  height: h,
                  marginLeft: i === 0 ? 0 : isMobile ? -14 : -18, // they overlap a little
                  top: lift, // up, down, up - like they were stuck on by hand
                  zIndex: on ? 30 : i % 2 ? 2 : 1,
                }}
              >
                <div
                  onMouseEnter={() => { if (!dragged.current) setHovered(p.id); }}
                  onMouseLeave={() => setHovered((h) => (h === p.id ? null : h))}
                  style={{
                    position: "relative", width: "100%", height: "100%",
                    // the one in focus lifts a touch and straightens up
                    transform: on ? "rotate(0deg) translateY(-6px) scale(1.04)" : `rotate(${tilt}deg)`,
                    transition: reduced ? undefined : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <img
                    src={p.src}
                    alt={p.place ?? ""}
                    draggable={false}
                    loading="lazy"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      display: "block",
                      borderRadius: 2,
                      boxShadow: on
                        ? `0 2px 4px ${withAlpha(colors.ink, 0.18)}, 0 14px 26px ${withAlpha(colors.ink, 0.2)}`
                        : `0 1px 2px ${withAlpha(colors.ink, 0.18)}, 0 8px 18px ${withAlpha(colors.ink, 0.14)}`,
                      transition: "box-shadow 0.5s ease",
                      userSelect: "none",
                    }}
                  />
                  {/* a kraft-paper tag with where it was taken, slid out from under the photo */}
                  {p.place && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute", left: "50%", bottom: isMobile ? -20 : -22, zIndex: 3, whiteSpace: "nowrap",
                        padding: isMobile ? "2px 10px 3px" : "3px 12px 4px", borderRadius: 2,
                        backgroundColor: KRAFT, backgroundImage: PAPER_GRAIN,
                        boxShadow: `0 2px 6px ${withAlpha(colors.ink, 0.18)}`,
                        fontFamily: fonts.hand, fontSize: isMobile ? 16 : 18, lineHeight: 1.15, color: colors.ink,
                        opacity: on ? 1 : 0,
                        transform: `translate(-50%, ${on ? 0 : -10}px) rotate(${on ? spread(p.id + "tag", 4) : 0}deg)`,
                        transition: reduced ? undefined : "opacity 0.3s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
                        pointerEvents: "none",
                      }}
                    >
                      {p.place}
                    </span>
                  )}
                  {/* the washi tape holding it on */}
                  <span
                    ref={(el) => {
                      if (el) tapes.current.set(p.id, el);
                    }}
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: `calc(${tapeAt}% - ${isMobile ? 26 : 32}px)`,
                      top: -9,
                      width: isMobile ? 52 : 64,
                      height: 18,
                      background: TAPES[i % TAPES.length],
                      clipPath: TAPE_CLIP,
                      transform: `rotate(${tapeAngle}deg)`,
                      transformOrigin: "0% 50%",
                      pointerEvents: "none",
                      zIndex: 2,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
