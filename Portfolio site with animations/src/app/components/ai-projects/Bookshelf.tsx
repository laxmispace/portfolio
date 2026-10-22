import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, useVelocity } from "motion/react";
import { BOOKS } from "@/app/data/shelf";
import { colors, withAlpha } from "@/app/theme/tokens";
import woodImg from "@/assets/guestbook/wood@2x.jpg";

// Real-looking books - cloth-bound, some fat, some thin, foil or paper-label titles - on a
// plank of the guestbook's wood. Hover a book (tap, on a phone) and it turns round where it
// stands to show its cover; a cover is far wider than a spine, so it shoves its neighbours
// aside. The push travels outwards a beat at a time, heavier books are slower to get
// going, and each book's top lags behind its feet as it slides, then wobbles upright.
// Let go and it turns back, and they all slide home.

const W = 460;
const H = 320;
const ROW_BOTTOM = 44;
const PLANK_H = 12;
const GAP = 2;

type Finish = "foil" | "label" | "plain";
interface Look {
  bg: string;
  ink: string;
  height: number;
  spine: number;
  finish: Finish;
}

const FOIL = "#D8B46C";
const LOOKS: Look[] = [
  { bg: "#6B2A2A", ink: FOIL, height: 204, spine: 52, finish: "foil" },
  { bg: "#E4D6BA", ink: "#3A2E22", height: 182, spine: 22, finish: "label" },
  { bg: "#2F4A3A", ink: FOIL, height: 214, spine: 40, finish: "foil" },
  { bg: "#B8893B", ink: "#2A2015", height: 176, spine: 30, finish: "plain" },
  { bg: "#22314A", ink: FOIL, height: 198, spine: 58, finish: "foil" },
  { bg: "#A67B52", ink: "#F3E8D6", height: 188, spine: 20, finish: "plain" },
  { bg: "#2E5257", ink: FOIL, height: 206, spine: 36, finish: "label" },
];
const SHELF_BOOKS = BOOKS.slice(0, LOOKS.length);
const coverWidth = (l: Look) => Math.round(l.height * 0.66);
const massOf = (l: Look) => (l.height * l.spine) / (195 * 38);

// cloth grain, as a tiled noise image
const CLOTH = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.32 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>",
).replace(/%2523/g, "%23")}")`;
const WEAVE = "repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0 1px, transparent 1px 3px)";

/** where each book's centre sits, with `open` turned cover-out (so as wide as its cover) */
function slots(open: number | null) {
  const widths = LOOKS.map((l, i) => (i === open ? coverWidth(l) : l.spine));
  const total = widths.reduce((a, b) => a + b, 0) + GAP * (widths.length - 1);
  let x = (W - total) / 2;
  return widths.map((w) => {
    const c = x + w / 2;
    x += w + GAP;
    return c;
  });
}

function Band({ at, ink }: { at: "top" | "bottom"; ink: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        [at]: 14,
        height: 7,
        background: `linear-gradient(180deg, ${withAlpha(colors.white, 0.18)}, ${withAlpha(colors.ink, 0.28)})`,
        boxShadow: `0 1px 0 ${withAlpha(ink, 0.25)}`,
      }}
    />
  );
}

