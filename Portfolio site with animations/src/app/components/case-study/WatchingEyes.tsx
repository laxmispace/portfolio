import { useEffect, useId, useRef, type RefObject } from "react";
import { colors } from "@/app/theme/tokens";

// Two tall eyes (62×48 artwork) that watch the visitor.
//  - Mouse: they follow the cursor.
//  - Touch: they follow the finger while it's down, and glance around on their own otherwise.
//  - Typing: once the pointer has been still for a moment, they watch the `watch` field (the
//    password box), tracking roughly where the caret is.
//  - `closed`: an eyelid in the page colour slides down over the eye, leaving only a U-shaped
//    closed-eye line until it opens again.
// Shapes are the original artwork's (outlined tall eye, round pupil, round glint), in brand colours.
// Everything runs on one requestAnimationFrame loop that writes SVG attributes directly.

const EYES = [
  { cx: 14.118, cy: 23.658 },
  { cx: 46.935, cy: 23.658 },
];
const RX = 14.118, RY = 23.658; // the eye
const PUPIL = 8.013; // round pupil
const GLINT = 2.671; // round highlight, up and to the left in the pupil
const GLINT_DX = -1.526, GLINT_DY = -3.053;
const STROKE = 1.77; // the outline, drawn inside the eye like the original's masked stroke
// How far the pupil may travel from the eye centre - mostly sideways, like real eyes.
const MAX_X = RX - PUPIL - STROKE - 0.35;
const MAX_Y = (RY - PUPIL - STROKE) * 0.62;
// At rest they glance up and to the left, like the original artwork.
const REST = { x: -3.052, y: -4.198 };
const LID_CURVE = 7; // how far the eyelid's lower edge bows down in the middle

type Point = { x: number; y: number };

