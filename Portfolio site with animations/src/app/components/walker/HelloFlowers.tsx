// The loader's character: he waves hello holding a pink and a yellow flower (from
// src/assets/loader/Hello With Flowers.html, ported by scripts/port-hello-flowers.mjs).
// Each frame the rig bends every outline, so nothing is cut apart; the motion lines by the
// waving hand flicker with each swing. Holds still for reduced motion.
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { HELLO_LAYERS, HELLO_SMILE, HELLO_VIEWBOX } from "./helloFlowersData";
import { RIG as RIG_SRC } from "./helloFlowersRig";

export { HELLO_VIEWBOX };
/** The waving palm (folded in by the elbow), in drawing units - the loader's flower blooms from here. */
export const HELLO_PALM = { x: 268, y: 135 };
/** The top of his head, in drawing units - the speech bubble sits above it. */
export const HELLO_HEAD = { x: 712, y: 106 };

// newer versions of the drawing add motion lines, whose flicker the rig reports separately
const RIG = RIG_SRC as typeof RIG_SRC & { motion?: (t: number) => { op: Record<string, number> } };
const prep = RIG.prepare(HELLO_LAYERS);
const hasSmile = HELLO_SMILE.full.length > 0;
const isMotionLine = (tag: string) => tag === "moL" || tag === "moT";

export function HelloFlowers() {
  const reduce = useReducedMotion();
  const layerRefs = useRef<(SVGPathElement | null)[]>([]);
  const smileRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const paint = (t: number) => {
      const ds: string[] = RIG.frame(prep, t);
      const op: Record<string, number> | undefined = RIG.motion?.(t).op;
      ds.forEach((d, i) => {
        const el = layerRefs.current[i];
        if (!el) return;
        el.setAttribute("d", d);
        const tag = HELLO_LAYERS[i].tag;
        if (op && isMotionLine(tag)) el.style.opacity = op[tag].toFixed(3);
      });
      if (hasSmile) smileRef.current?.setAttribute("d", RIG.smileD(HELLO_SMILE, t));
    };
    paint(0);
    if (reduce) return;
    let t = 0, last: number | null = null, raf = 0;
    const loop = (now: number) => {
      if (last !== null) t += Math.min((now - last) / 1000, 0.05);
      last = now;
      paint(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  const { x, y, w, h } = HELLO_VIEWBOX;
  return (
    <svg
      viewBox={`${x} ${y} ${w} ${h}`}
      role="img"
      aria-label="A smiling character waves hello while holding a pink and a yellow flower"
      style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }}
    >
      {HELLO_LAYERS.map((l, i) => (
        <path key={i} ref={(el) => { layerRefs.current[i] = el; }} fill={l.f} fillRule={l.eo ? "evenodd" : undefined} />
      ))}
      {hasSmile && <path ref={smileRef} fill="#212012" />}
    </svg>
  );
}
