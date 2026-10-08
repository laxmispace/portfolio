import { useRef } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import confetti from "canvas-confetti";
import { haptic } from "@/app/lib/feedback";
import { colors } from "@/app/theme/tokens";

// Heart outline in a 24×24 box - used both for the button and for every confetti particle.
const HEART_PATH =
  "M12 21s-7.5-4.6-9.6-9.2C.9 8.5 2.6 4.5 6.3 4.1c2.1-.2 3.9.9 5.7 3 1.8-2.1 3.6-3.2 5.7-3 3.7.4 5.4 4.4 3.9 7.7C19.5 16.4 12 21 12 21z";

const BURST_COLORS = [colors.orange, colors.pink, colors.olive, colors.oliveDeep, colors.pinkLight];

let heartShape: confetti.Shape | null = null;
const getHeartShape = () => (heartShape ??= confetti.shapeFromPath({ path: HEART_PATH }));

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// The heart pulses, then bursts into hearts from where it sits, followed by a
// gentle shower from the top of the screen.
function burstHearts(from: DOMRect) {
  const origin = {
    x: (from.left + from.width / 2) / window.innerWidth,
    y: (from.top + from.height / 2) / window.innerHeight,
  };
  const shared = { shapes: [getHeartShape()], colors: BURST_COLORS, zIndex: 10000, disableForReducedMotion: true };

  confetti({ ...shared, origin, particleCount: 36, spread: 80, startVelocity: 38, scalar: 1.6, gravity: 0.7, ticks: 260 });
  setTimeout(() => confetti({ ...shared, origin, particleCount: 24, spread: 140, startVelocity: 28, scalar: 1.2, gravity: 0.6, ticks: 240 }), 140);
  setTimeout(() => {
    for (let i = 0; i < 6; i++) {
      confetti({
        ...shared,
        origin: { x: Math.random(), y: -0.1 },
        angle: 270,
        particleCount: 4,
        spread: 40,
        startVelocity: 12,
        scalar: 1.4 + Math.random(),
        gravity: 0.5,
        drift: (Math.random() - 0.5) * 1.2,
        ticks: 380,
      });
    }
  }, 320);
}

export function MadeWithLove({ fontSize = 12, color = colors.oliveDeep }: { fontSize?: number; color?: string }) {
  const heartRef = useRef<HTMLButtonElement>(null);
  const pulse = useAnimationControls();
  const reduceMotion = useReducedMotion();
  const ringSize = fontSize + 8;

  const celebrate = async () => {
    haptic(12);
    const pulsing = pulse.start({ scale: [1, 1.45, 0.9, 1.25, 1], transition: { duration: 0.6, ease: "easeOut" } });
    if (!prefersReducedMotion() && heartRef.current) {
      setTimeout(() => heartRef.current && burstHearts(heartRef.current.getBoundingClientRect()), 180);
    }
    await pulsing;
  };

  return (
    <p className="font-inclusive-sans" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize, lineHeight: 1.3, color, margin: 0 }}>
      designed and built with love
      <motion.button
        ref={heartRef}
        type="button"
        onClick={celebrate}
        animate={pulse}
        whileHover={{ scale: 1.15 }}
        aria-label="Send some love"
        style={{ position: "relative", display: "inline-flex", padding: 2, margin: -2, border: "none", background: "none", cursor: "pointer" }}
      >
        {/* Two staggered ripples breathe out from behind the heart so it reads as tappable */}
        {!reduceMotion &&
          [0, 1].map((i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [0.6, 1.5], opacity: [0.45, 0] }}
              transition={{ duration: 1.8, delay: i * 0.9, repeat: Infinity, repeatDelay: 0.6, ease: "easeOut" }}
              style={{
                position: "absolute", left: "50%", top: "50%", width: ringSize, height: ringSize,
                marginLeft: -ringSize / 2, marginTop: -ringSize / 2, borderRadius: "50%",
                border: `1.5px solid ${colors.orange}`, pointerEvents: "none",
              }}
            />
          ))}
        <svg width={fontSize + 2} height={fontSize + 2} viewBox="0 0 24 24" aria-hidden="true" style={{ position: "relative" }}>
          <path d={HEART_PATH} fill={colors.orange} />
        </svg>
      </motion.button>
    </p>
  );
}