export function WatchingEyes({
  width = 62, closed = false, watch,
  eyeColor = colors.offWhite, outlineColor = colors.ink, pupilColor = colors.ink, glintColor = colors.oliveLight, lidColor = colors.sand,
}: {
  width?: number;
  closed?: boolean;
  /** A field to look at while the visitor types (when the pointer is idle). */
  watch?: RefObject<HTMLInputElement | null>;
  eyeColor?: string; outlineColor?: string; pupilColor?: string; glintColor?: string;
  /** Should match the background behind the eyes - the lid is drawn in it. */
  lidColor?: string;
}) {
  // unique per instance, so two pairs of eyes on one page don't share clip paths
  const clipId = `watching-eye-${useId().replace(/:/g, "")}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const pupilRefs = useRef<(SVGGElement | null)[]>([]);
  const glintRefs = useRef<(SVGCircleElement | null)[]>([]);
  const lidRefs = useRef<(SVGPathElement | null)[]>([]);
  const uRefs = useRef<(SVGPathElement | null)[]>([]);
  // Read inside the loop, so changing them never restarts it.
  const closedRef = useRef(closed);
  closedRef.current = closed;
  const watchRef = useRef(watch);
  watchRef.current = watch;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover)").matches;
    let pointer: Point | null = null;
    let pointerAt = -Infinity; // when the pointer last moved
    let touching = false;
    let wander: Point = { x: REST.x / MAX_X, y: REST.y / MAX_Y }; // idle gaze, as a fraction of the range
    let nextWander = 0;
    const pos: Point[] = EYES.map(() => ({ ...REST }));
    let shut = closedRef.current ? 1 : 0; // 0 open … 1 fully closed
    let last = performance.now();
    let nextBlink = last + 2000 + Math.random() * 2500;
    let blinkStart = -1;
    let frame = 0;

    /** Gaze toward a screen point from one eye, clamped to the eye. */
    const toward = (p: Point, i: number, box: DOMRect): Point => {
      const scale = box.width / 62;
      const dx = (p.x - (box.left + EYES[i].cx * scale)) / scale;
      const dy = (p.y - (box.top + EYES[i].cy * scale)) / scale;
      const dist = Math.hypot(dx, dy);
      if (dist < 0.001) return { x: 0, y: 0 };
      const reach = dist / (dist + 70); // small moves near the face, toward the rim further away
      const ux = dx / dist, uy = dy / dist;
      const edge = 1 / Math.hypot(ux / MAX_X, uy / MAX_Y);
      return { x: ux * edge * reach, y: uy * edge * reach };
    };

    /** Roughly where the caret sits in the watched field. */
    const caretPoint = (): Point | null => {
      const el = watchRef.current?.current;
      if (!el || document.activeElement !== el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.min(r.right - 40, r.left + 14 + el.value.length * 8), y: r.top + r.height / 2 };
    };

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const box = svgRef.current?.getBoundingClientRect();

      // What to look at, most specific first.
      const recentPointer = !!pointer && (touching || (canHover && now - pointerAt < 1500));
      const caret = recentPointer ? null : caretPoint();
      let fast = false;
      let target: (i: number) => Point;
      if (box && recentPointer && pointer) { const p = pointer; target = (i) => toward(p, i, box); }
      else if (box && caret) target = (i) => toward(caret, i, box);
      else if (box && pointer && canHover) { const p = pointer; target = (i) => toward(p, i, box); } // mouse resting
      else {
        // Nothing to follow: glance somewhere new every couple of seconds, quickly, like a saccade.
        if (now >= nextWander) {
          const center = Math.random() < 0.4; // often settle back to looking out at the visitor
          wander = center ? { x: 0, y: 0.1 } : { x: (Math.random() * 2 - 1) * 0.75, y: (Math.random() * 2 - 1) * 0.4 };
          nextWander = now + 1800 + Math.random() * 2600;
        }
        fast = true;
        // With reduced motion they hold still instead of glancing around.
        target = reduced ? () => REST : () => ({ x: wander.x * MAX_X, y: wander.y * MAX_Y });
      }

      // Idle glances ease a bit slower than following a pointer, so they don't twitch.
      const k = reduced ? 1 : 1 - Math.exp(-dt / (fast ? 110 : 85));
      EYES.forEach((_, i) => {
        const t = target(i);
        pos[i].x += (t.x - pos[i].x) * k;
        pos[i].y += (t.y - pos[i].y) * k;
        pupilRefs.current[i]?.setAttribute("transform", `translate(${pos[i].x.toFixed(3)} ${pos[i].y.toFixed(3)})`);
        // The highlight belongs to the light, not the pupil: cancel most of the pupil's shift.
        glintRefs.current[i]?.setAttribute("transform", `translate(${(pos[i].x * -0.7).toFixed(3)} ${(pos[i].y * -0.7).toFixed(3)})`);
      });

      // Eyelids: held shut while `closed`, otherwise an occasional blink.
      const wantShut = closedRef.current ? 1 : 0;
      shut += (wantShut - shut) * (reduced ? 1 : 1 - Math.exp(-dt / (wantShut ? 40 : 65)));
      if (closedRef.current) { blinkStart = -1; nextBlink = now + 1500; }
      if (!reduced && blinkStart < 0 && now >= nextBlink) blinkStart = now;
      let blink = 0;
      if (blinkStart >= 0) {
        const t = now - blinkStart;
        if (t < 75) blink = t / 75;
        else if (t < 115) blink = 1;
        else if (t < 245) blink = 1 - (t - 115) / 130;
        else {
          blinkStart = -1;
          nextBlink = now + (Math.random() < 0.18 ? 160 : 2600 + Math.random() * 3600);
        }
      }
      const amount = Math.max(shut, blink);
      // The lid's lower edge travels from above the eye to past its bottom, covering it; the
      // U-shaped closed-eye line fades in as it gets there.
      const u = Math.min(1, Math.max(0, (amount - 0.7) / 0.3));
      EYES.forEach((eye, i) => {
        const top = eye.cy - RY - LID_CURVE - 1;
        const edge = top + amount * (2 * RY + LID_CURVE + 3);
        uRefs.current[i]?.setAttribute("opacity", u.toFixed(3));
        const l = eye.cx - RX - 1, r = eye.cx + RX + 1;
        lidRefs.current[i]?.setAttribute(
          "d",
          `M${l} ${top - 2} H${r} V${edge.toFixed(3)} Q${eye.cx} ${(edge + LID_CURVE * 2).toFixed(3)} ${l} ${edge.toFixed(3)} Z`,
        );
      });

      frame = requestAnimationFrame(tick);
    };

    // Mouse / pen: pointer events. Touch: touch events, which keep firing while the finger drags
    // (pointer events are cancelled as soon as the browser starts scrolling).
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer = { x: e.clientX, y: e.clientY };
      pointerAt = performance.now();
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      touching = true;
      pointer = { x: t.clientX, y: t.clientY };
      pointerAt = performance.now();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length) return;
      touching = false;
      pointer = null;
      // hold the gaze where they tapped for a beat, then go back to glancing around
      wander = { x: pos[0].x / MAX_X, y: pos[0].y / MAX_Y };
      nextWander = performance.now() + 900;
    };
    const onLeave = () => { pointer = null; };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <svg ref={svgRef} width={width} height={(width * 48) / 62} viewBox="0 0 62 48" fill="none" aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
      <defs>
        {EYES.map((eye, i) => (
          <clipPath key={i} id={`${clipId}-${i}`}>
            <ellipse cx={eye.cx} cy={eye.cy} rx={RX - STROKE} ry={RY - STROKE} />
          </clipPath>
        ))}
        {EYES.map((eye, i) => (
          <clipPath key={`lid-${i}`} id={`${clipId}-lid-${i}`}>
            <ellipse cx={eye.cx} cy={eye.cy} rx={RX + 0.6} ry={RY + 0.6} />
          </clipPath>
        ))}
      </defs>
      {EYES.map((eye, i) => (
        <g key={i}>
          <ellipse cx={eye.cx} cy={eye.cy} rx={RX - STROKE / 2} ry={RY - STROKE / 2} fill={eyeColor} />
          <g clipPath={`url(#${clipId}-${i})`}>
            <g ref={(el) => { pupilRefs.current[i] = el; }} transform={`translate(${REST.x} ${REST.y})`}>
              <circle cx={eye.cx} cy={eye.cy} r={PUPIL} fill={pupilColor} />
              <circle ref={(el) => { glintRefs.current[i] = el; }} cx={eye.cx + GLINT_DX} cy={eye.cy + GLINT_DY} r={GLINT} fill={glintColor} />
            </g>
          </g>
          <ellipse cx={eye.cx} cy={eye.cy} rx={RX - STROKE / 2} ry={RY - STROKE / 2} stroke={outlineColor} strokeWidth={STROKE} />
          {/* eyelid, drawn in the page colour (a touch wider than the eye, so no dark edge peeks out) */}
          <path ref={(el) => { lidRefs.current[i] = el; }} fill={lidColor} d="" clipPath={`url(#${clipId}-lid-${i})`} />
          {/* the closed eye: just a U */}
          <path
            ref={(el) => { uRefs.current[i] = el; }}
            d={`M${eye.cx - RX * 0.72} ${eye.cy + RY * 0.42} Q${eye.cx} ${eye.cy + RY * 1.02} ${eye.cx + RX * 0.72} ${eye.cy + RY * 0.42}`}
            stroke={outlineColor} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0}
          />
        </g>
      ))}
    </svg>
  );
}
