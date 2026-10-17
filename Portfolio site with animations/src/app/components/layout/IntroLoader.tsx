// Loading screen: the little walker strolls on a warm orange page (soft glow, paper
// grain), waving, and says "hey!" in a speech bubble. After one walk cycle a big pink
// flower (the outline of src/assets/loader/loading-flower.svg) blooms out of its
// waving hand, spinning, until it covers
// the whole screen, while a flock of birds flies out past the edges. Then a
// flower-shaped hole opens in the pink - with an olive layer trailing just behind
// it as a rim - and grows past the corners, revealing the hero.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import { Walker } from "@/app/components/walker/Walker";
import { colors, fonts, withAlpha } from "@/app/theme/tokens";
import flowerSvg from "@/assets/loader/loading-flower.svg?raw";

const WALK_MS = 2800; // the walker's stroll before the bloom
const BLOOM_S = 1.35; // the flower growing until it covers the screen
const OPEN_S = 1.05; // the flower-shaped hole opening to reveal the hero
const RIM_LAG_S = 0.14; // the olive layer's hole trails the pink one by this much
const STAGE = 190; // walker width on the loader
// Where the walker's waving palm sits inside its stage, as fractions of the SVG (≈150,146 in a -30 -45 700 635 box).
const BLOOM_AT = { x: (150 + 30) / 700, y: (146 + 45) / 635 };

// ── "hey!" speech bubble ──
function Hey() {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ scale: 0, opacity: 0, rotate: -12 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ scale: 0, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
      transition={{ type: "spring", stiffness: 520, damping: 17, delay: 0.45 }}
      style={{ position: "absolute", left: "calc(50% + 26px)", top: -50, width: 74, height: 48, transformOrigin: "14% 96%" }}
    >
      <motion.div
        animate={{ y: [0, -3, 0], rotate: [0, -2, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{ position: "relative", width: "100%", height: "100%" }}
      >
        <svg width="74" height="48" viewBox="0 0 74 48" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path
            d="M18 2H56A16 16 0 0 1 72 18V20A16 16 0 0 1 56 36H31L13 46L20 36H18A16 16 0 0 1 2 20V18A16 16 0 0 1 18 2Z"
            fill={colors.sandLight}
            stroke={colors.ink}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 2,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: fonts.hand,
            fontWeight: 700,
            fontSize: 25,
            lineHeight: 1,
            color: colors.ink,
            letterSpacing: "0.01em",
          }}
        >
          hey!
        </span>
      </motion.div>
    </motion.div>
  );
}

// ── the backdrop: a warm glow and paper grain (replaces the dotted grid) ──
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
)}")`;

