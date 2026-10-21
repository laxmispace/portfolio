// The site's footer: a sand frame (4095×1485 in the design, so its height follows its width)
// with an invitation to book a call, and the "butterfly daydream" - the character lying on
// the grass, swinging his feet and watching a butterfly flutter in front of him.
// The animation is a port of "Butterfly Daydream.html": both legs shear together about the knee line, the
// butterfly bobs and flaps, the eyes follow it and blink, the smile breathes. It only runs
// while the footer is on screen, and holds still for reduced motion.
import { useEffect, useRef } from "react";
import { CALENDLY_URL } from "@/app/lib/links";
import { colors } from "@/app/theme/tokens";
import { SquiggleLink } from "@/app/components/ui/Buttons";
import { BUTTERFLY, CLIPS, EYE_1, EYE_2, FILLS, FRAME_SHIFT, GRASS, GROUND, INK, SMILE, SWISH_1, SWISH_2 } from "./daydreamPaths";

const BG = "#E3D9CE";
export const FOOTER_GROUND = "#020202"; // the ground (and the page's bottom edge under it)
const GRASS_COLOR = "#625E37";
const FEATURE = "#212012"; // eyes, smile, swish lines

// Animation constants from the original.
const HINGE = { ox: 1258, oy: 135, nx: 0.8142115807765141, ny: -0.5805682575971666 };
const CUT = 660;
const TAU = Math.PI * 2;
const RAD = Math.PI / 180;
const E1 = { x: 946, y: 354 };
const E2 = { x: 1033, y: 326 };
const SM = { x: 990, y: 433 };
const BC = { x: 1310, y: 140 };

// shear about the knee line so the legs stay attached
const shear = (a: number) => { const k = Math.tan(a); return `matrix(1 0 ${k} 1 ${(-k * CUT).toFixed(3)} 0)`; };
// scale about a centre point
const sc = (c: { x: number; y: number }, sx: number, sy: number, dx = 0, dy = 0) =>
  `matrix(${sx} 0 0 ${sy} ${(c.x * (1 - sx) + dx).toFixed(3)} ${(c.y * (1 - sy) + dy).toFixed(3)})`;
// squash the wings toward the hinge line (a side-on flap)
const flap = (s: number) => {
  const k = 1 - s, { nx, ny, ox, oy } = HINGE, c = ox * nx + oy * ny;
  return `matrix(${1 - k * nx * nx} ${-k * nx * ny} ${-k * nx * ny} ${1 - k * ny * ny} ${k * c * nx} ${k * c * ny})`;
};

const SHIFT = `translate(${FRAME_SHIFT} 0)`;
// the character: outline + ground line, the ground, then the colours under the outline
const Figure = () => (
  <g transform={SHIFT}>
    <path d={INK} fill={FOOTER_GROUND} />
    <path d={GROUND} fill={FOOTER_GROUND} />
    {/* square off the ground line's rounded ends so the dark ground meets both edges flat */}
    <rect x={-60} y={899.74} width={70} height={520} fill={FOOTER_GROUND} />
    <rect x={4125} y={819.44} width={75} height={600} fill={FOOTER_GROUND} />
    {FILLS.map((f, i) => <path key={i} d={f.d} fill={f.color} />)}
  </g>
);
const Butterfly = () => (
  <g transform={SHIFT}>
    {BUTTERFLY.map((p, i) => <path key={i} d={p.d} fill={p.color} fillRule={p.evenodd ? "evenodd" : undefined} />)}
  </g>
);

