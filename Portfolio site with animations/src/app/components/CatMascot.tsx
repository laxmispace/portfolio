import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useIsMobile } from "@/app/useIsMobile";

type Mood = "walking" | "sitting" | "sleeping" | "irritated" | "happy";

// ── SVG Cat drawing ───────────────────────────────────────────────────────────
// Soft, hand-drawn look: every shape is a rounded blob path, strokes are thick
// with round joins, and a gentle turbulence filter gives the outline a wobbly,
// pencil-sketch quality. `fat` (0–3) puffs the belly out as the cat is fed.
function CatBody({ mood, dir, fat, blink }: { mood: Mood; dir: 1 | -1; fat: number; blink: boolean }) {
  const sleeping = mood === "sleeping";
  const irritated = mood === "irritated";
  const happy = mood === "happy";
  const eyesShut = sleeping || happy || blink;

  const ink = irritated ? "#c67d39" : "#4a4327";
  const fur = "#efe4d4";
  const belly = "#f8f2e6";
  const line = "#c9bd84";
  const earPink = irritated ? "#c67d39" : "#eab0c0";
  const cheek = "#eab0c0";

  // Body puffs outward and settles lower as the cat gets rounder.
  const bx = 34;
  const by = 42 + fat * 0.6;
  const brx = (sleeping ? 25 : 19) + fat * 3.4;
  const bry = (sleeping ? 15 : 14) + fat * 1.4;

  const sitting = mood === "sitting" || sleeping || happy;
  const footY = by + bry - 2;

  return (
    <svg
      width="80" height="66"
      viewBox="0 0 80 66"
      fill="none"
      style={{ transform: dir === -1 ? "scaleX(-1)" : undefined, display: "block", overflow: "visible" }}
    >
      <defs>
        <filter id="cat-sketch" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="2" seed="6" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      <g filter="url(#cat-sketch)" strokeLinecap="round" strokeLinejoin="round">
        {/* Tail — a soft curl, never a spike */}
        <path
          d={sleeping
            ? "M50 46 Q64 46 65 35 Q66 25 57 23"
            : irritated
            ? "M50 40 Q60 30 66 33 Q72 37 67 27"
            : happy
            ? "M50 40 Q62 35 63 21 Q63 12 55 11"
            : "M50 40 Q60 37 62 28 Q64 20 57 16"}
          stroke={line} strokeWidth={5.5} fill="none"
        />

        {/* Body blob */}
        <ellipse cx={bx} cy={by} rx={brx} ry={bry} fill={fur} stroke={line} strokeWidth={2.5} />
        {/* Belly patch */}
        <ellipse cx={bx - 2} cy={by + 3} rx={brx * 0.62} ry={bry * 0.7} fill={belly} />

        {/* Paws */}
        {sitting ? (
          <>
            <ellipse cx={bx - 9} cy={footY + 2} rx={6} ry={4.2} fill={fur} stroke={line} strokeWidth={2} />
            <ellipse cx={bx + 7} cy={footY + 2} rx={6} ry={4.2} fill={fur} stroke={line} strokeWidth={2} />
          </>
        ) : (
          <>
            <ellipse cx={bx - 10} cy={footY} rx={4.2} ry={3.2} fill={fur} stroke={line} strokeWidth={2} />
            <ellipse cx={bx + 8} cy={footY} rx={4.2} ry={3.2} fill={fur} stroke={line} strokeWidth={2} />
          </>
        )}

        {/* Head — a rounded squish, not a hard circle */}
        <path
          d="M20 24 Q19 9 34 9 Q49 9 48 24 Q48 38 34 38 Q20 38 20 24 Z"
          fill={fur} stroke={line} strokeWidth={2.5}
        />

        {/* Ears — rounded triangles */}
        <path d="M23 13 Q19 3 29 8 Q26 11 23 13 Z" fill={fur} stroke={line} strokeWidth={2.5} />
        <path d="M45 13 Q49 3 39 8 Q42 11 45 13 Z" fill={fur} stroke={line} strokeWidth={2.5} />
        <path d="M24 12 Q22 6.5 27.5 9.5 Z" fill={earPink} opacity={0.75} />
        <path d="M44 12 Q46 6.5 40.5 9.5 Z" fill={earPink} opacity={0.75} />

        {/* Cheeks */}
        {!irritated && (
          <>
            <ellipse cx={25} cy={28} rx={3.6} ry={2.6} fill={cheek} opacity={0.4} />
            <ellipse cx={43} cy={28} rx={3.6} ry={2.6} fill={cheek} opacity={0.4} />
          </>
        )}

        {/* Eyes */}
        {eyesShut ? (
          <>
            <path d="M25 22 Q28.5 26 32 22" stroke={ink} strokeWidth={2} fill="none" />
            <path d="M36 22 Q39.5 26 43 22" stroke={ink} strokeWidth={2} fill="none" />
          </>
        ) : (
          <>
            <ellipse cx={29} cy={22} rx={3} ry={irritated ? 1.6 : 3.7} fill={ink} />
            <ellipse cx={39} cy={22} rx={3} ry={irritated ? 1.6 : 3.7} fill={ink} />
            {!irritated && (
              <>
                <circle cx={30.2} cy={20.6} r={1.05} fill="#fff" />
                <circle cx={40.2} cy={20.6} r={1.05} fill="#fff" />
              </>
            )}
          </>
        )}

        {/* Nose — tiny soft blob */}
        <path d="M32.4 26.6 Q34 28.8 35.6 26.6 Q34 25.9 32.4 26.6 Z" fill={earPink} stroke="#dc9db0" strokeWidth={0.6} />

        {/* Mouth */}
        {irritated ? (
          <path d="M31 31 Q34 29 37 31" stroke={ink} strokeWidth={1.4} fill="none" />
        ) : (
          <path d="M34 28.6 Q34 31.4 31.6 31.8 M34 28.6 Q34 31.4 36.4 31.8" stroke={ink} strokeWidth={1.4} fill="none" />
        )}

        {/* Whiskers — gentle curves */}
        <path d="M13 25 Q20 24 24 27" stroke={line} strokeWidth={1} fill="none" opacity={0.55} />
        <path d="M13 30 Q20 30 24 30" stroke={line} strokeWidth={1} fill="none" opacity={0.55} />
        <path d="M55 25 Q48 24 44 27" stroke={line} strokeWidth={1} fill="none" opacity={0.55} />
        <path d="M55 30 Q48 30 44 30" stroke={line} strokeWidth={1} fill="none" opacity={0.55} />
      </g>
    </svg>
  );
}

