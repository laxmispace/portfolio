import { useRef } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { haptic } from "@/app/lib/feedback";
import { colors } from "@/app/theme/tokens";
import { BUTTERFLY_SPRITE, FLOWER_SPRITE, type Sprite } from "./loveSprites";

// Heart outline in a 24×24 box.
const HEART_PATH =
  "M12 21s-7.5-4.6-9.6-9.2C.9 8.5 2.6 4.5 6.3 4.1c2.1-.2 3.9.9 5.7 3 1.8-2.1 3.6-3.2 5.7-3 3.7.4 5.4 4.4 3.9 7.7C19.5 16.4 12 21 12 21z";

// Tapping the heart throws a little bouquet: the hero's flower and the footer's butterfly,
// each in random colours from the site's palette. A few burst out of the heart, more pop up
// all over the screen and drift about, and some float down from the top. Plain DOM + Web
// Animations, cleaned up when they finish.
const PALETTE = [colors.pink, colors.pinkLight, colors.orange, colors.orangeLight, colors.olive, colors.oliveLight, colors.sand];
const pickColor = (not?: string) => {
  const pool = PALETTE.filter((c) => c !== not);
  return pool[Math.floor(Math.random() * pool.length)];
};
const ORIGINAL = { petal: "#DDA1AE", center: "#C67D39", wing: "#DDA1AE", body: "#9F642D" };

/** The sprite as SVG markup, with its petal/wing (and centre/body) colours swapped. */
const svgFor = (sp: Sprite, main: string, accent: string) =>
  `<svg viewBox="${sp.viewBox}" width="100%" height="100%" style="display:block;overflow:visible">${sp.paths
    .map((p) => {
      const fill = p.color === ORIGINAL.petal ? main : p.color === ORIGINAL.center || p.color === ORIGINAL.body ? accent : p.color;
      return `<path d="${p.d}" fill="${fill}"${p.evenodd ? ' fill-rule="evenodd"' : ""}/>`;
    })
    .join("")}</svg>`;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

type Launch = { x: number; y: number; angle: number; speed: number; delay: number; dur: number };

function fling(layer: HTMLElement, butterfly: boolean, l: Launch) {
  const size = butterfly ? rand(26, 40) : rand(18, 30);
  const main = pickColor();
  const el = document.createElement("div");
  el.style.cssText = `position:absolute;left:0;top:0;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;will-change:transform,opacity`;
  el.innerHTML = svgFor(butterfly ? BUTTERFLY_SPRITE : FLOWER_SPRITE, main, pickColor(main));
  layer.appendChild(el);
  if (butterfly) {
    // wings: a quick flap, squashing the drawing sideways about its middle
    (el.firstElementChild as SVGElement).animate(
      [{ transform: "scaleX(1)" }, { transform: "scaleX(0.35)" }],
      { duration: rand(110, 160), iterations: Infinity, direction: "alternate", easing: "ease-in-out" },
    );
  }
  const gravity = butterfly ? 40 : 300; // butterflies float, flowers fall
  const spin = butterfly ? rand(-25, 25) : rand(-540, 540);
  const wobble = butterfly ? rand(18, 34) : rand(4, 10);
  const frames: Keyframe[] = [];
  for (let k = 0; k <= 16; k++) {
    const t = (k / 16) * (l.dur / 1000);
    const x = l.x + Math.cos(l.angle) * l.speed * t + wobble * Math.sin(t * 5 + size);
    const y = l.y + Math.sin(l.angle) * l.speed * t + 0.5 * gravity * t * t;
    const s = k === 0 ? 0.2 : 1;
    frames.push({ transform: `translate(${x}px, ${y}px) rotate(${(spin * k) / 16}deg) scale(${s})`, opacity: k > 12 ? (16 - k) / 4 : 1 });
  }
  el.animate(frames, { duration: l.dur, easing: "linear", delay: l.delay, fill: "backwards" }).finished.then(() => el.remove());
}

function burstBouquet(from: DOMRect) {
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:10000;overflow:hidden";
  document.body.appendChild(layer);
  const W = window.innerWidth, H = window.innerHeight;
  const hx = from.left + from.width / 2, hy = from.top + from.height / 2;
  let n = 0;
  // a handful burst out of the heart itself
  for (let i = 0; i < 8; i++, n++)
    fling(layer, n % 3 === 0, { x: hx, y: hy, angle: rand(-Math.PI * 0.95, -Math.PI * 0.05), speed: rand(220, 420), delay: 0, dur: rand(1800, 2600) });
  // most pop up all over the screen - spread on a loose grid so no corner is left empty -
  // and drift off in any direction
  const cols = 5, rows = 4;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++, n++)
      fling(layer, n % 3 === 0, {
        x: ((c + rand(0.15, 0.85)) / cols) * W, y: ((r + rand(0.15, 0.85)) / rows) * H * 0.85,
        angle: rand(0, Math.PI * 2), speed: rand(30, 110), delay: rand(80, 600), dur: rand(2000, 3000),
      });
  // and a few float down from the top
  for (let i = 0; i < 8; i++, n++)
    fling(layer, n % 2 === 0, { x: rand(0, W), y: -30, angle: Math.PI / 2, speed: rand(20, 60), delay: rand(200, 900), dur: rand(2600, 3600) });
  window.setTimeout(() => layer.remove(), 5000);
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** `heart` colours the heart and its ripples; it defaults to the site orange. */
export function MadeWithLove({ fontSize = 12, color = colors.oliveDeep, heart = colors.orange }: { fontSize?: number; color?: string; heart?: string }) {
  const heartRef = useRef<HTMLButtonElement>(null);
  const pulse = useAnimationControls();
  const reduceMotion = useReducedMotion();
  const ringSize = fontSize + 8;

  const celebrate = async () => {
    haptic(12);
    const pulsing = pulse.start({ scale: [1, 1.45, 0.9, 1.25, 1], transition: { duration: 0.6, ease: "easeOut" } });
    if (!prefersReducedMotion() && heartRef.current) {
      setTimeout(() => heartRef.current && burstBouquet(heartRef.current.getBoundingClientRect()), 180);
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
                border: `1.5px solid ${heart}`, pointerEvents: "none",
              }}
            />
          ))}
        <svg width={fontSize + 2} height={fontSize + 2} viewBox="0 0 24 24" aria-hidden="true" style={{ position: "relative" }}>
          <path d={HEART_PATH} fill={heart} />
        </svg>
      </motion.button>
    </p>
  );
}