function Backdrop() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundColor: colors.orange, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(60% 55% at 50% 46%, ${withAlpha(colors.orangeLight, 0.95)} 0%, ${withAlpha(colors.orangeLight, 0)} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 90% at 50% 50%, transparent 55%, ${withAlpha(colors.brown, 0.28)} 100%)` }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: GRAIN, backgroundSize: "180px 180px", opacity: 0.22, mixBlendMode: "multiply" }} />
    </div>
  );
}

// ── the bloom ──
// Only the flower's outline is used (the first subpath - the second is the hole at its
// heart), so the pink covers the screen solidly. Units are the SVG's own (1587×1153 frame).
const FLOWER_D = flowerSvg.match(/ d="([^"]+)"/)?.[1] ?? "";
const OUTLINE_D = FLOWER_D.slice(0, FLOWER_D.indexOf("M", 1) > 0 ? FLOWER_D.indexOf("M", 1) : undefined);
const FLOWER_FILL = flowerSvg.match(/fill="(#[0-9A-Fa-f]{3,8})"/)?.[1] ?? colors.pink;
const HEART = { x: 750, y: 620 }; // the flower's centre, which everything turns and grows around

// Nearest the outline comes to the heart: the flower covers a circle this big, times its scale.
let innerReach = 0;
function flowerInnerReach() {
  if (innerReach) return innerReach;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("style", "position:absolute;width:0;height:0;visibility:hidden");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", OUTLINE_D);
  svg.appendChild(path);
  document.body.appendChild(svg);
  const len = path.getTotalLength();
  let min = Infinity;
  for (let i = 0; i < 720; i++) {
    const p = path.getPointAtLength((len * i) / 720);
    min = Math.min(min, Math.hypot(p.x - HEART.x, p.y - HEART.y));
  }
  svg.remove();
  innerReach = Number.isFinite(min) && min > 0 ? min : 330;
  return innerReach;
}

interface BloomPlan {
  from: { x: number; y: number }; // the flower in the walker's hand
  to: { x: number; y: number }; // where the flower's heart ends up: the screen's centre
  cover: number; // scale at which the flower covers every corner
  spread: number; // how far the birds fly
}

function planBloom(from: { x: number; y: number }): BloomPlan {
  const w = innerWidth;
  const h = innerHeight;
  const to = { x: w / 2, y: h / 2 };
  const corner = Math.hypot(w / 2, h / 2);
  return { from, to, cover: (corner / flowerInnerReach()) * 1.06, spread: Math.min(1.3, Math.max(0.4, w / 1440)) };
}

function Bloom({ plan, still }: { plan: BloomPlan; still: boolean }) {
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 1587 1153"
      width="1587"
      height="1153"
      initial={{ x: plan.from.x - plan.to.x, y: plan.from.y - plan.to.y, scale: 0.012, rotate: -110 }}
      animate={{ x: 0, y: 0, scale: plan.cover * 1.15, rotate: 0 }}
      transition={{
        scale: { duration: still ? 0.3 : BLOOM_S, ease: [0.7, 0, 0.3, 1] },
        x: { duration: still ? 0.3 : BLOOM_S * 0.75, ease: [0.45, 0, 0.2, 1] },
        y: { duration: still ? 0.3 : BLOOM_S * 0.75, ease: [0.45, 0, 0.2, 1] },
        rotate: { duration: still ? 0.3 : BLOOM_S, ease: [0.3, 0, 0.2, 1] },
      }}
      style={{
        position: "absolute",
        left: plan.to.x - HEART.x,
        top: plan.to.y - HEART.y,
        overflow: "visible",
        transformOrigin: `${HEART.x}px ${HEART.y}px`,
        zIndex: 2,
        willChange: "transform",
      }}
    >
      <path d={OUTLINE_D} fill={FLOWER_FILL} />
    </motion.svg>
  );
}

// ── the reveal: a flower-shaped hole opens in the pink, an olive rim trailing it ──
function Iris({ plan, still }: { plan: BloomPlan; still: boolean }) {
  const pinkHole = useRef<SVGPathElement>(null);
  const oliveHole = useRef<SVGPathElement>(null);

  // grows from nothing at the heart to past every corner, turning a little as it goes
  const at = (t: number) =>
    `translate(${plan.to.x} ${plan.to.y}) rotate(${-30 + 75 * t}) scale(${Math.max(0.0001, t * plan.cover * 1.04)}) translate(${-HEART.x} ${-HEART.y})`;

  useEffect(() => {
    const place = (el: SVGPathElement | null, t: number) => el?.setAttribute("transform", at(t));
    const opts = { duration: still ? 0.3 : OPEN_S, ease: [0.65, 0, 0.35, 1] as [number, number, number, number] };
    const a = animate(0, 1, { ...opts, onUpdate: (t) => place(pinkHole.current, t) });
    const b = animate(0, 1, { ...opts, delay: still ? 0 : RIM_LAG_S, onUpdate: (t) => place(oliveHole.current, t) });
    return () => { a.stop(); b.stop(); };
  }, [plan, still]);

  return (
    <svg aria-hidden="true" width="100%" height="100%" style={{ position: "absolute", inset: 0, zIndex: 4 }}>
      <defs>
        <mask id="intro-iris-olive" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
          <rect width="100%" height="100%" fill="white" />
          <path ref={oliveHole} d={OUTLINE_D} fill="black" transform={at(0)} />
        </mask>
        <mask id="intro-iris-pink" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
          <rect width="100%" height="100%" fill="white" />
          <path ref={pinkHole} d={OUTLINE_D} fill="black" transform={at(0)} />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill={colors.olive} mask="url(#intro-iris-olive)" />
      <rect width="100%" height="100%" fill={FLOWER_FILL} mask="url(#intro-iris-pink)" />
    </svg>
  );
}

// ── the flock ──
const BIRDS = [
  { w: 77, h: 51, d: "M6 39.0005C12.9128 33.7561 16.3852 26.3805 29.7719 27.142C37.9463 27.607 41.9144 38.5573 44.8376 43.5177C46.9747 47.1441 50.5 39.1689 50.5 22.0005C50.5 14.0781 56.2929 10.0314 61.9919 7.63879C64.9181 6.70999 67.9137 6.36056 71 6.00055" },
  { w: 108, h: 54, d: "M6 25.5126C6 24.3846 9.0616 20.851 17.2596 16.1854C21.9654 13.5073 29.5145 14.0885 34.6887 15.9168C39.8629 17.7451 42.8771 21.7973 44.7426 25.7046C48.167 32.8767 47.8783 41.5943 48.0513 46.5714C48.1769 50.184 50.6898 34.348 55.989 24.5964C64.7811 13.7358 73.9687 7.22271 82.8552 6.21022C87.9693 5.86597 94.3105 5.86597 101.792 6.81384" },
  { w: 141, h: 65, d: "M6 58.1317C6 57.5629 8.33175 53.6681 13.7841 47.3339C24.2418 35.185 43.1508 39.8781 55.0917 41.7549C59.9777 42.5228 61.2317 47.3852 62.1938 47.4302C73.9906 47.9823 80.7279 15.6855 101.366 6.35446C107.832 5.81245 116.486 5.81245 122.418 6.91908C128.35 8.02571 131.298 10.239 134.335 12.5193" },
  { w: 86, h: 38, d: "M6.00195 7.65819C11.508 6.6108 24.9667 4.48428 32.2714 7.73072C42.6266 12.3329 41.732 27.8184 44.2866 31.606C52.2169 20.9271 61.319 11.6498 68.0454 8.90442C71.5585 7.96941 75.2741 7.96467 79.1024 7.95978" },
];
// Each bird: which drawing, where it ends up (relative to a 1440-wide screen), when it leaves, and how big.
const FLIGHTS = [
  { bird: 2, dx: 760, dy: -520, delay: 0.0, size: 0.55 },
  { bird: 0, dx: -640, dy: -470, delay: 0.08, size: 0.6 },
  { bird: 1, dx: 420, dy: -620, delay: 0.18, size: 0.5 },
  { bird: 3, dx: -820, dy: -200, delay: 0.26, size: 0.6 },
  { bird: 1, dx: 900, dy: -150, delay: 0.34, size: 0.42 },
  { bird: 0, dx: -260, dy: -640, delay: 0.42, size: 0.45 },
  { bird: 3, dx: 220, dy: -700, delay: 0.55, size: 0.38 },
];

function Flock({ at, spread }: { at: { x: number; y: number }; spread: number }) {
  return (
    <>
      {FLIGHTS.map((f, i) => {
        const b = BIRDS[f.bird];
        const goesLeft = f.dx < 0;
        return (
          <motion.div
            key={i}
            aria-hidden="true"
            initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
            animate={{ x: f.dx * spread, y: f.dy * spread, scale: 1, opacity: [0, 1, 1, 0.9] }}
            transition={{ duration: 2.2, delay: f.delay, ease: [0.3, 0.1, 0.4, 1] }}
            style={{ position: "absolute", left: at.x - (b.w * f.size) / 2, top: at.y - (b.h * f.size) / 2, zIndex: 5 }}
          >
            <motion.svg
              width={b.w * f.size}
              height={b.h * f.size}
              viewBox={`0 0 ${b.w} ${b.h}`}
              animate={{ scaleY: [1, 0.55, 1] }}
              transition={{ duration: 0.42, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
              style={{ display: "block", overflow: "visible", scaleX: goesLeft ? -1 : 1 }}
            >
              <path d={b.d} stroke={colors.sandLight} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </motion.svg>
          </motion.div>
        );
      })}
    </>
  );
}

export function IntroLoader({ onDone }: { onDone: () => void }) {
  const reduceMotion = !!useReducedMotion();
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const stageRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"walk" | "bloom" | "open" | "gone">("walk");
  const [plan, setPlan] = useState<BloomPlan | null>(null);

  // walk → bloom
  useEffect(() => {
    const t = setTimeout(() => {
      const r = stageRef.current?.getBoundingClientRect();
      const hand = r
        ? { x: r.left + r.width * BLOOM_AT.x, y: r.top + r.width * (635 / 700) * BLOOM_AT.y }
        : { x: innerWidth / 2, y: innerHeight / 2 };
      setPlan(planBloom(hand));
      setPhase("bloom");
    }, reduceMotion ? 1200 : WALK_MS);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  // bloom → open: as soon as the pink covers the screen (the flower is still turning), the hole starts opening and the hero
  // animates in underneath it
  useEffect(() => {
    if (phase !== "bloom") return;
    const t = setTimeout(() => {
      setPhase("open");
      onDoneRef.current();
    }, (reduceMotion ? 0.3 : BLOOM_S * 0.8) * 1000);
    return () => clearTimeout(t);
  }, [phase, reduceMotion]);

  useEffect(() => {
    if (phase !== "open") return;
    const t = setTimeout(() => setPhase("gone"), (reduceMotion ? 0.3 : OPEN_S + RIM_LAG_S) * 1000 + 60);
    return () => clearTimeout(t);
  }, [phase, reduceMotion]);

  const opening = phase === "open";

  return (
    <AnimatePresence>
      {phase !== "gone" && (
        <motion.div
          key="intro"
          role="status"
          aria-label="Loading Laxmi Mahajan's portfolio"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            pointerEvents: opening ? "none" : undefined,
            // undo the desktop page zoom: the loader works in screen px throughout
            zoom: "calc(1 / var(--page-zoom))",
          }}
        >
          {/* the orange page and the walker - hidden under the pink by the time the hole opens */}
          {!opening && (
            <>
              <Backdrop />
              <div ref={stageRef} style={{ position: "relative", width: STAGE }}>
                <AnimatePresence>{phase === "walk" && <Hey key="hey" />}</AnimatePresence>
                <Walker wave />
              </div>
            </>
          )}

          {plan && phase === "bloom" && <Bloom plan={plan} still={reduceMotion} />}
          {plan && opening && <Iris plan={plan} still={reduceMotion} />}
          {/* the birds keep flying out over the reveal */}
          {plan && !reduceMotion && <Flock at={plan.from} spread={plan.spread} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
