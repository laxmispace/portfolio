// Loading screen: the little walker strolls on an orange page with "laxmi mahajan"
// underneath and says "hey!" once. After one 3-second walk cycle its flower blooms:
// a big pink flower (src/assets/loader/loading-flower.svg) grows out of the one in its
// hand and spins into place until its petals fill the screen, leaving the walker
// framed in the hole at its heart, while a flock of birds flies out past the edges.
// Then the hole opens up past the edges of the screen, revealing the hero.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Walker } from "@/app/components/walker/Walker";
import { Logo } from "./Logo";
import { colors, fonts } from "@/app/theme/tokens";
import flowerSvg from "@/assets/loader/loading-flower.svg?raw";

const WALK_MS = 3000; // one full loop of the walker
const BLOOM_S = 1.8; // the flower growing until it fills the screen
const OPEN_S = 0.9; // the hole opening up to reveal the hero
const STAGE = 150; // walker width on the loader (0.75× the first version)
// Where the walker's flower sits inside its stage, as fractions of the SVG (bloom at 159,147 in a -30 -45 700 635 box).
const BLOOM_AT = { x: (159 + 30) / 700, y: (147 + 45) / 635 };

// ── "hey!" ──
function Hey() {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ scale: 0, opacity: 0, rotate: -14 }}
      animate={{ scale: [0, 1.15, 1], opacity: [0, 1, 1], rotate: [-14, 6, 0] }}
      exit={{ scale: 0, opacity: 0, rotate: 10, transition: { duration: 0.25, ease: "easeIn" } }}
      transition={{ duration: 0.55, times: [0, 0.6, 1], ease: "easeOut", delay: 0.5 }}
      style={{ position: "absolute", left: "calc(50% - 52px / 2 + 60px)", top: -42, width: 52, transformOrigin: "0% 100%" }}
    >
      <span
        style={{
          display: "block",
          width: 52,
          height: 44,
          fontFamily: fonts.display,
          fontStyle: "normal",
          fontWeight: 400,
          fontSize: 36,
          lineHeight: "44px",
          color: colors.sand,
          WebkitTextStroke: `2px ${colors.ink}`,
          paintOrder: "stroke fill",
          whiteSpace: "nowrap",
        }}
      >
        hey!
      </span>
      {/* the speech tail, curling down towards the head */}
      <svg width="16" height="16" viewBox="0 0 18 18" style={{ position: "absolute", left: -10, top: 42, overflow: "visible" }}>
        <path d="M15 1 C 14 8, 9 13, 2 15" fill="none" stroke={colors.sand} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}

function Name() {
  return (
    <div style={{ marginTop: -6, display: "flex", justifyContent: "center" }}>
      <Logo height={40} />
    </div>
  );
}

// ── the bloom: the loading flower, which grows to cover everything but the hole at its heart ──
// The flower is drawn for a 1587×1153 screen; its petals reach well past that frame.
const FLOWER_D = flowerSvg.match(/ d="([^"]+)"/)?.[1] ?? "";
const FLOWER_FILL = flowerSvg.match(/fill="(#[0-9A-Fa-f]{3,8})"/)?.[1] ?? colors.pink;
const HOLE = { x: 750, y: 620 }; // centre of the hole, in the flower's own units
const HOLE_R = 290; // the hole's smallest half-width
// How far the flower's frame reaches from the hole's centre: left, right, up, down.
const REACH = { l: HOLE.x, r: 1587 - HOLE.x, u: HOLE.y, d: 1153 - HOLE.y };

interface BloomPlan {
  from: { x: number; y: number }; // the flower in the walker's hand
  to: { x: number; y: number }; // where the hole ends up: around the walker and name
  scale: number; // just big enough for the petals to cover the screen
  turn: number; // portrait screens get the flower turned on its side
  openScale: number; // big enough for the hole to clear every corner
  spread: number; // how far the birds fly
}

function planBloom(from: { x: number; y: number }, to: { x: number; y: number }): BloomPlan {
  const w = innerWidth;
  const h = innerHeight;
  const portrait = h > w;
  // turned 90° clockwise, the frame's left reach comes from its bottom, and so on
  const [l, r, u, d] = portrait ? [REACH.d, REACH.u, REACH.l, REACH.r] : [REACH.l, REACH.r, REACH.u, REACH.d];
  const scale = Math.max(to.x / l, (w - to.x) / r, to.y / u, (h - to.y) / d);
  const corner = Math.max(Math.hypot(to.x, to.y), Math.hypot(w - to.x, to.y), Math.hypot(to.x, h - to.y), Math.hypot(w - to.x, h - to.y));
  return { from, to, scale, turn: portrait ? 90 : 0, openScale: (corner / HOLE_R) * 1.1, spread: Math.min(1.3, Math.max(0.4, w / 1440)) };
}

