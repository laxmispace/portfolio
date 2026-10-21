import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { useIsMobile } from "@/app/hooks/useIsMobile";
import { useScrollContainer } from "@/app/context/ScrollContext";
import { colors, fonts, textStyles, withAlpha } from "@/app/theme/tokens";
import { SquiggleLink } from "@/app/components/ui/Buttons";
import { toCss } from "@/app/lib/zoom";
import { PHOTO_PLACES } from "@/app/data/aboutPhotos";

// "Beyond pixels": one centred paragraph about life outside design. Every word starts
// in light olive (#D2CE93) and fills to ink (#212012), one after another, as the paragraph scrolls up the screen.
// Six small illustrations sit inline after a few words and fill in with them; hovering one
// (tapping, on phones) pops up its photos at their real proportions over a softly blurred page.
//   icons:  src/assets/about-icons/<n>.png - 200px copies of the originals in
//           src/assets/about me text icons/ (1 sketching, 2 print, 3 travel, 4 hackathon,
//           5 food, 6 home)
//   photos: src/assets/about-photos/<n>.<k>.jpg - 1200px copies of the originals in
//           src/assets/my-photos/ ("1.1 Sketching…" → 1.1.jpg), "1.1", "1.2" … for icon 1
const iconFiles = import.meta.glob<string>("@/assets/about-icons/*.png", { eager: true, query: "?url", import: "default" });
const iconFor = (n: number) => iconFiles[`/src/assets/about-icons/${n}.png`];
const photoFiles = import.meta.glob<string>("@/assets/about-photos/*.jpg", { eager: true, query: "?url", import: "default" });
type Photo = { id: string; url: string };
const PHOTOS: Record<number, Photo[]> = {};
Object.entries(photoFiles)
  .map(([path, url]) => ({ m: path.split("/").pop()!.match(/^(\d+)\.(\d+)\.\w+$/), url }))
  .filter((x) => x.m)
  .sort((a, b) => Number(a.m![2]) - Number(b.m![2]))
  .forEach(({ m, url }) => (PHOTOS[Number(m![1])] ??= []).push({ id: `${m![1]}.${m![2]}`, url }));

const PLACES = PHOTO_PLACES;

type Segment = { text: string } | { icon: number; label: string };

// ── The copy ──────────────────────────────────────────────────────────────────
const COPY: Segment[] = [
  { text: "I make things when I’m not designing. Origami, sketching in tiny rectangles" },
  { icon: 1, label: "sketching" },
  { text: ", giftable stationery, wood carve prints" },
  { icon: 2, label: "wood carve prints" },
  { text: ". Solo trips" },
  { icon: 3, label: "solo trips" },
  { text: "to other countries on a whim, no itinerary, just an art or music event and whoever I meet along the way. Hackathons" },
  { icon: 4, label: "hackathons" },
  { text: "to challenge how I think. Homemade bowls" },
  { icon: 5, label: "homemade bowls" },
  { text: ", fiction at night, and a growing list of plants" },
  { icon: 6, label: "home and plants" },
  { text: "I’m very attached to. Low stakes, full joy." },
];

const UNFILLED = colors.oliveLight; // #D2CE93 - a word's colour before the fill reaches it
const FADED = 0.35; // an icon's opacity before the fill reaches it
const SPREAD = 0.08; // how soft the fill's leading edge is (share of the paragraph)

/** Turns scroll progress into a word's fill: faded until the fill reaches it, then full. */
function useFill(progress: MotionValue<number>, at: number) {
  return useTransform(progress, [at - SPREAD, at], [FADED, 1]);
}

function Word({ word, at, progress, space }: { word: string; at: number; progress: MotionValue<number>; space: boolean }) {
  const color = useTransform(progress, [at - SPREAD, at], [UNFILLED, colors.ink]);
  return <motion.span style={{ color }}>{word}{space ? " " : ""}</motion.span>;
}

