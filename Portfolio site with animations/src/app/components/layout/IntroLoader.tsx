// Loading screen: the little walker strolls on an orange page with "laxmi mahajan"
// underneath and says "hey!" once. After one 3-second walk cycle its flower blooms:
// a pink flower grows out of the one in its hand until the petals fill the screen,
// while a flock of birds takes off and flies out past the edges. Then the page
// softly fades to reveal the hero.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Walker } from "@/app/components/walker/Walker";
import { colors, fonts } from "@/app/theme/tokens";

const WALK_MS = 3000; // one full loop of the walker
const BLOOM_S = 1.8; // the flower growing until it fills the screen
const FADE_S = 0.9; // loader fading out over the hero
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
    <div style={{ marginTop: -10, width: STAGE + 16, textAlign: "center" }}>
      <p style={{ fontFamily: fonts.hand, fontWeight: 600, fontSize: 26, lineHeight: "30px", color: colors.ink, transform: "rotate(-3deg)" }}>
        laxmi mahajan
      </p>
      {/* the lower line of the banner (the walker's ground is the upper one) */}
      <svg viewBox="0 0 220 16" width={STAGE + 16} height="12" style={{ display: "block", marginTop: 2, overflow: "visible" }} aria-hidden="true">
        <path d="M4 12 C 50 15, 80 2, 128 4 S 196 10, 216 7" fill="none" stroke={colors.ink} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ── the bloom: a five-petal flower, outlined like the character, that grows to cover everything ──
const PETAL_REACH = 55; // radius (in flower units) the petals + core are guaranteed to cover

function Bloom({ at, scale, still }: { at: { x: number; y: number }; scale: number; still: boolean }) {
  const outline = { stroke: colors.ink, strokeWidth: 3, vectorEffect: "non-scaling-stroke" as const };
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="-100 -100 200 200"
      width="200"
      height="200"
      initial={{ scale: 0.1, rotate: -20, opacity: 0 }}
      animate={{ scale, rotate: 70, opacity: 1 }}
      transition={{
        scale: { duration: still ? 0.3 : BLOOM_S, ease: [0.55, 0, 0.25, 1] },
        rotate: { duration: still ? 0.3 : BLOOM_S, ease: "easeInOut" },
        opacity: { duration: 0.2 },
      }}
      style={{ position: "absolute", left: at.x - 100, top: at.y - 100, overflow: "visible", zIndex: 2 }}
    >
      {[0, 1, 2, 3, 4].map((k) => (
        <ellipse key={k} cx="0" cy="-48" rx="33" ry="48" transform={`rotate(${k * 72})`} fill={colors.pink} {...outline} />
      ))}
      <circle r="56" fill={colors.pink} />
      <motion.circle
        r="17"
        fill={colors.orange}
        {...outline}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: still ? 0.2 : BLOOM_S * 0.45, delay: still ? 0 : BLOOM_S * 0.25 }}
      />
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
  const [phase, setPhase] = useState<"walk" | "bloom" | "gone">("walk");
  const [heyGone, setHeyGone] = useState(false);
  const [bloom, setBloom] = useState({ at: { x: 0, y: 0 }, scale: 1, spread: 1 });

  // walk → bloom
  useEffect(() => {
    const t = setTimeout(() => {
      const r = stageRef.current?.getBoundingClientRect();
      const at = r ? { x: r.left + r.width * BLOOM_AT.x, y: r.top + r.width * (635 / 700) * BLOOM_AT.y } : { x: innerWidth / 2, y: innerHeight / 2 };
      // far enough to cover the farthest corner of the screen
      const far = Math.max(Math.hypot(at.x, at.y), Math.hypot(innerWidth - at.x, at.y), Math.hypot(at.x, innerHeight - at.y), Math.hypot(innerWidth - at.x, innerHeight - at.y));
      setBloom({ at, scale: (far / PETAL_REACH) * 1.05, spread: Math.min(1.3, Math.max(0.4, innerWidth / 1440)) });
      setPhase("bloom");
    }, reduceMotion ? 1200 : WALK_MS);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  // bloom: "hey!" leaves a quarter of the way in; the hero starts once the screen is pink
  useEffect(() => {
    if (phase !== "bloom") return;
    const dur = reduceMotion ? 300 : BLOOM_S * 1000;
    const hey = setTimeout(() => setHeyGone(true), dur * 0.25);
    const done = setTimeout(() => {
      setPhase("gone");
      onDoneRef.current(); // the hero animates in while the loader fades over it
    }, dur + 80);
    return () => { clearTimeout(hey); clearTimeout(done); };
  }, [phase, reduceMotion]);

  return (
    <AnimatePresence>
      {phase !== "gone" && (
        <motion.div
          key="intro"
          role="status"
          aria-label="Loading Laxmi Mahajan's portfolio"
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_S, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000,
            backgroundColor: colors.orange,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div ref={stageRef} style={{ position: "relative", width: STAGE }}>
              <AnimatePresence>{!heyGone && <Hey key="hey" />}</AnimatePresence>
              <Walker />
            </div>
            <Name />
          </div>

          {phase === "bloom" && (
            <>
              <Bloom at={bloom.at} scale={bloom.scale} still={reduceMotion} />
              {!reduceMotion && <Flock at={bloom.at} spread={bloom.spread} />}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