function Bloom({ plan, open, still }: { plan: BloomPlan; open: boolean; still: boolean }) {
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 1587 1153"
      width="1587"
      height="1153"
      initial={{ x: plan.from.x - plan.to.x, y: plan.from.y - plan.to.y, scale: 0.01, rotate: plan.turn - 60, opacity: 0 }}
      animate={{ x: 0, y: 0, scale: open ? plan.openScale : plan.scale, rotate: plan.turn, opacity: 1 }}
      transition={
        open
          ? { scale: { duration: still ? 0.3 : OPEN_S, ease: [0.55, 0, 0.8, 0.2] } }
          : {
              scale: { duration: still ? 0.3 : BLOOM_S, ease: [0.55, 0, 0.25, 1] },
              x: { duration: still ? 0.3 : BLOOM_S * 0.8, ease: [0.4, 0, 0.2, 1] },
              y: { duration: still ? 0.3 : BLOOM_S * 0.8, ease: [0.4, 0, 0.2, 1] },
              rotate: { duration: still ? 0.3 : BLOOM_S, ease: "easeInOut" },
              opacity: { duration: 0.2 },
            }
      }
      style={{
        position: "absolute",
        left: plan.to.x - HOLE.x,
        top: plan.to.y - HOLE.y,
        overflow: "visible",
        transformOrigin: `${HOLE.x}px ${HOLE.y}px`,
        zIndex: 2,
      }}
    >
      <path d={FLOWER_D} fill={FLOWER_FILL} fillRule="evenodd" clipRule="evenodd" />
    </motion.svg>
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
            style={{ position: "absolute", left: at.x - (b.w * f.size) / 2, top: at.y - (b.h * f.size) / 2, zIndex: 3 }}
          >
            <motion.svg
              width={b.w * f.size}
              height={b.h * f.size}
              viewBox={`0 0 ${b.w} ${b.h}`}
              animate={{ scaleY: [1, 0.55, 1] }}
              transition={{ duration: 0.42, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
              style={{ display: "block", overflow: "visible", scaleX: goesLeft ? -1 : 1 }}
            >
              <path d={b.d} stroke={colors.sand} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"walk" | "bloom" | "open" | "gone">("walk");
  const [heyGone, setHeyGone] = useState(false);
  const [plan, setPlan] = useState<BloomPlan | null>(null);

  // walk → bloom
  useEffect(() => {
    const t = setTimeout(() => {
      const r = stageRef.current?.getBoundingClientRect();
      const centre = { x: innerWidth / 2, y: innerHeight / 2 };
      const hand = r ? { x: r.left + r.width * BLOOM_AT.x, y: r.top + r.width * (635 / 700) * BLOOM_AT.y } : centre;
      const c = contentRef.current?.getBoundingClientRect();
      setPlan(planBloom(hand, c ? { x: c.left + c.width / 2, y: c.top + c.height / 2 } : centre));
      setPhase("bloom");
    }, reduceMotion ? 1200 : WALK_MS);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  // bloom: "hey!" leaves a quarter of the way in; once the petals cover the screen the
  // hole opens up, and the hero starts animating in underneath it
  useEffect(() => {
    if (phase !== "bloom") return;
    const dur = reduceMotion ? 300 : BLOOM_S * 1000;
    const hey = setTimeout(() => setHeyGone(true), dur * 0.25);
    const open = setTimeout(() => {
      setPhase("open");
      onDoneRef.current();
    }, dur + 250);
    return () => { clearTimeout(hey); clearTimeout(open); };
  }, [phase, reduceMotion]);

  useEffect(() => {
    if (phase !== "open") return;
    const t = setTimeout(() => setPhase("gone"), (reduceMotion ? 0.3 : OPEN_S) * 1000);
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
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            pointerEvents: opening ? "none" : undefined,
          }}
        >
          {/* the orange page - it clears away as the hole opens, so the hero shows through */}
          <motion.div
            aria-hidden="true"
            animate={{ opacity: opening ? 0 : 1 }}
            transition={{ duration: (reduceMotion ? 0.3 : OPEN_S) * 0.5, ease: "easeIn" }}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: colors.orange,
              backgroundImage: `radial-gradient(${colors.orangeDot} 1.6px, transparent 2px)`,
              backgroundSize: "24px 24px",
              backgroundPosition: "center",
            }}
          />
          <motion.div
            ref={contentRef}
            animate={{ opacity: opening ? 0 : 1, scale: opening ? 1.08 : 1 }}
            transition={{ duration: (reduceMotion ? 0.3 : OPEN_S) * 0.4, ease: "easeIn" }}
            style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <div ref={stageRef} style={{ position: "relative", width: STAGE }}>
              <AnimatePresence>{!heyGone && <Hey key="hey" />}</AnimatePresence>
              <Walker />
            </div>
            <Name />
          </motion.div>

          {plan && (phase === "bloom" || opening) && (
            <>
              <Bloom plan={plan} open={opening} still={reduceMotion} />
              {!reduceMotion && <Flock at={plan.from} spread={plan.spread} />}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