/** `viewBox` frames the drawing: just him (phones), or the whole Figma frame (desktop). */
function Daydream({ viewBox }: { viewBox: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const $ = (id: string) => svg.querySelector<SVGElement>(`[data-dd="${id}"]`)!;
    const legs = $("legs"), swish = $("swish"), sw1 = $("sw1"), sw2 = $("sw2");
    const eye1 = $("eye1"), eye2 = $("eye2"), smile = $("smile"), bf = $("bf"), wings = $("wings");

    // blinking: every few seconds, now and then a double blink (eyes open between the two)
    let nextBlink = 1.6, blinkStart = -1, doubleBlink = false;
    const blinkAmount = (t: number) => {
      if (blinkStart < 0 && t >= nextBlink) { blinkStart = t; doubleBlink = Math.random() < 0.25; }
      if (blinkStart < 0) return 1;
      const dur = 0.17, gap = 0.08, e = t - blinkStart, total = doubleBlink ? dur * 2 + gap : dur;
      if (e > total) { blinkStart = -1; nextBlink = t + 2.2 + Math.random() * 2.8; return 1; }
      let local = e;
      if (doubleBlink) { if (e > dur && e < dur + gap) return 1; if (e >= dur + gap) local = e - dur - gap; }
      return 1 - 0.92 * Math.sin(Math.PI * Math.min(local / dur, 1));
    };

    const draw = (t: number) => {
      // both legs swing together as one piece, so the boots never pull apart where they touch
      const ph = (TAU / 2.6) * t;
      const a = RAD * (3.8 * Math.sin(ph) + 0.5 * Math.sin(2 * ph + 0.6));
      legs.setAttribute("transform", shear(a));
      swish.setAttribute("transform", shear(a));
      const sp = 0.5 + 0.5 * Math.sin(ph);
      sw1.style.opacity = (0.35 + 0.65 * sp).toFixed(3);
      sw2.style.opacity = (0.35 + 0.65 * (1 - sp)).toFixed(3);
      // butterfly: bobs in front of him, drifting a little side to side
      const by = 46 * Math.sin((TAU * t) / 3.2) + 8 * Math.sin((TAU * t) / 1.1);
      const bx = -16 * Math.sin((TAU * t) / 6.4);
      const tilt = -7 * Math.cos((TAU * t) / 3.2);
      bf.setAttribute("transform", `translate(${bx.toFixed(2)} ${by.toFixed(2)}) rotate(${tilt.toFixed(2)} ${BC.x} ${BC.y})`);
      const f = 0.5 + 0.5 * Math.cos((TAU * t) / 0.36);
      wings.setAttribute("transform", flap(0.3 + 0.7 * Math.pow(f, 1.3)));
      // eyes follow the butterfly and blink
      const b = blinkAmount(t);
      const ex = bx * 0.12 + 2, ey = by * 0.1;
      eye1.setAttribute("transform", sc(E1, 1, b, ex, ey));
      eye2.setAttribute("transform", sc(E2, 1, b, ex, ey));
      // the smile breathes a little
      const s = Math.sin((TAU * t) / 3.4);
      smile.setAttribute("transform", sc(SM, 1 + 0.022 * s, 1 + 0.07 * s, 0, -1.5 * s));
    };

    draw(0.5);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let t = 0.5, last: number | null = null, raf = 0, visible = false;
    const frame = (now: number) => {
      if (last !== null) t += Math.min((now - last) / 1000, 0.05);
      last = now;
      draw(t);
      raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
    };
    const kick = () => { if (visible && !document.hidden && !raf) { last = null; raf = requestAnimationFrame(frame); } };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); });
    io.observe(svg);
    document.addEventListener("visibilitychange", kick);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", kick); cancelAnimationFrame(raf); };
  }, []);

  const feature = (id: string, d: string, evenodd = true) => (
    <g data-dd={id}><g transform={SHIFT}><path d={d} fill={FEATURE} fillRule={evenodd ? "evenodd" : undefined} /></g></g>
  );

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      preserveAspectRatio="xMaxYMax meet"
      role="img"
      aria-label="A smiling character in orange boots lies on the grass, swinging his feet and watching a pink butterfly flutter in front of him"
      style={{ display: "block", width: "100%", height: "100%", overflow: "hidden" }}
    >
      <defs>
        {Object.entries(CLIPS).map(([id, points]) => (
          <clipPath key={id} id={`dd-${id}`} clipPathUnits="userSpaceOnUse"><polygon points={points} /></clipPath>
        ))}
      </defs>
      <g clipPath="url(#dd-body)"><Figure /></g>
      <g data-dd="legs"><g clipPath="url(#dd-legs)"><Figure /></g></g>
      <g transform={SHIFT}><path d={GRASS} fill={GRASS_COLOR} fillRule="evenodd" /></g>
      <g data-dd="swish">{feature("sw1", SWISH_1)}{feature("sw2", SWISH_2)}</g>
      {feature("eye1", EYE_1)}
      {feature("eye2", EYE_2)}
      {feature("smile", SMILE, false)}
      <g data-dd="bf">
        <g clipPath="url(#dd-bfBody)"><Butterfly /></g>
        <g data-dd="wings"><g clipPath="url(#dd-wing)"><Butterfly /></g></g>
      </g>
    </svg>
  );
}

export function SiteFooter({ isMobile }: { isMobile: boolean }) {
  const line = (
    <p className="font-caslon" style={{ fontSize: isMobile ? 22 : 32, lineHeight: isMobile ? "30px" : "40px", fontWeight: 500, letterSpacing: "-0.01em", color: colors.ink }}>
      I’m open to full-time and freelancing opportunities.
      <br />
      <SquiggleLink href={CALENDLY_URL}>Book a call</SquiggleLink>
    </p>
  );

  if (isMobile) {
    return (
      <footer data-no-reveal style={{ background: BG, marginTop: 56, paddingTop: 24, display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ padding: "0 16px" }}>{line}</div>
        {/* framed wider than the character, so he sits smaller on a phone */}
        <div style={{ width: "100%", aspectRatio: "2400 / 1400" }}><Daydream viewBox="-720 -150 2400 1400" /></div>
      </footer>
    );
  }

  // Desktop: the drawing fills the Figma frame (4140×1390, the character 2458 in from the
  // left) so the ground runs edge to edge; the line sits top-left on the page's 36px margin.
  return (
    <footer data-no-reveal style={{ position: "relative", background: BG, aspectRatio: "4140 / 1540", overflow: "hidden", marginTop: 96 }}>
      {/* 150 extra units above the Figma frame, so the butterfly's bob never clips */}
      <div style={{ position: "absolute", inset: 0 }}><Daydream viewBox="-2458 -150 4140 1540" /></div>
      <div style={{ position: "absolute", left: 36, top: 48 }}>{line}</div>
    </footer>
  );
}