// ── Speech bubble ─────────────────────────────────────────────────────────────
function Bubble({ text, color = "#efe4d4" }: { text: string; color?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6, y: 4 }}
      transition={{ duration: 0.2, ease: "backOut" }}
      style={{
        position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
        background: color, borderRadius: 12, padding: "6px 12px", marginBottom: 6,
        fontFamily: "'Inclusive Sans', sans-serif", fontSize: 12, fontWeight: 600,
        color: "#212012", whiteSpace: "nowrap",
        boxShadow: "0 2px 12px rgba(33,32,18,0.15)",
        border: "1.5px solid rgba(255,255,255,0.6)",
      }}
    >
      {text}
      {/* tail */}
      <div style={{ position: "absolute", bottom: -7, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `7px solid ${color}` }} />
    </motion.div>
  );
}

// ── Zzz bubbles ───────────────────────────────────────────────────────────────
function ZzzBubbles() {
  return (
    <>
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.9, 0], y: [-4, -22 - i * 10], x: [0, i * 5 - 4], scale: [0.5, 0.9 + i * 0.1, 0.4] }}
          transition={{ duration: 2.2, delay: i * 0.7, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", top: -14 - i * 10, right: -4 + i * 6,
            fontFamily: "'Libre Caslon Condensed', serif", fontSize: 11 + i * 3,
            color: "#625e37", fontStyle: "italic", lineHeight: 1,
          }}
        >
          z
        </motion.span>
      ))}
    </>
  );
}

