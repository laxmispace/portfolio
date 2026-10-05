// The green strip that closes the page: a grid of olive cells whose hues drift
// within ±10° of the strip colour in a slow, endless wave. Cells near the pointer
// light up, and a click/tap sends a ripple across the grid. Drawn on a canvas and
// paused while off-screen; holds still for reduced motion.
import { useEffect, useRef } from "react";
import { colors } from "@/app/theme/tokens";

const CELL = 18; // cell pitch in px (16px tile + 2px gap)
const GAP = 2;
const HUE_SWING = 10; // ± degrees around the strip's own hue
const POINTER_RADIUS = 110;

// colors.oliveLight (#D2CE93) as HSL
function hexToHsl(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: s * 100, l: l * 100 };
}
const BASE = hexToHsl(colors.oliveLight);

export function LivingGrid({ height }: { height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, raf = 0, visible = true;
    const pointer = { x: -9999, y: -9999, strength: 0 };
    const ripples: { x: number; y: number; t0: number }[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      const t = now / 1000;
      ctx.fillStyle = colors.oliveLight;
      ctx.fillRect(0, 0, w, h);
      const cols = Math.ceil(w / CELL) + 1;
      const rows = Math.ceil(h / CELL) + 1;
      pointer.strength += ((pointer.x > -999 ? 1 : 0) - pointer.strength) * 0.12;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * CELL, y = r * CELL;
          const cx = x + CELL / 2, cy = y + CELL / 2;
          // two slow, crossing waves keep the field shifting without ever repeating obviously
          const wave = Math.sin(t * 0.7 + c * 0.28 + r * 0.17) * 0.6 + Math.sin(t * 0.45 - c * 0.11 + r * 0.31) * 0.4;
          let hue = BASE.h + wave * HUE_SWING;
          let light = BASE.l + wave * 3;

          const pd = Math.hypot(cx - pointer.x, cy - pointer.y);
          if (pd < POINTER_RADIUS) {
            const k = (1 - pd / POINTER_RADIUS) ** 2 * pointer.strength;
            light += k * 12;
            hue += k * HUE_SWING * 0.6;
          }
          for (const rp of ripples) {
            const radius = (now - rp.t0) * 0.35;
            const band = Math.abs(Math.hypot(cx - rp.x, cy - rp.y) - radius);
            if (band < 26) light += (1 - band / 26) * 10 * Math.max(0, 1 - (now - rp.t0) / 1600);
          }

          ctx.fillStyle = `hsl(${hue.toFixed(1)} ${BASE.s.toFixed(1)}% ${Math.min(light, 92).toFixed(1)}%)`;
          ctx.beginPath();
          ctx.roundRect(x + GAP / 2, y + GAP / 2, CELL - GAP, CELL - GAP, 3);
          ctx.fill();
        }
      }
      while (ripples.length && now - ripples[0].t0 > 1600) ripples.shift();
    };

    const loop = (now: number) => {
      draw(now);
      if (visible && !reduceMotion) raf = requestAnimationFrame(loop);
    };

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e: PointerEvent) => { Object.assign(pointer, local(e)); if (reduceMotion) draw(performance.now()); };
    const onLeave = () => { pointer.x = pointer.y = -9999; if (reduceMotion) draw(performance.now()); };
    const onDown = (e: PointerEvent) => { const p = local(e); ripples.push({ ...p, t0: performance.now() }); };

    resize();
    draw(performance.now());
    const ro = new ResizeObserver(() => { resize(); draw(performance.now()); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduceMotion) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="rounded-b-2xl"
      style={{ display: "block", width: "100%", height, backgroundColor: colors.oliveLight, touchAction: "pan-y", cursor: "crosshair" }}
    />
  );
}