/** Hovering with a mouse (or trackpad): photos open on hover rather than tap. */
function useFinePointer() {
  const query = "(hover: hover) and (pointer: fine)";
  const [fine, setFine] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setFine(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return fine;
}

/** An inline icon, 12px taller than the text; it fills in with the word before it. `hug`
 *  drops the gap after it when punctuation follows (", giftable…"). */
function Icon({ n, label, at, progress, hug, finePointer, onOpen, onClose }: {
  n: number; label: string; at: number; progress: MotionValue<number>; hug: boolean;
  finePointer: boolean; onOpen: () => void; onClose: () => void;
}) {
  const opacity = useFill(progress, at);
  const src = iconFor(n);
  if (!src) return hug ? null : <span> </span>;
  const hasPhotos = !!PHOTOS[n]?.length;
  return (
    <motion.button
      type="button"
      aria-label={hasPhotos ? `See photos: ${label}` : label}
      onMouseEnter={() => { if (finePointer && hasPhotos) onOpen(); }}
      onMouseLeave={() => { if (finePointer) onClose(); }}
      onClick={() => { if (!finePointer && hasPhotos) onOpen(); }}
      whileHover={{ scale: 1.12, rotate: -4 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
      style={{
        display: "inline-block", verticalAlign: "-0.2em", height: "calc(1em + 12px)", padding: 0, border: "none", background: "none",
        margin: `0 ${hug ? "0.04em" : "0.22em"} 0 0.16em`, cursor: hasPhotos ? "zoom-in" : "default", fontSize: "inherit", opacity,
      }}
    >
      <img src={src} alt="" draggable={false} style={{ display: "block", height: "100%", width: "auto" }} />
    </motion.button>
  );
}

/** A stable pseudo-random number in [0, 1) for a string - so a photo's label spot and dot
 *  look random but stay put between renders and visits. */
function rand(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

/** Plans the labels: each place is written once, under one of its photos picked at random,
 *  at a random spot along its bottom edge; photos sharing a place are tied together. */
function planLabels(photos: Photo[]) {
  const groups = new Map<string, string[]>();
  photos.forEach((p) => { const place = PLACES[p.id]; if (place) groups.set(place, [...(groups.get(place) ?? []), p.id]); });
  const labelOn = new Map<string, { place: string; align: "flex-start" | "center" | "flex-end"; tilt: number }>();
  groups.forEach((ids, place) => {
    const host = ids[Math.floor(rand(place) * ids.length)];
    const r = rand(place + "~");
    labelOn.set(host, { place, align: r < 0.34 ? "flex-start" : r < 0.67 ? "center" : "flex-end", tilt: (rand(place + "^") - 0.5) * 5 });
  });
  return { labelOn, groups: [...groups.values()].filter((ids) => ids.length > 1) };
}

function Caption({ label, small }: { label: { place: string; align: string; tilt: number } | undefined; small: boolean }) {
  if (!label) return null;
  return (
    <figcaption style={{ display: "flex", justifyContent: label.align, width: "100%", paddingTop: 8, color: colors.ink }}>
      <span style={{ display: "flex", alignItems: "flex-start", gap: 4, maxWidth: "100%", transform: `rotate(${label.tilt}deg)` }}>
        {/* a little curl rising up to the photo */}
        <svg width="22" height="26" viewBox="0 0 22 26" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: -6 }}>
          <path d="M18 24C9 23 4 17 6 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M2 8L6 3l4 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontFamily: fonts.hand, fontSize: small ? 18 : 20, lineHeight: small ? "18px" : "20px", textWrap: "balance" }}>{label.place}</span>
      </span>
    </figcaption>
  );
}

/** The photos on their own, at their own proportions, over a softly blurred page: a row
 *  (up to 3 across) on desktop, a two-column collage on phones. Each place is written once;
 *  photos from the same event get a small dot, joined by a dashed thread.
 *  Hover-opened ones (desktop) let the pointer through. */
function Lightbox({ photos, finePointer, onClose }: { photos: Photo[] | null; finePointer: boolean; onClose: () => void }) {
  const isMobile = useIsMobile();
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef(new Map<string, HTMLImageElement>());
  const [threads, setThreads] = useState<{ x: number; y: number }[][]>([]);
  const plan = photos ? planLabels(photos) : null;

  useEffect(() => {
    if (!photos) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photos, onClose]);

  // Measure where each grouped photo sits (once they've settled) and thread its dots together.
  useEffect(() => {
    setThreads([]);
    if (!photos || !plan?.groups.length) return;
    const measure = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const w = wrap.getBoundingClientRect();
      setThreads(plan.groups.map((ids) => ids.flatMap((id) => {
        const img = imgRefs.current.get(id);
        if (!img) return [];
        const r = img.getBoundingClientRect();
        return [{ x: toCss(r.left - w.left + r.width * (0.25 + 0.5 * rand(id))), y: toCss(r.bottom - w.top) - 12 }];
      })));
    };
    const timers = [650, 1100].map((t) => window.setTimeout(measure, t));
    window.addEventListener("resize", measure);
    return () => { timers.forEach(clearTimeout); window.removeEventListener("resize", measure); };
  }, [photos, isMobile]);

  const cols = photos ? Math.min(photos.length, 3) : 1;
  const rows = photos ? Math.ceil(photos.length / 3) : 1;
  const LABEL_H = 50; // room left under each photo for a possible label (desktop rows)

  return createPortal(
    <AnimatePresence>
      {photos && plan && (
        <motion.div
          key="about-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          role="dialog"
          style={{
            position: "fixed", inset: 0, zIndex: 9500, overflowY: isMobile ? "auto" : "hidden",
            display: "flex", padding: 16,
            background: withAlpha(colors.sand, 0.35), backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)",
            pointerEvents: finePointer ? "none" : "auto",
          }}
        >
          <div
            ref={wrapRef}
            style={
              isMobile
                ? { position: "relative", margin: "auto", width: "100%", columnCount: photos.length > 1 ? 2 : 1, columnGap: 10 }
                : { position: "relative", margin: "auto", display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "center", gap: 16, maxWidth: 1200 }
            }
          >
            {photos.map((photo, i) => (
              <motion.figure
                key={photo.id}
                initial={{ scale: 0.55, y: 30, rotate: i % 2 ? 6 : -6, opacity: 0 }}
                animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.7, y: 20, opacity: 0, transition: { duration: 0.18 } }}
                transition={{ type: "spring", stiffness: 300, damping: 22, delay: i * 0.05 }}
                style={{
                  margin: 0, display: "flex", flexDirection: "column", alignItems: "stretch",
                  ...(isMobile ? { breakInside: "avoid", marginBottom: 10 } : { minHeight: undefined }),
                }}
              >
                <img
                  ref={(el) => { if (el) imgRefs.current.set(photo.id, el); else imgRefs.current.delete(photo.id); }}
                  src={photo.url}
                  alt={PLACES[photo.id] ?? ""}
                  style={{
                    display: "block", borderRadius: 8, boxShadow: `0 18px 44px ${withAlpha(colors.ink, 0.28)}`,
                    ...(isMobile
                      ? { width: "100%", height: "auto", maxHeight: photos.length > 1 ? undefined : "78vh", objectFit: "cover" }
                      : {
                          width: "auto", height: "auto",
                          // each photo keeps its own shape; up to 3 to a row, rows share the height
                          maxHeight: `calc((min(80vh, 760px) - ${16 * (rows - 1) + LABEL_H * rows}px) / ${rows})`,
                          maxWidth: `calc((min(100vw, 1200px) - ${32 + 16 * (cols - 1)}px) / ${cols})`,
                        }),
                  }}
                />
                <Caption label={plan.labelOn.get(photo.id)} small={isMobile} />
              </motion.figure>
            ))}

            {/* dots on photos from the same event, joined by a dashed thread */}
            {threads.length > 0 && (
              <motion.svg
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }}
              >
                {threads.map((pts, g) => (
                  <g key={g}>
                    {pts.length > 1 && (
                      <path
                        d={pts.map((p, k) => {
                          if (!k) return `M${p.x} ${p.y}`;
                          const a = pts[k - 1];
                          // the thread sags a little between dots
                          return `Q${(a.x + p.x) / 2} ${Math.max(a.y, p.y) + 26} ${p.x} ${p.y}`;
                        }).join(" ")}
                        fill="none" stroke={colors.ink} strokeWidth={1.5} strokeDasharray="4 4" strokeLinecap="round" opacity={0.75}
                      />
                    )}
                    {pts.map((p, k) => (
                      <circle key={k} cx={p.x} cy={p.y} r={4.5} fill={colors.orange} stroke={colors.sandLight} strokeWidth={2} />
                    ))}
                  </g>
                ))}
              </motion.svg>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

interface PersonalSectionProps {
  onAboutOpen?: () => void;
}

export function PersonalSection({ onAboutOpen }: PersonalSectionProps) {
  const isMobile = useIsMobile();
  const reduce = useReducedMotion();
  const finePointer = useFinePointer();
  const [open, setOpen] = useState<Photo[] | null>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  // How much of the paragraph has passed a reading line 72% of the way down the visible
  // area: words above the line are filled. (Rect maths only, so the desktop zoom cancels out.)
  const scroller = useScrollContainer();
  const progress = useMotionValue(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) { progress.set(1); return; }
    if (!scroller) return;
    const update = () => {
      const t = textRef.current?.getBoundingClientRect();
      const c = scroller.getBoundingClientRect();
      if (!t || !t.height) return;
      progress.set(Math.min(1, Math.max(0, (c.top + c.height * 0.72 - t.top) / t.height)));
    };
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { scroller.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [scroller, reduce, progress]);

  // Every word gets the point (0-1) at which the fill reaches it; an icon takes the point
  // of the word before it.
  const words = COPY.reduce((n, s) => n + ("text" in s ? s.text.trim().split(/\s+/).length : 0), 0);
  let w = 0;
  let last = 0;
  const at = () => (last = ++w / words);

  return (
    <section style={{ padding: isMobile ? "40px 20px 32px" : "72px 48px 64px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <p style={{ ...textStyles.label, color: colors.oliveDeep, marginBottom: isMobile ? 16 : 24 }}>
        beyond pixels
      </p>

      <p
        ref={textRef}
        data-no-reveal
        className="font-caslon"
        style={{ maxWidth: 1000, fontSize: isMobile ? 26 : 52, lineHeight: isMobile ? "38px" : "70px", fontWeight: 500, letterSpacing: "calc(-0.03em - 0.25px)", color: colors.ink }}
      >
        {COPY.map((s, i) => {
          const next = COPY[i + 1];
          if ("icon" in s) {
            const hug = !!next && "text" in next && /^[,.;:!?]/.test(next.text);
            return (
              <Icon
                key={i} n={s.icon} label={s.label} at={last} progress={progress} hug={hug}
                finePointer={finePointer} onOpen={() => setOpen(PHOTOS[s.icon] ?? null)} onClose={() => setOpen(null)}
              />
            );
          }
          const parts = s.text.trim().split(/\s+/);
          const beforeIcon = !!next && "icon" in next;
          return (
            <span key={i}>
              {parts.map((word, k) => (
                <Word key={k} word={word} at={at()} progress={progress} space={k < parts.length - 1 || !beforeIcon} />
              ))}
            </span>
          );
        })}
      </p>

      {onAboutOpen && (
        <div style={{ marginTop: isMobile ? 32 : 40 }}>
          <SquiggleLink onClick={onAboutOpen} style={{ fontSize: isMobile ? 20 : 24, lineHeight: isMobile ? "28px" : "32px" }}>work experience</SquiggleLink>
        </div>
      )}

      <Lightbox photos={open} finePointer={finePointer} onClose={() => setOpen(null)} />
    </section>
  );
}
