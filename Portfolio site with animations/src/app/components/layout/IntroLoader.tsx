// Loading screen: the little walker strolls on an orange page with "laxmi mahajan"
// underneath, saying "hey!" every so often. After one 3-second walk cycle a pink
// rectangle grows from the middle until it fills the screen, then the whole thing
// fades away to reveal the hero.
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Walker } from "@/app/components/walker/Walker";
import { colors, fonts } from "@/app/theme/tokens";

const WALK_MS = 3000; // one full loop of the walker
const FILL_S = 1.3; // the pink rectangle filling the screen
const FADE_S = 0.6; // loader fading out over the hero
const STAGE = 200; // walker width on the loader

// "hey!" pops in, holds, and pops out — on repeat, a little speech bubble.
const pop = {
  animate: { scale: [0, 1.15, 1, 1, 0], opacity: [0, 1, 1, 1, 0], rotate: [-14, 6, 0, 0, 0] },
  transition: { duration: 1.5, times: [0, 0.12, 0.2, 0.78, 0.9], repeat: Infinity, repeatDelay: 0.15, ease: "easeOut" as const },
};

function Hey({ still }: { still: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      {...(still ? {} : pop)}
      style={{
        position: "absolute",
        left: "calc(50% - 52px / 2 + 79.5px)",
        top: -38,
        width: 52,
        transformOrigin: "0% 100%",
        zIndex: 1,
      }}
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
      <svg width="18" height="18" viewBox="0 0 18 18" style={{ position: "absolute", left: -10, top: 44, overflow: "visible" }}>
        <path d="M15 1 C 14 8, 9 13, 2 15" fill="none" stroke={colors.sand} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}

function Name() {
  return (
    <div style={{ position: "relative", marginTop: -14, width: STAGE + 20, textAlign: "center" }}>
      <p
        style={{
          fontFamily: fonts.hand,
          fontWeight: 600,
          fontSize: 32,
          lineHeight: "36px",
          color: colors.ink,
          transform: "rotate(-3deg)",
        }}
      >
        laxmi mahajan
      </p>
      {/* the lower line of the banner (the walker's ground is the upper one) */}
      <svg viewBox="0 0 220 16" width={STAGE + 20} height="16" style={{ display: "block", marginTop: 2, overflow: "visible" }} aria-hidden="true">
        <path d="M4 12 C 50 15, 80 2, 128 4 S 196 10, 216 7" fill="none" stroke={colors.ink} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function IntroLoader({ onDone }: { onDone: () => void }) {
  const reduceMotion = !!useReducedMotion();
  const [phase, setPhase] = useState<"walk" | "fill" | "gone">("walk");

  useEffect(() => {
    const t = setTimeout(() => setPhase("fill"), reduceMotion ? 1200 : WALK_MS);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {phase !== "gone" && (
        <motion.div
          key="intro"
          role="status"
          aria-label="Loading Laxmi Mahajan's portfolio"
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_S, ease: "easeOut" }}
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
            <div style={{ position: "relative", width: STAGE }}>
              <Hey still={reduceMotion} />
              <Walker />
            </div>
            <Name />
          </div>

          {/* the pink rectangle that grows from the middle until it fills the screen */}
          <motion.div
            aria-hidden="true"
            initial={{ clipPath: "inset(50% 50% 50% 50% round 32px)" }}
            animate={phase === "fill" ? { clipPath: "inset(0% 0% 0% 0% round 0px)" } : undefined}
            transition={{ duration: reduceMotion ? 0.3 : FILL_S, ease: [0.65, 0, 0.35, 1] }}
            onAnimationComplete={() => {
              if (phase !== "fill") return;
              setPhase("gone");
              onDone(); // the hero animates in while the loader fades over it
            }}
            style={{ position: "absolute", inset: 0, backgroundColor: colors.pink }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