function BookBox({ index, look, open }: { index: number; look: Look; open: boolean }) {
  const book = SHELF_BOOKS[index];
  const { bg, ink, height: Hb, spine: S, finish } = look;
  const D = coverWidth(look);
  const fat = S >= 40;
  const face = { position: "absolute" as const, backfaceVisibility: "hidden" as const, WebkitBackfaceVisibility: "hidden" as const };
  const cloth = `${CLOTH}, ${WEAVE}`;
  const foilText = finish === "foil" ? { textShadow: `0 1px 0 ${withAlpha(colors.ink, 0.35)}` } : {};

  return (
    <div className="lab-own" style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `translateZ(${-D / 2}px)` }}>
      {/* spine */}
      <div
        style={{
          ...face,
          inset: 0,
          transform: `translateZ(${D / 2}px)`,
          borderRadius: "3px 3px 2px 2px",
          overflow: "hidden",
          background: `${cloth}, linear-gradient(90deg, ${withAlpha(colors.white, 0.2)} 0, ${withAlpha(colors.white, 0)} 28%, ${withAlpha(colors.ink, 0)} 62%, ${withAlpha(colors.ink, 0.34)} 100%), ${bg}`,
          boxShadow: `inset 0 2px 0 ${withAlpha(colors.white, 0.12)}, inset 0 -2px 0 ${withAlpha(colors.ink, 0.25)}`,
        }}
      >
        <Band at="top" ink={ink} />
        <Band at="bottom" ink={ink} />
        {finish === "label" ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: Math.max(14, S - 8),
              height: Math.min(110, Hb - 70),
              borderRadius: 2,
              background: "#F2EADB",
              boxShadow: `0 0 0 1px ${withAlpha(colors.ink, 0.15)}, inset 0 0 6px ${withAlpha("#8a6d3b", 0.25)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <span style={{ writingMode: "vertical-rl", fontSize: S < 26 ? 8 : 10, fontWeight: 600, color: "#2a2015", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxHeight: "92%" }}>
              {book.title}
            </span>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: "34px 0 38px", display: "flex", justifyContent: "center", overflow: "hidden" }}>
            <span
              style={{
                writingMode: "vertical-rl",
                fontSize: fat ? 15 : S < 26 ? 9 : 11,
                lineHeight: `${S}px`,
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: ink,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textTransform: fat ? "none" : "uppercase",
                ...foilText,
              }}
            >
              {book.title}
            </span>
          </div>
        )}
        <span style={{ position: "absolute", left: 0, right: 0, bottom: 24, textAlign: "center", fontSize: 6, letterSpacing: "0.08em", color: withAlpha(finish === "label" ? "#F2EADB" : ink, 0.75), textTransform: "uppercase" }}>
          {S >= 26 ? book.author.split(" ").pop() : ""}
        </span>
      </div>

      {/* front cover */}
      <div
        style={{
          ...face,
          left: (S - D) / 2,
          top: 0,
          width: D,
          height: Hb,
          transform: `rotateY(90deg) translateZ(${S / 2}px)`,
          borderRadius: "2px 4px 4px 2px",
          overflow: "hidden",
          background: `${cloth}, radial-gradient(120% 80% at 25% 15%, ${withAlpha(colors.white, 0.14)}, transparent 60%), ${bg}`,
          boxShadow: open ? `0 22px 36px ${withAlpha(colors.ink, 0.32)}` : "none",
          transition: "box-shadow 0.5s ease",
        }}
      >
        {open && (
          <div style={{ position: "absolute", inset: 10, border: `1px solid ${withAlpha(ink, 0.45)}`, borderRadius: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", padding: "22px 10px 14px", textAlign: "center" }}>
            <span style={{ fontSize: 16, lineHeight: "19px", fontWeight: 700, color: finish === "label" ? "#F2EADB" : ink, ...foilText }}>{book.title}</span>
            <span style={{ width: 18, height: 1, background: withAlpha(ink, 0.5) }} />
            <span style={{ fontSize: 7, letterSpacing: "0.12em", textTransform: "uppercase", color: withAlpha(finish === "label" ? "#F2EADB" : ink, 0.85) }}>{book.author}</span>
          </div>
        )}
        <div style={{ position: "absolute", top: 0, left: 5, width: 2, height: "100%", background: withAlpha(colors.ink, 0.3), filter: "blur(1.2px)" }} />
      </div>

      {/* back cover, fore-edge, top edge */}
      <div style={{ ...face, left: (S - D) / 2, top: 0, width: D, height: Hb, transform: `rotateY(-90deg) translateZ(${S / 2}px)`, background: `${cloth}, ${bg}`, filter: "brightness(0.82)" }} />
      <div style={{ ...face, inset: 0, transform: `rotateY(180deg) translateZ(${D / 2}px)`, background: "repeating-linear-gradient(90deg, #f3ece2 0 1px, #e3d7c6 1px 2px)" }} />
      <div
        style={{
          ...face,
          left: 0,
          top: (Hb - D) / 2,
          width: S,
          height: D,
          transform: `rotateX(90deg) translateZ(${Hb / 2}px)`,
          background: "repeating-linear-gradient(0deg, #f3ece2 0 1px, #e2d5c3 1px 2px)",
          boxShadow: `inset 0 0 0 2px ${bg}`,
        }}
      />
    </div>
  );
}

function ShelfBook({
  index,
  x,
  delay,
  open,
  onHover,
  onTap,
}: {
  index: number;
  x: number;
  delay: number;
  open: boolean;
  onHover: () => void;
  onTap: () => void;
}) {
  const look = LOOKS[index];
  const mass = massOf(look);
  // its slide along the shelf: a weighted spring, so it overshoots a touch and settles
  const sx = useSpring(x, { stiffness: 170, damping: 18, mass });
  useEffect(() => {
    const t = window.setTimeout(() => sx.set(x), delay);
    return () => window.clearTimeout(t);
  }, [x, delay, sx]);
  // inertia: the top lags behind the feet while it slides, then springs upright
  const vx = useVelocity(sx);
  const lag = useTransform(vx, (v) => Math.max(-9, Math.min(9, -v * 0.022)));
  const tilt = useSpring(lag, { stiffness: 300, damping: 13, mass });
  const pointer = useRef("mouse");

  return (
    <motion.div
      onPointerDown={(e) => (pointer.current = e.pointerType)}
      onPointerEnter={(e) => e.pointerType === "mouse" && onHover()}
      onClick={() => pointer.current !== "mouse" && onTap()}
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width: look.spine,
        height: look.height,
        marginLeft: -look.spine / 2,
        x: sx,
        rotateZ: tilt,
        transformOrigin: "50% 100%",
        transformStyle: "preserve-3d",
        zIndex: open ? 5 : 1,
        cursor: "pointer",
      }}
    >
      <motion.div
        initial={false}
        animate={open ? { rotateY: -90, z: 22, y: [null, -9, 0] } : { rotateY: 0, z: 0, y: 0 }}
        transition={{
          rotateY: { type: "spring", stiffness: 110, damping: 15, mass },
          z: { type: "spring", stiffness: 160, damping: 18 },
          y: { duration: 0.6, times: [0, 0.4, 1], ease: "easeInOut" },
        }}
        style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transformOrigin: `50% 50% ${-coverWidth(look) / 2}px` }}
      >
        <BookBox index={index} look={look} open={open} />
      </motion.div>
    </motion.div>
  );
}

function Shelf() {
  const [open, setOpen] = useState<number | null>(null);
  const last = useRef(0);
  if (open !== null) last.current = open;
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);
  // small delays, so brushing across the shelf doesn't set every book spinning
  const choose = (i: number | null, wait: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(i), wait);
  };

  const xs = slots(open);
  // the push (or the settling back) travels outwards from the book that turned
  const origin = open ?? last.current;

  return (
    <div style={{ position: "relative", width: W, height: H }}>
      <div
        aria-hidden
        style={{ position: "absolute", left: 30, right: 30, bottom: ROW_BOTTOM - 2, height: 150, background: `radial-gradient(60% 100% at 50% 100%, ${withAlpha(colors.ink, 0.1)}, transparent 70%)` }}
      />
      <div
        onPointerLeave={(e) => e.pointerType === "mouse" && choose(null, 200)}
        style={{ position: "absolute", left: 0, right: 0, bottom: ROW_BOTTOM, height: 240, perspective: 1400, perspectiveOrigin: "50% 35%", zIndex: 2 }}
      >
        {LOOKS.map((_, i) => (
          <ShelfBook
            key={i}
            index={i}
            x={xs[i]}
            delay={i === origin ? 0 : 60 + Math.abs(i - origin) * 50}
            open={open === i}
            onHover={() => choose(i, open === null ? 90 : 150)}
            onTap={() => choose(open === i ? null : i, 0)}
          />
        ))}
      </div>
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 14,
          right: 14,
          bottom: ROW_BOTTOM - PLANK_H,
          height: PLANK_H,
          zIndex: 1,
          borderRadius: 2,
          backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.22) 0, rgba(0,0,0,0) 3px, rgba(0,0,0,0) calc(100% - 4px), rgba(0,0,0,0.42) 100%), url(${woodImg})`,
          backgroundSize: `100% 100%, auto ${PLANK_H}px`,
          backgroundRepeat: "no-repeat, repeat-x",
          boxShadow: `0 12px 16px ${withAlpha(colors.ink, 0.2)}`,
        }}
      />
    </div>
  );
}

export function Bookshelf() {
  return <Shelf />;
}

export const BOOKSHELF_SIZE = { w: W, h: H };
