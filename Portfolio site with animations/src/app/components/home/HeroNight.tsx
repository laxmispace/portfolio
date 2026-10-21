// The hero's little world: a ball-chain pull hanging from the top that switches the hero into
// night (the screen darkens, fireflies wander about and glow specks twinkle everywhere),
// and clouds that keep drifting behind the walker's head and melting away.
// Assets (SVGs saved without extensions, so they're read raw):
//   src/assets/night-mode/       glow - 1/2/3 (the firefly is drawn inline so its wings can flutter)
//   src/assets/walker + clouds/  clouds-1, clouds-2, clouds - 3, cloud - 4
import { useMemo, useRef } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type PanInfo } from "motion/react";
import { haptic, softTick } from "@/app/lib/feedback";

const night = import.meta.glob<string>("@/assets/night-mode/*", { eager: true, query: "?raw", import: "default" });
const sky = import.meta.glob<string>("@/assets/walker + clouds/*", { eager: true, query: "?raw", import: "default" });
const svgUrl = (raw: string | undefined) => (raw ? `data:image/svg+xml;utf8,${encodeURIComponent(raw)}` : "");
const pick = (files: Record<string, string>, test: (name: string) => boolean) =>
  Object.entries(files).filter(([p]) => test(p.split("/").pop()!.trim())).sort(([a], [b]) => a.localeCompare(b)).map(([, raw]) => svgUrl(raw));

const GLOWS = pick(night, (n) => n.startsWith("glow"));
const CLOUDS = pick(sky, (n) => n.startsWith("cloud"));

export const NIGHT_BG = "#1C1B10"; // a touch warmer than ink, so the glows read as warm light

// A stable pseudo-random number in [0, 1) for each index/seed.
const rnd = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

// ── The pull cord ────────────────────────────────────────────────────────────
const CHAIN_W = 20;
const BEAD_GAP = 6;
const KNOB_H = 20;

/** A fine ball chain ending in a small wooden pull; the pull glows warm once it's night. */
function PullChain({ height, on }: { height: number; on: boolean }) {
  const cx = CHAIN_W / 2;
  const chainEnd = height - KNOB_H;
  const beads = Array.from({ length: Math.floor(chainEnd / BEAD_GAP) }, (_, k) => 3 + k * BEAD_GAP);
  return (
    <svg width={CHAIN_W} height={height} viewBox={`0 0 ${CHAIN_W} ${height}`} style={{ display: "block", overflow: "visible" }}>
      <line x1={cx} y1={0} x2={cx} y2={chainEnd} stroke={on ? "#8C8656" : "#625E37"} strokeWidth={0.75} style={{ transition: "stroke 0.7s" }} />
      {beads.map((y) => (
        <circle key={y} cx={cx} cy={y} r={1.6} fill={on ? "#8C8656" : "#625E37"} style={{ transition: "fill 0.7s" }} />
      ))}
      {/* the pull: a little acorn-shaped wooden bead */}
      <g transform={`translate(${cx} ${chainEnd})`}>
        <rect x={-2.5} y={0} width={5} height={4} rx={1} fill={on ? "#8C8656" : "#625E37"} style={{ transition: "fill 0.7s" }} />
        <path
          d="M0 3 C5.5 3 7 8 7 11.5 C7 16 3.5 19.5 0 20 C-3.5 19.5 -7 16 -7 11.5 C-7 8 -5.5 3 0 3 Z"
          fill={on ? "#FEE28E" : "#9A7650"}
          style={{ transition: "fill 0.7s, filter 0.7s", filter: on ? "drop-shadow(0 0 6px rgba(254, 226, 142, 0.9))" : "none" }}
        />
        <ellipse cx={-2.4} cy={9} rx={1.4} ry={2.6} fill="#FFFFFF" opacity={on ? 0.55 : 0.25} />
      </g>
    </svg>
  );
}
/** Hangs from the top edge and sways gently. Pull it down (drag) or click it to switch
 *  the hero between day and night; it springs back with a little wobble. */
