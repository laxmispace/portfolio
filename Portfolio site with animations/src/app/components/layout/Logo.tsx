// The "laxmi mahajan" logo, used in the side nav and the mobile header.
// The artwork lives in src/assets/logo/laxmi-mahajan-logo.svg - swap that file to
// update the logo everywhere. Until it has content, the name shows in handwriting.
// With `cycle`, the flower keeps swapping its petal and eye colours through the
// orange / pink / green combinations, turning a fifth of a turn with each swap.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import logoSvg from "@/assets/logo/laxmi-mahajan-logo.svg?raw";
import { colors, fonts } from "@/app/theme/tokens";

const hasArtwork = logoSvg.trim().startsWith("<svg");

// The flower's petals are the one pink shape in the artwork, its eye the one orange shape.
const PETAL = colors.pink.toUpperCase();
const EYE = colors.orange.toUpperCase();
const markup = logoSvg
  .replace(`fill="${PETAL}"`, `class="logo-petal" style="fill: var(--logo-petal, ${PETAL})"`)
  .replace(`fill="${EYE}"`, `class="logo-eye" style="fill: var(--logo-eye, ${EYE})"`);

// [petals, eye] - every pairing of the three brand colours, starting from the original.
const COMBOS: [string, string][] = [
  [colors.pink, colors.orange],
  [colors.olive, colors.pink],
  [colors.orange, colors.olive],
  [colors.pink, colors.olive],
  [colors.olive, colors.orange],
  [colors.orange, colors.pink],
];
const CYCLE_MS = 2400;

export function Logo({ height, style, cycle = false }: { height: number; style?: CSSProperties; cycle?: boolean }) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!cycle || reduceMotion) return;
    const t = setInterval(() => setStep((s) => s + 1), CYCLE_MS);
    return () => clearInterval(t);
  }, [cycle, reduceMotion]);

  // The petals turn around the eye's centre, so the flower spins in place.
  useEffect(() => {
    const host = hostRef.current;
    const petal = host?.querySelector<SVGGraphicsElement>(".logo-petal");
    const eye = host?.querySelector<SVGGraphicsElement>(".logo-eye");
    if (!petal || !eye) return;
    const b = eye.getBBox();
    petal.style.transformBox = "view-box";
    petal.style.transformOrigin = `${b.x + b.width / 2}px ${b.y + b.height / 2}px`;
  }, []);

  if (hasArtwork) {
    const [petal, eye] = COMBOS[step % COMBOS.length];
    return (
      <span
        ref={hostRef}
        role="img"
        aria-label="Laxmi Mahajan"
        className="site-logo"
        style={{
          display: "inline-block",
          height,
          lineHeight: 0,
          ["--logo-petal" as string]: petal,
          ["--logo-eye" as string]: eye,
          ["--logo-turn" as string]: `${step * 72}deg`,
          ...style,
        }}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    );
  }
  return (
    <span
      aria-label="Laxmi Mahajan"
      style={{ display: "inline-block", fontFamily: fonts.hand, fontWeight: 600, fontSize: height * 0.62, lineHeight: `${height}px`, color: colors.ink, whiteSpace: "nowrap", ...style }}
    >
      laxmi mahajan
    </span>
  );
}
