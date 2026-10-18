// The loader's character: he waves hello holding a pink and a yellow flower (a port of
// src/assets/loader/Hello With Flowers.html). Each frame the rig bends every outline, so
// nothing is cut apart; holds still for reduced motion.
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { HELLO_LAYERS, HELLO_SMILE } from "./helloFlowersData";
import { RIG } from "./helloFlowersRig";

export const HELLO_VIEWBOX = { x: -60, y: -70, w: 1420, h: 1260 };
/** The waving palm, in drawing units - where the loader's flower blooms from. */
export const HELLO_PALM = { x: 200, y: 190 };
/** The top of his head, in drawing units - the speech bubble sits above it. */
export const HELLO_HEAD = { x: 712, y: 106 };

const prep = RIG.prepare(HELLO_LAYERS);

export function HelloFlowers() {
  const reduce = useReducedMotion();
  const layerRefs = useRef<(SVGPathElement | null)[]>([]);
  const smileRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const paint = (t: number) => {
      const ds: string[] = RIG.frame(prep, t);
      ds.forEach((d, i) => layerRefs.current[i]?.setAttribute("d", d));
      smileRef.current?.setAttribute("d", RIG.smileD(HELLO_SMILE, t));
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
      <path ref={smileRef} fill="#212012" />
    </svg>
  );
}