export function PullCord({ on, onToggle, height }: { on: boolean; onToggle: () => void; height: number }) {
  const reduce = useReducedMotion();
  const y = useMotionValue(0);
  const swing = useMotionValue(0);
  const dragged = useRef(false);

  const pull = () => {
    haptic(12);
    softTick(0.08);
    onToggle();
    // spring back and swing a little, like a cord let go
    animate(y, 0, { type: "spring", stiffness: 520, damping: 12 });
    if (!reduce) animate(swing, [0, 7, -5, 3, 0], { duration: 1.1, ease: "easeOut" });
  };

  return (
    <motion.div
      style={{ position: "absolute", top: 0, width: CHAIN_W, marginLeft: -CHAIN_W / 2, height, transformOrigin: "50% 0%", rotate: swing, zIndex: 6 }}
      animate={reduce ? undefined : { rotate: [-2.5, 2.5, -2.5] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.button
        type="button"
        aria-label={on ? "Turn the lights back on" : "Turn the lights off"}
        aria-pressed={on}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        dragSnapToOrigin
        style={{ y, display: "block", width: "100%", height: "100%", padding: 0, border: "none", background: "none", cursor: "grab", touchAction: "none" }}
        whileHover={{ y: 4 }}
        whileTap={{ cursor: "grabbing" }}
        onDragStart={() => { dragged.current = false; }}
        onDragEnd={(_, info: PanInfo) => { if (info.offset.y > 18) { dragged.current = true; pull(); } }}
        onClick={() => { if (dragged.current) { dragged.current = false; return; } y.set(14); pull(); }}
      >
        <PullChain height={height} on={on} />
      </motion.button>
    </motion.div>
  );
}

// ── Night: darkness, fireflies, glow specks ──────────────────────────────────
// Fireflies come in two glows: the usual pale yellow, and a few warm orange ones.
const GLOW = {
  yellow: { tail: "#FEE28E", core: "#FEE8A4", soft: "#FEE28E99", strong: "#FEE28E" },
  orange: { tail: "#FFB25C", core: "#FFD39A", soft: "#FF9F4A99", strong: "#FF9F4A" },
} as const;

/** The firefly, drawn from the night-mode asset: body heading right, glowing tail on the
 *  left, and two pairs of wings that flutter about the shoulder (148, 88). */
function FireflySvg({ tone, i }: { tone: keyof typeof GLOW; i: number }) {
  const c = GLOW[tone];
  const flap = 0.09 + rnd(i * 41) * 0.05; // a hair different for each one, so they don't beat in sync
  return (
    <svg viewBox="0 0 189 180" style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}>
      <path d="M164.746 92.3035L80.6518 104.572C71.8763 105.852 64.0078 99.0482 64.0078 90.1798C64.0078 81.5362 71.5014 74.8 80.0962 75.7177L164.6 84.7396C166.538 84.9465 168.008 86.5817 168.008 88.5308C168.008 90.4238 166.619 92.0302 164.746 92.3035Z" fill="#625E37" />
      <path d="M183.587 78.4591C188.894 84.3995 188.875 89.7685 183.054 96.0568C181.242 98.0143 178.449 98.6434 175.851 98.0409L155.08 93.2247C152.684 92.6692 150.988 90.5346 150.988 88.075C150.988 85.7716 152.479 83.7334 154.674 83.0364L175.231 76.5102C178.19 75.5706 181.519 76.1435 183.587 78.4591Z" fill="#625E37" />
      <ellipse cx="177.008" cy="75.5" rx="3" ry="4.5" fill="#C67D39" />
      <ellipse cx="171.008" cy="78.5" rx="3" ry="4.5" fill="#C67D39" />
      {/* wings: lower pair, then upper pair, each folding toward the body and back */}
      <g className="ff-wing ff-wing-low" style={{ animationDuration: `${flap}s` }}>
        <path d="M150.1 91.9799L145.119 165.306C144.945 167.874 142.201 169.426 139.91 168.252C130.805 163.588 126.247 153.154 129.012 143.304L143.728 90.8813C144.266 88.9632 146.388 87.9766 148.202 88.801C149.435 89.3616 150.191 90.6283 150.1 91.9799Z" fill="#705740" fillOpacity="0.85" />
        <path d="M155.595 90.4266L186.167 168.34C187.229 171.047 185.729 174.08 182.934 174.878C173.267 177.64 163.297 171.582 161.294 161.731L147.296 92.8781C146.849 90.6805 148.149 88.5041 150.296 87.8556C152.462 87.2012 154.768 88.32 155.595 90.4266Z" fill="#624C37" fillOpacity="0.85" />
      </g>
      <g className="ff-wing ff-wing-high" style={{ animationDuration: `${flap}s` }}>
        <path d="M149.348 85.2545L144.368 11.9286C144.193 9.36058 141.449 7.80834 139.158 8.98198C130.053 13.6467 125.495 24.0805 128.26 33.9302L142.976 86.3531C143.514 88.2712 145.636 89.2578 147.45 88.4334C148.683 87.8728 149.439 86.6061 149.348 85.2545Z" fill="#705740" fillOpacity="0.85" />
        <path d="M156.577 84.3644L185.295 11.1766C186.316 8.57415 184.873 5.65793 182.185 4.89041C172.93 2.248 163.377 8.01413 161.403 17.4343L147.92 81.7789C147.688 82.8867 147.879 84.0412 148.455 85.0154C150.376 88.2661 155.197 87.8797 156.577 84.3644Z" fill="#624C37" fillOpacity="0.85" />
      </g>
      <rect x="141.008" y="83" width="17" height="11" rx="5" fill="#585532" />
      {/* the glowing tail */}
      <ellipse cx="66" cy="90" rx="34" ry="30" fill={c.tail} style={{ filter: "blur(8px)" }} />
      <ellipse cx="62" cy="90" rx="15" ry="13" fill={c.core} />
    </svg>
  );
}

// the wings fold in toward the body and spring back out, a few dozen times a second
const FIREFLY_CSS = `
.ff-wing { transform-box: view-box; transform-origin: 148px 88px; animation: ff-flap 0.1s ease-in-out infinite alternate; }
.ff-wing-high { --ff-fold: 0.35; }
.ff-wing-low { --ff-fold: 0.4; animation-delay: -0.02s; }
@keyframes ff-flap { from { transform: scaleY(1); } to { transform: scaleY(var(--ff-fold)); } }
`;

function Firefly({ i, size }: { i: number; size: number }) {
  // a wandering loop of 5 points across the lower half of the hero, so they hover low
  // instead of drifting up into the copy; it turns to face where it's flying
  const pts = useMemo(() => Array.from({ length: 5 }, (_, k) => ({ x: 5 + rnd(i * 13 + k) * 88, y: 52 + rnd(i * 29 + k * 7) * 40 })), [i]);
  const loop = [...pts, pts[0]];
  const left = loop.map((p) => `${p.x}%`);
  const top = loop.map((p) => `${p.y}%`);
  const rotate = loop.map((p, k) => {
    const n = loop[(k + 1) % loop.length];
    return (Math.atan2(n.y - p.y, n.x - p.x) * 180) / Math.PI;
  });
  const duration = 16 + rnd(i * 3) * 10;
  const tone = i % 3 === 0 ? "orange" : "yellow";
  const c = GLOW[tone];
  return (
    <motion.div
      aria-hidden="true"
      initial={{ left: left[0], top: top[0], opacity: 0 }}
      animate={{ left, top, opacity: 1 }}
      transition={{ left: { duration, repeat: Infinity, ease: "easeInOut" }, top: { duration, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 1.2 } }}
      style={{ position: "absolute", width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
    >
      <motion.div animate={{ rotate }} transition={{ duration, repeat: Infinity, ease: "easeInOut" }} style={{ width: "100%", height: "100%" }}>
        {/* its glow breathes */}
        <motion.div
          animate={{ filter: [`drop-shadow(0 0 2px ${c.soft})`, `drop-shadow(0 0 8px ${c.strong})`, `drop-shadow(0 0 2px ${c.soft})`] }}
          transition={{ duration: 1.6 + rnd(i) * 1.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: "100%", height: "100%" }}
        >
          <FireflySvg tone={tone} i={i} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function Speck({ i }: { i: number }) {
  const size = 6 + rnd(i * 5) * 10;
  const delay = rnd(i * 11) * 4;
  return (
    <motion.img
      aria-hidden="true"
      src={GLOWS[i % GLOWS.length]}
      alt=""
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 0.95, 0.2, 0.9, 0], scale: [0.4, 1, 0.8, 1.05, 0.5], y: [0, -10, -4, -14, -20] }}
      transition={{ duration: 5 + rnd(i * 17) * 5, delay, repeat: Infinity, ease: "easeInOut" }}
      style={{ position: "absolute", left: `${rnd(i * 7) * 96}%`, top: `${30 + rnd(i * 23) * 64}%`, width: size, height: size, pointerEvents: "none" }}
    />
  );
}

/** A tiny crescent moon tucked into the top-right corner of the night sky. */
function Moon({ isMobile, still }: { isMobile: boolean; still: boolean }) {
  const size = isMobile ? 16 : 24;
  return (
    <motion.svg
      viewBox="0 0 100 100"
      initial={{ opacity: 0, y: 8, rotate: -20 }}
      animate={still ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 1, y: [0, -2, 0], rotate: [0, 4, 0] }}
      transition={still ? { duration: 0.6 } : { opacity: { duration: 1, delay: 0.3 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
      style={{
        position: "absolute", top: isMobile ? 72 : 64, right: isMobile ? 20 : 40, width: size, height: size,
        overflow: "visible", filter: "drop-shadow(0 0 6px rgba(254, 226, 142, 0.6))",
      }}
    >
      <defs>
        <mask id="hero-moon-cut">
          <rect width="100" height="100" fill="white" />
          <circle cx="66" cy="36" r="38" fill="black" />
        </mask>
      </defs>
      <circle cx="46" cy="54" r="40" fill="#FEE28E" mask="url(#hero-moon-cut)" />
    </motion.svg>
  );
}

/** The night layer: a dark wash over the hero, with fireflies and glow specks above it.
 *  `below` goes under the hero's content, `above` over it. */
export function Night({ on, layer, isMobile }: { on: boolean; layer: "below" | "above"; isMobile: boolean }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {on && (
        <motion.div
          key={layer}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: layer === "below" ? 0 : 4, overflow: "hidden" }}
        >
          {layer === "below" ? (
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 90% at 70% 0%, #2B2918 0%, ${NIGHT_BG} 60%)` }} />
          ) : reduce ? (
            <>
            <Moon isMobile={isMobile} still />
            {Array.from({ length: 10 }, (_, i) => (
              <img key={i} src={GLOWS[i % GLOWS.length]} alt="" style={{ position: "absolute", left: `${rnd(i * 7) * 96}%`, top: `${rnd(i * 23) * 92}%`, width: 12, opacity: 0.7 }} />
            ))}
            </>
          ) : (
            <>
              <Moon isMobile={isMobile} still={false} />
              <style>{FIREFLY_CSS}</style>
              {Array.from({ length: isMobile ? 8 : 16 }, (_, i) => <Speck key={`s${i}`} i={i} />)}
              {Array.from({ length: isMobile ? 5 : 8 }, (_, i) => <Firefly key={`f${i}`} i={i + 1} size={isMobile ? 16 : 22} />)}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Clouds over the walker ───────────────────────────────────────────────────
const CLOUD_CROSS = 30; // seconds for one cloud to drift across
const CLOUD_GAP = 11; // seconds between one cloud setting off and the next
const CLOUD_ORDER = [0, 2, 1, 3]; // the order they set off in

/** Clouds drifting right-to-left a little above the walker's head, behind it, each fading
 *  in and melting away before it's gone; staggered so there's always one somewhere.
 *  At night the clouds drift up and fade away. */
export function Clouds({ dim }: { dim: boolean }) {
  const reduce = useReducedMotion();
  if (!CLOUDS.length || reduce) return null;
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      <motion.div
        animate={dim ? { opacity: 0, y: -40, scale: 0.85 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "absolute", inset: 0 }}
      >
        {CLOUDS.map((src, i) => {
          // every cloud crosses at the same speed and they set off at even intervals, in a
          // shuffled order, with a rest after each round - so the sky never bunches up
          const slot = CLOUD_ORDER[i % CLOUD_ORDER.length];
          const delay = slot * CLOUD_GAP;
          const repeatDelay = CLOUDS.length * CLOUD_GAP - CLOUD_CROSS;
          return (
            <motion.img
              key={i}
              src={src}
              alt=""
              initial={{ left: "100%", opacity: 0 }}
              animate={{ left: ["100%", "-45%"], opacity: [0, 0.95, 0.95, 0] }}
              transition={{
                left: { duration: CLOUD_CROSS, repeat: Infinity, repeatDelay, ease: "linear", delay },
                opacity: { duration: CLOUD_CROSS, repeat: Infinity, repeatDelay, times: [0, 0.15, 0.75, 1], ease: "easeInOut", delay },
              }}
              style={{ position: "absolute", top: `${[-22, -12, -18, -8][slot % 4]}%`, width: `${[30, 36, 26, 32][slot % 4]}%`, height: "auto" }}
            />
          );
        })}
      </motion.div>
    </div>
  );
}