// ── Hearts ────────────────────────────────────────────────────────────────────
function Hearts() {
  return (
    <>
      {[0, 1].map(i => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0], y: [-8, -32 - i * 12], scale: [0.5, 1.1, 0.7] }}
          transition={{ duration: 1.4, delay: i * 0.4, ease: "easeOut" }}
          style={{ position: "absolute", top: -14 - i * 10, right: 2 + i * 12, fontSize: 14, lineHeight: 1 }}
        >
          🩷
        </motion.span>
      ))}
    </>
  );
}

// ── Feed button ───────────────────────────────────────────────────────────────
function FeedButton({ onFeed }: { onFeed: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 4, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.2 }}
      onClick={e => { e.stopPropagation(); onFeed(); }}
      style={{
        position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
        background: "#c67d39", color: "#212012", border: "none", cursor: "pointer",
        padding: "5px 11px", borderRadius: 8, fontSize: 10, fontFamily: "'Inclusive Sans', sans-serif",
        fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", whiteSpace: "nowrap",
        boxShadow: "0 2px 8px rgba(198,125,57,0.3)",
      }}
    >
      🐟 feed
    </motion.button>
  );
}

// ── Main Cat Component ────────────────────────────────────────────────────────
export function CatMascot() {
  const isMobile = useIsMobile();
  const [mood, setMood] = useState<Mood>("walking");
  const [posX, setPosX] = useState(12); // percent from left
  const [dir, setDir] = useState<1 | -1>(1);
  const [hovered, setHovered] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [blink, setBlink] = useState(false);
  const [feedCount, setFeedCount] = useState(0);
  const dirRef = useRef<1 | -1>(1);
  const moodRef = useRef<Mood>("walking");
  const walkTimerRef = useRef<ReturnType<typeof setInterval>>();
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout>>();

  moodRef.current = mood;

  // How chonky the cat is right now: one level per two feeds, capped at 3.
  const fat = Math.min(3, Math.floor(feedCount / 2));
  const fatRef = useRef(fat);
  fatRef.current = fat;

  const showBubble = useCallback((text: string, dur = 2200) => {
    setBubble(text);
    clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => setBubble(null), dur);
  }, []);

  // Occasional blink — small thing, makes it feel alive
  useEffect(() => {
    let stop = false;
    let to: ReturnType<typeof setTimeout>;
    const loop = () => {
      if (stop) return;
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
      to = setTimeout(loop, 3600 + Math.random() * 2800);
    };
    to = setTimeout(loop, 3000);
    return () => { stop = true; clearTimeout(to); };
  }, []);

  // The food slowly digests — chonk wears off over time
  useEffect(() => {
    const t = setInterval(() => setFeedCount(c => (c > 0 ? c - 1 : 0)), 22000);
    return () => clearInterval(t);
  }, []);

  // Walking loop — a fuller cat waddles slower
  useEffect(() => {
    if (mood !== "walking") {
      clearInterval(walkTimerRef.current);
      return;
    }
    walkTimerRef.current = setInterval(() => {
      setPosX(prev => {
        const speed = Math.max(0.07, 0.22 - fatRef.current * 0.05);
        const next = prev + dirRef.current * speed;
        if (next > 82) { dirRef.current = -1; setDir(-1); }
        if (next < 4) { dirRef.current = 1; setDir(1); }
        return Math.max(4, Math.min(82, next));
      });
    }, 50);
    return () => clearInterval(walkTimerRef.current);
  }, [mood]);

  // Idle sit: a heavier cat plops down to rest more often
  useEffect(() => {
    if (mood !== "walking") return;
    const heavy = fat >= 2;
    const t = setTimeout(() => {
      if (moodRef.current !== "walking") return;
      setMood("sitting");
      showBubble(heavy ? "need a break 😮‍💨" : "...", 2000);
      setTimeout(() => { if (moodRef.current === "sitting") setMood("walking"); }, heavy ? 4800 : 3500);
    }, (heavy ? 5000 : 12000) + Math.random() * (heavy ? 4000 : 8000));
    return () => clearTimeout(t);
  }, [mood, showBubble, fat]);

  const handleBodyClick = () => {
    if (mood === "sleeping") {
      setMood("sitting");
      showBubble("hiss! >:(", 2000);
      return;
    }
    if (mood === "happy") return;
    if (mood === "sitting" || mood === "walking") {
      if (fat >= 3) {
        setMood("sitting");
        showBubble("too full to play 😩", 2200);
        setTimeout(() => { if (moodRef.current === "sitting") setMood("walking"); }, 2400);
        return;
      }
      setMood("irritated");
      showBubble("stop poking me!", 2000);
      setTimeout(() => { setMood("walking"); }, 2200);
    }
  };

  const handleFeed = () => {
    if (mood === "sleeping") return;
    const next = Math.min(8, feedCount + 1);
    setFeedCount(next);
    const nextFat = Math.min(3, Math.floor(next / 2));
    setMood("happy");
    showBubble(
      nextFat >= 3 ? "so stuffed 😵‍💫" : nextFat >= 2 ? "getting chonky 🐟" : "yummy! 🐟",
      2500,
    );
    setTimeout(() => {
      setMood("sleeping");
      setTimeout(() => { setMood("walking"); }, nextFat >= 2 ? 12000 : 9000);
    }, 2800);
  };

  return (
    <motion.div
      animate={{ left: `${posX}%`, scale: isMobile ? 0.72 : 1 }}
      transition={{ left: { type: "tween", duration: 0.05, ease: "linear" }, scale: { duration: 0.3 } }}
      style={{
        // On mobile the cat walks the seam just above the fixed bottom nav band.
        position: "fixed", bottom: isMobile ? 76 : 0, zIndex: 40,
        transformOrigin: "bottom left",
        userSelect: "none",
      }}
    >
      <div
        style={{ position: "relative", cursor: "pointer" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleBodyClick}
      >
        {/* Bubble */}
        <AnimatePresence>
          {bubble && <Bubble text={bubble} />}
        </AnimatePresence>

        {/* Feed button on hover */}
        <AnimatePresence>
          {hovered && mood !== "sleeping" && mood !== "happy" && (
            <FeedButton onFeed={handleFeed} />
          )}
        </AnimatePresence>

        {/* Zzz when sleeping */}
        <AnimatePresence>
          {mood === "sleeping" && <ZzzBubbles />}
        </AnimatePresence>

        {/* Hearts when happy/fed */}
        <AnimatePresence>
          {mood === "happy" && <Hearts />}
        </AnimatePresence>

        {/* Walking bob / full-belly wobble */}
        <motion.div
          animate={
            mood === "walking"
              ? { y: [0, -2, 0] }
              : fat >= 2 && (mood === "sitting" || mood === "happy")
              ? { scaleX: [1, 1.03, 1], scaleY: [1, 0.98, 1] }
              : { y: 0 }
          }
          transition={
            mood === "walking"
              ? { duration: Math.max(0.3, 0.45 + fat * 0.07), repeat: Infinity, ease: "easeInOut" }
              : fat >= 2
              ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              : {}
          }
          style={{ transformOrigin: "bottom center" }}
        >
          {/* Irritated shake */}
          <motion.div
            animate={mood === "irritated" ? { x: [-3, 3, -3, 3, 0] } : { x: 0 }}
            transition={mood === "irritated" ? { duration: 0.4, ease: "easeInOut" } : {}}
          >
            <CatBody mood={mood} dir={dir} fat={fat} blink={blink} />
          </motion.div>
        </motion.div>

        {/* Ground shadow — widens with the cat */}
        <div style={{
          width: 48 + fat * 12, height: 6, background: "rgba(33,32,18,0.08)", borderRadius: "50%",
          margin: "0 auto", transform: "scaleX(0.9)",
        }} />
      </div>
    </motion.div>
  );
}
